// The thief's tools, each with a limited count per level — spending one is
// a decision, not a freebie.
//  - Coin (C): toss it where the mouse points; the nearest guard walks over
//    to check the noise, opening a gap in the patrol.
//  - Loop (L): freeze every camera for a few seconds; their cones go grey
//    and they cannot raise the alarm while looped.
//  - Disguise (D): for a few seconds the guards take you for staff and
//    ignore you — but the cameras still see through it.
import { TUNING } from './config.js';
import { lureGuards } from './guards.js';
import { sfx } from './audio.js';

export function makeTools() {
  return {
    coin: TUNING.coinUses,
    loop: TUNING.loopUses,
    disguise: TUNING.disguiseUses,
    coins: [], // {x, y, t} ringing coins on the floor
  };
}

export function useCoin(game, x, y) {
  const tools = game.tools;
  if (tools.coin <= 0 || game.state !== 'playing') return false;
  tools.coin--;
  tools.coins.push({ x, y, t: 1.6 });
  lureGuards(game.guards, x, y);
  sfx.coin();
  setTimeout(() => sfx.coinLand(), 260);
  return true;
}

export function useLoop(game) {
  const tools = game.tools;
  if (tools.loop <= 0 || game.state !== 'playing') return false;
  tools.loop--;
  for (const c of game.cameras) c.frozen = TUNING.loopSeconds;
  game.loopT = TUNING.loopSeconds;
  sfx.loop();
  return true;
}

export function useDisguise(game) {
  const tools = game.tools;
  if (tools.disguise <= 0 || game.state !== 'playing') return false;
  tools.disguise--;
  game.disguiseT = TUNING.disguiseSeconds;
  sfx.disguise();
  return true;
}

export function updateTools(game, dt) {
  for (const c of game.tools.coins) c.t -= dt;
  game.tools.coins = game.tools.coins.filter((c) => c.t > 0);
  if (game.loopT > 0) game.loopT -= dt;
  if (game.disguiseT > 0) game.disguiseT -= dt;
}
