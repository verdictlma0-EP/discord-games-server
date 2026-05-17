const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const REPO_URL = 'https://github.com/CoolDude2349/Offline-HTML-Games-Pack.git';
const REPO_DIR = path.join(__dirname, 'repo');
const GAMES_DIR = path.join(REPO_DIR, 'offline');

function syncRepo() {
  if (fs.existsSync(REPO_DIR)) {
    console.log('Repo exists, pulling latest...');
    try { execSync('git pull', { cwd: REPO_DIR, stdio: 'inherit' }); }
    catch (e) { console.warn('git pull failed, continuing with existing files.'); }
  } else {
    console.log('Cloning game repo (this may take a minute)...');
    execSync(`git clone --depth=1 ${REPO_URL} ${REPO_DIR}`, { stdio: 'inherit' });
    console.log('Repo cloned!');
  }
}

function getGames() {
  if (!fs.existsSync(GAMES_DIR)) return [];
  return fs.readdirSync(GAMES_DIR)
    .filter(f => f.endsWith('.html'))
    .sort()
    .map(file => ({
      id:   file.replace('.html', ''),
      name: formatName(file.replace('.html', '')),
      file,
      url:  `/games/${encodeURIComponent(file)}`,
    }));
}

function formatName(id) {
  return id
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy',
    "frame-ancestors 'self' https://discord.com https://*.discord.com");
  next();
});

// Serve game files — decode URI so filenames with spaces work
app.use('/games', (req, res, next) => {
  req.url = decodeURIComponent(req.url);
  next();
}, express.static(GAMES_DIR));

// Landing page with working links
app.get('/', (req, res) => {
  const games = getGames();
  const rows = games.map(g =>
    `<a href="${g.url}" class="row">${g.name}</a>`
  ).join('');

  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Discord Games</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #111; color: #fff; font-family: sans-serif; }
    header { padding: 1.5rem 2rem; background: #1a1a2e; border-bottom: 1px solid #333; }
    h1 { font-size: 1.4rem; color: #5865F2; }
    .sub { color: #aaa; font-size: 0.85rem; margin-top: 0.25rem; }
    input {
      display: block; width: calc(100% - 4rem); margin: 1rem 2rem;
      padding: 0.6rem 1rem; border-radius: 6px; border: none;
      background: #222; color: #fff; font-size: 1rem;
    }
    .list { padding: 0 2rem 2rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .row {
      display: block; padding: 0.65rem 1rem;
      background: #1e1e2e; border-radius: 6px;
      text-decoration: none; color: #fff; font-size: 0.95rem;
      transition: background 0.15s;
    }
    .row:hover { background: #5865F2; }
  </style>
</head>
<body>
  <header>
    <h1>Discord Games</h1>
    <p class="sub">${games.length} games available</p>
  </header>
  <input id="s" placeholder="Search games..." oninput="filter(this.value)">
  <div class="list" id="list">${rows}</div>
  <script>
    function filter(q) {
      q = q.toLowerCase();
      document.querySelectorAll('.row').forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    }
  </script>
</body>
</html>`);
});

app.get('/api/games', (req, res) => res.json(getGames()));
app.get('/health', (req, res) => res.send('OK'));

syncRepo();
app.listen(PORT, () => {
  console.log(`Game server on port ${PORT} — ${getGames().length} games loaded`);
});
