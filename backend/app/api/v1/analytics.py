"""
Synapse Backend — Analytics API Routes
=========================================
Dashboard analytics endpoints.
All endpoints require authentication via JWT.

Endpoints:
    GET /api/v1/analytics/stats/{agent_id}     — Aggregate stats
    GET /api/v1/analytics/activity/{agent_id}   — Hourly activity chart
    GET /api/v1/analytics/trend/{agent_id}      — Daily conversation trend
"""

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import get_current_user, get_supabase_dep
from app.schemas.analytics import (
    ActivityChartResponse,
    AgentStatsResponse,
    TrendChartResponse,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter()


def _get_service(supabase=Depends(get_supabase_dep)) -> AnalyticsService:
    """Dependency: create AnalyticsService with the Supabase client."""
    return AnalyticsService(supabase)


@router.get("/stats/{agent_id}", response_model=AgentStatsResponse)
async def get_agent_stats(
    agent_id: str,
    user: dict = Depends(get_current_user),
    service: AnalyticsService = Depends(_get_service),
):
    """
    Get aggregate dashboard statistics for an agent.
    Returns total conversations, messages, average messages per conversation,
    document count, and chunk count.
    """
    return service.get_dashboard_stats(user["user_id"], agent_id)


@router.get("/activity/{agent_id}", response_model=ActivityChartResponse)
async def get_activity_chart(
    agent_id: str,
    days: int = Query(7, ge=1, le=90, description="Number of days to look back"),
    user: dict = Depends(get_current_user),
    service: AnalyticsService = Depends(_get_service),
):
    """
    Get hourly message distribution for the activity chart.
    Returns 24 data points (one per hour) with message counts.
    """
    return service.get_activity_chart(user["user_id"], agent_id, days)


@router.get("/trend/{agent_id}", response_model=TrendChartResponse)
async def get_conversation_trend(
    agent_id: str,
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    user: dict = Depends(get_current_user),
    service: AnalyticsService = Depends(_get_service),
):
    """
    Get daily conversation count trend.
    Returns one data point per day with the number of new conversations.
    """
    return service.get_conversation_trend(user["user_id"], agent_id, days)
