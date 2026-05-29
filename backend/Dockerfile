# =============================================================================
# Synapse Backend — Docker Image
# =============================================================================
# Multi-stage build:
# 1. Install dependencies
# 2. Pre-download the embedding model (so it's baked into the image)
# 3. Copy application code
#
# Build:  docker build -t synapse-backend .
# Run:    docker run -p 8000:8000 --env-file .env synapse-backend
# =============================================================================

FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install minimal system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the embedding model during build.
# This adds ~80MB to the image but eliminates cold-start download time.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy application code
COPY . .

# Expose the port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import httpx, os; port = os.environ.get('PORT', '8000'); httpx.get(f'http://localhost:{port}/health').raise_for_status()" || exit 1

# Run with uvicorn
# Workers: 1 for free tier (limited RAM). Increase for production.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
