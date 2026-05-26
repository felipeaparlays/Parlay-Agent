import { useState, useEffect } from "react";

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parlay, setParlay] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/odds/worldcup")
      .then(r => r.json())
      .then(data => {
        setGames(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getBestOdds = (bookmakers, team) => {
    let best = null, bestBook = null;
    bookmakers.forEach(book => {
      book.markets.forEach(market => {
        if (market.key === "h2h") {
          market.outcomes.forEach(o => {
            if (o.name === team) {
              const dec = o.price > 0 ? o.price / 100 + 1 : 100 / Math.abs(o.price) + 1;
              const bestDec = best ? (best > 0 ? best / 100 + 1 : 100 / Math.abs(best) + 1) : 0;
              if (dec > bestDec) { best = o.price; bestBook = book.title; }
            }
          });
        }
      });
    });
    return { odds: best, book: bestBook };
  };

  const addToParlay = (team, odds, book, game) => {
    if (parlay.find(p => p.game === game)) return;
    setParlay([...parlay, { team, odds, book, game }]);
  };

  const parlayPayout = parlay.reduce((acc, p) => {
    const dec = p.odds > 0 ? p.odds / 100 + 1 : 100 / Math.abs(p.odds) + 1;
    return acc * dec;
  }, 1);

  return (
    <div style={{ background: "#0a0d14", minHeight: "100vh", color: "#fff", fontFamily: "monospace", padding: 20 }}>
      <h1 style={{ color: "#00e5a0", fontSize: 24 }}>🌍 World Cup 2026 Agent</h1>
      <p style={{ color: "#5a6a85" }}>Live odds from 20+ books — tap a team to add to parlay</p>

      {parlay.length > 0 && (
        <div style={{ background: "#0f1a2e", border: "1px solid #00e5a040", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ color: "#00e5a0", fontWeight: "bold", marginBottom: 8 }}>🎯 Your Parlay</div>
          {parlay.map((p, i) => (
            <div key={i} style={{ color: "#a0b4cc", marginBottom: 4 }}>
              {p.team} ({p.odds > 0 ? "+" : ""}{p.odds} on {p.book})
            </div>
          ))}
          <div style={{ color: "#00e5a0", marginTop: 8, fontWeight: "bold" }}>
            $100 → ${(parlayPayout * 100).toFixed(0)} payout ({parlayPayout.toFixed(2)}x)
          </div>
          <button onClick={() => setParlay([])}
            style={{ marginTop: 8, background: "#ff5c5c20", border: "1px solid #ff5c5c", color: "#ff5c5c", padding: "6px 14px", borderRadius: 6, cursor: "pointer" }}>
            Clear
          </button>
        </div>
      )}

      {loading && <p style={{ color: "#5a6a85" }}>Loading live odds...</p>}

      {games.map(game => (
        <div key={game.id} style={{ background: "#111827", border: "1px solid #1e2a40", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ color: "#5a6a85", fontSize: 12, marginBottom: 8 }}>
            {new Date(game.commence_time).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[game.home_team, game.away_team].map(team => {
              const best = getBestOdds(game.bookmakers, team);
              const inParlay = parlay.find(p => p.team === team);
              return (
                <button key={team} onClick={() => addToParlay(team, best.odds, best.book, game.id)}
                  style={{ flex: 1, background: inParlay ? "#00e5a020" : "#0a0d14", border: `1px solid ${inParlay ? "#00e5a0" : "#1e2a40"}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>{team}</div>
                  <div style={{ color: "#00e5a0", fontSize: 12 }}>{best.odds > 0 ? "+" : ""}{best.odds}</div>
                  <div style={{ color: "#5a6a85", fontSize: 11 }}>{best.book}</div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}