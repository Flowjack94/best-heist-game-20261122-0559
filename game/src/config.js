// The Midnight Vault — tuning and level layouts.
// One tile is 32 px. The playfield is 40 x 23 tiles under a 64 px HUD,
// so the canvas is 1280 x 800. Walls, crates and shadow zones are tile
// rectangles; guards walk waypoint loops; cameras sweep from a wall mount.
export const TILE = 32;
export const HUD_H = 64;
export const COLS = 40;
export const ROWS = 23;
export const VIEW_W = COLS * TILE; // 1280
export const VIEW_H = HUD_H + ROWS * TILE; // 800

export const TUNING = {
  playerWalk: 150, // px/s
  playerSneak: 85,
  guardChaseMultiplier: 1.45,
  guardSeeRate: 60, // suspicion per second while the thief is in a cone
  guardSeeRateSneak: 30,
  cameraSeeRate: 75,
  suspicionDecay: 25,
  shadowFactor: 0.5, // detection rate multiplier while the thief hides in shadow
  catchDistance: 18, // a guard touching the thief catches them
  coinUses: 3,
  loopUses: 2,
  loopSeconds: 6,
  disguiseUses: 1,
  disguiseSeconds: 4,
  coinLureRadius: 420,
  guardVisionRange: 230,
  guardConeHalfAngle: 0.6,
  cameraRange: 280,
  cameraConeHalfAngle: 0.5,
  lives: 3,
};

function tileCenter(tx, ty) {
  return { x: tx * TILE + TILE / 2, y: HUD_H + ty * TILE + TILE / 2 };
}

function guard(waypoints, speed) {
  return { waypoints: waypoints.map(([tx, ty]) => tileCenter(tx, ty)), speed };
}

function camera(tx, ty, baseAngle, sweepAmp, sweepSpeed) {
  const p = tileCenter(tx, ty);
  return { x: p.x, y: p.y, baseAngle, sweepAmp, sweepSpeed };
}

