// server.js

const express = require("express");
const fetch = require("node-fetch");
const app = express();

// Serve static files from the "public" folder
app.use(express.static("public"));

// API route to get NHL data for a team
app.get("/api/team/:abbr", async (req, res) => {
  const abbr = req.params.abbr;

  try {
    const response = await fetch(`https://api-web.nhle.com/v1/club-schedule/${abbr}/now`);
    const data = await response.json();
    res.json(data); // Send the NHL data as JSON response
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch NHL data" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
