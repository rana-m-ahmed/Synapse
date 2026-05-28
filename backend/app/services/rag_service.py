"""
Synapse Backend — RAG Service
=================================
The core RAG (Retrieval-Augmented Generation) pipeline.
This is the heart of Synapse — it takes a user question, retrieves relevant
context from the agent's knowledge base, and streams a grounded AI response.

Pipeline:
    1. Get or create conversation
    2. Fetch recent conversation history
    3. Reformulate query (resolve pronouns/references using history)
    4. Embed the reformulated query
    5. Vector search for relevant chunks
    6. Build the final prompt with context + history
    7. Stream response from Groq (LLaMA 3.3)
    8. Save messages to conversation
    9. Yield tokens as SSE events
"""

import json
import logging
from typing import AsyncGenerator, Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from app.core.config import get_settings
from app.core.exceptions import NotFoundError, RagError
from app.db.repositories.vector_repo import VectorRepository
from app.services.conversation_service import ConversationService
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger("synapse.service.rag")


# ── Prompt Templates ─────────────────────────────────────────────────────

QUERY_REFORMULATION_PROMPT = """Given the following conversation history and a new question, rephrase the question to be a standalone query that can be used for semantic search. 
If the new question is a simple greeting (e.g. "hi", "hello"), a casual acknowledgment (e.g. "thanks", "ok"), or otherwise does not require searching a knowledge base, output exactly: [NO_SEARCH]
Otherwise, output ONLY the rephrased standalone query, nothing else.

Chat History:
{history}

New Question: {question}

Standalone Query:"""


ANSWER_SYSTEM_PROMPT = """You are {agent_name}, a helpful, intelligent AI assistant for a business. 

Rules:
- If the user is asking a factual question, answer it based ONLY on the following context extracted from the business's knowledge base.
- If the user is asking a factual question and the context is empty or doesn't contain enough information to answer, say exactly: "{fallback_message}"
- If the user is just saying a greeting (like "hi", "hello") or casual chat, respond warmly and naturally. Do NOT use the fallback message for greetings.
- Do NOT make up factual information that isn't in the context.
- Do NOT mention that you are reading from "context" or "documents" — just answer naturally.
- If relevant, cite specific details from the context.
- Use a friendly, professional tone.

Context from knowledge base:
{context}"""


