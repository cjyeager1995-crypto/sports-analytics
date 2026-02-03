from fastapi import APIRouter, Query
from services.nba_data import search_players, get_top_players

router = APIRouter(prefix="/api/players", tags=["players"])


@router.get("/search")
def search(q: str = Query("", min_length=1)):
    results = search_players(q)
    return {"players": results}


@router.get("/top")
def top(
    n: int = Query(50, ge=1, le=100),
    sort_by: str = Query("pts"),
):
    return {"players": get_top_players(n, sort_by)}
