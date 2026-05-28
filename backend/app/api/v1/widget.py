"""
Synapse Backend — Widget API Routes
=======================================
PUBLIC endpoints for the embeddable chat widget.
These do NOT require JWT authentication — they authenticate using the agent_id.
The agent must exist and be active (is_active = true).

Endpoints:
    GET  /api/v1/widget/config/{agent_id}  — Get widget configuration
    POST /api/v1/widget/chat               — Send a message (streaming SSE)
    GET  /api/v1/widget/script/{agent_id}  — Get the embed script snippet
"""

from fastapi import APIRouter, Depends, Request
from fastapi.responses import PlainTextResponse, StreamingResponse

from app.core.dependencies import get_embedding_service_dep, get_supabase_dep
from app.core.exceptions import ForbiddenError, NotFoundError
from app.schemas.chat import WidgetChatRequest, WidgetConfigResponse
from app.services.agent_service import AgentService
from app.services.rag_service import RagService

router = APIRouter()


def _validate_active_agent(supabase, agent_id: str) -> dict:
    """
    Validate that the agent exists and is active.
    This is the "authentication" for widget endpoints — instead of a JWT,
    we verify the agent_id is valid and enabled.
    """
    agent_service = AgentService(supabase)
    agent = agent_service.get_agent_raw(agent_id)

    if not agent.get("is_active", False):
        raise ForbiddenError("This agent is currently inactive")

    return agent


@router.get("/config/{agent_id}", response_model=WidgetConfigResponse)
async def get_widget_config(
    agent_id: str,
    supabase=Depends(get_supabase_dep),
):
    """
    Get the widget configuration for an agent.
    Used by the embedded widget to load its initial state (name, color, welcome message).
    No authentication required.
    """
    agent = _validate_active_agent(supabase, agent_id)

    return WidgetConfigResponse(
        agent_id=agent["id"],
        agent_name=agent["name"],
        welcome_message=agent["welcome_message"],
        accent_color=agent["accent_color"],
    )


@router.post("/chat")
async def widget_chat(
    data: WidgetChatRequest,
    request: Request,
    supabase=Depends(get_supabase_dep),
    embedding_service=Depends(get_embedding_service_dep),
):
    """
    Send a message from the embedded widget and receive a streaming response.
    No JWT authentication required — the agent_id in the request body is validated.

    The response format is identical to the authenticated /chat endpoint (SSE).
    """
    agent = _validate_active_agent(supabase, data.agent_id)

    # Extract visitor IP for analytics
    visitor_ip = request.client.host if request.client else None

    rag_service = RagService(supabase, embedding_service)

    return StreamingResponse(
        rag_service.chat_stream(
            agent_id=data.agent_id,
            agent_name=agent["name"],
            fallback_message=agent["fallback_message"],
            session_id=data.session_id,
            user_message=data.message,
            visitor_ip=visitor_ip,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/script/{agent_id}", response_class=PlainTextResponse)
async def get_embed_script(
    agent_id: str,
    supabase=Depends(get_supabase_dep),
):
    """
    Returns the JavaScript embed snippet that businesses paste into their website.
    The script loads the Synapse chat widget and connects it to this agent.

    Usage on business website:
        <script src="https://your-backend.com/api/v1/widget/script/{agent_id}"></script>
    """
    # Validate agent exists and is active
    _validate_active_agent(supabase, agent_id)

    from app.core.config import get_settings
    settings = get_settings()

    # Determine the frontend URL for the widget
    # In production, this would be the deployed frontend URL
    frontend_url = settings.cors_origins_list[0] if settings.cors_origins_list else "http://localhost:3000"

    script = f"""
(function() {{
    // Synapse Chat Widget Loader
    // Agent ID: {agent_id}

    var AGENT_ID = '{agent_id}';
    var API_BASE = '{settings.SUPABASE_URL.replace("supabase.co", "supabase.co")}';

    // Determine the backend URL from the script's own src attribute
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var backendUrl = currentScript.src.replace(/\\/api\\/v1\\/widget\\/script\\/.*/, '');

    // Create widget container
    var container = document.createElement('div');
    container.id = 'synapse-widget-container';
    container.setAttribute('data-agent-id', AGENT_ID);
    container.setAttribute('data-backend-url', backendUrl);
    document.body.appendChild(container);

    // Load widget CSS
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = backendUrl + '/static/widget.css';
    document.head.appendChild(link);

    // Load widget JS
    var widgetScript = document.createElement('script');
    widgetScript.src = backendUrl + '/static/widget.js';
    widgetScript.defer = true;
    document.body.appendChild(widgetScript);
}})();
"""

    return PlainTextResponse(
        content=script.strip(),
        media_type="application/javascript",
    )
