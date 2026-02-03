import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { GameLog } from "../api/client";

export default function TrendChart({
  stat,
  games,
  rolling5,
  rolling10,
}: {
  stat: string;
  games: GameLog[];
  rolling5: number[];
  rolling10: number[];
}) {
  const data = games.map((g, i) => ({
    date: g.GAME_DATE,
    value: g[stat] as number,
    r5: rolling5[i],
    r10: rolling10[i],
  }));

  return (
    <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase">{stat}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#525252" }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 10, fill: "#525252" }} width={30} />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid #262626", borderRadius: 8 }}
            labelStyle={{ color: "#737373" }}
          />
          <Line type="monotone" dataKey="value" stroke="#525252" dot={false} strokeWidth={1} />
          <Line type="monotone" dataKey="r5" stroke="#dc2626" dot={false} strokeWidth={2} name="5-game avg" />
          <Line type="monotone" dataKey="r10" stroke="#991b1b" dot={false} strokeWidth={2} name="10-game avg" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
