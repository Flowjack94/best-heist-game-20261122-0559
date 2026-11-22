// All drawing: the room, the vision cones, the thief, the loot and the HUD.
// Everything is drawn in code on one canvas — no image assets.
import { TILE, HUD_H, COLS, ROWS, VIEW_W, VIEW_H, TUNING } from './config.js';
import { conePolygon, rectPx } from './vision.js';

const FLOOR_A = '#232a3a';
const FLOOR_B = '#202635';
const WALL = '#4a5468';
const WALL_TOP = '#6b7a96';

export function drawGame(ctx, game) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawFloor(ctx);
  drawShadows(ctx, game);
  drawCrates(ctx, game);
  drawWalls(ctx, game);
  drawExit(ctx, game);
  drawLoot(ctx, game);
  drawCoins(ctx, game);
  drawCameras(ctx, game);
  drawGuards(ctx, game);
  drawPlayer(ctx, game);
  drawHud(ctx, game);
  drawBanners(ctx, game);
  if (game.state === 'title') drawTitle(ctx, game);
  if (game.state === 'levelclear') drawLevelClear(ctx, game);
  if (game.state === 'caught') drawCaught(ctx, game);
  if (game.state === 'win') drawWin(ctx, game);
  if (game.state === 'gameover') drawGameOver(ctx, game);
  if (game.paused) drawPaused(ctx);
}

function drawFloor(ctx) {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? FLOOR_A : FLOOR_B;
      ctx.fillRect(x * TILE, HUD_H + y * TILE, TILE, TILE);
    }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE, HUD_H);
    ctx.lineTo(x * TILE, VIEW_H);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, HUD_H + y * TILE);
    ctx.lineTo(VIEW_W, HUD_H + y * TILE);
    ctx.stroke();
  }
}

function drawShadows(ctx, game) {
  for (const s of game.level.shadows) {
    const r = rectPx(s);
    ctx.fillStyle = 'rgba(88, 60, 140, 0.35)';
    ctx.fillRect(r.x, HUD_H + r.y, r.w, r.h);
    ctx.strokeStyle = 'rgba(150, 110, 220, 0.5)';
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(r.x + 1, HUD_H + r.y + 1, r.w - 2, r.h - 2);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(200, 170, 255, 0.8)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SHADOW — safe', r.x + 6, HUD_H + r.y + 16);
  }
}

function drawCrates(ctx, game) {
  for (const c of game.level.crates) {
    const r = rectPx(c);
    ctx.fillStyle = '#6e5230';
    ctx.fillRect(r.x + 2, HUD_H + r.y + 2, r.w - 4, r.h - 4);
    ctx.strokeStyle = '#a8845a';
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x + 2, HUD_H + r.y + 2, r.w - 4, r.h - 4);
    ctx.beginPath();
    ctx.moveTo(r.x + 2, HUD_H + r.y + 2);
    ctx.lineTo(r.x + r.w - 2, HUD_H + r.y + r.h - 2);
    ctx.moveTo(r.x + r.w - 2, HUD_H + r.y + 2);
    ctx.lineTo(r.x + 2, HUD_H + r.y + r.h - 2);
    ctx.stroke();
  }
}

function drawWalls(ctx, game) {
  for (const w of game.level.walls) {
    const r = rectPx(w);
    ctx.fillStyle = WALL;
    ctx.fillRect(r.x, HUD_H + r.y, r.w, r.h);
    ctx.fillStyle = WALL_TOP;
    ctx.fillRect(r.x, HUD_H + r.y, r.w, 5);
  }
  // Outer border.
  ctx.fillStyle = WALL;
  ctx.fillRect(0, HUD_H, VIEW_W, 6);
  ctx.fillRect(0, VIEW_H - 6, VIEW_W, 6);
  ctx.fillRect(0, HUD_H, 6, VIEW_H - HUD_H);
  ctx.fillRect(VIEW_W - 6, HUD_H, 6, VIEW_H - HUD_H);
}

