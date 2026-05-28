import { useState, useEffect } from "react";

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parlay, setParlay] = useState([]);

  useEffect(() => {
    fetch("https://parlay-agent-production.up.railway.app/odds/worldcup")
      .then(r => r.json())
      .then(data => { setGames(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const addToParlay = (team, odds, book, gameId) => {
    if (parlay.find(p => p.gameId === gameId)) return;
    setParlay([...parlay, { team, odds, book, gameId }]);
  };

  const parlayPayout = parlay.reduce((acc, p) => {
    const dec = p.odds > 0 ? p.odds / 100 + 1 : 100 / Math.abs(p.odds) + 1;
    return acc * dec;
  }, 1);

  const getRatingColor = (rating) => {
    if (rating?.includes('VALUE')) return '#00e5a0';
    if (rating?.includes('SLIGHT')) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ background: "#0a0d14", minHeight: "100vh", color: "#fff", fontFamily: "system-ui", padding: "16px", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ color: "#00e5a0", fontSize: 20, margin: "0 0 4px" }}>🌍 World Cup 2026 Agent</h1>
      <p style={{ color: "#5a6a85", fontSize: 12, margin: "0 0 16px" }}>Smart model + live odds from 20+ books</p>

      {parlay.length > 0 && (
        <div style={{ background: "#0f1a2e", border: "1px solid #00e5a040", borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <div style={{ color: "#00e5a0", fontWeight: "bold", marginBottom: 8, fontSize: 14 }}>🎯 Your Parlay</div>
          {parlay.map((p, i) => (
            <div key={i} style={{ color: "#a0b4cc", fontSize: 13, marginBottom: 4 }}>
              {p.team} ({p.odds > 0 ? "+" : ""}{p.odds} on {p.book})
            </div>
          ))}
          <div style={{ color: "#00e5a0", marginTop: 8, fontWeight: "bold", fontSize: 14 }}>
            $100 → ${(parlayPayout * 100).toFixed(0)} ({parlayPayout.toFixed(2)}x)
          </div>
          <button onClick={() => setParlay([])}
            style={{ marginTop: 8, background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
            Clear
          </button>
        </div>
      )}

      {loading && <p style={{ color: "#5a6a85" }}>Loading live odds + model analysis...</p>}

      {games.map(game => {
        const m = game.model;
        if (!m) return null;
        const rec = m.recommendation;

        return (
          <div key={game.id} style={{ background: "#111827", border: "1px solid #1e2a40", borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ color: "#5a6a85", fontSize: 11 }}>
                {new Date(game.commence_time).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
              <div style={{ fontSize: 11, fontWeight: "bold", color: getRatingColor(rec?.rating) }}>
                {rec?.rating}
              </div>
            </div>

            {rec?.bet && (
              <div style={{ background: "#00e5a010", border: "1px solid #00e5a030", borderRadius: 8, padding: "6px 10px", marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: "#00e5a0" }}>Model Pick: </span>
                <span style={{ color: "#fff" }}>{rec.bet}</span>
                <span style={{ color: "#5a6a85" }}> · Edge: +{rec.edge}%</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              {[
                { team: game.home_team, prob: m.homeWinProb, modelOdds: m.homeModelOdds, best: m.homeBestOdds, edge: m.homeEdge },
                { team: game.away_team, prob: m.awayWinProb, modelOdds: m.awayModelOdds, best: m.awayBestOdds, edge: m.awayEdge }
              ].map(side => {
                const inParlay = parlay.find(p => p.team === side.team);
                const hasEdge = parseFloat(side.edge) > 2;
                return (
                  <button key={side.team} onClick={() => addToParlay(side.team, side.best?.odds, side.best?.book, game.id)}
                    style={{ flex: 1, background: inParlay ? "#00e5a015" : "#0a0d14", border: `1px solid ${inParlay ? "#00e5a0" : hasEdge ? "#00e5a040" : "#1e2a40"}`, borderRadius: 8, padding: "10px 8px", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ color: "#fff", fontWeight: "bold", fontSize: 12, marginBottom: 4 }}>{side.team}</div>
                    <div style={{ color: "#00e5a0", fontSize: 13, fontWeight: "bold" }}>
                      {side.best?.odds > 0 ? "+" : ""}{side.best?.odds}
                    </div>
                    <div style={{ color: "#5a6a85", fontSize: 10 }}>{side.best?.book}</div>
                    <div style={{ marginTop: 4, paddingTop: 4, borderTop: "1px solid #1e2a40" }}>
                      <div style={{ color: "#a0b4cc", fontSize: 10 }}>Model: {side.prob}% win</div>
                      <div style={{ color: "#a0b4cc", fontSize: 10 }}>Fair odds: {side.modelOdds > 0 ? "+" : ""}{side.modelOdds}</div>
                      {side.edge && <div style={{ color: parseFloat(side.edge) > 2 ? "#00e5a0" : "#5a6a85", fontSize: 10 }}>Edge: {side.edge}%</div>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 8, textAlign: "center", fontSize: 10, color: "#5a6a85" }}>
              Draw: {m.drawProb}% probability
            </div>
          </div>
        );
      })}
    </div>
  );
}