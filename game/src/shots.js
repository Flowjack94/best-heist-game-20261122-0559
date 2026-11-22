// Staged screenshot states (?shot=cover|caught|loot|getaway).
// Each one composes a frozen, deterministic frame of the real game so the
// screenshots show the heist at its best: the room, the thief, guards with
// vision cones, cameras, the loot target and the alarm meter in one frame.
import { TILE, HUD_H } from './config.js';
import { loadLevel } from './main.js';

function tileCenter(tx, ty) {
  return { x: tx * TILE + TILE / 2, y: HUD_H + ty * TILE + TILE / 2 };
}

export function applyShot(game, shot) {
  // Freeze the simulation so the staged frame is deterministic.
  game.shotFrozen = true;
  if (shot === 'cover') {
    // Level 1 mid-heist: thief crossing the middle room, two guards with
    // cones sweeping, the camera on the top wall, the Sapphire glowing,
    // alarm meter at 42%.
    game.state = 'playing';
    const p = tileCenter(17, 14);
    game.player.x = p.x;
    game.player.y = p.y;
    game.player.angle = 0.4;
    game.player.sneaking = true;
    const g1 = game.guards[0];
    const g1p = tileCenter(24, 9);
    g1.x = g1p.x;
    g1.y = g1p.y;
    g1.angle = Math.PI;
    g1.suspicion = 42;
    g1.state = 'patrol';
    const g2 = game.guards[1];
    const g2p = tileCenter(10, 5);
    g2.x = g2p.x;
    g2.y = g2p.y;
    g2.angle = 0.3;
    g2.suspicion = 0;
    g2.state = 'patrol';
    game.cameras[0].angle = Math.PI / 2 + 0.5;
    game.alarm = 42;
    game.maxAlarm = 42;
  } else if (shot === 'caught') {
    // SPOTTED: the thief stepped into a guard's cone, alarm at 88, the
    // guard is chasing and the warning banner is up.
    game.state = 'playing';
    const p = tileCenter(12, 9);
    game.player.x = p.x;
    game.player.y = p.y;
    game.player.angle = Math.PI;
    const g1 = game.guards[0];
    const g1p = tileCenter(9, 9);
    g1.x = g1p.x;
    g1.y = g1p.y;
    g1.angle = 0;
    g1.suspicion = 88;
    g1.state = 'chase';
    g1.seen = true;
    const g2 = game.guards[1];
    const g2p = tileCenter(20, 5);
    g2.x = g2p.x;
    g2.y = g2p.y;
    g2.angle = Math.PI / 2;
    g2.suspicion = 0;
    game.cameras[0].angle = Math.PI / 2 - 0.4;
    game.alarm = 88;
    game.maxAlarm = 88;
    game.spottedBefore = true;
    game.spottedFlash = 1.6;
  } else if (shot === 'loot') {
    // Level 2: the thief at the Gold Reserve, exit open, one guard closing in.
    loadLevel(game, 1);
    game.state = 'playing';
    const p = tileCenter(34, 4);
    game.player.x = p.x;
    game.player.y = p.y;
    game.player.angle = Math.PI / 2;
    game.lootTaken = true;
    game.bonusTaken = 1;
    game.score = 650;
    const g1 = game.guards[1];
    const g1p = tileCenter(28, 5);
    g1.x = g1p.x;
    g1.y = g1p.y;
    g1.angle = -Math.PI / 2;
    g1.suspicion = 18;
    const g2 = game.guards[0];
    const g2p = tileCenter(6, 5);
    g2.x = g2p.x;
    g2.y = g2p.y;
    g2.angle = 0.6;
    g2.suspicion = 0;
    game.cameras[0].angle = Math.PI / 2 + 0.6;
    game.cameras[1].angle = 0.5;
    game.alarm = 18;
    game.maxAlarm = 18;
  } else if (shot === 'getaway') {
    // Level 3 cleared: the getaway overlay with the score breakdown.
    loadLevel(game, 2);
    game.state = 'levelclear';
    game.levelIndex = 2;
    game.lootTaken = true;
    game.bonusTaken = 2;
    game.score = 1730;
    game.clearBreakdown = { loot: 500, bonus: 300, time: 180, ghost: 250, total: 1230 };
    const p = tileCenter(36, 3);
    game.player.x = p.x;
    game.player.y = p.y;
    game.player.angle = -Math.PI / 2;
    const g1 = game.guards[2];
    const g1p = tileCenter(28, 17);
    g1.x = g1p.x;
    g1.y = g1p.y;
    g1.angle = Math.PI;
    g1.suspicion = 0;
    game.cameras[0].angle = Math.PI / 2 - 0.5;
    game.alarm = 12;
    game.maxAlarm = 12;
  }
}