class RagService:
    """
    Orchestrates the full RAG pipeline: retrieve → reformulate → generate → stream.

    This service is stateless per-request but depends on:
    - EmbeddingService: for encoding queries into vectors
    - VectorRepository: for similarity search
    - ConversationService: for conversation history
    - ChatGroq: for LLM response generation
    """

    def __init__(
        self,
        supabase_client,
        embedding_service: EmbeddingService,
    ):
        self._embedding_service = embedding_service
        self._vector_repo = VectorRepository(supabase_client)
        self._conversation_service = ConversationService(supabase_client)

        settings = get_settings()
        self._llm = ChatGroq(
            model=settings.GROQ_MODEL_NAME,
            api_key=settings.GROQ_API_KEY,
            temperature=0.3,         # Low temperature for factual responses
            max_tokens=1024,
            streaming=True,
        )
        self._max_history = settings.MAX_CONVERSATION_HISTORY
        self._max_results = settings.MAX_RETRIEVAL_RESULTS
        self._similarity_threshold = settings.SIMILARITY_THRESHOLD

    # ── Main Entry Point ──────────────────────────────────────────────────

    async def chat_stream(
        self,
        agent_id: str,
        agent_name: str,
        fallback_message: str,
        session_id: str,
        user_message: str,
        visitor_ip: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Process a user message and stream the AI response as SSE events.

        Yields SSE-formatted strings:
            event: token\ndata: {"token": "word"}\n\n
            event: sources\ndata: {"sources": [...]}\n\n
            event: done\ndata: {}\n\n
            event: error\ndata: {"message": "..."}\n\n

        Args:
            agent_id: The agent to chat with.
            agent_name: Display name of the agent (for the system prompt).
            fallback_message: Message to use when no relevant context is found.
            session_id: Client-generated session identifier.
            user_message: The user's question.
            visitor_ip: Optional visitor IP for analytics.
        """
        try:
            # ── Step 1: Get or create conversation ────────────────────
            conversation = self._conversation_service.get_or_create_conversation(
                agent_id=agent_id,
                session_id=session_id,
                visitor_ip=visitor_ip,
            )
            conversation_id = conversation["id"]

            # ── Step 2: Fetch conversation history ────────────────────
            history_messages = self._conversation_service.get_conversation_history(
                conversation_id=conversation_id,
                limit=self._max_history,
            )

            # ── Step 3: Save user message ─────────────────────────────
            self._conversation_service.save_message(
                conversation_id=conversation_id,
                role="user",
                content=user_message,
            )

            # ── Step 4: Reformulate query with history context ────────
            search_query = await self._reformulate_query(
                user_message, history_messages
            )
            logger.info(f"Reformulated query: '{search_query}'")

            search_results = []
            if search_query != "[NO_SEARCH]":
                query_embedding = self._embedding_service.embed_text(search_query)
                search_results = self._vector_repo.search(
                    agent_id=agent_id,
                    query_embedding=query_embedding,
                    threshold=self._similarity_threshold,
                    limit=self._max_results,
                )

            # ── Step 6: Build source references ──────────────────────
            sources = []
            if search_results:
                for result in search_results:
                    source_name = result.get("metadata", {}).get(
                        "source_file", "Unknown source"
                    )
                    sources.append({
                        "document_name": source_name,
                        "chunk_preview": result["content"][:100],
                        "similarity_score": round(result["similarity"], 3),
                    })
                # Send sources event before streaming tokens
                yield self._format_sse("sources", {"sources": sources})
            else:
                logger.info(f"No relevant chunks found (or search skipped) for agent {agent_id}")
                yield self._format_sse("sources", {"sources": []})

            # ── Step 7: Build context and stream response ─────────────
            # Build the context string from retrieved chunks
            context = self._build_context(search_results) if search_results else ""

            # Build the message list for the LLM
            messages = self._build_messages(
                agent_name=agent_name,
                fallback_message=fallback_message,
                context=context,
                history=history_messages,
                user_message=user_message,
            )

            # ── Step 8: Stream LLM response ───────────────────────────
            full_response = ""
            async for chunk in self._llm.astream(messages):
                token = chunk.content
                if token:
                    full_response += token
                    yield self._format_sse("token", {"token": token})

            # ── Step 9: Save assistant response ───────────────────────
            self._conversation_service.save_message(
                conversation_id=conversation_id,
                role="assistant",
                content=full_response,
                sources=sources,
            )

            yield self._format_sse("done", {})

            logger.info(
                f"Chat response completed for agent {agent_id}: "
                f"{len(full_response)} chars, {len(sources)} sources"
            )

        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"RAG pipeline error: {e}", exc_info=True)
            yield self._format_sse("error", {"message": str(e)})

    # ── Query Reformulation ───────────────────────────────────────────────

    async def _reformulate_query(
        self,
        user_message: str,
        history: list[dict],
    ) -> str:
        """
        Use the LLM to reformulate the user's question into a standalone
        search query, resolving pronouns and references from conversation history.

        Examples:
            History: "What products do you sell?" / "We sell widgets and gadgets."
            New question: "How much do they cost?"
            Reformulated: "How much do widgets and gadgets cost?"

        If there's no history, we still evaluate it for [NO_SEARCH] via the LLM.
        """
        history_text = "No previous history."
        if history:
            # Build history text
            history_text = "\n".join([
                f"{'User' if m['role'] == 'user' else 'Assistant'}: {m['content']}"
                for m in history
            ])

        prompt = QUERY_REFORMULATION_PROMPT.format(
            history=history_text,
            question=user_message,
        )

        try:
            response = await self._llm.ainvoke([HumanMessage(content=prompt)])
            reformulated = response.content.strip()

            # Sanity check: if the LLM returns something too different or empty, use original
            if not reformulated or len(reformulated) > 500:
                return user_message

            return reformulated

        except Exception as e:
            logger.warning(f"Query reformulation failed, using original: {e}")
            return user_message

    # ── Context Building ──────────────────────────────────────────────────

    def _build_context(self, search_results: list[dict]) -> str:
        """
        Build the context string from search results.
        Each chunk is labeled with its source for attribution.
        """
        context_parts = []
        for i, result in enumerate(search_results, 1):
            source = result.get("metadata", {}).get("source_file", "Unknown")
            similarity = round(result["similarity"], 2)
            context_parts.append(
                f"[Source {i}: {source} (relevance: {similarity})]:\n{result['content']}"
            )

        return "\n\n---\n\n".join(context_parts)

    def _build_messages(
        self,
        agent_name: str,
        fallback_message: str,
        context: str,
        history: list[dict],
        user_message: str,
    ) -> list:
        """
        Build the full message list for the LLM.
        Includes system prompt (with context), conversation history, and the new user message.
        """
        messages = []

        # System prompt with context
        system_prompt = ANSWER_SYSTEM_PROMPT.format(
            agent_name=agent_name,
            fallback_message=fallback_message,
            context=context,
        )
        messages.append(SystemMessage(content=system_prompt))

        # Add conversation history
        for msg in history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            else:
                messages.append(AIMessage(content=msg["content"]))

        # Add current user message
        messages.append(HumanMessage(content=user_message))

        return messages

    # ── SSE Formatting ────────────────────────────────────────────────────

    @staticmethod
    def _format_sse(event: str, data: dict) -> str:
        """
        Format a Server-Sent Event string.

        SSE format:
            event: <event_name>
            data: <json_data>

            (blank line terminates the event)
        """
        return f"event: {event}\ndata: {json.dumps(data)}\n\n"
