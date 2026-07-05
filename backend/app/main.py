import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import (
    agents,
    analytics,
    analyze,
    auth,
    billing,
    copilot,
    customer_success,
    dashboard,
    engines,
    leadgen,
    marketing,
    projects,
    report,
    sales,
    strategy,
    upload,
)
from app.config import get_settings
from app.core.exceptions import AscendoError, AuthError, LLMProviderError, NotFoundError, PlannerError
from app.db import chroma, mongodb
from app.logging_config import setup_logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    mongodb.connect()
    chroma.connect()
    logger.info("Ascendo backend started")
    yield
    mongodb.disconnect()
    logger.info("Ascendo backend stopped")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Ascendo — AI Business Growth Operating System",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(NotFoundError)
    async def _not_found_handler(request: Request, exc: NotFoundError):
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(AuthError)
    async def _auth_error_handler(request: Request, exc: AuthError):
        return JSONResponse(status_code=401, content={"detail": str(exc)})

    @app.exception_handler(LLMProviderError)
    async def _llm_error_handler(request: Request, exc: LLMProviderError):
        return JSONResponse(status_code=502, content={"detail": str(exc)})

    @app.exception_handler(PlannerError)
    async def _planner_error_handler(request: Request, exc: PlannerError):
        return JSONResponse(status_code=500, content={"detail": str(exc)})

    @app.exception_handler(AscendoError)
    async def _generic_ascendo_error_handler(request: Request, exc: AscendoError):
        return JSONResponse(status_code=500, content={"detail": str(exc)})

    app.include_router(auth.router)
    app.include_router(projects.router)
    app.include_router(upload.router)
    app.include_router(analyze.router)
    app.include_router(agents.router)
    app.include_router(dashboard.router)
    app.include_router(report.router)
    app.include_router(copilot.router)
    app.include_router(strategy.router)
    app.include_router(analytics.router)
    app.include_router(marketing.router)
    app.include_router(leadgen.router)
    app.include_router(sales.router)
    app.include_router(customer_success.router)
    app.include_router(engines.router)
    app.include_router(billing.router)

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
