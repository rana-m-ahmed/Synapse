"""
Synapse Backend — Agents API Routes
=======================================
CRUD endpoints for AI agent management.
All endpoints require authentication via JWT.

Endpoints:
    POST   /api/v1/agents/            — Create a new agent
    GET    /api/v1/agents/            — List all agents for the user
    GET    /api/v1/agents/{agent_id}  — Get agent details
    PATCH  /api/v1/agents/{agent_id}  — Update agent settings
    DELETE /api/v1/agents/{agent_id}  — Delete agent + all data
"""

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, get_supabase_dep
from app.schemas.agent import AgentCreate, AgentListResponse, AgentResponse, AgentUpdate
from app.schemas.common import SuccessResponse
from app.services.agent_service import AgentService

router = APIRouter()


def _get_service(supabase=Depends(get_supabase_dep)) -> AgentService:
    """Dependency: create AgentService with the Supabase client."""
    return AgentService(supabase)


@router.post("/", response_model=AgentResponse, status_code=201)
async def create_agent(
    data: AgentCreate,
    user: dict = Depends(get_current_user),
    service: AgentService = Depends(_get_service),
):
    """Create a new AI support agent."""
    return service.create_agent(user["user_id"], data)


@router.get("/", response_model=AgentListResponse)
async def list_agents(
    user: dict = Depends(get_current_user),
    service: AgentService = Depends(_get_service),
):
    """List all agents belonging to the authenticated user."""
    agents = service.list_agents(user["user_id"])
    return AgentListResponse(agents=agents, total=len(agents))


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    user: dict = Depends(get_current_user),
    service: AgentService = Depends(_get_service),
):
    """Get details for a specific agent."""
    return service.get_agent(user["user_id"], agent_id)


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    data: AgentUpdate,
    user: dict = Depends(get_current_user),
    service: AgentService = Depends(_get_service),
):
    """Update an agent's settings (name, colors, messages, etc.)."""
    return service.update_agent(user["user_id"], agent_id, data)


@router.delete("/{agent_id}", response_model=SuccessResponse)
async def delete_agent(
    agent_id: str,
    user: dict = Depends(get_current_user),
    service: AgentService = Depends(_get_service),
):
    """Delete an agent and all associated data (documents, conversations)."""
    service.delete_agent(user["user_id"], agent_id)
    return SuccessResponse(message=f"Agent '{agent_id}' deleted successfully")
