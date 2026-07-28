import { BehaviourTree, State } from "mistreevous";

const INTENTS = new Set([
  "finish",
  "phase_action",
  "defend",
  "conserve",
  "attack",
  "reposition"
]);

export function runBehaviorPolicy(profile, facts = {}) {
  requireProfile(profile);
  let intent = null;
  const agent = {
    CanFinish: () => Boolean(facts.canFinish),
    HasPhaseAction: () =>
      profile.id === "ai_profile_boss_hunter" &&
      Boolean(facts.hasPhaseAction),
    ShouldDefend: () => Boolean(facts.shouldDefend),
    ShouldConserve: () => Boolean(facts.shouldConserve),
    HasEffectiveAttack: () => Boolean(facts.hasEffectiveAttack),
    SetIntent: (nextIntent) => {
      if (!INTENTS.has(nextIntent)) {
        throw new Error(`unknown battle intent: ${nextIntent}`);
      }
      if (intent !== null) {
        throw new Error("behavior policy attempted to set more than one intent");
      }
      intent = nextIntent;
      return State.SUCCEEDED;
    }
  };
  const tree = createDeterministicTree(profile.behaviorTree, agent);

  tree.step();
  if (tree.isRunning() || tree.getState() === State.RUNNING || !intent) {
    throw new Error("behavior policy did not resolve in one deterministic step");
  }

  return {
    intent,
    steps: 1,
    running: tree.isRunning(),
    state: publicTreeState(tree.getState())
  };
}

export function resolveBattleIntent({
  snapshot,
  actorUnitId,
  candidates,
  profile,
  facts
}) {
  if (snapshot?.result) return null;
  if (!snapshot || !actorUnitId || !Array.isArray(candidates)) {
    throw new TypeError(
      "snapshot, actorUnitId, and candidates are required"
    );
  }
  const resolvedProfile =
    profile ??
    snapshot.content?.profiles?.[
      findUnit(snapshot, actorUnitId)?.profileId
    ];
  requireProfile(resolvedProfile);

  return runBehaviorPolicy(
    resolvedProfile,
    facts ?? deriveBehaviorFacts(snapshot, actorUnitId, candidates, resolvedProfile)
  ).intent;
}

export function deriveBehaviorFacts(
  snapshot,
  actorUnitId,
  candidates,
  profile
) {
  const actor = findUnit(snapshot, actorUnitId);
  if (!actor) throw new Error(`unknown battle unit id: ${actorUnitId}`);
  const phaseActionId = currentPhaseActionId(profile, actor);

  return {
    canFinish: candidates.some((candidate) =>
      candidateSettlesResult(candidate, "defeat")
    ),
    hasPhaseAction: Boolean(
      phaseActionId &&
        candidates.some(
          (candidate) => candidate.action?.actionId === phaseActionId
        )
    ),
    shouldDefend:
      actor.hp / actor.maxHp <= profile.lowHealthRatio &&
      candidates.some((candidate) => candidate.action?.type === "defend"),
    shouldConserve:
      actor.essence / actor.maxEssence <= profile.lowEssenceRatio &&
      candidates.some((candidate) => candidate.essenceCost === 0),
    hasEffectiveAttack: candidates.some((candidate) =>
      ["basicAttack", "skill", "boss"].includes(candidate.action?.type)
    )
  };
}

function currentPhaseActionId(profile, actor) {
  const hpRatio = actor.maxHp > 0 ? actor.hp / actor.maxHp : 0;
  return profile.phases?.find(
    (phase) =>
      hpRatio >= phase.minimumHpRatio && hpRatio <= phase.maximumHpRatio
  )?.phaseActionId;
}

function candidateSettlesResult(candidate, result) {
  return (
    candidate.settlementSummary?.result === result ||
    candidate.preview?.settlementSummary?.result === result ||
    candidate.result === result
  );
}

function findUnit(snapshot, unitId) {
  if (snapshot.player?.unitId === unitId) return snapshot.player;
  return snapshot.enemies?.find((unit) => unit.unitId === unitId) ?? null;
}

function requireProfile(profile) {
  if (
    !profile ||
    typeof profile !== "object" ||
    !profile.id ||
    !profile.behaviorTree
  ) {
    throw new TypeError("a battle AI profile with a behavior tree is required");
  }
}

function createDeterministicTree(definition, agent) {
  const originalRandom = Math.random;
  let uidPart = 0;
  try {
    // Mistreevous 4.3.1 hard-codes Math.random for opaque node UIDs.
    Math.random = () => ((uidPart += 1) % 65_536) / 65_536;
    return new BehaviourTree(definition, agent, {
      getDeltaTime: () => 0,
      random: () => {
        throw new Error("behavior policy must not request randomness");
      }
    });
  } finally {
    Math.random = originalRandom;
  }
}

function publicTreeState(state) {
  const label = String(state).split(".").at(-1);
  return label.toUpperCase();
}
