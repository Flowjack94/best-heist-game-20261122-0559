// The Midnight Vault — game loop, state machine and scoring.
// States: title → playing → levelclear → (next level) → win,
//          playing → caught → playing (life lost) or gameover.
import { TILE, HUD_H, COLS, ROWS, VIEW_W, VIEW_H, TUNING, LEVELS } from './config.js';
import { rectPx, moveCircle } from './vision.js';
import { makeGuard, makeCamera, updateGuard, updateCamera } from './guards.js';
import { makeTools, useCoin, useLoop, useDisguise, updateTools } from './tools.js';
import { makeInput, moveVector } from './input.js';
import { drawGame } from './render.js';
import { ensureAudio, toggleMute, sfx } from './audio.js';
import { applyShot } from './shots.js';

const PLAYER_R = 12;

export function createGame(canvas) {
  const ctx = canvas.getContext('2d');
  const game = {
    canvas,
    ctx,
    state: 'title',
    paused: false,
    time: 0,
    levelIndex: 0,
    level: LEVELS[0],
    player: { x: 0, y: 0, angle: 0, sneaking: false },
    guards: [],
    cameras: [],
    tools: makeTools(),
    wallsPx: [],
    lootTaken: false,
    bonusTaken: 0,
    alarm: 0,
    maxAlarm: 0,
    lives: TUNING.lives,
    score: 0,
    levelTime: 0,
    loopT: 0,
    disguiseT: 0,
    spottedFlash: 0,
    clearBreakdown: null,
    spottedBefore: false,
    input: null,
  };
  game.input = makeInput(canvas, game);
  attachActions(game);
  loadLevel(game, 0);
  return game;
}

export function loadLevel(game, idx) {
  game.levelIndex = idx;
  game.level = LEVELS[idx];
  game.wallsPx = [
    ...game.level.walls.map(rectPx),
    // Outer border as walls (top/bottom/left/right, inside the HUD).
    { x: 0, y: HUD_H, w: VIEW_W, h: 6 },
    { x: 0, y: VIEW_H - 6, w: VIEW_W, h: 6 },
    { x: 0, y: HUD_H, w: 6, h: VIEW_H - HUD_H },
    { x: VIEW_W - 6, y: HUD_H, w: 6, h: VIEW_H - HUD_H },
  ];
  game.player.x = game.level.playerStart.x;
  game.player.y = game.level.playerStart.y;
  game.player.angle = 0;
  game.player.sneaking = false;
  game.guards = game.level.guards.map(makeGuard);
  game.cameras = game.level.cameras.map(makeCamera);
  game.tools = makeTools();
  game.level.bonus.forEach((b) => (b.taken = false));
  game.lootTaken = false;
  game.bonusTaken = 0;
  game.alarm = 0;
  game.maxAlarm = 0;
  game.levelTime = 0;
  game.loopT = 0;
  game.disguiseT = 0;
  game.spottedFlash = 0;
  game.spottedBefore = false;
  game.clearBreakdown = null;
  game.input.clickTarget = null;
}

export function inShadow(game, x, y) {
  for (const s of game.level.shadows) {
    if (x >= s.x * TILE && x < (s.x + s.w) * TILE && y >= HUD_H + s.y * TILE && y < HUD_H + (s.y + s.h) * TILE) return true;
  }
  return false;
}

