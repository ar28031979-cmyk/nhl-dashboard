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
    // Adjusted endpoint, verifying if data is being returned
    const response = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${abbr}/schedule`);
    const data = await response.json();

    if (!data || !data.dates || data.dates.length === 0) {
      return res.status(404).json({ error: "No data found for this team." });
    }

    res.json(data); // Send the NHL data as JSON response
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ error: "Failed to fetch NHL data" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
