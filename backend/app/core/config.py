"""
Synapse Backend — Application Configuration
=============================================
Centralized configuration management using pydantic-settings.
All environment variables are validated at startup — if any required
value is missing, the app fails fast with a clear error message.

Usage:
    from app.core.config import get_settings
    settings = get_settings()
    print(settings.SUPABASE_URL)
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Reads from a `.env` file in the backend root directory.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # ── Supabase ──────────────────────────────────────────────────────────
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str  # Server-side key (bypasses RLS)
    SUPABASE_ANON_KEY: str          # Public key (used for widget reference)
    SUPABASE_JWT_SECRET: str        # For verifying JWTs issued by Supabase Auth

    # ── Groq (LLM Provider) ──────────────────────────────────────────────
    GROQ_API_KEY: str
    GROQ_MODEL_NAME: str = "llama-3.3-70b-versatile"

    # ── Embedding Model ──────────────────────────────────────────────────
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384

    # ── RAG Pipeline ─────────────────────────────────────────────────────
    CHUNK_SIZE: int = 500           # Characters per chunk
    CHUNK_OVERLAP: int = 50         # Overlap between consecutive chunks
    MAX_RETRIEVAL_RESULTS: int = 5  # Top-K chunks to retrieve
    SIMILARITY_THRESHOLD: float = 0.3  # Minimum cosine similarity
    MAX_CONVERSATION_HISTORY: int = 6  # Messages to include as context

    # ── CORS ─────────────────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # ── Environment ──────────────────────────────────────────────────────
    ENVIRONMENT: str = "development"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"


@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings singleton. Loaded once, reused everywhere.
    The @lru_cache ensures the .env file is only read once.
    """
    return Settings()
