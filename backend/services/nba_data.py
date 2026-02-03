from nba_api.stats.static import players as nba_players
from nba_api.stats.static import teams as nba_teams
from nba_api.stats.endpoints import playergamelog, commonteamroster, leagueleaders, leaguestandings
from datetime import datetime, timedelta
import time

from db import get_cached, set_cache

STAT_COLUMNS = [
    "GAME_DATE", "MATCHUP", "WL", "MIN",
    "PTS", "REB", "AST", "BLK", "STL", "TOV", "FG3M", "FTM",
    "FGM", "FGA", "FG_PCT", "FG3A", "FG3_PCT", "FTA", "FT_PCT",
    "PLUS_MINUS",
]

RANGE_DAYS = {"1m": 30, "3m": 90, "6m": 180}
RANGE_GAMES = {"3g": 3, "10g": 10}


def search_players(query: str) -> list[dict]:
    q = query.lower().strip()
    if not q:
        return []

    cached = get_cached("player_search_cache", {"query": q})
    if cached is not None:
        return cached

    all_players = nba_players.get_players()
    results = [
        {"id": p["id"], "full_name": p["full_name"], "is_active": p["is_active"]}
        for p in all_players
        if q in p["full_name"].lower()
    ][:25]

    set_cache("player_search_cache", {"query": q}, results)
    return results


def get_game_logs(player_id: int, range_key: str = "3m") -> list[dict]:
    # For game-count ranges, fetch from the 6m cache/data and slice
    if range_key in RANGE_GAMES:
        all_logs = get_game_logs(player_id, "6m")
        n = RANGE_GAMES[range_key]
        return all_logs[-n:] if len(all_logs) >= n else all_logs

    cached = get_cached("game_log_cache", {"player_id": player_id, "range_key": range_key})
    if cached is not None:
        return cached

    days = RANGE_DAYS.get(range_key, 90)
    cutoff = datetime.now() - timedelta(days=days)

    # Determine the NBA season string(s) to query
    now = datetime.now()
    # NBA season spans Oct-Jun; season label is the starting year
    if now.month >= 10:
        current_season = f"{now.year}-{str(now.year+1)[2:]}"
    else:
        current_season = f"{now.year-1}-{str(now.year)[2:]}"

    seasons_to_query = [current_season]
    # If cutoff reaches into the previous season, also query that
    if cutoff.month < 10 and cutoff.year < now.year:
        prev = f"{cutoff.year-1}-{str(cutoff.year)[2:]}"
        if prev != current_season:
            seasons_to_query.append(prev)

    all_games = []
    for season in seasons_to_query:
        try:
            log = playergamelog.PlayerGameLog(
                player_id=player_id,
                season=season,
                season_type_all_star="Regular Season",
            )
            df = log.get_data_frames()[0]
            for _, row in df.iterrows():
                game = {col: _convert(row.get(col)) for col in STAT_COLUMNS if col in row.index}
                all_games.append(game)
            time.sleep(0.6)  # rate-limit courtesy
        except Exception:
            continue

    # Filter by cutoff date and sort
    filtered = []
    for g in all_games:
        try:
            gd = datetime.strptime(g["GAME_DATE"], "%b %d, %Y")
            if gd >= cutoff:
                g["_sort"] = gd
                filtered.append(g)
        except (ValueError, KeyError):
            filtered.append(g)

    filtered.sort(key=lambda g: g.get("_sort", datetime.min))
    for g in filtered:
        g.pop("_sort", None)

    set_cache("game_log_cache", {"player_id": player_id, "range_key": range_key}, filtered)
    return filtered


def search_teams(query: str) -> list[dict]:
    q = query.lower().strip()
    if not q:
        return []
    all_teams = nba_teams.get_teams()
    return [
        {"id": t["id"], "full_name": t["full_name"], "abbreviation": t["abbreviation"]}
        for t in all_teams
        if q in t["full_name"].lower() or q in t["abbreviation"].lower()
    ][:15]


