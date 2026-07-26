export function calculateTheftResult({
  theftRank = 0,
  agility = 0,
  insight = 0,
  caution = 0,
  preparation = 0,
  difficulty = 0,
  baseScore,
}) {
  const base =
    baseScore ?? theftRank * 2 + agility + insight + caution + preparation;
  const score = base - difficulty;

  return {
    score,
    band: score >= 3 ? "success" : score >= 0 ? "partial" : "failure",
  };
}
