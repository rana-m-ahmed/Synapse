---
title: Synapse Backend
emoji: ⚡
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 8080
pinned: false
---

# Synapse Backend

FastAPI backend for the Synapse AI Customer Support Agent platform.

## Quick Start

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and Groq credentials

# 4. Run the database migrations
# Copy each SQL file from supabase/migrations/ into the Supabase SQL Editor
# and execute them in order (001 through 008)

# 5. Create a Supabase Storage bucket named "documents"
# Go to Supabase Dashboard → Storage → New Bucket → Name: "documents" → Public: No

# 6. Start the development server
uvicorn app.main:app --reload --port 8000
```

## API Documentation

When running in development mode, interactive API docs are available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   ├── core/                    # Config, auth, dependencies
│   ├── api/v1/                  # Route handlers
│   ├── schemas/                 # Pydantic request/response models
│   ├── services/                # Business logic
│   ├── document_processing/     # File parsing & chunking
│   └── db/                      # Database repositories
├── supabase/migrations/         # SQL migration scripts
├── requirements.txt
├── Dockerfile
└── .env.example
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI + Uvicorn |
| Database  | Supabase (PostgreSQL + pgvector) |
| LLM       | Groq API (LLaMA 3.3 70B) |
| Embeddings| sentence-transformers (all-MiniLM-L6-v2) |
| Auth      | Supabase Auth (JWT) |
| Storage   | Supabase Storage |
