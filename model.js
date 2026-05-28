// ── Parlay Agent Smart Model ──────────────────────────────────────
// Calculates true win probabilities based on multiple factors

const TEAM_DATA = {
  // Group A
  "Mexico": { fifa: 11, attack: 72, defense: 68, form: [1,1,0,1,1], homeAdv: 8 },
  "South Africa": { fifa: 67, attack: 45, defense: 50, form: [0,1,0,0,1], homeAdv: 5 },
  "South Korea": { fifa: 23, attack: 65, defense: 62, form: [1,0,1,1,0], homeAdv: 4 },
  "Czech Republic": { fifa: 40, attack: 60, defense: 63, form: [1,1,0,1,0], homeAdv: 4 },

  // Group B
  "USA": { fifa: 13, attack: 70, defense: 65, form: [1,1,1,0,1], homeAdv: 9 },
  "Paraguay": { fifa: 55, attack: 48, defense: 55, form: [0,0,1,1,0], homeAdv: 5 },
  "Qatar": { fifa: 37, attack: 52, defense: 55, form: [0,1,0,1,0], homeAdv: 6 },
  "Canada": { fifa: 38, attack: 58, defense: 60, form: [1,0,1,1,1], homeAdv: 7 },

  // Group C
  "Brazil": { fifa: 5, attack: 88, defense: 82, form: [1,1,1,1,0], homeAdv: 7 },
  "Morocco": { fifa: 14, attack: 65, defense: 72, form: [1,0,1,1,1], homeAdv: 5 },
  "Haiti": { fifa: 90, attack: 38, defense: 40, form: [0,0,1,0,0], homeAdv: 4 },
  "Scotland": { fifa: 39, attack: 58, defense: 60, form: [1,1,0,0,1], homeAdv: 5 },

  // Group D
  "Germany": { fifa: 16, attack: 82, defense: 75, form: [1,1,0,1,1], homeAdv: 7 },
  "Curaçao": { fifa: 85, attack: 35, defense: 38, form: [0,0,0,1,0], homeAdv: 3 },
  "Netherlands": { fifa: 7, attack: 80, defense: 76, form: [1,1,1,0,1], homeAdv: 6 },
  "Ivory Coast": { fifa: 48, attack: 62, defense: 55, form: [1,0,1,0,1], homeAdv: 5 },

  // Group E
  "Spain": { fifa: 8, attack: 84, defense: 78, form: [1,1,1,1,0], homeAdv: 6 },
  "Cape Verde": { fifa: 75, attack: 42, defense: 48, form: [1,0,0,1,0], homeAdv: 5 },
  "Belgium": { fifa: 3, attack: 82, defense: 74, form: [1,1,0,1,1], homeAdv: 6 },
  "Egypt": { fifa: 36, attack: 58, defense: 62, form: [0,1,1,0,1], homeAdv: 5 },

  // Group F
  "Saudi Arabia": { fifa: 56, attack: 52, defense: 55, form: [1,0,1,0,0], homeAdv: 6 },
  "Uruguay": { fifa: 17, attack: 72, defense: 70, form: [1,1,0,1,1], homeAdv: 5 },
  "Iran": { fifa: 22, attack: 60, defense: 65, form: [1,0,1,1,0], homeAdv: 5 },
  "New Zealand": { fifa: 97, attack: 40, defense: 45, form: [0,1,0,0,1], homeAdv: 4 },

  // Group G
  "France": { fifa: 2, attack: 90, defense: 82, form: [1,1,1,0,1], homeAdv: 7 },
  "Senegal": { fifa: 20, attack: 68, defense: 65, form: [1,0,1,1,0], homeAdv: 5 },
  "Iraq": { fifa: 63, attack: 45, defense: 48, form: [0,1,0,0,1], homeAdv: 5 },
  "Norway": { fifa: 35, attack: 68, defense: 62, form: [1,1,1,0,1], homeAdv: 5 },

  // Group H
  "Argentina": { fifa: 1, attack: 92, defense: 80, form: [1,1,1,1,1], homeAdv: 7 },
  "Algeria": { fifa: 30, attack: 60, defense: 62, form: [1,0,1,0,1], homeAdv: 5 },
  "Austria": { fifa: 25, attack: 68, defense: 67, form: [1,1,0,1,0], homeAdv: 5 },
  "Jordan": { fifa: 87, attack: 38, defense: 45, form: [0,0,1,0,0], homeAdv: 4 },

  // Group I
  "Portugal": { fifa: 6, attack: 86, defense: 76, form: [1,1,1,0,1], homeAdv: 6 },
  "DR Congo": { fifa: 58, attack: 50, defense: 48, form: [1,0,0,1,0], homeAdv: 5 },
  "Colombia": { fifa: 19, attack: 72, defense: 66, form: [1,1,0,1,1], homeAdv: 6 },
  "Uzbekistan": { fifa: 70, attack: 48, defense: 50, form: [1,0,1,0,1], homeAdv: 4 },

  // Group J
  "England": { fifa: 4, attack: 84, defense: 78, form: [1,1,1,1,0], homeAdv: 7 },
  "Croatia": { fifa: 10, attack: 72, defense: 70, form: [0,1,1,0,1], homeAdv: 5 },
  "Ghana": { fifa: 60, attack: 55, defense: 52, form: [1,0,1,0,1], homeAdv: 5 },
  "Panama": { fifa: 80, attack: 40, defense: 50, form: [0,0,0,1,0], homeAdv: 4 },

  // Group K
  "Australia": { fifa: 24, attack: 62, defense: 60, form: [1,0,1,1,0], homeAdv: 5 },
  "Turkey": { fifa: 29, attack: 66, defense: 63, form: [1,1,0,1,0], homeAdv: 5 },
  "Japan": { fifa: 18, attack: 70, defense: 68, form: [1,1,1,0,1], homeAdv: 6 },
  "Tunisia": { fifa: 45, attack: 52, defense: 58, form: [0,1,0,1,0], homeAdv: 4 },

  // Group L
  "Switzerland": { fifa: 21, attack: 68, defense: 70, form: [1,0,1,1,1], homeAdv: 5 },
  "Bosnia & Herzegovina": { fifa: 62, attack: 55, defense: 50, form: [1,1,0,0,1], homeAdv: 5 },
};

