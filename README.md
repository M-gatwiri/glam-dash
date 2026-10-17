# Glam Dash 🎀

A pastel fashion-themed endless runner built with plain HTML, CSS, and JavaScript for Start.ng.

## Play locally
1. Unzip the project folder.
2. Open `index.html` in a modern browser.
3. Press **Start my glam run**.
4. Move between three lanes using **← / →** or **A / D**. On phones, use the on-screen arrows.
5. Collect 💎 gems and 👛 glam drops. Avoid 💦 puddles!

The game is playable locally without a Start.ng account. Player identity and leaderboard features become available when published on Start.ng.

## Files
- `index.html` — page structure
- `styles.css` — responsive pastel styling
- `game.js` — game loop, controls, scoring, and Start.ng integration
- `startng.json` — leaderboard score configuration
- `cover.png` — game cover art

## Publish on Start.ng
1. Create a **public** GitHub repository named `glam-dash`.
2. Put all files in this folder at the repository root and commit/push them.
3. Check the repository before publishing (replace `YOUR-USERNAME`):
   ```bash
   curl -X POST https://api.start.ng/games/check \
     -H "Content-Type: application/json" \
     -d '{"repo_url":"https://github.com/YOUR-USERNAME/glam-dash","name":"glam-dash"}'
   ```
4. Fix any errors or warnings returned by the check.
5. Publish:
   ```bash
   curl -X POST https://api.start.ng/games/publish \
     -H "Content-Type: application/json" \
     -d '{"repo_url":"https://github.com/YOUR-USERNAME/glam-dash","name":"glam-dash"}'
   ```
6. If the response includes an `approve_url`, open it and approve the game.
7. Test the live game at `https://glam-dash.start.ng`.

Once linked, pushes to the repository's default branch should update the published game.
