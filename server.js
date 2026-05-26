const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors({
  origin: '*'
}));
app.use(express.json());

// ── Test route ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Parlay Agent Server is running!' });
});

// ── Get all available sports ────────────────────────────────────
app.get('/sports', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.the-odds-api.com/v4/sports',
      {
        params: {
          apiKey: process.env.ODDS_API_KEY,
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Get live World Cup odds ─────────────────────────────────────
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
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Get live NBA odds ───────────────────────────────────────────
app.get('/odds/nba', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.the-odds-api.com/v4/sports/basketball_nba/odds',
      {
        params: {
          apiKey: process.env.ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h',
          oddsFormat: 'american',
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Start server ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});