export const LEVELS = [
  {
    name: 'The Gallery',
    sub: 'Museum malam — curi Star Sapphire, jangan bangunkan penjaga.',
    playerStart: tileCenter(2, 21),
    exit: tileCenter(38, 21),
    loot: { ...tileCenter(36, 3), name: 'Star Sapphire', value: 500 },
    bonus: [
      { ...tileCenter(6, 20), value: 150 },
      { ...tileCenter(33, 20), value: 150 },
    ],
    walls: [
      { x: 13, y: 1, w: 1, h: 7 },
      { x: 26, y: 1, w: 1, h: 7 },
      { x: 4, y: 10, w: 12, h: 1 },
      { x: 24, y: 10, w: 12, h: 1 },
      { x: 19, y: 13, w: 1, h: 8 },
      { x: 8, y: 16, w: 8, h: 1 },
      { x: 28, y: 16, w: 8, h: 1 },
    ],
    crates: [
      { x: 6, y: 3, w: 2, h: 2 },
      { x: 20, y: 5, w: 2, h: 1 },
      { x: 33, y: 6, w: 2, h: 2 },
      { x: 5, y: 14, w: 2, h: 1 },
      { x: 30, y: 13, w: 2, h: 2 },
      { x: 16, y: 19, w: 2, h: 1 },
      { x: 24, y: 19, w: 2, h: 1 },
    ],
    shadows: [
      { x: 2, y: 18, w: 4, h: 3 },
      { x: 36, y: 2, w: 3, h: 3 },
      { x: 17, y: 2, w: 3, h: 3 },
    ],
    guards: [
      guard([[6, 5], [6, 9], [20, 9], [20, 18], [6, 18]], 55),
      guard([[15, 3], [24, 3], [24, 8], [15, 8]], 55),
    ],
    cameras: [camera(20, 0, Math.PI / 2, 0.9, 0.55)],
  },
  {
    name: 'The Vault Floor',
    sub: 'Brankas bank — tiga penjaga, dua kamera, Gold Reserve di ujung.',
    playerStart: tileCenter(2, 21),
    exit: tileCenter(38, 21),
    loot: { ...tileCenter(36, 3), name: 'The Gold Reserve', value: 500 },
    bonus: [
      { ...tileCenter(3, 20), value: 150 },
      { ...tileCenter(20, 20), value: 150 },
      { ...tileCenter(36, 20), value: 150 },
    ],
    walls: [
      { x: 10, y: 1, w: 1, h: 6 },
      { x: 20, y: 1, w: 1, h: 6 },
      { x: 30, y: 1, w: 1, h: 6 },
      { x: 2, y: 8, w: 10, h: 1 },
      { x: 14, y: 8, w: 10, h: 1 },
      { x: 28, y: 8, w: 10, h: 1 },
      { x: 6, y: 13, w: 1, h: 7 },
      { x: 16, y: 13, w: 1, h: 7 },
      { x: 26, y: 13, w: 1, h: 7 },
      { x: 34, y: 13, w: 1, h: 7 },
      { x: 12, y: 18, w: 8, h: 1 },
      { x: 24, y: 18, w: 8, h: 1 },
    ],
    crates: [
      { x: 4, y: 4, w: 2, h: 2 },
      { x: 24, y: 4, w: 2, h: 1 },
      { x: 36, y: 5, w: 2, h: 2 },
      { x: 3, y: 16, w: 2, h: 2 },
      { x: 20, y: 15, w: 2, h: 1 },
      { x: 33, y: 16, w: 2, h: 1 },
    ],
    shadows: [
      { x: 36, y: 19, w: 3, h: 3 },
      { x: 2, y: 2, w: 3, h: 2 },
      { x: 18, y: 19, w: 4, h: 2 },
    ],
    guards: [
      guard([[4, 3], [4, 7], [9, 7], [9, 3]], 65),
      guard([[22, 3], [28, 3], [28, 7], [22, 7]], 65),
      guard([[8, 10], [8, 17], [14, 17], [14, 10]], 65),
    ],
    cameras: [
      camera(20, 0, Math.PI / 2, 0.9, 0.6),
      camera(0, 12, 0, 0.7, 0.5),
    ],
  },
  {
    name: 'The Rooftop',
    sub: 'Atap gedung — ambil tas kabur dan lari ke helipad sebelum fajar.',
    playerStart: tileCenter(2, 21),
    exit: tileCenter(37, 2),
    loot: { ...tileCenter(20, 2), name: 'The Getaway Bag', value: 500 },
    bonus: [
      { ...tileCenter(3, 21), value: 150 },
      { ...tileCenter(36, 21), value: 150 },
    ],
    walls: [
      { x: 12, y: 4, w: 1, h: 5 },
      { x: 27, y: 4, w: 1, h: 5 },
      { x: 5, y: 12, w: 10, h: 1 },
      { x: 25, y: 12, w: 10, h: 1 },
      { x: 18, y: 16, w: 4, h: 1 },
    ],
    crates: [
      { x: 8, y: 2, w: 2, h: 2 },
      { x: 30, y: 2, w: 2, h: 2 },
      { x: 20, y: 8, w: 2, h: 2 },
      { x: 3, y: 18, w: 3, h: 2 },
      { x: 33, y: 18, w: 3, h: 2 },
    ],
    shadows: [
      { x: 2, y: 2, w: 3, h: 3 },
      { x: 36, y: 2, w: 3, h: 3 },
    ],
    guards: [
      guard([[5, 6], [20, 6], [20, 10], [5, 10]], 80),
      guard([[25, 6], [36, 6], [36, 10], [25, 10]], 80),
      guard([[10, 15], [30, 15], [30, 20], [10, 20]], 80),
    ],
    cameras: [
      camera(20, 0, Math.PI / 2, 1.0, 0.7),
      camera(39, 11, Math.PI, 0.7, 0.6),
    ],
  },
];
