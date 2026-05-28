"""
Synapse Backend — Agent Service
==================================
Business logic layer for agent management.
Handles ownership validation and delegates to the agent repository.
"""

import logging

from supabase import Client

from app.core.exceptions import ForbiddenError, NotFoundError
from app.db.repositories.agent_repo import AgentRepository
from app.schemas.agent import AgentCreate, AgentResponse, AgentUpdate

logger = logging.getLogger("synapse.service.agent")


class AgentService:
    """
    Service layer for agent CRUD operations.
    All methods verify resource ownership before performing operations.
    """

    def __init__(self, supabase: Client):
        self._repo = AgentRepository(supabase)

    def _verify_ownership(self, agent: dict, user_id: str) -> None:
        """Raise ForbiddenError if the user doesn't own this agent."""
        if agent["user_id"] != user_id:
            raise ForbiddenError("You do not have permission to access this agent")

    def _to_response(self, agent: dict) -> AgentResponse:
        """Convert a raw agent row to an AgentResponse, enriching with document count."""
        doc_count = self._repo.count_documents(agent["id"])
        return AgentResponse(
            id=agent["id"],
            user_id=agent["user_id"],
            name=agent["name"],
            description=agent.get("description"),
            welcome_message=agent["welcome_message"],
            accent_color=agent["accent_color"],
            fallback_message=agent["fallback_message"],
            is_active=agent["is_active"],
            document_count=doc_count,
            created_at=agent["created_at"],
            updated_at=agent["updated_at"],
        )

    def create_agent(self, user_id: str, data: AgentCreate) -> AgentResponse:
        """Create a new agent for the authenticated user."""
        agent = self._repo.create(user_id, data.model_dump())
        return self._to_response(agent)

    def get_agent(self, user_id: str, agent_id: str) -> AgentResponse:
        """Get an agent by ID, verifying ownership."""
        agent = self._repo.get_by_id(agent_id)
        if not agent:
            raise NotFoundError("Agent", agent_id)
        self._verify_ownership(agent, user_id)
        return self._to_response(agent)

    def get_agent_raw(self, agent_id: str) -> dict:
        """
        Get raw agent data without ownership check.
        Used by widget endpoints where the agent is accessed by its public ID.
        """
        agent = self._repo.get_by_id(agent_id)
        if not agent:
            raise NotFoundError("Agent", agent_id)
        return agent

    def list_agents(self, user_id: str) -> list[AgentResponse]:
        """List all agents belonging to the authenticated user."""
        agents = self._repo.list_by_user(user_id)
        return [self._to_response(a) for a in agents]

    def update_agent(self, user_id: str, agent_id: str, data: AgentUpdate) -> AgentResponse:
        """Update an agent's settings, verifying ownership."""
        agent = self._repo.get_by_id(agent_id)
        if not agent:
            raise NotFoundError("Agent", agent_id)
        self._verify_ownership(agent, user_id)

        updated = self._repo.update(agent_id, data.model_dump(exclude_unset=True))
        return self._to_response(updated)

    def delete_agent(self, user_id: str, agent_id: str) -> None:
        """Delete an agent and all associated data, verifying ownership."""
        agent = self._repo.get_by_id(agent_id)
        if not agent:
            raise NotFoundError("Agent", agent_id)
        self._verify_ownership(agent, user_id)

        self._repo.delete(agent_id)
        logger.info(f"Agent {agent_id} deleted by user {user_id}")