function drawExit(ctx, game) {
  const e = game.level.exit;
  const open = game.lootTaken;
  const pulse = 0.6 + 0.4 * Math.sin(game.time * 4);
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.fillStyle = open ? `rgba(60, 220, 120, ${0.25 + 0.35 * pulse})` : 'rgba(120, 120, 120, 0.25)';
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = open ? '#3cdc78' : '#888';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = open ? '#b8ffd4' : '#bbb';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'EXIT' : 'LOCKED', 0, 4);
  ctx.restore();
}

function drawLoot(ctx, game) {
  const l = game.level.loot;
  if (game.lootTaken) return;
  const pulse = 0.7 + 0.3 * Math.sin(game.time * 5);
  ctx.save();
  ctx.translate(l.x, l.y);
  ctx.fillStyle = `rgba(255, 215, 0, ${0.25 * pulse})`;
  ctx.beginPath();
  ctx.arc(0, 0, 26 + 6 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(-11, -11, 22, 22);
  ctx.fillStyle = '#fff3b0';
  ctx.fillRect(-6, -6, 12, 12);
  ctx.restore();
  ctx.fillStyle = '#ffe27a';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(l.name.toUpperCase(), l.x, l.y + 40);
  for (const b of game.level.bonus) {
    if (b.taken) continue;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff0a0';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('$', 0, 3.5);
    ctx.restore();
  }
}

function drawCoins(ctx, game) {
  for (const c of game.tools.coins) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.strokeStyle = `rgba(255, 220, 120, ${Math.min(1, c.t)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 6 + (1.6 - c.t) * 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawCone(ctx, poly, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawCameras(ctx, game) {
  for (const c of game.cameras) {
    const frozen = c.frozen > 0;
    const poly = conePolygon(c.x, c.y, c.angle, TUNING.cameraConeHalfAngle, TUNING.cameraRange, game.wallsPx);
    drawCone(
      ctx,
      poly,
      frozen ? 'rgba(140, 140, 140, 0.10)' : c.seen ? 'rgba(255, 40, 40, 0.30)' : 'rgba(255, 60, 60, 0.16)',
      frozen ? 'rgba(160,160,160,0.5)' : 'rgba(255, 80, 80, 0.55)',
    );
    // Wall mount + lens.
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.fillStyle = frozen ? '#777' : '#c22';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(Math.cos(c.angle) * 4, Math.sin(c.angle) * 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (frozen) {
      ctx.fillStyle = '#ddd';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LOOPED', c.x, c.y - 14);
    }
  }
}

function drawGuards(ctx, game) {
  for (const g of game.guards) {
    const poly = conePolygon(g.x, g.y, g.angle, TUNING.guardConeHalfAngle, TUNING.guardVisionRange, game.wallsPx);
    const hot = g.suspicion > 60;
    drawCone(
      ctx,
      poly,
      g.seen ? 'rgba(255, 200, 40, 0.34)' : hot ? 'rgba(255, 160, 40, 0.22)' : 'rgba(255, 220, 80, 0.13)',
      g.seen ? 'rgba(255, 210, 60, 0.7)' : 'rgba(255, 220, 100, 0.35)',
    );
    ctx.save();
    ctx.translate(g.x, g.y);
    // Body: navy uniform, direction nose.
    ctx.fillStyle = g.state === 'chase' ? '#a33' : '#2c4a7a';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dfe8ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.rotate(g.angle);
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(4, -6);
    ctx.lineTo(4, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // Suspicion / state marker.
    if (g.suspicion > 5) {
      ctx.fillStyle = g.suspicion > 60 ? '#ff5040' : '#ffd23c';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.state === 'chase' ? '!' : '?', g.x, g.y - 20);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(g.x - 14, g.y - 32, 28, 4);
      ctx.fillStyle = g.suspicion > 60 ? '#ff5040' : '#ffd23c';
      ctx.fillRect(g.x - 14, g.y - 32, 28 * (g.suspicion / 100), 4);
    } else if (g.state === 'investigate') {
      ctx.fillStyle = '#ffd23c';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', g.x, g.y - 20);
    }
  }
}

function drawPlayer(ctx, game) {
  const p = game.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  // Shadow-zone hint ring.
  if (game.inShadow(p.x, p.y)) {
    ctx.strokeStyle = 'rgba(170, 130, 255, 0.7)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, 19, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.rotate(p.angle);
  ctx.fillStyle = game.disguiseT > 0 ? '#3a6ea5' : '#151515';
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = game.disguiseT > 0 ? '#9ecfff' : '#f5f5f5';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Mask eyes.
  ctx.fillStyle = '#fff';
  ctx.fillRect(2, -7, 5, 3);
  ctx.fillRect(2, 4, 5, 3);
  ctx.restore();
  if (p.sneaking) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('sneaking', p.x, p.y + 24);
  }
  if (game.disguiseT > 0) {
    ctx.fillStyle = '#9ecfff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DISGUISED', p.x, p.y - 20);
  }
}

function alarmColor(v) {
  if (v < 35) return '#3cdc78';
  if (v < 70) return '#ffb020';
  return '#ff4030';
}

function drawHud(ctx, game) {
  ctx.fillStyle = '#10141f';
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.strokeStyle = '#2a3348';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HUD_H);
  ctx.lineTo(VIEW_W, HUD_H);
  ctx.stroke();

  ctx.fillStyle = '#e8ecf5';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('THE MIDNIGHT VAULT', 14, 24);
  ctx.fillStyle = '#9aa7c2';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Level ${game.levelIndex + 1}/3 — ${game.level.name}`, 14, 44);

  // Alarm meter — the big one, centre top.
  const ax = 330;
  const aw = 300;
  ctx.fillStyle = '#c8d0e2';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', ax, 20);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(ax, 28, aw, 18);
  ctx.fillStyle = alarmColor(game.alarm);
  ctx.fillRect(ax, 28, aw * (game.alarm / 100), 18);
  ctx.strokeStyle = '#555';
  ctx.strokeRect(ax, 28, aw, 18);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(game.alarm)}%`, ax + aw / 2, 41);
  if (game.alarm >= 70) {
    ctx.fillStyle = game.alarm >= 95 ? '#ff4030' : '#ffb020';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(game.alarm >= 95 ? '!! CAUGHT SOON !!' : '! SPOTTED !', ax + aw / 2, 58);
  }

  // Tools.
  const tx = 660;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#c8d0e2';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Coin x${game.tools.coin}  [C]`, tx, 24);
  ctx.fillText(`Loop x${game.tools.loop}  [L]`, tx, 42);
  ctx.fillText(`Disguise x${game.tools.disguise}  [D]`, tx, 58);
  if (game.loopT > 0) {
    ctx.fillStyle = '#9ecfff';
    ctx.fillText(`LOOP ${game.loopT.toFixed(1)}s`, tx + 170, 42);
  }

  // Loot / lives / score / time, right side.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`Loot ${game.lootTaken ? 1 : 0}/1  +${game.bonusTaken} bonus`, VIEW_W - 14, 22);
  ctx.fillStyle = '#ff6b81';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('♥'.repeat(Math.max(0, game.lives)) + '♡'.repeat(Math.max(0, 3 - game.lives)), VIEW_W - 14, 42);
  ctx.fillStyle = '#e8ecf5';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Score ${game.score}   ${fmtTime(game.levelTime)}`, VIEW_W - 14, 58);
}

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, '0')}`;
}

