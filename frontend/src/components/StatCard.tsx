import { StatSummary } from "../api/client";

const ARROW: Record<string, string> = { up: "\u2191", down: "\u2193", stable: "\u2192" };
const COLOR: Record<string, string> = {
  up: "text-green-400",
  down: "text-red-400",
  stable: "text-gray-600",
};

export default function StatCard({
  label,
  summary,
  direction,
}: {
  label: string;
  summary: StatSummary;
  direction: string;
}) {
  return (
    <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
        <span className={`text-sm font-bold ${COLOR[direction]}`}>
          {ARROW[direction]} {direction}
        </span>
      </div>
      <p className="text-3xl font-bold">{summary.avg}</p>
      <p className="text-xs text-gray-600 mt-1">
        Min {summary.min} / Max {summary.max} &middot; {summary.games} games
      </p>
    </div>
  );
}
