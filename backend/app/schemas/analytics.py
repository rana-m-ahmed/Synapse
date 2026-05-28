"""
Synapse Backend — Analytics Schemas
======================================
Response models for the /api/v1/analytics endpoints.
"""

from pydantic import BaseModel


class AgentStatsResponse(BaseModel):
    """Aggregate statistics for an agent's dashboard."""
    total_conversations: int
    total_messages: int
    avg_messages_per_conversation: float
    total_documents: int
    total_chunks: int


class HourlyActivity(BaseModel):
    """Message count for a specific hour of the day."""
    hour: int                       # 0-23
    count: int


class DailyTrend(BaseModel):
    """Conversation count for a specific date."""
    date: str                       # ISO date string (YYYY-MM-DD)
    count: int


class ActivityChartResponse(BaseModel):
    """Response for the hourly activity chart."""
    data: list[HourlyActivity]


class TrendChartResponse(BaseModel):
    """Response for the daily conversation trend chart."""
    data: list[DailyTrend]