// Calculate recent form score (weighted — recent games matter more)
const getFormScore = (form) => {
  const weights = [0.35, 0.25, 0.20, 0.12, 0.08];
  return form.reduce((acc, result, i) => acc + result * weights[i], 0);
};

// Calculate overall team strength score
const getTeamStrength = (team) => {
  const data = TEAM_DATA[team];
  if (!data) return 50;

  const fifaScore = Math.max(0, 100 - data.fifa) * 0.3;
  const attackScore = data.attack * 0.25;
  const defenseScore = data.defense * 0.25;
  const formScore = getFormScore(data.form) * 100 * 0.2;

  return fifaScore + attackScore + defenseScore + formScore;
};

// Main probability calculator
const calculateProbabilities = (homeTeam, awayTeam) => {
  const homeStrength = getTeamStrength(homeTeam);
  const awayStrength = getTeamStrength(awayTeam);

  const homeData = TEAM_DATA[homeTeam] || { homeAdv: 5 };
  const homeBoost = homeData.homeAdv || 5;

  const adjustedHome = homeStrength + homeBoost;
  const total = adjustedHome + awayStrength;

  const homeWin = adjustedHome / total;
  const awayWin = awayStrength / total;

  // Draw probability based on how close teams are
  const strengthDiff = Math.abs(homeStrength - awayStrength);
  const drawBase = 0.28 - (strengthDiff * 0.003);
  const drawProb = Math.max(0.08, Math.min(0.32, drawBase));

  // Normalize
  const scale = (1 - drawProb) / (homeWin + awayWin);
  return {
    home: homeWin * scale,
    away: awayWin * scale,
    draw: drawProb
  };
};

// Convert probability to american odds
const probToAmerican = (prob) => {
  if (prob >= 0.5) return Math.round(-(prob / (1 - prob)) * 100);
  return Math.round(((1 - prob) / prob) * 100);
};

// Find edge vs book odds
const findEdge = (trueProbability, bookOdds) => {
  const bookProb = bookOdds < 0
    ? Math.abs(bookOdds) / (Math.abs(bookOdds) + 100)
    : 100 / (bookOdds + 100);
  const edge = ((trueProbability - bookProb) / bookProb) * 100;
  return edge.toFixed(1);
};

module.exports = { calculateProbabilities, probToAmerican, findEdge, TEAM_DATA };