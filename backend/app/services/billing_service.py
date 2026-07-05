"""Stripe-backed subscription billing: checkout, customer portal, webhook
synchronization, and per-plan usage gating.
"""

import logging
from datetime import datetime, timezone

import stripe
from bson import ObjectId
from fastapi import HTTPException, status

from app.config import get_settings
from app.core.exceptions import NotFoundError
from app.db import mongodb

logger = logging.getLogger(__name__)

PLAN_NONE = "none"
PLAN_STARTER = "starter"
PLAN_GROWTH = "growth"
PLAN_SCALE = "scale"

_STARTER_MONTHLY_LIMIT = 1
_NO_PLAN_LIFETIME_LIMIT = 1


def _configure_stripe():
    settings = get_settings()
    stripe.api_key = settings.stripe_secret_key
    return settings


def _plan_price_map() -> dict[str, str]:
    settings = _configure_stripe()
    return {
        PLAN_STARTER: settings.stripe_price_starter,
        PLAN_GROWTH: settings.stripe_price_growth,
        PLAN_SCALE: settings.stripe_price_scale,
    }


def _plan_for_price_id(price_id: str) -> str:
    for plan, mapped_price_id in _plan_price_map().items():
        if mapped_price_id == price_id:
            return plan
    return PLAN_NONE


async def _get_user_doc(user_id: str) -> dict:
    doc = await mongodb.users_collection().find_one({"_id": ObjectId(user_id)})
    if not doc:
        raise NotFoundError(f"User {user_id} not found")
    return doc


async def get_or_create_customer(user_id: str) -> str:
    user = await _get_user_doc(user_id)
    existing = user.get("stripe_customer_id")
    if existing:
        return existing

    _configure_stripe()
    customer = stripe.Customer.create(
        email=user["email"],
        name=user["full_name"],
        metadata={"user_id": user_id},
    )
    await mongodb.users_collection().update_one(
        {"_id": user["_id"]}, {"$set": {"stripe_customer_id": customer.id}}
    )
    return customer.id


async def create_checkout_session(user_id: str, plan: str) -> str:
    price_map = _plan_price_map()
    if plan not in price_map or not price_map[plan]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Unknown plan '{plan}'")

    settings = _configure_stripe()
    customer_id = await get_or_create_customer(user_id)
    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=customer_id,
        line_items=[{"price": price_map[plan], "quantity": 1}],
        success_url=f"{settings.frontend_base_url}/settings?billing=success",
        cancel_url=f"{settings.frontend_base_url}/settings?billing=cancelled",
        metadata={"user_id": user_id, "plan": plan},
    )
    return session.url


async def create_portal_session(user_id: str) -> str:
    settings = _configure_stripe()
    customer_id = await get_or_create_customer(user_id)
    portal_session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{settings.frontend_base_url}/settings",
    )
    return portal_session.url


async def _set_user_plan_by_customer(customer_id: str, fields: dict) -> None:
    result = await mongodb.users_collection().update_one(
        {"stripe_customer_id": customer_id}, {"$set": fields}
    )
    if result.matched_count == 0:
        logger.warning("Stripe webhook: no user found for customer %s", customer_id)


async def handle_webhook_event(event: dict) -> None:
    event_type = event["type"]
    # Stripe's SDK objects aren't plain dicts (no .get()) - convert once so the
    # rest of this function can use normal dict access/.get() safely.
    data = event["data"]["object"].to_dict()

    if event_type == "checkout.session.completed":
        customer_id = data["customer"]
        subscription_id = data.get("subscription")
        plan = (data.get("metadata") or {}).get("plan", PLAN_NONE)
        await _set_user_plan_by_customer(
            customer_id,
            {
                "plan": plan,
                "subscription_status": "active",
                "subscription_id": subscription_id,
            },
        )
        logger.info("Checkout completed for customer %s -> plan=%s", customer_id, plan)

    elif event_type == "customer.subscription.updated":
        customer_id = data["customer"]
        price_id = data["items"]["data"][0]["price"]["id"]
        plan = _plan_for_price_id(price_id)
        period_end = datetime.fromtimestamp(data["current_period_end"], tz=timezone.utc)
        await _set_user_plan_by_customer(
            customer_id,
            {
                "plan": plan,
                "subscription_status": data["status"],
                "subscription_id": data["id"],
                "current_period_end": period_end,
            },
        )

    elif event_type == "customer.subscription.deleted":
        customer_id = data["customer"]
        await _set_user_plan_by_customer(
            customer_id, {"plan": PLAN_NONE, "subscription_status": "canceled"}
        )

    elif event_type == "invoice.payment_failed":
        customer_id = data["customer"]
        await _set_user_plan_by_customer(customer_id, {"subscription_status": "past_due"})

    else:
        logger.debug("Ignoring unhandled Stripe event type: %s", event_type)


def _start_of_month() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


async def get_billing_status(user_id: str) -> dict:
    user = await _get_user_doc(user_id)
    lifetime_projects = await mongodb.projects_collection().count_documents({"user_id": user_id})
    projects_this_month = await mongodb.projects_collection().count_documents(
        {"user_id": user_id, "created_at": {"$gte": _start_of_month()}}
    )
    period_end = user.get("current_period_end")
    return {
        "plan": user.get("plan", PLAN_NONE),
        "subscription_status": user.get("subscription_status", PLAN_NONE),
        "current_period_end": period_end.isoformat() if isinstance(period_end, datetime) else None,
        "lifetime_projects": lifetime_projects,
        "projects_this_month": projects_this_month,
    }


async def assert_can_create_project(user_id: str) -> None:
    user = await _get_user_doc(user_id)
    plan = user.get("plan", PLAN_NONE)

    if plan in (PLAN_GROWTH, PLAN_SCALE):
        return

    if plan == PLAN_STARTER:
        count = await mongodb.projects_collection().count_documents(
            {"user_id": user_id, "created_at": {"$gte": _start_of_month()}}
        )
        if count >= _STARTER_MONTHLY_LIMIT:
            raise HTTPException(
                status.HTTP_402_PAYMENT_REQUIRED,
                "You've used your Starter plan's analysis for this month. Upgrade to Growth for unlimited analyses.",
            )
        return

    # No active plan: one lifetime analysis, then must subscribe.
    count = await mongodb.projects_collection().count_documents({"user_id": user_id})
    if count >= _NO_PLAN_LIFETIME_LIMIT:
        raise HTTPException(
            status.HTTP_402_PAYMENT_REQUIRED,
            "You've used your free analysis. Choose a plan to run another.",
        )
