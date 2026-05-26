const axios = require('axios');
require('dotenv').config();

const toDecimal = (american) => {
  const n = parseFloat(american);
  if (isNaN(n)) return null;
  return n > 0 ? n / 100 + 1 : 100 / Math.abs(n) + 1;
};

const impliedProb = (american) => {
  const n = parseFloat(american);
  if (isNaN(n)) return null;
  return n < 0 ? Math.abs(n) / (Math.abs(n) + 100) : 100 / (n + 100);
};

const findBestOdds = (bookmakers, teamName) => {
  let best = null;
  let bestBook = null;
  bookmakers.forEach(book => {
    book.markets.forEach(market => {
      if (market.key === 'h2h') {
        market.outcomes.forEach(outcome => {
          if (outcome.name === teamName) {
            const dec = toDecimal(outcome.price);
            if (!best || dec > toDecimal(best)) {
              best = outcome.price;
              bestBook = book.title;
            }
          }
        });
      }
    });
  });
  return { odds: best, book: bestBook };
};

const analyzeWorldCup = async () => {
  try {
    console.log('\n Fetching live World Cup odds...\n');
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

    const games = response.data;
    const results = [];

    games.forEach(game => {
      const teams = [game.home_team, game.away_team];
      const gameDate = new Date(game.commence_time).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      teams.forEach(team => {
        const best = findBestOdds(game.bookmakers, team);
        if (!best.odds) return;
        const dec = toDecimal(best.odds);
        const ip = impliedProb(best.odds);
        const trueProb = ip / 1.046;
        const ev = ((trueProb - ip) / ip * 100).toFixed(1);

        results.push({
          game: `${game.home_team} vs ${game.away_team}`,
          date: gameDate,
          team,
          bestOdds: best.odds,
          bestBook: best.book,
          decimal: dec.toFixed(2),
          impliedProb: (ip * 100).toFixed(1) + '%',
          ev: ev + '%',
          evNum: parseFloat(ev),
        });
      });
    });

    results.sort((a, b) => b.evNum - a.evNum);

    console.log('WORLD CUP 2026 - BEST VALUE PLAYS\n');
    console.log('='.repeat(55));

    results.slice(0, 10).forEach((r, i) => {
      console.log(`\n#${i + 1} ${r.team}`);
      console.log(`   Game:      ${r.game}`);
      console.log(`   Date:      ${r.date}`);
      console.log(`   Best Odds: ${r.bestOdds} on ${r.bestBook}`);
      console.log(`   Pays:      ${r.decimal}x`);
      console.log(`   EV:        ${r.ev}`);
    });

    const bestTwo = results.slice(0, 2);
    if (bestTwo.length === 2) {
      const combined = (parseFloat(bestTwo[0].decimal) * parseFloat(bestTwo[1].decimal)).toFixed(2);
      const payout = (parseFloat(combined) * 100).toFixed(0);
      console.log('\n BEST 2-LEG PARLAY');
      console.log(`   Leg 1: ${bestTwo[0].team} (${bestTwo[0].bestOdds} on ${bestTwo[0].bestBook})`);
      console.log(`   Leg 2: ${bestTwo[1].team} (${bestTwo[1].bestOdds} on ${bestTwo[1].bestBook})`);
      console.log(`   $100 stake pays $${payout}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
};

analyzeWorldCup();