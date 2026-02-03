import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, StatsData, TrendData } from "../api/client";
import StatCard from "../components/StatCard";
import TrendChart from "../components/TrendChart";
import TimeRangeToggle from "../components/TimeRangeToggle";

const STATS = ["PTS", "REB", "AST", "BLK", "STL", "TOV", "FG3M", "FTM"];

export default function PlayerDetail() {
  const { playerId } = useParams();
  const [range, setRange] = useState("10g");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    setError("");
    const id = Number(playerId);
    Promise.all([api.getStats(id, range), api.getTrends(id, range)])
      .then(([s, t]) => {
        setStats(s);
        setTrends(t);
      })
      .catch(() => setError("Failed to load player data."))
      .finally(() => setLoading(false));
  }, [playerId, range]);

  if (loading) return <p className="text-gray-600 mt-12 text-center">Loading player data...</p>;
  if (error) return <p className="text-red-500 mt-12 text-center">{error}</p>;
  if (!stats || !trends) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-red-500">Player #{playerId}</h2>
        <TimeRangeToggle value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {STATS.map(
          (s) =>
            trends.summary[s] && (
              <StatCard
                key={s}
                label={s}
                summary={trends.summary[s]}
                direction={trends.direction[s] || "stable"}
              />
            )
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STATS.map(
          (s) =>
            trends.rolling[s] && (
              <TrendChart
                key={s}
                stat={s}
                games={stats.games}
                rolling5={trends.rolling[s].r5}
                rolling10={trends.rolling[s].r10}
              />
            )
        )}
      </div>
    </div>
  );
}