def get_team_roster(team_id: int) -> list[dict]:
    cache_key = {"player_id": team_id, "range_key": "roster"}
    cached = get_cached("game_log_cache", cache_key)
    if cached is not None:
        return cached

    try:
        r = commonteamroster.CommonTeamRoster(team_id=team_id)
        df = r.get_data_frames()[0]
        players = []
        for _, row in df.iterrows():
            players.append({
                "player_id": int(row["PLAYER_ID"]),
                "name": str(row["PLAYER"]),
                "position": str(row.get("POSITION", "")),
                "number": str(row.get("NUM", "")),
            })
        time.sleep(0.6)
        set_cache("game_log_cache", cache_key, players)
        return players
    except Exception:
        return []


def get_top_players(n: int = 50, sort_by: str = "pts") -> list[dict]:
    # Always fetch a big pool, cache it, then sort + slice
    cached = get_cached("player_search_cache", {"query": "__top_pool__"})
    if cached is None:
        now = datetime.now()
        if now.month >= 10:
            season = f"{now.year}-{str(now.year+1)[2:]}"
        else:
            season = f"{now.year-1}-{str(now.year)[2:]}"

        try:
            l = leagueleaders.LeagueLeaders(
                stat_category_abbreviation="PTS",
                season=season,
                season_type_all_star="Regular Season",
            )
            df = l.get_data_frames()[0].head(200)
            pool = []
            for _, row in df.iterrows():
                gp = int(row["GP"]) if row["GP"] else 1
                pool.append({
                    "player_id": int(row["PLAYER_ID"]),
                    "name": str(row["PLAYER"]),
                    "team": str(row["TEAM"]),
                    "gp": gp,
                    "pts": round(float(row["PTS"]) / gp, 1),
                    "reb": round(float(row["REB"]) / gp, 1),
                    "ast": round(float(row["AST"]) / gp, 1),
                    "blk": round(float(row["BLK"]) / gp, 1),
                    "stl": round(float(row["STL"]) / gp, 1),
                    "tov": round(float(row["TOV"]) / gp, 1),
                    "fg3m": round(float(row["FG3M"]) / gp, 1),
                    "fg3_pct": round(float(row["FG3_PCT"]) * 100, 1) if row["FG3_PCT"] else 0.0,
                    "ftm": round(float(row["FTM"]) / gp, 1),
                })
            time.sleep(0.6)
            set_cache("player_search_cache", {"query": "__top_pool__"}, pool)
            cached = pool
        except Exception:
            return []

    valid_keys = {"pts", "reb", "ast", "blk", "stl", "tov", "fg3m", "fg3_pct", "ftm", "gp"}
    key = sort_by if sort_by in valid_keys else "pts"
    sorted_list = sorted(cached, key=lambda p: p.get(key, 0), reverse=True)
    return sorted_list[:n]


def get_team_standings() -> list[dict]:
    cached = get_cached("player_search_cache", {"query": "__standings__"})
    if cached is not None:
        return cached

    now = datetime.now()
    if now.month >= 10:
        season = f"{now.year}-{str(now.year+1)[2:]}"
    else:
        season = f"{now.year-1}-{str(now.year)[2:]}"

    try:
        l = leaguestandings.LeagueStandings(season=season, season_type="Regular Season")
        df = l.get_data_frames()[0]
        results = []
        for _, row in df.iterrows():
            wins = int(row["WINS"])
            losses = int(row["LOSSES"])
            results.append({
                "team_id": int(row["TeamID"]),
                "city": str(row["TeamCity"]),
                "name": str(row["TeamName"]),
                "conference": str(row["Conference"]),
                "wins": wins,
                "losses": losses,
                "win_pct": round(float(row["WinPCT"]) * 100, 1),
                "record": str(row["Record"]),
                "home": str(row["HOME"]),
                "road": str(row["ROAD"]),
                "l10": str(row["L10"]),
                "streak": str(row["strCurrentStreak"]),
                "ppg": round(float(row["PointsPG"]), 1),
                "opp_ppg": round(float(row["OppPointsPG"]), 1),
                "diff": round(float(row["DiffPointsPG"]), 1),
            })
        results.sort(key=lambda t: t["win_pct"], reverse=True)
        time.sleep(0.6)
        set_cache("player_search_cache", {"query": "__standings__"}, results)
        return results
    except Exception:
        return []


def _convert(val):
    if val is None:
        return None
    try:
        import numpy as np
        if isinstance(val, (np.integer,)):
            return int(val)
        if isinstance(val, (np.floating,)):
            return float(val)
    except ImportError:
        pass
    return val
