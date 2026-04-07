import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// API route
const NHL_TEAMS = ["ANA","BOS","BUF","CGY","CAR","CHI","COL","CBJ","DAL","DET",
"EDM","FLA","LAK","MIN","MTL","NSH","NJD","NYI","NYR","OTT","PHI","PIT",
"SEA","SJS","STL","TBL","TOR","UTA","VAN","VGK","WSH","WPG"];

async function fetchTeamSchedule(team) {
  const url = `https://statsapi.web.nhl.com/api/v1/schedule?teamId=${team}&startDate=2023-01-01&endDate=2024-12-31`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch schedule for ${team}`);
  return await res.json();
}

app.get('/api/team/:team', async (req, res) => {
  const team = req.params.team.toUpperCase();
  if (!NHL_TEAMS.includes(team)) return res.status(404).json({ error: 'Invalid team' });
  try {
    const scheduleData = await fetchTeamSchedule(team);
    res.json({ team, schedule: scheduleData });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve index.html for any other route (SPA)
app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, ()=>console.log(`Backend running on port ${PORT}`));
