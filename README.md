# Discord Games Server

This server hosts the HTML game files and serves them to Discord Activities.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Put all your `.html` game files inside the `games/` folder:
   ```
   game-server/
   └── games/
       ├── zombierush.html
       ├── worldshardestgame.html
       ├── worldshardestgame2.html
       ├── worldshardestgame3.html
       └── wrestlebros.html
   ```

3. Run locally to test:
   ```
   npm start
   ```

## Deploying to Render

- Build command: `npm install`
- Start command: `npm start`
- Add no environment variables (none needed for this service)
