from fastapi import APIRouter, Query
from services.nba_data import search_teams, get_team_roster, get_game_logs, get_team_standings
from services.trends import calculate_trends

router = APIRouter(prefix="/api/teams", tags=["teams"])


@router.get("/search")
def search(q: str = Query("", min_length=1)):
    return {"teams": search_teams(q)}


@router.get("/standings")
def standings():
    return {"teams": get_team_standings()}


@router.get("/{team_id}/roster")
def roster(team_id: int, range: str = Query("10g", pattern="^(1m|3m|6m|3g|10g)$")):
    players = get_team_roster(team_id)
    results = []
    for p in players:
        logs = get_game_logs(p["player_id"], range)
        trends = calculate_trends(logs)
        results.append({
            "player_id": p["player_id"],
            "name": p["name"],
            "position": p["position"],
            "number": p["number"],
            "summary": trends["summary"],
            "direction": trends["direction"],
        })
    return {"team_id": team_id, "range": range, "players": results}
