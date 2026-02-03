import { useState, useEffect, useRef } from "react";
import { api, Player, Team } from "../api/client";

export default function PlayerSearch({
  mode,
  onSelectPlayer,
  onSelectTeam,
}: {
  mode: "players" | "teams";
  onSelectPlayer: (player: Player) => void;
  onSelectTeam: (team: Team) => void;
}) {
  const [query, setQuery] = useState("");
  const [playerResults, setPlayerResults] = useState<Player[]>([]);
  const [teamResults, setTeamResults] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.length < 2) {
      setPlayerResults([]);
      setTeamResults([]);
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        if (mode === "players") {
          const data = await api.searchPlayers(query);
          setPlayerResults(data.players);
          setTeamResults([]);
        } else {
          const data = await api.searchTeams(query);
          setTeamResults(data.teams);
          setPlayerResults([]);
        }
      } catch {
        setPlayerResults([]);
        setTeamResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [query, mode]);

  const clear = () => {
    setQuery("");
    setPlayerResults([]);
    setTeamResults([]);
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder={mode === "players" ? "Search players..." : "Search teams..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-gray-600 focus:outline-none focus:border-red-700"
      />
      {loading && <p className="text-gray-600 mt-1 text-xs">Searching...</p>}
      {playerResults.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-neutral-900 rounded-lg border border-neutral-800 divide-y divide-neutral-800 max-h-64 overflow-y-auto shadow-xl">
          {playerResults.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => { onSelectPlayer(p); clear(); }}
                className="w-full text-left px-4 py-2.5 hover:bg-neutral-800 transition text-sm"
              >
                <span className="font-medium">{p.full_name}</span>
                {!p.is_active && <span className="ml-2 text-xs text-gray-600">(inactive)</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {teamResults.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-neutral-900 rounded-lg border border-neutral-800 divide-y divide-neutral-800 max-h-64 overflow-y-auto shadow-xl">
          {teamResults.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => { onSelectTeam(t); clear(); }}
                className="w-full text-left px-4 py-2.5 hover:bg-neutral-800 transition text-sm"
              >
                <span className="font-medium">{t.full_name}</span>
                <span className="ml-2 text-xs text-gray-600">{t.abbreviation}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
