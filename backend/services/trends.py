TRACKED_STATS = ["PTS", "REB", "AST", "BLK", "STL", "TOV", "FG3M", "FTM"]


def calculate_trends(game_logs: list[dict]) -> dict:
    if not game_logs:
        return {"rolling": {}, "summary": {}, "direction": {}}

    rolling = {}
    summary = {}
    direction = {}

    for stat in TRACKED_STATS:
        values = [g.get(stat, 0) or 0 for g in game_logs]
        if not values:
            continue

        # Rolling averages
        r5 = _rolling_avg(values, 5)
        r10 = _rolling_avg(values, 10)
        rolling[stat] = {"r5": r5, "r10": r10}

        # Summary stats
        summary[stat] = {
            "avg": round(sum(values) / len(values), 1),
            "min": min(values),
            "max": max(values),
            "games": len(values),
        }

        # Direction: compare last 5-game avg to overall avg
        direction[stat] = _direction(values)

    return {"rolling": rolling, "summary": summary, "direction": direction}


def _rolling_avg(values: list, window: int) -> list[float]:
    result = []
    for i in range(len(values)):
        start = max(0, i - window + 1)
        chunk = values[start : i + 1]
        result.append(round(sum(chunk) / len(chunk), 1))
    return result


def _direction(values: list) -> str:
    if len(values) < 5:
        return "stable"
    overall = sum(values) / len(values)
    recent = sum(values[-5:]) / 5
    pct = (recent - overall) / overall if overall else 0
    if pct > 0.05:
        return "up"
    elif pct < -0.05:
        return "down"
    return "stable"
