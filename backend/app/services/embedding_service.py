"""
Synapse Backend — Embedding Service
=====================================
Wraps the sentence-transformers library to provide text embedding functionality.
The model is loaded once at application startup and reused for all requests.

Model: all-MiniLM-L6-v2
- Output dimension: 384
- Size: ~80MB download, ~250MB in memory
- Performance: ~14,000 sentences/sec on GPU, ~100 sentences/sec on CPU
- Quality: Very good for semantic search at this scale

Usage:
    service = EmbeddingService()
    service.load_model()

    vector = service.embed_text("What is your return policy?")
    vectors = service.embed_texts(["chunk 1", "chunk 2", "chunk 3"])
"""

import logging
from typing import Optional

import numpy as np
from sentence_transformers import SentenceTransformer

from app.core.config import get_settings

logger = logging.getLogger("synapse.embedding")


class EmbeddingService:
    """
    Singleton embedding service that loads a sentence-transformers model
    and provides methods to embed text strings into dense vectors.

    The model is loaded into memory once via load_model() and then
    reused for all subsequent embed calls. This avoids the overhead
    of loading a ~250MB model on every request.
    """

    def __init__(self):
        self._model: Optional[SentenceTransformer] = None
        self._model_name: str = get_settings().EMBEDDING_MODEL_NAME
        self._dimension: int = get_settings().EMBEDDING_DIMENSION

    @property
    def is_loaded(self) -> bool:
        """Check if the model has been loaded into memory."""
        return self._model is not None

    @property
    def dimension(self) -> int:
        """Return the embedding dimension (384 for all-MiniLM-L6-v2)."""
        return self._dimension

    def load_model(self) -> None:
        """
        Load the sentence-transformers model into memory.
        Called once during application startup (in main.py lifespan).

        The model is downloaded from HuggingFace on first run and cached
        locally in ~/.cache/torch/sentence_transformers/
        """
        if self._model is not None:
            logger.info(f"Model '{self._model_name}' is already loaded.")
            return

        logger.info(f"Loading embedding model: {self._model_name}")
        self._model = SentenceTransformer(self._model_name, device="cpu")
        logger.info(f"Model loaded successfully. Dimension: {self._dimension}")

    def embed_text(self, text: str) -> list[float]:
        """
        Embed a single text string into a dense vector.

        Args:
            text: The text to embed (e.g., a user query or a document chunk).

        Returns:
            A list of floats representing the embedding vector (384 dimensions).

        Raises:
            RuntimeError: If the model hasn't been loaded yet.
        """
        if self._model is None:
            raise RuntimeError(
                "Embedding model not loaded. Call load_model() first."
            )

        # encode() returns a numpy array; normalize for cosine similarity
        embedding = self._model.encode(
            text,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        return embedding.tolist()

    def embed_texts(self, texts: list[str], batch_size: int = 32) -> list[list[float]]:
        """
        Embed multiple text strings in batch (more efficient than one-by-one).
        Used during document processing to embed all chunks at once.

        Args:
            texts: List of text strings to embed.
            batch_size: Number of texts to process in each batch.
                        Higher = faster but more memory. 32 is safe for CPU.

        Returns:
            List of embedding vectors, one per input text.

        Raises:
            RuntimeError: If the model hasn't been loaded yet.
        """
        if self._model is None:
            raise RuntimeError(
                "Embedding model not loaded. Call load_model() first."
            )

        if not texts:
            return []

        logger.info(f"Embedding {len(texts)} texts in batches of {batch_size}")

        embeddings: np.ndarray = self._model.encode(
            texts,
            batch_size=batch_size,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

        logger.info(f"Embedding complete. Shape: {embeddings.shape}")
        return embeddings.tolist()
