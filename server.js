const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// API route
app.get('/api/team/:team', async (req, res) => {
  try {
    const team = req.params.team;

    const response = await fetch(`https://api-web.nhle.com/v1/club-schedule/${team}/week/now`);
    const data = await response.json();

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch NHL data' });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
