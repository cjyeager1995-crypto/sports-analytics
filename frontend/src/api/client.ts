const BASE = import.meta.env.PROD
  ? "https://sports-analytics-p0qd.onrender.com/api"
  : "/api";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export interface Player {
  id: number;
  full_name: string;
  is_active: boolean;
}

export interface Team {
  id: number;
  full_name: string;
  abbreviation: string;
}

export interface TopPlayer {
  player_id: number;
  name: string;
  team: string;
  gp: number;
  pts: number;
  reb: number;
  ast: number;
  blk: number;
  stl: number;
  tov: number;
  fg3m: number;
  fg3_pct: number;
  ftm: number;
}

export interface TeamStanding {
  team_id: number;
  city: string;
  name: string;
  conference: string;
  wins: number;
  losses: number;
  win_pct: number;
  record: string;
  home: string;
  road: string;
  l10: string;
  streak: string;
  ppg: number;
  opp_ppg: number;
  diff: number;
}

export interface GameLog {
  GAME_DATE: string;
  MATCHUP: string;
  WL: string;
  MIN: number;
  PTS: number;
  REB: number;
  AST: number;
  BLK: number;
  STL: number;
  TOV: number;
  FG3M: number;
  FTM: number;
  [key: string]: unknown;
}

export interface StatSummary {
  avg: number;
  min: number;
  max: number;
  games: number;
}

export interface TrendData {
  player_id: number;
  range: string;
  rolling: Record<string, { r5: number[]; r10: number[] }>;
  direction: Record<string, string>;
  summary: Record<string, StatSummary>;
}

export interface StatsData {
  player_id: number;
  range: string;
  games: GameLog[];
  summary: Record<string, StatSummary>;
}

export interface RosterPlayer {
  player_id: number;
  name: string;
  position: string;
  number: string;
  summary: Record<string, StatSummary>;
  direction: Record<string, string>;
}

export interface RosterData {
  team_id: number;
  range: string;
  players: RosterPlayer[];
}

export const api = {
  searchPlayers: (q: string) =>
    fetchJSON<{ players: Player[] }>(`/players/search?q=${encodeURIComponent(q)}`),

  searchTeams: (q: string) =>
    fetchJSON<{ teams: Team[] }>(`/teams/search?q=${encodeURIComponent(q)}`),

  getTopPlayers: (n = 50, sortBy = "pts") =>
    fetchJSON<{ players: TopPlayer[] }>(`/players/top?n=${n}&sort_by=${sortBy}`),

  getTeamStandings: () =>
    fetchJSON<{ teams: TeamStanding[] }>(`/teams/standings`),

  getStats: (playerId: number, range = "3m") =>
    fetchJSON<StatsData>(`/players/${playerId}/stats?range=${range}`),

  getTrends: (playerId: number, range = "3m") =>
    fetchJSON<TrendData>(`/players/${playerId}/trends?range=${range}`),

  getTeamRoster: (teamId: number, range = "10g") =>
    fetchJSON<RosterData>(`/teams/${teamId}/roster?range=${range}`),
};
