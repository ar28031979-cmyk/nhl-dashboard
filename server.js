import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.static('public')); // serves index.html

const CACHE = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const TEAMS = [
  "ANA","BOS","BUF","CGY","CAR","CHI","COL","DAL","DET","EDM",
  "FLA","LAK","MIN","MTL","NSH","NJD","NYI","NYR","OTT","PHI",
  "PIT","SEA","SJS","STL","TBL","TOR","VAN","VGK","WSH","WPG"
];

// Pro endpoint to get team schedule
app.get('/api/team/:team', async (req, res) => {
  const team = req.params.team.toUpperCase();
  if(!TEAMS.includes(team)) return res.status(404).json({error:'Unknown team'});

  const now = Date.now();
  if(CACHE[team] && now - CACHE[team].ts < CACHE_TTL){
    return res.json(CACHE[team].data);
  }

  try{
    const month = (d= new Date()) => `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;

    const urls = [
      `https://statsapi.web.nhl.com/api/v1/schedule?teamId=${team}&startDate=${month()}-01&endDate=${month()}-31`,
      `https://statsapi.web.nhl.com/api/v1/schedule?teamId=${team}&startDate=${month(-1)}-01&endDate=${month(-1)}-31`
    ];

    let games = [];
    for(const u of urls){
      const r = await fetch(u);
      const j = await r.json();
      if(j.dates) j.dates.forEach(d => d.games.forEach(g=>games.push(g)));
    }

    // Sort games by date
    games.sort((a,b)=>new Date(a.gameDate) - new Date(b.gameDate));

    // Add highlight link using NHL YouTube search
    games = games.map(g => {
      const home = g.teams.home.team.abbreviation;
      const away = g.teams.away.team.abbreviation;
      const videoQuery = `${away} ${home} highlights`;
      g.youtube = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(videoQuery)}`;
      return g;
    });

    CACHE[team] = {ts: now, data:{games}};
    res.json({games});

  }catch(e){
    console.error(e);
    res.status(500).json({error:'Failed to fetch NHL data', detail:e.message});
  }
});

app.listen(3000, ()=>console.log('Server running on port 3000'));