function updatePlaying(game, dt) {
  const p = game.player;
  const keys = game.input.keys;
  p.sneaking = keys.has('shift');

  // Movement: keys first, click-to-move when no key is held.
  let [dx, dy] = moveVector(keys);
  if (dx === 0 && dy === 0 && game.input.clickTarget) {
    const t = game.input.clickTarget;
    const ddx = t.x - p.x;
    const ddy = t.y - p.y;
    const d = Math.hypot(ddx, ddy);
    if (d < 6) game.input.clickTarget = null;
    else {
      dx = ddx / d;
      dy = ddy / d;
    }
  }
  if (dx !== 0 || dy !== 0) {
    const speed = p.sneaking ? TUNING.playerSneak : TUNING.playerWalk;
    const moved = moveCircle(p.x, p.y, PLAYER_R, dx * speed * dt, dy * speed * dt, game.wallsPx, {
      x: 0,
      y: HUD_H,
      w: VIEW_W,
      h: VIEW_H - HUD_H,
    });
    if ((moved.x !== p.x || moved.y !== p.y) && Math.random() < dt * 6) sfx.step();
    p.x = moved.x;
    p.y = moved.y;
    p.angle = Math.atan2(dy, dx);
  }

  // Guards and cameras.
  for (const g of game.guards) updateGuard(g, game, dt);
  for (const c of game.cameras) updateCamera(c, game, dt, game.time);
  updateTools(game, dt);

  // Alarm = the worst suspicion anyone holds.
  let worst = 0;
  for (const g of game.guards) worst = Math.max(worst, g.suspicion);
  for (const c of game.cameras) worst = Math.max(worst, c.suspicion);
  game.alarm = worst;
  game.maxAlarm = Math.max(game.maxAlarm, worst);
  if (worst > 25 && !game.spottedBefore) {
    game.spottedBefore = true;
    game.spottedFlash = 1.6;
    sfx.spotted();
  }
  if (worst > 25) game.spottedFlash = Math.max(game.spottedFlash, 0.6);
  if (game.spottedFlash > 0) game.spottedFlash -= dt;
  if (worst > 85 && Math.random() < dt * 2) sfx.alarm();

  // Caught: alarm maxed, or a guard touches the thief.
  let caught = game.alarm >= 100;
  if (!caught) {
    for (const g of game.guards) {
      if (Math.hypot(g.x - p.x, g.y - p.y) < TUNING.catchDistance + 6) {
        caught = true;
        break;
      }
    }
  }
  if (caught) {
    game.lives--;
    sfx.caught();
    game.state = game.lives > 0 ? 'caught' : 'gameover';
    return;
  }

  // Loot pickup.
  const l = game.level.loot;
  if (!game.lootTaken && Math.hypot(l.x - p.x, l.y - p.y) < 26) {
    game.lootTaken = true;
    sfx.loot();
    sfx.exitOpen();
  }
  for (const b of game.level.bonus) {
    if (!b.taken && Math.hypot(b.x - p.x, b.y - p.y) < 22) {
      b.taken = true;
      game.bonusTaken++;
      game.score += b.value;
      sfx.bonus();
    }
  }

  // Exit (open once the main loot is taken).
  const e = game.level.exit;
  if (game.lootTaken && Math.hypot(e.x - p.x, e.y - p.y) < 30) {
    const timeBonus = Math.max(0, 300 - Math.floor(game.levelTime) * 3);
    const ghost = game.maxAlarm < 50 ? 250 : 0;
    const total = game.level.loot.value + game.bonusTaken * 150 + timeBonus + ghost;
    game.clearBreakdown = { loot: game.level.loot.value, bonus: game.bonusTaken * 150, time: timeBonus, ghost, total };
    game.score += total;
    if (game.levelIndex === 2) {
      game.state = 'win';
      sfx.win();
    } else {
      game.state = 'levelclear';
      sfx.clear();
    }
    return;
  }

  game.levelTime += dt;
}

export function startGame(canvas) {
  const game = createGame(canvas);
  window.__game = game; // for play-testing and screenshots
  let last = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!game.paused && !game.shotFrozen) {
      game.time += dt;
      if (game.state === 'playing') updatePlaying(game, dt);
    }
    drawGame(game.ctx, game);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Staged screenshot states (?shot=cover|caught|loot|getaway).
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) applyShot(game, shot);
  return game;
}

// ---- actions called from input.js ----
export function attachActions(game) {
  game.onEnter = () => {
    ensureAudio();
    sfx.click();
    if (game.state === 'title') {
      loadLevel(game, 0);
      game.state = 'playing';
    } else if (game.state === 'levelclear') {
      loadLevel(game, game.levelIndex + 1);
      game.state = 'playing';
    } else if (game.state === 'caught') {
      loadLevel(game, game.levelIndex);
      game.state = 'playing';
    } else if (game.state === 'win' || game.state === 'gameover') {
      game.score = 0;
      game.lives = TUNING.lives;
      loadLevel(game, 0);
      game.state = 'playing';
    }
  };
  game.togglePause = () => {
    if (game.state === 'playing') game.paused = !game.paused;
  };
  game.toggleMute = () => toggleMute();
  game.restartLevel = () => {
    if (game.state === 'playing') {
      loadLevel(game, game.levelIndex);
      game.state = 'playing';
    }
  };
  game.tossCoinAtMouse = () => {
    const m = game.input.mouse;
    useCoin(game, m.x, m.y);
  };
  game.useLoopTool = () => useLoop(game);
  game.useDisguiseTool = () => useDisguise(game);
  game.inShadow = (x, y) => inShadow(game, x, y);
}
