const express = require('express');
const { calculateProbabilities, probToAmerican, findEdge } = require('./model');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Parlay Agent Server is running!' });
});

app.get('/sports', async (req, res) => {
  try {
    const response = await axios.get('https://api.the-odds-api.com/v4/sports', {
      params: { apiKey: process.env.ODDS_API_KEY, all: true }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/odds/worldcup', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup/odds',
      {
        params: {
          apiKey: process.env.ODDS_API_KEY,
          regions: 'us,eu',
          markets: 'h2h',
          oddsFormat: 'american',
        }
      }
    );

    const games = response.data.map(game => {
      const probs = calculateProbabilities(game.home_team, game.away_team);

      const getBestOdds = (teamName) => {
        let best = null, bestBook = null;
        game.bookmakers.forEach(book => {
          book.markets.forEach(market => {
            if (market.key === 'h2h') {
              market.outcomes.forEach(o => {
                if (o.name === teamName) {
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

      const homeBest = getBestOdds(game.home_team);
      const awayBest = getBestOdds(game.away_team);

      return {
        ...game,
        model: {
          homeWinProb: (probs.home * 100).toFixed(1),
          awayWinProb: (probs.away * 100).toFixed(1),
          drawProb: (probs.draw * 100).toFixed(1),
          homeModelOdds: probToAmerican(probs.home),
          awayModelOdds: probToAmerican(probs.away),
          homeEdge: homeBest.odds ? findEdge(probs.home, homeBest.odds) : null,
          awayEdge: awayBest.odds ? findEdge(probs.away, awayBest.odds) : null,
          homeBestOdds: homeBest,
          awayBestOdds: awayBest,
          recommendation: (() => {
            const homeEdge = parseFloat(homeBest.odds ? findEdge(probs.home, homeBest.odds) : -99);
            const awayEdge = parseFloat(awayBest.odds ? findEdge(probs.away, awayBest.odds) : -99);
            if (homeEdge > 5) return { bet: game.home_team, edge: homeEdge, rating: '✅ VALUE' };
            if (awayEdge > 5) return { bet: game.away_team, edge: awayEdge, rating: '✅ VALUE' };
            if (homeEdge > 2) return { bet: game.home_team, edge: homeEdge, rating: '⚠️ SLIGHT EDGE' };
            if (awayEdge > 2) return { bet: game.away_team, edge: awayEdge, rating: '⚠️ SLIGHT EDGE' };
            return { bet: null, edge: 0, rating: '❌ NO VALUE' };
          })()
        }
      };
    });

    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});