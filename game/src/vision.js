// Vision and collision geometry: ray-cast vision cones against the walls,
// line-of-sight tests, and circle-vs-rectangle movement collision.
import { TILE } from './config.js';

export function rectPx(r) {
  return { x: r.x * TILE, y: r.y * TILE, w: r.w * TILE, h: r.h * TILE };
}

export function pointInRect(px, py, r) {
  return px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;
}

// Distance from (ox,oy) along direction (dx,dy) to the first wall hit,
// capped at maxDist. Steps in small increments — cheap and robust.
export function rayHit(ox, oy, dx, dy, walls, maxDist) {
  const step = 6;
  for (let d = step; d <= maxDist; d += step) {
    const x = ox + dx * d;
    const y = oy + dy * d;
    for (const w of walls) {
      if (pointInRect(x, y, w)) return d - step / 2;
    }
  }
  return maxDist;
}

// The visible polygon of a cone: origin, facing angle, half-angle, range.
export function conePolygon(ox, oy, angle, halfAngle, range, walls) {
  const rays = 26;
  const pts = [{ x: ox, y: oy }];
  for (let i = 0; i <= rays; i++) {
    const a = angle - halfAngle + (2 * halfAngle * i) / rays;
    const d = rayHit(ox, oy, Math.cos(a), Math.sin(a), walls, range);
    pts.push({ x: ox + Math.cos(a) * d, y: oy + Math.sin(a) * d });
  }
  return pts;
}

// True when the straight line from (x1,y1) to (x2,y2) crosses no wall.
export function hasLineOfSight(x1, y1, x2, y2, walls) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return true;
  const steps = Math.ceil(dist / 6);
  for (let i = 1; i < steps; i++) {
    const x = x1 + (dx * i) / steps;
    const y = y1 + (dy * i) / steps;
    for (const w of walls) {
      if (pointInRect(x, y, w)) return false;
    }
  }
  return true;
}

// True when a circle of radius r at (x,y) overlaps a wall rect.
export function circleHitsWall(x, y, r, walls) {
  for (const w of walls) {
    const cx = Math.max(w.x, Math.min(x, w.x + w.w));
    const cy = Math.max(w.y, Math.min(y, w.y + w.h));
    if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
  }
  return false;
}

// Move a circle, sliding along walls: try x then y separately.
export function moveCircle(x, y, r, dx, dy, walls, bounds) {
  let nx = x + dx;
  if (nx - r < bounds.x || nx + r > bounds.x + bounds.w) nx = x;
  else if (circleHitsWall(nx, y, r, walls)) nx = x;
  let ny = y + dy;
  if (ny - r < bounds.y || ny + r > bounds.y + bounds.h) ny = y;
  else if (circleHitsWall(nx, ny, r, walls)) ny = y;
  return { x: nx, y: ny };
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
