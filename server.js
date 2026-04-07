import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/api/team/:team", async (req, res) => {
  const teamAbbrev = req.params.team.toUpperCase();
  const month = (offset = 0) => {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  try {
    const base = "https://statsapi.web.nhl.com/api/v1";
    const endpoints = [
      `${base}/schedule?teamId=${teamAbbrev}&startDate=${month(0)}-01&endDate=${month(0)}-31`,
      `${base}/schedule?teamId=${teamAbbrev}&startDate=${month(-1)}-01&endDate=${month(-1)}-31`,
    ];

    // Fetch all endpoints in parallel
    const results = await Promise.all(
      endpoints.map((url) => fetch(url).then((r) => r.json()))
    );

    // Merge games
    const games = [];
    results.forEach((r) => {
      r.dates?.forEach((d) => d.games.forEach((g) => games.push(g)));
    });

    // Sort by date
    games.sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));

    res.json({ games });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
