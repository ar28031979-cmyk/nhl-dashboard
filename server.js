import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.static("public")); // serve index.html if needed

const PORT = process.env.PORT || 3000;

// NHL Teams map for 32 teams
const TEAM_IDS = {
  ANA: 24, BOS: 6, BUF: 7, CGY: 20, CAR: 12, CHI: 16,
  COL: 21, CBJ: 29, DAL: 25, DET: 17, EDM: 22, FLA: 13,
  LAK: 26, MIN: 30, MTL: 8, NSH: 18, NJD: 1, NYI: 2,
  NYR: 3, OTT: 9, PHI: 4, PIT: 5, SEA: 55, SJS: 28,
  STL: 19, TBL: 14, TOR: 10, UTA: 54, VAN: 23, VGK: 54,
  WSH: 15, WPG: 52
};

// Endpoint: /api/team/:abbrev
app.get("/api/team/:team", async (req, res) => {
  const abbrev = req.params.team.toUpperCase();
  const teamId = TEAM_IDS[abbrev];

  if (!teamId) return res.status(404).json({ error: "Team not found" });

  try {
    const response = await fetch(
      `https://statsapi.web.nhl.com/api/v1/schedule?teamId=${teamId}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`NHL Dashboard server running on port ${PORT}`));
