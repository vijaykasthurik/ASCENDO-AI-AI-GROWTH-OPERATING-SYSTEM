import logging

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.config import get_settings
from app.models.user import UserPublic
from app.services import billing_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/billing", tags=["billing"])


class CheckoutRequest(BaseModel):
    plan: str


@router.post("/checkout-session")
async def checkout_session(payload: CheckoutRequest, user: UserPublic = Depends(get_current_user)):
    url = await billing_service.create_checkout_session(user.id, payload.plan)
    return {"checkout_url": url}


@router.post("/portal-session")
async def portal_session(user: UserPublic = Depends(get_current_user)):
    url = await billing_service.create_portal_session(user.id)
    return {"portal_url": url}


@router.get("/status")
async def billing_status(user: UserPublic = Depends(get_current_user)):
    return await billing_service.get_billing_status(user.id)


@router.post("/webhook")
async def webhook(request: Request):
    settings = get_settings()
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        logger.warning("Rejected invalid Stripe webhook: %s", exc)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid webhook signature") from exc

    await billing_service.handle_webhook_event(event)
    return {"status": "ok"}
