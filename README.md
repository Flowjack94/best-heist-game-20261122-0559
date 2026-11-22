[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559) [![rank](https://make.fun/badge/best-heist-game-20261122-0559/Flowjack94/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559) [![reward](https://make.fun/badge/best-heist-game-20261122-0559/Flowjack94/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

# The Midnight Vault — a heist game

A complete top-down heist game for the [make.fun bounty](https://make.fun/bounty/best-heist-game-20261122-0559). You are the Midnight Vault thief, slipping through three rooms in one night: steal the Star Sapphire from the gallery, the Gold Reserve from the bank vault floor, and the Getaway Bag on the rooftop — then reach the exit before the alarm hits 100%.

Guards patrol with sweeping vision cones, security cameras sweep the halls, and every time you are seen the alarm meter climbs. Hide in the purple shadow zones, read the patrols before you move, and spend your tools wisely: toss a coin to lure a guard away, loop the cameras, or wear a disguise the guards take for staff (the cameras still see through it). Grab the bonus cash, clear a room without ever being spotted for a ghost bonus, and make the getaway pay.

Three levels, one night: **The Gallery** (2 guards, 1 camera), **The Vault Floor** (3 guards, 2 cameras), **The Rooftop** (3 fast guards, 2 cameras). Three lives. All art is drawn in code on a canvas and all sounds are synthesised with WebAudio — the game ships no assets and makes no network request.

## Play

```sh
node serve.ts   # serves game/ on http://localhost:8080
```

Open `game/index.html` in desktop Chrome (or the local server above). WASD / arrows to move, `Shift` to sneak, click to walk there, `C` coin, `L` camera loop, `D` disguise, `P` pause, `M` mute, `R` restart the level, `Enter` to start / continue.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `game/index.html` + `game/src/` — the game itself: `main.js` (loop and state machine), `config.js` (levels and tuning), `vision.js` (ray-cast cones, line of sight, collision), `guards.js` (patrol, chase, cameras), `tools.js` (coin, loop, disguise), `player` movement in `main.js`, `render.js` (the rooms, cones, HUD), `shots.js` (the staged screenshot states), `input.js`, `audio.js` (synthesised sounds).
- `screenshots/` — real renders of the game, staged by `shots.json` (`?shot=cover|caught|loot|getaway`).
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
