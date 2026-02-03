import { TopPlayer } from "../api/client";

export type SortKey = "pts" | "reb" | "ast" | "fg3m" | "fg3_pct" | "blk" | "stl" | "tov" | "ftm" | "gp";

const STATS: { key: SortKey; label: string }[] = [
  { key: "pts", label: "PTS" },
  { key: "reb", label: "REB" },
  { key: "ast", label: "AST" },
  { key: "fg3m", label: "3PM" },
  { key: "fg3_pct", label: "3P%" },
  { key: "blk", label: "BLK" },
  { key: "stl", label: "STL" },
  { key: "tov", label: "TOV" },
  { key: "ftm", label: "FTM" },
];

export default function TopPlayersTable({
  players,
  loading,
  sortBy,
  onSort,
  isPlayerFav,
  onToggleFav,
}: {
  players: TopPlayer[];
  loading: boolean;
  sortBy: SortKey;
  onSort: (key: SortKey) => void;
  isPlayerFav: (id: number) => boolean;
  onToggleFav: (id: number, name: string) => void;
}) {
  if (loading) {
    return <p className="text-gray-600 text-center mt-12">Loading top players...</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-900">
            <th className="w-10 py-3 px-2"></th>
            <th className="text-left py-3 px-2 text-gray-500 font-medium w-8">#</th>
            <th className="text-left py-3 px-3 text-gray-500 font-medium sticky left-0 bg-neutral-900 min-w-[180px]">
              Player
            </th>
            <th className="py-3 px-2 text-gray-500 font-medium text-center">Team</th>
            <th
              className={`py-3 px-2 font-medium text-center cursor-pointer select-none transition hover:text-red-400 ${sortBy === "gp" ? "text-red-500" : "text-gray-500"}`}
              onClick={() => onSort("gp")}
            >
              GP {sortBy === "gp" && "\u25BC"}
            </th>
            {STATS.map((s) => (
              <th
                key={s.key}
                className={`py-3 px-2 font-medium text-center min-w-[60px] cursor-pointer select-none transition hover:text-red-400 ${sortBy === s.key ? "text-red-500" : "text-gray-500"}`}
                onClick={() => onSort(s.key)}
              >
                {s.label} {sortBy === s.key && "\u25BC"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={p.player_id} className="border-b border-neutral-900 hover:bg-neutral-900/60">
              <td className="py-2.5 px-2 text-center">
                <button
                  onClick={() => onToggleFav(p.player_id, p.name)}
                  className={`text-lg leading-none transition ${
                    isPlayerFav(p.player_id) ? "text-red-500" : "text-neutral-700 hover:text-red-500"
                  }`}
                  title={isPlayerFav(p.player_id) ? "Remove from favorites" : "Add to favorites"}
                >
                  {isPlayerFav(p.player_id) ? "\u2605" : "\u2606"}
                </button>
              </td>
              <td className="py-2.5 px-2 text-gray-600 text-sm">{i + 1}</td>
              <td className="py-2.5 px-3 font-medium sticky left-0 bg-black whitespace-nowrap">
                {p.name}
              </td>
              <td className="py-2.5 px-2 text-center text-gray-500">{p.team}</td>
              <td className={`py-2.5 px-2 text-center ${sortBy === "gp" ? "text-red-400 font-bold" : ""}`}>{p.gp}</td>
              {STATS.map((s) => (
                <td
                  key={s.key}
                  className={`py-2.5 px-2 text-center ${sortBy === s.key ? "text-red-400 font-bold" : ""}`}
                >
                  {s.key === "fg3_pct" ? `${p[s.key]}%` : p[s.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
