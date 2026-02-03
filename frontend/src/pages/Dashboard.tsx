import { useState, useEffect, useCallback } from "react";
import PlayerSearch from "../components/PlayerSearch";
import ComparisonTable, { TableRow } from "../components/ComparisonTable";
import TopPlayersTable, { SortKey } from "../components/TopPlayersTable";
import StandingsTable from "../components/StandingsTable";
import TimeRangeToggle from "../components/TimeRangeToggle";
import ModeToggle, { Mode } from "../components/ModeToggle";
import { useFavorites } from "../hooks/useFavorites";
import { api, Player, Team, TopPlayer, TeamStanding, TrendData, RosterPlayer } from "../api/client";

interface TrackedPlayer {
  id: number;
  name: string;
  trends: TrendData | null;
  loading: boolean;
}

interface TrackedTeam {
  id: number;
  name: string;
  players: RosterPlayer[];
  loading: boolean;
  error: boolean;
}

export default function Dashboard() {
  const [mode, setMode] = useState<Mode>("players");
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [topLoading, setTopLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("pts");
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [players, setPlayers] = useState<TrackedPlayer[]>([]);
  const [teams, setTeams] = useState<TrackedTeam[]>([]);
  const [range, setRange] = useState("10g");
  const { favs, togglePlayer, toggleTeam, isPlayerFav, isTeamFav } = useFavorites();

  const [favPlayerData, setFavPlayerData] = useState<TrackedPlayer[]>([]);
  const [favTeamData, setFavTeamData] = useState<TrackedTeam[]>([]);

  // Load top 50 (re-fetch when sortBy changes)
  useEffect(() => {
    setTopLoading(true);
    api.getTopPlayers(50, sortBy).then((d) => {
      setTopPlayers(d.players);
      setTopLoading(false);
    }).catch(() => setTopLoading(false));
  }, [sortBy]);

  // Load standings on mount
  useEffect(() => {
    setStandingsLoading(true);
    api.getTeamStandings().then((d) => {
      setStandings(d.teams);
      setStandingsLoading(false);
    }).catch(() => setStandingsLoading(false));
  }, []);

  const loadTrends = useCallback(
    async (playerId: number): Promise<TrendData | null> => {
      try {
        return await api.getTrends(playerId, range);
      } catch {
        return null;
      }
    },
    [range]
  );

  const loadTeamRoster = useCallback(
    async (teamId: number) => {
      try {
        const data = await api.getTeamRoster(teamId, range);
        return data.players;
      } catch {
        return null;
      }
    },
    [range]
  );

  // Reload searched players when range changes
  useEffect(() => {
    if (players.length === 0) return;
    const ids = players.map((p) => ({ id: p.id, name: p.name }));
    setPlayers((prev) => prev.map((p) => ({ ...p, loading: true, trends: null })));
    ids.forEach(({ id }) => {
      loadTrends(id).then((trends) =>
        setPlayers((prev) =>
          prev.map((x) => (x.id === id ? { ...x, trends, loading: false } : x))
        )
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  // Reload searched teams when range changes
  useEffect(() => {
    if (teams.length === 0) return;
    const tms = teams.map((t) => ({ id: t.id, name: t.name }));
    setTeams((prev) => prev.map((t) => ({ ...t, loading: true, players: [], error: false })));
    tms.forEach(({ id }) => {
      loadTeamRoster(id).then((roster) =>
        setTeams((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, players: roster || [], loading: false, error: !roster } : t
          )
        )
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  // Load favorites data
  useEffect(() => {
    if (mode !== "favorites") return;
    const fpIds = favs.players.map((p) => p.id);
    setFavPlayerData(favs.players.map((p) => ({ id: p.id, name: p.name, trends: null, loading: true })));
    fpIds.forEach((id) => {
      loadTrends(id).then((trends) =>
        setFavPlayerData((prev) =>
          prev.map((x) => (x.id === id ? { ...x, trends, loading: false } : x))
        )
      );
    });
    setFavTeamData(favs.teams.map((t) => ({ id: t.id, name: t.name, players: [], loading: true, error: false })));
    favs.teams.forEach((t) => {
      loadTeamRoster(t.id).then((roster) =>
        setFavTeamData((prev) =>
          prev.map((x) =>
            x.id === t.id ? { ...x, players: roster || [], loading: false, error: !roster } : x
          )
        )
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, range, favs.players.length, favs.teams.length]);

  const addPlayer = async (player: Player) => {
    if (players.some((p) => p.id === player.id)) return;
    setPlayers((prev) => [...prev, { id: player.id, name: player.full_name, trends: null, loading: true }]);
    const trends = await loadTrends(player.id);
    setPlayers((prev) =>
      prev.map((p) => (p.id === player.id ? { ...p, trends, loading: false } : p))
    );
  };

  const addTeam = async (team: Team) => {
    if (teams.some((t) => t.id === team.id)) return;
    setTeams((prev) => [...prev, { id: team.id, name: team.full_name, players: [], loading: true, error: false }]);
    const roster = await loadTeamRoster(team.id);
    setTeams((prev) =>
      prev.map((t) =>
        t.id === team.id ? { ...t, players: roster || [], loading: false, error: !roster } : t
      )
    );
  };

  const removePlayer = (id: number) => setPlayers((prev) => prev.filter((p) => p.id !== id));
  const removeTeam = (id: number) => setTeams((prev) => prev.filter((t) => t.id !== id));

  const playerRows: TableRow[] = players.map((p) => ({
    name: p.name,
    id: p.id,
    summary: p.trends?.summary || null,
    direction: p.trends?.direction || null,
    loading: p.loading,
  }));

  const teamSections = teams.map((t) => ({
    team: t,
    rows: t.players.map((p) => ({
      name: p.name,
      id: p.player_id,
      subtitle: p.position ? `#${p.number} ${p.position}` : undefined,
      summary: p.summary,
      direction: p.direction,
      loading: false,
    })) as TableRow[],
  }));

  const favPlayerRows: TableRow[] = favPlayerData.map((p) => ({
    name: p.name,
    id: p.id,
    summary: p.trends?.summary || null,
    direction: p.trends?.direction || null,
    loading: p.loading,
  }));

  const favTeamSections = favTeamData.map((t) => ({
    team: t,
    rows: t.players.map((p) => ({
      name: p.name,
      id: p.player_id,
      subtitle: p.position ? `#${p.number} ${p.position}` : undefined,
      summary: p.summary,
      direction: p.direction,
      loading: false,
    })) as TableRow[],
  }));

  const totalFavs = favs.players.length + favs.teams.length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 flex-wrap">
        <ModeToggle value={mode} onChange={setMode} favCount={totalFavs} />
        {mode !== "favorites" && (
          <PlayerSearch mode={mode} onSelectPlayer={addPlayer} onSelectTeam={addTeam} />
        )}
        {(mode === "teams" || mode === "favorites") && (
          <TimeRangeToggle value={range} onChange={setRange} />
        )}
      </div>

      {/* PLAYERS MODE */}
      {mode === "players" && (
        <>
          {playerRows.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Search Results</h3>
              <ComparisonTable
                rows={playerRows}
                onRemove={removePlayer}
                label="players"
                isPlayerFav={isPlayerFav}
                onToggleFav={togglePlayer}
              />
            </div>
          )}
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Top 50 Players
            <span className="text-gray-600 font-normal ml-2">(click a column to sort)</span>
          </h3>
          <TopPlayersTable
            players={topPlayers}
            loading={topLoading}
            sortBy={sortBy}
            onSort={setSortBy}
            isPlayerFav={isPlayerFav}
            onToggleFav={togglePlayer}
          />
        </>
      )}

      {/* TEAMS MODE */}
      {mode === "teams" && (
        <>
          {teamSections.map(({ team, rows: tRows }) => (
            <div key={team.id} className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-bold text-red-500">{team.name}</h3>
                <button
                  onClick={() => toggleTeam(team.id, team.name)}
                  className={`text-lg transition ${isTeamFav(team.id) ? "text-red-500" : "text-neutral-700 hover:text-red-500"}`}
                >
                  {isTeamFav(team.id) ? "\u2605" : "\u2606"}
                </button>
                <button
                  onClick={() => removeTeam(team.id)}
                  className="text-neutral-700 hover:text-red-500 transition text-sm"
                >
                  Remove
                </button>
              </div>
              {team.loading ? (
                <p className="text-gray-600">Loading roster...</p>
              ) : team.error ? (
                <p className="text-red-500">Failed to load roster.</p>
              ) : (
                <ComparisonTable rows={tRows} label="players" isPlayerFav={isPlayerFav} onToggleFav={togglePlayer} />
              )}
            </div>
          ))}
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Team Standings
          </h3>
          <StandingsTable
            teams={standings}
            loading={standingsLoading}
            isTeamFav={isTeamFav}
            onToggleFav={toggleTeam}
          />
        </>
      )}

      {/* FAVORITES MODE */}
      {mode === "favorites" && totalFavs === 0 && (
        <p className="text-gray-600 text-center mt-12">
          No favorites yet. Star players or teams to add them here.
        </p>
      )}
      {mode === "favorites" && favs.players.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Favorite Players
          </h3>
          <ComparisonTable
            rows={favPlayerRows}
            label="players"
            isPlayerFav={isPlayerFav}
            onToggleFav={togglePlayer}
          />
        </div>
      )}
      {mode === "favorites" &&
        favTeamSections.map(({ team, rows: tRows }) => (
          <div key={team.id} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-bold text-red-500">{team.name}</h3>
              <button
                onClick={() => toggleTeam(team.id, team.name)}
                className="text-red-500 text-lg transition hover:text-neutral-700"
              >
                {"\u2605"}
              </button>
            </div>
            {team.loading ? (
              <p className="text-gray-600">Loading roster...</p>
            ) : team.error ? (
              <p className="text-red-500">Failed to load roster.</p>
            ) : (
              <ComparisonTable rows={tRows} label="players" isPlayerFav={isPlayerFav} onToggleFav={togglePlayer} />
            )}
          </div>
        ))}
    </div>
  );
}
