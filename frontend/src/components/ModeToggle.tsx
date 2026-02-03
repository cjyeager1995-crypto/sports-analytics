const MODES = ["players", "teams", "favorites"] as const;
const LABELS: Record<string, string> = {
  players: "Players",
  teams: "Teams",
  favorites: "Favorites",
};

export type Mode = (typeof MODES)[number];

export default function ModeToggle({
  value,
  onChange,
  favCount,
}: {
  value: Mode;
  onChange: (v: Mode) => void;
  favCount?: number;
}) {
  return (
    <div className="flex gap-1 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
      {MODES.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
            value === m
              ? "bg-red-700 text-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {LABELS[m]}
          {m === "favorites" && favCount ? (
            <span className="ml-1.5 text-xs opacity-70">({favCount})</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
