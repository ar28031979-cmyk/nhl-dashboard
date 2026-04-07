import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.static('public'));

const TEAMS = [
  {a:"ANA", c:"Anaheim", n:"Ducks", color:"#F47A38"},
  {a:"BOS", c:"Boston", n:"Bruins", color:"#FFB81C"},
  {a:"BUF", c:"Buffalo", n:"Sabres", color:"#003087"},
  {a:"CGY", c:"Calgary", n:"Flames", color:"#C8102E"},
  {a:"CAR", c:"Carolina", n:"Hurricanes", color:"#CC0000"},
  {a:"CHI", c:"Chicago", n:"Blackhawks", color:"#CF0A2C"},
  {a:"COL", c:"Colorado", n:"Avalanche", color:"#6F263D"},
  {a:"CBJ", c:"Columbus", n:"Blue Jackets", color:"#002654"},
  {a:"DAL", c:"Dallas", n:"Stars", color:"#006847"},
  {a:"DET", c:"Detroit", n:"Red Wings", color:"#CE1126"},
  {a:"EDM", c:"Edmonton", n:"Oilers", color:"#FF4C00"},
  {a:"FLA", c:"Florida", n:"Panthers", color:"#C8102E"},
  {a:"LAK", c:"Los Angeles", n:"Kings", color:"#898B8E"},
  {a:"MIN", c:"Minnesota", n:"Wild", color:"#154734"},
  {a:"MTL", c:"Montreal", n:"Canadiens", color:"#AF1E2D"},
  {a:"NSH", c:"Nashville", n:"Predators", color:"#FFB81C"},
  {a:"NJD", c:"New Jersey", n:"Devils", color:"#CE1126"},
  {a:"NYI", c:"NY Islanders", n:"Islanders", color:"#FC4C02"},
  {a:"NYR", c:"NY Rangers", n:"Rangers", color:"#0038A8"},
  {a:"OTT", c:"Ottawa", n:"Senators", color:"#C8102E"},
  {a:"PHI", c:"Philadelphia", n:"Flyers", color:"#F74902"},
  {a:"PIT", c:"Pittsburgh", n:"Penguins", color:"#FCB514"},
  {a:"SEA", c:"Seattle", n:"Kraken", color:"#007888"},
  {a:"SJS", c:"San Jose", n:"Sharks", color:"#006D75"},
  {a:"STL", c:"St. Louis", n:"Blues", color:"#002F87"},
  {a:"TBL", c:"Tampa Bay", n:"Lightning", color:"#002868"},
  {a:"TOR", c:"Toronto", n:"Maple Leafs", color:"#003E7E"},
  {a:"UTA", c:"Utah", n:"Hockey Club", color:"#4B92DB"},
  {a:"VAN", c:"Vancouver", n:"Canucks", color:"#00843D"},
  {a:"VGK", c:"Vegas", n:"Golden Knights", color:"#B4975A"},
  {a:"WSH", c:"Washington", n:"Capitals", color:"#C8102E"},
  {a:"WPG", c:"Winnipeg", n:"Jets", color:"#041E42"},
  {a:"CBJ2", c:"Seattle", n:"Kraken2", color:"#007888"} // extra to get 32 if needed
];

// Helper to fetch JSON from NHL API
async function fetchNHL(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Endpoint: /api/team/:team
app.get('/api/team/:team', async (req, res) => {
  try {
    const team = TEAMS.find(t => t.a === req.params.team.toUpperCase());
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const base = 'https://statsapi.web.nhl.com/api/v1';
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();

    // Fetch current month schedule
    const schedule = await fetchNHL(`${base}/schedule?teamId=${getTeamId(team.a)}&startDate=${year}-${month}-01&endDate=${year}-${month}-31`);

    // Determine last and next game
    const games = schedule.dates.flatMap(d => d.games);
    const pastGames = games.filter(g => g.status.detailedState === 'Final');
    const futureGames = games.filter(g => g.status.detailedState !== 'Final');

    const lastGame = pastGames[pastGames.length - 1] || null;
    const nextGame = futureGames[0] || null;

    res.json({ team, lastGame, nextGame });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Map team abbreviation to NHL team ID
function getTeamId(abbrev) {
  const map = {
    ANA: 24, BOS: 6, BUF: 7, CGY: 20, CAR: 12, CHI: 16, COL: 21,
    CBJ: 29, DAL: 25, DET: 17, EDM: 22, FLA: 13, LAK: 26, MIN: 30,
    MTL: 8, NSH: 18, NJD: 1, NYI: 2, NYR: 3, OTT: 9, PHI: 4,
    PIT: 5, SEA: 55, SJS: 28, STL: 19, TBL: 14, TOR: 10, UTA: 54,
    VAN: 23, VGK: 54, WSH: 15, WPG: 52
  };
  return map[abbrev] || 0;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
