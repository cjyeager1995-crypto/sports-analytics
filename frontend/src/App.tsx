import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PlayerDetail from "./pages/PlayerDetail";

export default function App() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <header className="mb-8 border-b border-red-900/40 pb-4">
        <Link to="/">
          <h1 className="text-3xl font-bold tracking-tight text-red-500">Sports Analytics</h1>
        </Link>
        <p className="text-gray-500 text-sm mt-1">NBA Player Stats &amp; Trends</p>
      </header>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/player/:playerId" element={<PlayerDetail />} />
      </Routes>
    </div>
  );
}
