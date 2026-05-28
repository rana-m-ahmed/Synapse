"""
Synapse Backend — Analytics Service
=======================================
Business logic for dashboard analytics.
Validates agent ownership and delegates to the analytics repository.
"""

import logging

from supabase import Client

from app.db.repositories.analytics_repo import AnalyticsRepository
from app.schemas.analytics import (
    ActivityChartResponse,
    AgentStatsResponse,
    DailyTrend,
    HourlyActivity,
    TrendChartResponse,
)
from app.services.agent_service import AgentService

logger = logging.getLogger("synapse.service.analytics")


class AnalyticsService:
    """
    Service layer for analytics.
    Validates agent ownership before returning any data.
    """

    def __init__(self, supabase: Client):
        self._repo = AnalyticsRepository(supabase)
        self._agent_service = AgentService(supabase)

    def get_dashboard_stats(self, user_id: str, agent_id: str) -> AgentStatsResponse:
        """
        Get aggregate dashboard stats for an agent.
        Verifies ownership before returning data.
        """
        # Verify ownership
        self._agent_service.get_agent(user_id, agent_id)

        # Fetch stats from RPC
        stats = self._repo.get_agent_stats(agent_id)
        doc_stats = self._repo.get_document_stats(agent_id)

        return AgentStatsResponse(
            total_conversations=stats.get("total_conversations", 0),
            total_messages=stats.get("total_messages", 0),
            avg_messages_per_conversation=float(
                stats.get("avg_messages_per_conversation", 0)
            ),
            total_documents=doc_stats.get("total_documents", 0),
            total_chunks=doc_stats.get("total_chunks", 0),
        )

    def get_activity_chart(
        self,
        user_id: str,
        agent_id: str,
        days: int = 7,
    ) -> ActivityChartResponse:
        """Get hourly message distribution for the activity chart."""
        self._agent_service.get_agent(user_id, agent_id)

        raw_data = self._repo.get_hourly_activity(agent_id, days)

        # Fill in missing hours with 0 count
        hour_map = {item["hour"]: item["message_count"] for item in raw_data}
        data = [
            HourlyActivity(hour=h, count=hour_map.get(h, 0))
            for h in range(24)
        ]

        return ActivityChartResponse(data=data)

    def get_conversation_trend(
        self,
        user_id: str,
        agent_id: str,
        days: int = 30,
    ) -> TrendChartResponse:
        """Get daily conversation counts for the trend chart."""
        self._agent_service.get_agent(user_id, agent_id)

        raw_data = self._repo.get_daily_conversations(agent_id, days)

        data = [
            DailyTrend(
                date=str(item["date"]),
                count=item["conversation_count"],
            )
            for item in raw_data
        ]

        return TrendChartResponse(data=data)
