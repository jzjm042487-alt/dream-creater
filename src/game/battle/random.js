export function fnv1aUtf8(text) {
  requireString(text, "text");
  const bytes = new TextEncoder().encode(text);
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash = Math.imul((hash ^ byte) >>> 0, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function xorshift32(input) {
  if (!Number.isInteger(input) || input < 0 || input > 0xffffffff) {
    throw new TypeError("value must be an unsigned 32-bit integer");
  }
  let value = input === 0 ? 0x9e3779b9 : input;
  value = (value ^ (value << 13)) >>> 0;
  value = (value ^ (value >>> 17)) >>> 0;
  value = (value ^ (value << 5)) >>> 0;
  return value >>> 0;
}

export function deterministicRandom(seed, cursor) {
  requireString(seed, "seed");
  requireSafeCounter(cursor, "cursor");
  return xorshift32(fnv1aUtf8(`${seed}|${cursor}`)) / 0x100000000;
}

export function hex8(value) {
  if (!Number.isInteger(value) || !Number.isFinite(value)) {
    throw new TypeError("value must be an integer");
  }
  return (value >>> 0).toString(16).padStart(8, "0");
}

export function deriveBattleSeedRoot(theftSeed) {
  requireString(theftSeed, "theftSeed");
  return hex8(fnv1aUtf8(`battle-ai-v1|${theftSeed}`));
}

export function deriveBattleSeed(root, battleId, serial) {
  requireString(root, "root");
  requireString(battleId, "battleId");
  requireSafeCounter(serial, "serial");
  return hex8(fnv1aUtf8(`${root}|${battleId}|${serial}`));
}

export function beginnerChoiceIndex(candidateCount, roll) {
  if (!Number.isSafeInteger(candidateCount) || candidateCount < 1) {
    throw new RangeError("candidateCount must be a positive safe integer");
  }
  if (typeof roll !== "number" || !Number.isFinite(roll) || roll < 0 || roll >= 1) {
    throw new RangeError("roll must be in [0, 1)");
  }
  if (candidateCount === 1) return 0;
  if (roll < 0.6) return 0;
  if (roll < 0.85) return 1;
  return candidateCount === 2 ? 0 : 2;
}

function requireString(value, name) {
  if (typeof value !== "string") {
    throw new TypeError(`${name} must be a string`);
  }
}

function requireSafeCounter(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer`);
  }
}
