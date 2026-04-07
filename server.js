// server.js
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

const NHL_TEAMS = [
  "ANA","BOS","BUF","CGY","CAR","CHI","COL","CBJ","DAL","DET",
  "EDM","FLA","LAK","MIN","MTL","NSH","NJD","NYI","NYR","OTT",
  "PHI","PIT","SEA","SJS","STL","TBL","TOR","UTA","VAN","VGK",
  "WSH","WPG"
];

// Helper to get schedule for team
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

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
