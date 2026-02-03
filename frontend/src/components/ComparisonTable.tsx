import { StatSummary } from "../api/client";

const STATS = ["PTS", "REB", "AST", "FG3M", "BLK", "STL", "TOV", "FTM"];
const ARROW: Record<string, string> = { up: "\u2191", down: "\u2193", stable: "" };
const DIR_COLOR: Record<string, string> = {
  up: "text-green-400",
  down: "text-red-400",
  stable: "text-gray-600",
};

export interface TableRow {
  name: string;
  id: number;
  subtitle?: string;
  summary: Record<string, StatSummary> | null;
  direction: Record<string, string> | null;
  loading: boolean;
}

export default function ComparisonTable({
  rows,
  onRemove,
  label,
  isPlayerFav,
  onToggleFav,
}: {
  rows: TableRow[];
  onRemove?: (id: number) => void;
  label?: string;
  isPlayerFav?: (id: number) => boolean;
  onToggleFav?: (id: number, name: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-gray-600 text-center mt-12">
        Search and add {label || "items"} above to compare stats.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-900">
            {onToggleFav && <th className="w-10 py-3 px-2"></th>}
            <th className="text-left py-3 px-3 text-gray-500 font-medium sticky left-0 bg-neutral-900 min-w-[180px]">
              Player
            </th>
            <th className="py-3 px-2 text-gray-500 font-medium text-center w-14">GP</th>
            {STATS.map((s) => (
              <th key={s} className="py-3 px-2 text-gray-500 font-medium text-center min-w-[70px]">
                {s}
              </th>
            ))}
            {onRemove && <th className="w-10"></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-neutral-900 hover:bg-neutral-900/60">
              {onToggleFav && (
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => onToggleFav(p.id, p.name)}
                    className={`text-lg leading-none transition ${
                      isPlayerFav?.(p.id) ? "text-red-500" : "text-neutral-700 hover:text-red-500"
                    }`}
                  >
                    {isPlayerFav?.(p.id) ? "\u2605" : "\u2606"}
                  </button>
                </td>
              )}
              <td className="py-3 px-3 font-medium sticky left-0 bg-black whitespace-nowrap">
                {p.name}
                {p.subtitle && (
                  <span className="ml-2 text-xs text-gray-600">{p.subtitle}</span>
                )}
              </td>
              {p.loading ? (
                <td colSpan={STATS.length + 1} className="py-3 px-2 text-gray-600 text-center">
                  Loading...
                </td>
              ) : p.summary ? (
                <>
                  <td className="py-3 px-2 text-center text-gray-500">
                    {p.summary[STATS[0]]?.games ?? "-"}
                  </td>
                  {STATS.map((s) => {
                    const summary = p.summary![s];
                    const dir = p.direction?.[s] || "stable";
                    if (!summary)
                      return <td key={s} className="py-3 px-2 text-center text-neutral-700">-</td>;
                    return (
                      <td key={s} className="py-3 px-2 text-center">
                        <span className="font-semibold">{summary.avg}</span>
                        <span className={`ml-1 text-xs ${DIR_COLOR[dir]}`}>{ARROW[dir]}</span>
                        <div className="text-[10px] text-gray-600 leading-tight">
                          {summary.min}-{summary.max}
                        </div>
                      </td>
                    );
                  })}
                </>
              ) : (
                <td colSpan={STATS.length + 1} className="py-3 px-2 text-red-500 text-center">
                  Error
                </td>
              )}
              {onRemove && (
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => onRemove(p.id)}
                    className="text-neutral-700 hover:text-red-500 transition text-lg leading-none"
                    title="Remove"
                  >
                    &times;
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
