import { useState, useEffect } from "react";

export interface FavPlayer {
  id: number;
  name: string;
}

export interface FavTeam {
  id: number;
  name: string;
}

interface Favorites {
  players: FavPlayer[];
  teams: FavTeam[];
}

const STORAGE_KEY = "sports_analytics_favorites";

function load(): Favorites {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { players: [], teams: [] };
}

function save(favs: Favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

export function useFavorites() {
  const [favs, setFavs] = useState<Favorites>(load);

  useEffect(() => {
    save(favs);
  }, [favs]);

  const togglePlayer = (id: number, name: string) => {
    setFavs((prev) => {
      const exists = prev.players.some((p) => p.id === id);
      return {
        ...prev,
        players: exists
          ? prev.players.filter((p) => p.id !== id)
          : [...prev.players, { id, name }],
      };
    });
  };

  const toggleTeam = (id: number, name: string) => {
    setFavs((prev) => {
      const exists = prev.teams.some((t) => t.id === id);
      return {
        ...prev,
        teams: exists
          ? prev.teams.filter((t) => t.id !== id)
          : [...prev.teams, { id, name }],
      };
    });
  };

  const isPlayerFav = (id: number) => favs.players.some((p) => p.id === id);
  const isTeamFav = (id: number) => favs.teams.some((t) => t.id === id);

  return { favs, togglePlayer, toggleTeam, isPlayerFav, isTeamFav };
}
