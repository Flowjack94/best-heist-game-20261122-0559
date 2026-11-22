// Guard and camera AI: patrol loops, coin investigation, chase when the
// thief is clearly seen, and sweeping cameras. Suspicion (0-100) rises
// while the thief stands in a cone with line of sight, and decays in cover.
import { TUNING } from './config.js';
import { hasLineOfSight, angleDiff } from './vision.js';

export function makeGuard(def) {
  return {
    x: def.waypoints[0].x,
    y: def.waypoints[0].y,
    angle: 0,
    speed: def.speed,
    waypoints: def.waypoints,
    wp: 1,
    state: 'patrol', // patrol | investigate | chase
    suspicion: 0,
    investigateX: 0,
    investigateY: 0,
    waitT: 0,
    seen: false,
  };
}

export function makeCamera(def) {
  return {
    x: def.x,
    y: def.y,
    baseAngle: def.baseAngle,
    sweepAmp: def.sweepAmp,
    sweepSpeed: def.sweepSpeed,
    angle: def.baseAngle,
    suspicion: 0,
    frozen: 0,
    seen: false,
  };
}

function seesTarget(ox, oy, angle, halfAngle, range, tx, ty, walls) {
  const dx = tx - ox;
  const dy = ty - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (Math.abs(angleDiff(Math.atan2(dy, dx), angle)) > halfAngle) return false;
  return hasLineOfSight(ox, oy, tx, ty, walls);
}

function stepToward(g, tx, ty, dt, speed) {
  const dx = tx - g.x;
  const dy = ty - g.y;
  const d = Math.hypot(dx, dy);
  if (d < 2) return true;
  const step = Math.min(d, speed * dt);
  g.x += (dx / d) * step;
  g.y += (dy / d) * step;
  g.angle = Math.atan2(dy, dx);
  return d - step < 4;
}

export function updateGuard(g, game, dt) {
  const t = TUNING;
  const p = game.player;
  const inShadow = game.inShadow(p.x, p.y);
  let rate = p.sneaking ? t.guardSeeRateSneak : t.guardSeeRate;
  if (inShadow) rate *= t.shadowFactor;
  if (game.disguiseT > 0) rate = 0;

  g.seen = seesTarget(g.x, g.y, g.angle, t.guardConeHalfAngle, t.guardVisionRange, p.x, p.y, game.wallsPx);
  if (g.seen) {
    g.suspicion = Math.min(100, g.suspicion + rate * dt);
    if (g.suspicion > 60) g.state = 'chase';
  } else {
    g.suspicion = Math.max(0, g.suspicion - t.suspicionDecay * dt);
    if (g.state === 'chase' && g.suspicion < 25) g.state = 'patrol';
  }

  if (g.state === 'patrol') {
    const target = g.waypoints[g.wp];
    if (stepToward(g, target.x, target.y, dt, g.speed)) {
      g.wp = (g.wp + 1) % g.waypoints.length;
    }
  } else if (g.state === 'investigate') {
    if (stepToward(g, g.investigateX, g.investigateY, dt, g.speed * 1.2)) {
      g.waitT -= dt;
      g.angle += dt * 1.5; // look around while checking the noise
      if (g.waitT <= 0) g.state = 'patrol';
    }
  } else if (g.state === 'chase') {
    stepToward(g, p.x, p.y, dt, g.speed * t.guardChaseMultiplier);
  }
}

export function updateCamera(c, game, dt, time) {
  const t = TUNING;
  if (c.frozen > 0) {
    c.frozen -= dt;
    c.seen = false;
    c.suspicion = Math.max(0, c.suspicion - t.suspicionDecay * dt);
    return;
  }
  c.angle = c.baseAngle + Math.sin(time * c.sweepSpeed) * c.sweepAmp;
  const p = game.player;
  const inShadow = game.inShadow(p.x, p.y);
  let rate = t.cameraSeeRate;
  if (inShadow) rate *= t.shadowFactor;
  c.seen = seesTarget(c.x, c.y, c.angle, t.cameraConeHalfAngle, t.cameraRange, p.x, p.y, game.wallsPx);
  if (c.seen) c.suspicion = Math.min(100, c.suspicion + rate * dt);
  else c.suspicion = Math.max(0, c.suspicion - t.suspicionDecay * dt);
}

// The nearest patrolling guard turns to check a noise at (x,y).
export function lureGuards(guards, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const g of guards) {
    if (g.state === 'chase') continue;
    const d = Math.hypot(g.x - x, g.y - y);
    if (d < TUNING.coinLureRadius && d < bestD) {
      best = g;
      bestD = d;
    }
  }
  if (best) {
    best.state = 'investigate';
    best.investigateX = x;
    best.investigateY = y;
    best.waitT = 2.2;
    best.suspicion = Math.max(0, best.suspicion - 20);
  }
  return best !== null;
}
