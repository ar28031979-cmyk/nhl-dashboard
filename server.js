import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.static('public')); // serves index.html

// Cache to reduce API calls
const CACHE = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 min

const TEAMS = [
  "ANA","BOS","BUF","CGY","CAR","CHI","COL","CBJ","DAL","DET","EDM",
  "FLA","LAK","MIN","MTL","NSH","NJD","NYI","NYR","OTT","PHI",
  "PIT","SEA","SJS","STL","TBL","TOR","VAN","VGK","WSH","WPG"
];

// Helper: Get month string
const monthStr = (offset = 0) => {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
};

// Fetch team schedule
app.get('/api/team/:team', async (req, res) => {
  const team = req.params.team.toUpperCase();
  if (!TEAMS.includes(team)) return res.status(404).json({ error: 'Unknown team' });

  const now = Date.now();
  if (CACHE[team] && now - CACHE[team].ts < CACHE_TTL) {
    return res.json(CACHE[team].data);
  }

  try {
    const urls = [
      `https://statsapi.web.nhl.com/api/v1/schedule?teamId=${team}&startDate=${monthStr()}-01&endDate=${monthStr()}-31`,
      `https://statsapi.web.nhl.com/api/v1/schedule?teamId=${team}&startDate=${monthStr(-1)}-01&endDate=${monthStr(-1)}-31`
    ];

    let games = [];
    for (const u of urls) {
      const r = await fetch(u);
      const j = await r.json();
      if (j.dates) j.dates.forEach(d => d.games.forEach(g => games.push(g)));
    }

    games.sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));

    // Add YouTube embed links
    games = games.map(g => {
      const home = g.teams.home.team.abbreviation;
      const away = g.teams.away.team.abbreviation;
      const videoQuery = `${away} ${home} highlights`;
      g.youtube = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(videoQuery)}`;
      return g;
    });

    CACHE[team] = { ts: now, data: { games } };
    res.json({ games });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch NHL data', detail: e.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
