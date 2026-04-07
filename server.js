import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// NHL team ID mapping
const TEAM_IDS = {
  ANA: 24, BOS: 6, BUF: 7, CGY: 20, CAR: 12, CHI: 16,
  COL: 21, CBJ: 29, DAL: 25, DET: 17, EDM: 22, FLA: 13,
  LAK: 26, MIN: 30, MTL: 8, NSH: 18, NJD: 1, NYI: 2,
  NYR: 3, OTT: 9, PHI: 4, PIT: 5, SEA: 55, SJS: 28,
  STL: 19, TBL: 14, TOR: 10, UTA: 54, VAN: 23, VGK: 54,
  WSH: 15, WPG: 52
};

async function fetchSchedule(teamId) {
  const url = `https://statsapi.web.nhl.com/api/v1/schedule?teamId=${teamId}`;
  const res = await fetch(url);
  return res.json();
}

app.get("/api/team/:team", async (req, res) => {
  try {
    const team = req.params.team.toUpperCase();
    const teamId = TEAM_IDS[team];
    if (!teamId) {
      return res.status(404).json({ error: "Team not found" });
    }

    const schedule = await fetchSchedule(teamId);
    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Always serve index for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
