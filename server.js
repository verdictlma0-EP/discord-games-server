const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Allow embedding inside Discord (removes X-Frame-Options restriction)
app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://discord.com https://*.discord.com");
  next();
});

// Serve static game files from the /games folder
app.use('/games', express.static(path.join(__dirname, 'games')));

// Game list (used by the bot to know what's available)
const GAMES = [
  { id: 'zombierush',          name: 'Zombie Rush',                file: 'zombierush.html' },
  { id: 'worldshardestgame',   name: "World's Hardest Game",       file: 'worldshardestgame.html' },
  { id: 'worldshardestgame2',  name: "World's Hardest Game 2",     file: 'worldshardestgame2.html' },
  { id: 'worldshardestgame3',  name: "World's Hardest Game 3",     file: 'worldshardestgame3.html' },
  { id: 'wrestlebros',         name: 'Wrestle Bros',               file: 'wrestlebros.html' },
];

// Root: simple landing page listing all games
app.get('/', (req, res) => {
  const links = GAMES.map(g =>
    `<li><a href="/games/${g.file}" target="_blank">${g.name}</a></li>`
  ).join('');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Discord Games Server</title></head>
      <body style="font-family:sans-serif;padding:2rem;background:#111;color:#fff">
        <h1>🎮 Discord Games</h1>
        <ul>${links}</ul>
      </body>
    </html>
  `);
});

// API endpoint so the bot can fetch the game list dynamically
app.get('/api/games', (req, res) => {
  res.json(GAMES);
});

// Health check for Render
app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
});