function drawBanners(ctx, game) {
  if (game.state === 'playing' && game.spottedFlash > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, game.spottedFlash);
    ctx.fillStyle = '#ff4030';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED!', VIEW_W / 2, HUD_H + 70);
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('Break line of sight — now!', VIEW_W / 2, HUD_H + 94);
    ctx.restore();
  }
}

function overlay(ctx, alpha) {
  ctx.fillStyle = `rgba(8, 10, 18, ${alpha})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function drawTitle(ctx, game) {
  overlay(ctx, 0.72);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 52px sans-serif';
  ctx.fillText('THE MIDNIGHT VAULT', VIEW_W / 2, 190);
  ctx.fillStyle = '#c8d0e2';
  ctx.font = '18px sans-serif';
  ctx.fillText('A three-night heist. Steal the loot. Slip out unseen.', VIEW_W / 2, 228);
  ctx.fillStyle = '#e8ecf5';
  ctx.font = '15px sans-serif';
  const lines = [
    'WASD / arrows — move    Shift — sneak (slower, harder to spot)',
    'Click — walk there    C — toss a coin (lures a guard)    L — loop the cameras',
    'D — disguise (guards ignore you, cameras do not)    P — pause    M — mute',
    'Hide in the purple SHADOW zones. Grab the gold loot, then reach the EXIT.',
    'If the ALARM hits 100% you are caught. Three lives. Ghost bonus if never seen.',
  ];
  lines.forEach((l, i) => ctx.fillText(l, VIEW_W / 2, 290 + i * 26));
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Press ENTER to start the heist', VIEW_W / 2, 480);
  ctx.fillStyle = '#9aa7c2';
  ctx.font = '13px sans-serif';
  ctx.fillText('An original game — art drawn in code, sounds synthesised, no assets, no network.', VIEW_W / 2, 516);
}

function drawLevelClear(ctx, game) {
  overlay(ctx, 0.6);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#3cdc78';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText(game.levelIndex === 2 ? 'CLEAN GETAWAY!' : 'LEVEL CLEAR!', VIEW_W / 2, 260);
  ctx.fillStyle = '#fff';
  ctx.font = '18px sans-serif';
  const b = game.clearBreakdown;
  ctx.fillText(`Loot +${b.loot}    Bonus +${b.bonus}    Time +${b.time}    Ghost +${b.ghost}`, VIEW_W / 2, 310);
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`Level score ${b.total}   —   Total ${game.score}`, VIEW_W / 2, 350);
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(game.levelIndex === 2 ? 'Press ENTER to play again' : 'Press ENTER for the next room', VIEW_W / 2, 410);
}

function drawCaught(ctx, game) {
  overlay(ctx, 0.55);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff4030';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText('CAUGHT!', VIEW_W / 2, 300);
  ctx.fillStyle = '#fff';
  ctx.font = '18px sans-serif';
  ctx.fillText(
    game.lives > 0 ? `The guards got you. ${game.lives} ${game.lives === 1 ? 'life' : 'lives'} left — press ENTER to try the room again.` : 'The guards got you.',
    VIEW_W / 2,
    350,
  );
}

function drawWin(ctx, game) {
  overlay(ctx, 0.7);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 50px sans-serif';
  ctx.fillText('THE PERFECT HEIST', VIEW_W / 2, 260);
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText('All three rooms cleaned. The vault, the gallery, the rooftop — yours.', VIEW_W / 2, 310);
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`Final score ${game.score}`, VIEW_W / 2, 360);
  ctx.fillStyle = '#9aa7c2';
  ctx.font = '16px sans-serif';
  ctx.fillText('Press ENTER to play again.', VIEW_W / 2, 410);
}

function drawGameOver(ctx, game) {
  overlay(ctx, 0.7);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff4030';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText('THE HEIST FAILED', VIEW_W / 2, 300);
  ctx.fillStyle = '#fff';
  ctx.font = '18px sans-serif';
  ctx.fillText(`Out of lives. Final score ${game.score}. Press ENTER to start over.`, VIEW_W / 2, 350);
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(8,10,18,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', VIEW_W / 2, VIEW_H / 2);
}
