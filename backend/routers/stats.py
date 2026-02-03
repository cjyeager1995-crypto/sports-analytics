from fastapi import APIRouter, Query
from services.nba_data import get_game_logs
from services.trends import calculate_trends

router = APIRouter(prefix="/api/players", tags=["stats"])


@router.get("/{player_id}/stats")
def player_stats(player_id: int, range: str = Query("3m", pattern="^(1m|3m|6m|3g|10g)$")):
    logs = get_game_logs(player_id, range)
    trends = calculate_trends(logs)
    return {
        "player_id": player_id,
        "range": range,
        "games": logs,
        "summary": trends["summary"],
    }


@router.get("/{player_id}/trends")
def player_trends(player_id: int, range: str = Query("3m", pattern="^(1m|3m|6m|3g|10g)$")):
    logs = get_game_logs(player_id, range)
    trends = calculate_trends(logs)
    return {
        "player_id": player_id,
        "range": range,
        "rolling": trends["rolling"],
        "direction": trends["direction"],
        "summary": trends["summary"],
    }
