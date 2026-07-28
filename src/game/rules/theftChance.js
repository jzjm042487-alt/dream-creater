const ITEM_PENALTIES = Object.freeze({
  ordinary: 0,
  equipment: 5,
  outerwear: 8,
  closeWorn: 10,
  secured: 15,
});

export function calculateTheftChance({
  luck,
  theftMastery,
  playerRankIndex,
  targetRankIndex,
  itemClass = "ordinary",
}) {
  if (!(itemClass in ITEM_PENALTIES)) {
    throw new Error(`Unknown theft item class: ${itemClass}`);
  }

  const rankGap = targetRankIndex - playerRankIndex;
  const luckBonus = Math.round((luck - 50) * 0.2);
  const masteryBonus = Math.round((theftMastery - 50) * 0.35);
  const rankModifier =
    rankGap > 0 ? -10 * rankGap : 5 * Math.min(-rankGap, 2);
  const chance =
    65 +
    luckBonus +
    masteryBonus +
    rankModifier -
    ITEM_PENALTIES[itemClass];

  return Math.max(15, Math.min(95, chance));
}

export function getDeterministicPercent(seed, cursor) {
  const input = `${seed}:${cursor}`;
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  return hash % 100;
}

export function resolveTheftRoll({
  seed,
  cursor,
  luck,
  theftMastery,
  playerRankIndex,
  targetRankIndex,
  itemClass,
}) {
  const chance = calculateTheftChance({
    luck,
    theftMastery,
    playerRankIndex,
    targetRankIndex,
    itemClass,
  });
  const roll = getDeterministicPercent(seed, cursor);

  return {
    chance,
    roll,
    success: roll < chance,
    nextCursor: cursor + 1,
  };
}
