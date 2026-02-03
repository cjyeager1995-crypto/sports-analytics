const RANGES = ["3g", "10g", "1m", "3m", "6m"] as const;
const LABELS: Record<string, string> = {
  "3g": "Last 3",
  "10g": "Last 10",
  "1m": "1 Month",
  "3m": "3 Months",
  "6m": "6 Months",
};

export default function TimeRangeToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (r: string) => void;
}) {
  return (
    <div className="flex gap-1 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
            value === r
              ? "bg-red-700 text-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {LABELS[r]}
        </button>
      ))}
    </div>
  );
}
