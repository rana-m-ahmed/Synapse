"""
Synapse Backend — FastAPI Application Entry Point
===================================================
Creates and configures the FastAPI application with:
- Lifespan manager (startup: load embedding model, shutdown: cleanup)
- CORS middleware for frontend/widget access
- API router mounting under /api/v1
- Global exception handlers
- Health check endpoint

Run locally:
    uvicorn app.main:app --reload --port 8000
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("synapse")


# ── Lifespan Manager ─────────────────────────────────────────────────────
# Runs once on startup and once on shutdown. Used to load the embedding
# model into memory so it's ready for the first request.

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan: startup and shutdown logic.

    Startup:
        - Validate settings
        - Pre-load the sentence-transformers embedding model
        - Log configuration summary

    Shutdown:
        - Cleanup (currently no-op, but extensible)
    """
    settings = get_settings()

    logger.info("=" * 60)
    logger.info("  SYNAPSE BACKEND — Starting up")
    logger.info("=" * 60)
    logger.info(f"  Environment   : {settings.ENVIRONMENT}")
    logger.info(f"  LLM Model     : {settings.GROQ_MODEL_NAME}")
    logger.info(f"  Embed Model   : {settings.EMBEDDING_MODEL_NAME}")
    logger.info(f"  Embed Dim     : {settings.EMBEDDING_DIMENSION}")
    logger.info(f"  Chunk Size    : {settings.CHUNK_SIZE}")
    logger.info(f"  CORS Origins  : {settings.cors_origins_list}")
    logger.info("=" * 60)

    # Pre-load the embedding model into memory.
    # This takes a few seconds on first load but ensures the first
    # API request doesn't have a cold-start delay.
    logger.info("Loading embedding model (this may take a moment)...")
    from app.services.embedding_service import EmbeddingService
    embedding_service = EmbeddingService()
    embedding_service.load_model()
    # Store on app state so it can be accessed via dependency injection
    app.state.embedding_service = embedding_service
    logger.info("Embedding model loaded and ready.")

    logger.info("Synapse backend is ready to accept requests.")

    yield  # ← App runs here

    # Shutdown
    logger.info("Synapse backend shutting down.")


# ── App Factory ───────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application instance.
    This factory pattern makes testing easier — you can create
    a fresh app instance with different settings for tests.
    """
    settings = get_settings()

    app = FastAPI(
        title="Synapse API",
        description="AI Customer Support Agent SaaS — Backend API",
        version="1.0.0",
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────
    # Allow the Next.js frontend and embeddable widget to make requests.
    # In production, restrict this to your actual domains.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception Handlers ────────────────────────────────────────────
    register_exception_handlers(app)

    # ── Routers ───────────────────────────────────────────────────────
    from app.api.v1.router import api_v1_router
    app.include_router(api_v1_router, prefix="/api/v1")

    # ── Health Check ──────────────────────────────────────────────────
    @app.get("/health", tags=["System"])
    async def health_check():
        """
        Health check endpoint for uptime monitoring.
        Returns 200 OK if the server is running.
        Used by Render/BetterStack to verify the backend is alive.
        """
        return {
            "status": "ok",
            "version": "1.0.0",
            "service": "synapse-backend",
        }

    return app


# Create the app instance — uvicorn will import this
app = create_app()
