// Keyboard + mouse input. WASD/arrows move, Shift sneaks, click walks to
// the point, C/L/D fire the tools, P pauses, M mutes, R restarts, Enter
// starts and continues. Also exposes the live key set for the game loop.
export function makeInput(canvas, game) {
  const keys = new Set();
  const input = { keys, mouse: { x: 0, y: 0, down: false }, clickTarget: null };

  function keyName(e) {
    const k = e.key.toLowerCase();
    if (k === ' ') return 'space';
    return k;
  }

  window.addEventListener('keydown', (e) => {
    const k = keyName(e);
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (e.repeat) return;
    keys.add(k);
    if (k === 'enter') game.onEnter();
    if (k === 'p') game.togglePause();
    if (k === 'm') game.toggleMute();
    if (k === 'r') game.restartLevel();
    if (k === 'c' && game.state === 'playing') game.tossCoinAtMouse();
    if (k === 'l' && game.state === 'playing') game.useLoopTool();
    if (k === 'd' && game.state === 'playing') game.useDisguiseTool();
  });
  window.addEventListener('keyup', (e) => keys.delete(keyName(e)));

  function canvasPos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  }

  canvas.addEventListener('mousemove', (e) => {
    input.mouse = canvasPos(e);
  });
  canvas.addEventListener('mousedown', (e) => {
    const p = canvasPos(e);
    input.mouse = p;
    input.mouse.down = true;
    if (game.state === 'playing') input.clickTarget = { x: p.x, y: p.y };
  });
  window.addEventListener('mouseup', () => {
    input.mouse.down = false;
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  return input;
}

// Movement vector from the held keys: [dx, dy] each in -1..1.
export function moveVector(keys) {
  let dx = 0;
  let dy = 0;
  if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
  if (keys.has('d') || keys.has('arrowright')) dx += 1;
  if (keys.has('w') || keys.has('arrowup')) dy -= 1;
  if (keys.has('s') || keys.has('arrowdown')) dy += 1;
  if (dx !== 0 && dy !== 0) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }
  return [dx, dy];
}
