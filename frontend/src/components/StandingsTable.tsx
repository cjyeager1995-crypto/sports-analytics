import { TeamStanding } from "../api/client";

export default function StandingsTable({
  teams,
  loading,
  isTeamFav,
  onToggleFav,
}: {
  teams: TeamStanding[];
  loading: boolean;
  isTeamFav: (id: number) => boolean;
  onToggleFav: (id: number, name: string) => void;
}) {
  if (loading) {
    return <p className="text-gray-600 text-center mt-12">Loading standings...</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-900">
            <th className="w-10 py-3 px-2"></th>
            <th className="text-left py-3 px-2 text-gray-500 font-medium w-8">#</th>
            <th className="text-left py-3 px-3 text-gray-500 font-medium sticky left-0 bg-neutral-900 min-w-[180px]">
              Team
            </th>
            <th className="py-3 px-2 text-gray-500 font-medium text-center">CONF</th>
            <th className="py-3 px-2 text-gray-500 font-medium text-center">W</th>
            <th className="py-3 px-2 text-gray-500 font-medium text-center">L</th>
            <th className="py-3 px-2 text-red-500 font-medium text-center">WIN%</th>
            <th className="py-3 px-2 text-gray-500 font-medium text-center">HOME</th>
            <th className="py-3 px-2 text-gray-500 font-medium text-center">ROAD</th>
            <th className="py-3 px-2 text-gray-500 font-medium text-center">L10</th>
            <th className="py-3 px-2 text-gray-500 font-medium text-center">STRK</th>
            <th className="py-3 px-2 text-gray-500 font-medium text-center">PPG</th>
            <th className="py-3 px-2 text-gray-500 font-medium text-center">OPP</th>
            <th className="py-3 px-2 text-gray-500 font-medium text-center">DIFF</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t, i) => (
            <tr key={t.team_id} className="border-b border-neutral-900 hover:bg-neutral-900/60">
              <td className="py-2.5 px-2 text-center">
                <button
                  onClick={() => onToggleFav(t.team_id, `${t.city} ${t.name}`)}
                  className={`text-lg leading-none transition ${
                    isTeamFav(t.team_id) ? "text-red-500" : "text-neutral-700 hover:text-red-500"
                  }`}
                >
                  {isTeamFav(t.team_id) ? "\u2605" : "\u2606"}
                </button>
              </td>
              <td className="py-2.5 px-2 text-gray-600 text-sm">{i + 1}</td>
              <td className="py-2.5 px-3 font-medium sticky left-0 bg-black whitespace-nowrap">
                {t.city} {t.name}
              </td>
              <td className="py-2.5 px-2 text-center text-gray-500">{t.conference}</td>
              <td className="py-2.5 px-2 text-center text-green-400 font-semibold">{t.wins}</td>
              <td className="py-2.5 px-2 text-center text-red-400 font-semibold">{t.losses}</td>
              <td className="py-2.5 px-2 text-center text-red-400 font-bold">{t.win_pct}%</td>
              <td className="py-2.5 px-2 text-center text-gray-400">{t.home}</td>
              <td className="py-2.5 px-2 text-center text-gray-400">{t.road}</td>
              <td className="py-2.5 px-2 text-center text-gray-400">{t.l10}</td>
              <td className="py-2.5 px-2 text-center text-gray-400">{t.streak}</td>
              <td className="py-2.5 px-2 text-center">{t.ppg}</td>
              <td className="py-2.5 px-2 text-center text-gray-400">{t.opp_ppg}</td>
              <td className={`py-2.5 px-2 text-center font-semibold ${t.diff > 0 ? "text-green-400" : t.diff < 0 ? "text-red-400" : "text-gray-400"}`}>
                {t.diff > 0 ? "+" : ""}{t.diff}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
