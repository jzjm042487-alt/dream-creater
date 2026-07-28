import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACTS = path.join(ROOT, "contracts");

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function loadRegistry() {
  const ids = readJson(path.join(CONTRACTS, "demo-v2-ids.json"));
  return {
    characters: ids.stableIds.characters,
    quests: ids.stableIds.quests,
    questSteps: ids.stableIds.questSteps,
    locations: ids.stableIds.locations,
    events: ids.stableIds.events,
    gu: ids.stableIds.gu,
    emotions: ids.stableIds.emotions,
    relationshipKinds: ids.stableIds.relationshipKinds,
    cultivationRanks: ids.stableIds.cultivationRanks,
    buffIds: ids.stableIds.buffIds,
    debuffIds: ids.stableIds.debuffIds,
    items: ids.stableIds.items,
    recipes: ids.stableIds.recipes,
    opportunities: ids.stableIds.opportunities,
    battles: ids.stableIds.battles,
    shops: ids.stableIds.shops,
    wildernessMaps: ids.systemIds.wildernessMaps,
    graphNodes: ids.systemIds.graphNodes,
    ordinaryRoutes: ids.systemIds.ordinaryRoutes,
    hiddenRoutes: ids.systemIds.hiddenRoutes,
    dialogueNodes: ids.systemIds.dialogueNodes,
    eventDeltas: ids.systemIds.eventDeltas,
    eventSlots: ids.systemIds.eventSlots,
    directions: ids.systemIds.directions,
    relativeCommands: ids.systemIds.relativeCommands,
    eventLifetimes: ids.systemIds.eventLifetimes,
    eventKinds: ids.systemIds.eventKinds,
    questStatuses: ids.systemIds.questStatuses,
    opportunityStatuses: ids.systemIds.opportunityStatuses,
    statusDurations: ids.systemIds.statusDurations,
    dialogueChoiceActions: ids.systemIds.dialogueChoiceActions,
    panelIds: ids.systemIds.panelIds,
    characterLifeStatuses: ids.systemIds.characterLifeStatuses,
    equipmentSlots: ids.systemIds.equipmentSlots,
    guAbilityFamilies: ids.systemIds.guAbilityFamilies,
    guAbilityTags: ids.systemIds.guAbilityTags,
    guClueKinds: ids.systemIds.guClueKinds,
    guLifecycleStatuses: ids.systemIds.guLifecycleStatuses,
    guConcealmentStatuses: ids.systemIds.guConcealmentStatuses,
    guCareStatuses: ids.systemIds.guCareStatuses,
    guFeedingModes: ids.systemIds.guFeedingModes,
    guAdvancementModes: ids.systemIds.guAdvancementModes,
    guTrackingOpportunities: ids.systemIds.guTrackingOpportunities,
    guTrackingResolutionTypes: ids.systemIds.guTrackingResolutionTypes,
    guHolderRouteIntel: ids.systemIds.guHolderRouteIntel,
    guSources: ids.systemIds.guSources,
    guTrackingClues: ids.systemIds.guTrackingClues,
    guCaptureBaits: ids.systemIds.guCaptureBaits,
    guCaptureTimings: ids.systemIds.guCaptureTimings,
    guCaptureContainers: ids.systemIds.guCaptureContainers,
    guAdvancements: ids.systemIds.guAdvancements,
    permanentEffects: ids.systemIds.permanentEffects
  };
}

export function validateSchema(value, schema, registry, fieldPath = "$", rootDir = CONTRACTS) {
  const errors = [];
  visit(value, schema, fieldPath, errors, registry, rootDir);
  return errors;
}

export function validateContentValue(value, schemaPath, registry) {
  const schema = readJson(schemaPath);
  const errors = validateSchema(value, schema, registry);
  const schemaName = path.basename(schemaPath);

  if (schemaName === "player-state.schema.json") {
    errors.push(...validatePlayerStateSemantics(value));
  } else if (schemaName === "quest.schema.json") {
    errors.push(...validateQuestSemantics(value));
  } else if (schemaName === "dialogue.schema.json") {
    errors.push(...validateDialogueSemantics(value, registry));
  } else if (schemaName === "event.schema.json") {
    errors.push(...validateEventSemantics(value));
  } else if (schemaName === "opportunity.schema.json") {
    errors.push(...validateOpportunitySemantics(value));
  }

  return errors;
}

export function validateWildernessGraph(map) {
  const errors = [];
  const nodeIds = new Set();
  const nodeById = new Map();

  for (const [index, node] of map.nodes.entries()) {
    if (nodeIds.has(node.id)) {
      errors.push(`$.nodes[${index}].id duplicates ${node.id}`);
    }
    nodeIds.add(node.id);
    nodeById.set(node.id, node);
  }

  for (const [index, node] of map.nodes.entries()) {
    for (const [edgeIndex, edge] of node.edges.entries()) {
      if (!nodeIds.has(edge.to)) {
        errors.push(`$.nodes[${index}].edges[${edgeIndex}].to unknown graph node ${edge.to}`);
      }
    }
  }

  for (const [origin, nodeId] of Object.entries(map.entryNodeByOrigin)) {
    if (origin !== "origin_default" && !map.availableOrdinaryDestinations.includes(origin)) {
      errors.push(`$.entryNodeByOrigin.${origin} origin must be ordinary destination or origin_default`);
    }
    if (!nodeIds.has(nodeId)) {
      errors.push(`$.entryNodeByOrigin.${origin} unknown graph node ${nodeId}`);
    }
  }

  for (const [origin, facing] of Object.entries(map.entryFacingByOrigin)) {
    if (!(origin in map.entryNodeByOrigin)) {
      errors.push(`$.entryFacingByOrigin.${origin} has no matching entryNodeByOrigin`);
    }
    if (!["north", "east", "south", "west"].includes(facing)) {
      errors.push(`$.entryFacingByOrigin.${origin} invalid facing ${facing}`);
    }
  }

  for (const destinationId of map.availableOrdinaryDestinations) {
    const hasNode = map.nodes.some((node) => node.destinationId === destinationId);
    if (!hasNode) {
      errors.push(`$.availableOrdinaryDestinations contains ${destinationId} but no node has that destinationId`);
    }
  }

  for (const route of map.ordinaryRoutes) {
    if (!map.availableOrdinaryDestinations.includes(route.destinationId)) {
      errors.push(`$.ordinaryRoutes.${route.id}.destinationId must be available ordinary destination`);
    }
    const result = simulateRoute(map, nodeById, route.sequence);
    if (result.error) {
      errors.push(`$.ordinaryRoutes.${route.id}.sequence ${result.error}`);
    } else if (result.node.destinationId !== route.destinationId) {
      errors.push(`$.ordinaryRoutes.${route.id}.sequence ends at ${result.node.id}, not ${route.destinationId}`);
    }
  }

  for (const route of map.hiddenRoutes) {
    if (map.availableOrdinaryDestinations.includes(route.locationId)) {
      errors.push(`$.hiddenRoutes.${route.id}.locationId must not be an ordinary destination`);
    }
    if (route.discoveryCondition.requiredNodeId && !nodeIds.has(route.discoveryCondition.requiredNodeId)) {
      errors.push(`$.hiddenRoutes.${route.id}.discoveryCondition.requiredNodeId unknown graph node`);
    }
    const result = simulateRoute(map, nodeById, route.sequence);
    if (result.error) {
      errors.push(`$.hiddenRoutes.${route.id}.sequence ${result.error}`);
    } else if (result.node.destinationId !== route.locationId) {
      errors.push(`$.hiddenRoutes.${route.id}.sequence ends at ${result.node.id}, not ${route.locationId}`);
    }
  }

  return errors;
}

function simulateRoute(map, nodeById, sequence) {
  const origin = Object.keys(map.entryNodeByOrigin)[0];
  let node = nodeById.get(map.entryNodeByOrigin[origin]);
  let facing = map.entryFacingByOrigin[origin];
  const history = [];

  for (const [index, command] of sequence.entries()) {
    if (command === "back") {
      if (!history.length) return { error: `[${index}] back has no history` };
      const previous = history.pop();
      node = nodeById.get(previous.nodeId);
      facing = previous.facing;
      continue;
    }

    const direction = relativeToAbsolute(facing, command);
    const edge = node.edges.find((candidate) => candidate.direction === direction);
    if (!edge) {
      return { error: `[${index}] ${command} resolves to ${direction}, missing edge from ${node.id}` };
    }
    history.push({ nodeId: node.id, facing });
    node = nodeById.get(edge.to);
    facing = direction;
  }

  return { node, facing };
}

function relativeToAbsolute(facing, command) {
  const directions = ["north", "east", "south", "west"];
  const index = directions.indexOf(facing);
  if (command === "forward") return facing;
  if (command === "right") return directions[(index + 1) % 4];
  if (command === "left") return directions[(index + 3) % 4];
  throw new Error(`Unsupported route command ${command}`);
}

export function schemaPathForContent(filePath) {
  const normalized = filePath.replaceAll("\\", "/");
  const base = path.basename(filePath);
  if (base.includes("player-state")) return path.join(CONTRACTS, "player-state.schema.json");
  if (normalized.includes("/characters/")) return path.join(CONTRACTS, "character.schema.json");
  if (normalized.includes("/quests/")) return path.join(CONTRACTS, "quest.schema.json");
  if (normalized.includes("/dialogue/")) return path.join(CONTRACTS, "dialogue.schema.json");
  if (normalized.includes("/events/")) return path.join(CONTRACTS, "event.schema.json");
  if (normalized.includes("/opportunities/")) return path.join(CONTRACTS, "opportunity.schema.json");
  if (base.includes("relationship")) return path.join(CONTRACTS, "relationship.schema.json");
  if (base.includes("wilderness-map") || base === "demo-v2.json") {
    return path.join(CONTRACTS, "wilderness-map.schema.json");
  }
  if (base.includes("character")) return path.join(CONTRACTS, "character.schema.json");
  if (base.includes("quest")) return path.join(CONTRACTS, "quest.schema.json");
  if (base.includes("dialogue")) return path.join(CONTRACTS, "dialogue.schema.json");
  if (base.includes("event")) return path.join(CONTRACTS, "event.schema.json");
  if (base.includes("opportunity")) return path.join(CONTRACTS, "opportunity.schema.json");
  return null;
}

function validatePlayerStateSemantics(value) {
  if (!isPlainObject(value)) return [];
  const errors = [];

  validateResourcePool(value.health, "$.health", errors);
  validateResourcePool(value.primevalEssence, "$.primevalEssence", errors);
  validateStatusInstances(value.buffs, "$.buffs", errors);
  validateStatusInstances(value.debuffs, "$.debuffs", errors);

  return errors;
}

function validateResourcePool(pool, fieldPath, errors) {
  if (!isPlainObject(pool)) return;
  if (Number.isInteger(pool.current) && Number.isInteger(pool.maximum) && pool.current > pool.maximum) {
    errors.push(`${fieldPath}.current must be less than or equal to ${fieldPath}.maximum`);
  }
}

function validateStatusInstances(instances, fieldPath, errors) {
  if (!Array.isArray(instances)) return;
  const seenIds = new Set();

  instances.forEach((instance, index) => {
    const instancePath = `${fieldPath}[${index}]`;
    validateStatusInstance(instance, instancePath, errors, seenIds);
  });
}

function validateStatusInstance(instance, instancePath, errors, seenIds = null) {
  if (!isPlainObject(instance)) return;

  if (seenIds && typeof instance.id === "string") {
    if (seenIds.has(instance.id)) {
      errors.push(`${instancePath}.id duplicates ${instance.id}`);
    }
    seenIds.add(instance.id);
  }

  if (instance.duration === "turns" && !Number.isInteger(instance.remainingTurns)) {
    errors.push(`${instancePath}.remainingTurns is required when duration is turns`);
  }
  if (
    (instance.duration === "scene" || instance.duration === "untilRest") &&
    "remainingTurns" in instance
  ) {
    errors.push(`${instancePath}.remainingTurns is not allowed when duration is ${instance.duration}`);
  }
}

function validateQuestSemantics(value) {
  if (!isPlainObject(value) || !Array.isArray(value.steps)) return [];
  const errors = [];
  const stepById = new Map();

  value.steps.forEach((step, index) => {
    if (!isPlainObject(step) || typeof step.id !== "string") return;
    if (stepById.has(step.id)) {
      errors.push(`$.steps[${index}].id duplicates ${step.id}`);
      return;
    }
    stepById.set(step.id, { step, index });
  });

  value.steps.forEach((step, index) => {
    if (!isPlainObject(step)) return;
    if (step.terminal === true && "nextStepId" in step) {
      errors.push(`$.steps[${index}].nextStepId is not allowed for a terminal step`);
    }
    if (step.terminal === false && !("nextStepId" in step)) {
      errors.push(`$.steps[${index}].nextStepId is required for a non-terminal step`);
    }
    if (typeof step.nextStepId === "string" && !stepById.has(step.nextStepId)) {
      errors.push(`$.steps[${index}].nextStepId must reference a step in this quest`);
    }
  });

  const currentEntry = stepById.get(value.currentStepId);
  if (typeof value.currentStepId === "string" && !currentEntry) {
    errors.push("$.currentStepId must reference a step in this quest");
  }
  if (typeof value.nextStepId === "string" && !stepById.has(value.nextStepId)) {
    errors.push("$.nextStepId must reference a step in this quest");
  }

  if (value.status === "completed") {
    if (currentEntry && currentEntry.step.terminal !== true) {
      errors.push("$.currentStepId must reference a terminal step when status is completed");
    }
    if ("nextStepId" in value) {
      errors.push("$.nextStepId is not allowed when status is completed");
    }
  } else if ((value.status === "active" || value.status === "inactive") && currentEntry) {
    if (currentEntry.step.terminal === true) {
      errors.push(`$.currentStepId must reference a non-terminal step when status is ${value.status}`);
    }
    if (currentEntry.step.nextStepId !== value.nextStepId) {
      errors.push("$.nextStepId must equal the current step nextStepId");
    }
  }

  return errors;
}

function validateDialogueSemantics(value, registry) {
  if (!isPlainObject(value) || !Array.isArray(value.nodes)) return [];
  const errors = [];
  const targetByAction = {
    nextNode: "nextNodeId",
    endDialogue: null,
    openMap: "targetLocationId",
    startBattle: "battleId",
    openShop: "shopId",
    openPanel: "panelId",
    openOpportunity: "opportunityId",
    applyEventDelta: "eventDeltaId"
  };
  const targetFields = [
    "nextNodeId",
    "targetLocationId",
    "battleId",
    "shopId",
    "panelId",
    "opportunityId",
    "eventDeltaId"
  ];

  value.nodes.forEach((node, nodeIndex) => {
    if (!isPlainObject(node) || !Array.isArray(node.choices)) return;
    node.choices.forEach((choice, choiceIndex) => {
      if (!isPlainObject(choice) || !registry.dialogueChoiceActions.includes(choice.action)) return;
      const choicePath = `$.nodes[${nodeIndex}].choices[${choiceIndex}]`;
      const requiredTarget = targetByAction[choice.action];

      if (requiredTarget && !(requiredTarget in choice)) {
        errors.push(`${choicePath}.${requiredTarget} is required for action ${choice.action}`);
      }
      for (const field of targetFields) {
        if (field in choice && field !== requiredTarget) {
          errors.push(`${choicePath}.${field} is not allowed for action ${choice.action}`);
        }
      }
    });
  });

  return errors;
}

function validateEventSemantics(value) {
  if (!isPlainObject(value) || !Array.isArray(value.eventDeltas)) return [];
  const errors = [];

  value.eventDeltas.forEach((delta, index) => {
    if (!isPlainObject(delta) || !isPlainObject(delta.effects)) return;
    if ("addBuff" in delta.effects) {
      validateStatusInstance(
        delta.effects.addBuff,
        `$.eventDeltas[${index}].effects.addBuff`,
        errors
      );
    }
    if ("addDebuff" in delta.effects) {
      validateStatusInstance(
        delta.effects.addDebuff,
        `$.eventDeltas[${index}].effects.addDebuff`,
        errors
      );
    }
  });

  return errors;
}

function validateOpportunitySemantics(value) {
  if (!isPlainObject(value)) return [];
  if (value.status !== "resolved" && "resolvedByCharacterId" in value) {
    return ["$.resolvedByCharacterId is only allowed when status is resolved"];
  }
  return [];
}

function visit(value, schema, fieldPath, errors, registry, rootDir) {
  if (schema.$ref) {
    const refPath = path.join(rootDir, schema.$ref);
    const refSchema = readJson(refPath);
    visit(value, refSchema, fieldPath, errors, registry, path.dirname(refPath));
    return;
  }

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${fieldPath} expected ${schema.type}, got ${typeOf(value)}`);
    return;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${fieldPath} expected one of ${schema.enum.join(", ")}, got ${value}`);
  }

  if (schema.pattern && typeof value === "string" && !new RegExp(schema.pattern).test(value)) {
    errors.push(`${fieldPath} must match ${schema.pattern}`);
  }

  if (schema.minLength && typeof value === "string" && value.length < schema.minLength) {
    errors.push(`${fieldPath} must have length >= ${schema.minLength}`);
  }

  if (Number.isInteger(schema.minimum) && typeof value === "number" && value < schema.minimum) {
    errors.push(`${fieldPath} must be >= ${schema.minimum}`);
  }

  if (Number.isInteger(schema.maximum) && typeof value === "number" && value > schema.maximum) {
    errors.push(`${fieldPath} must be <= ${schema.maximum}`);
  }

  if (schema["x-idRegistry"]) {
    const bucket = registry[schema["x-idRegistry"]] || [];
    if (!bucket.includes(value)) {
      errors.push(`${fieldPath} unknown ${schema["x-idRegistry"]} id: ${value}`);
    }
  }

  if (Array.isArray(value)) {
    if (Number.isInteger(schema.minItems) && value.length < schema.minItems) {
      errors.push(`${fieldPath} must contain at least ${schema.minItems} item(s)`);
    }
    if (Number.isInteger(schema.maxItems) && value.length > schema.maxItems) {
      errors.push(`${fieldPath} must contain at most ${schema.maxItems} item(s)`);
    }
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) {
      errors.push(`${fieldPath} must contain unique items`);
    }
    if (schema.items) {
      value.forEach((item, index) => visit(item, schema.items, `${fieldPath}[${index}]`, errors, registry, rootDir));
    }
  }

  if (isPlainObject(value)) {
    const required = schema.required || [];
    for (const key of required) {
      if (!(key in value)) {
        errors.push(`${fieldPath}.${key} is required`);
      }
    }

    const properties = schema.properties || {};
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in properties)) {
          errors.push(`${fieldPath}.${key} is not allowed`);
        }
      }
    }

    for (const [key, propSchema] of Object.entries(properties)) {
      if (key in value) {
        visit(value[key], propSchema, `${fieldPath}.${key}`, errors, registry, rootDir);
      }
    }

    if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      for (const [key, item] of Object.entries(value)) {
        if (!(key in properties)) {
          visit(item, schema.additionalProperties, `${fieldPath}.${key}`, errors, registry, rootDir);
        }
      }
    }

    if (Number.isInteger(schema.minProperties) && Object.keys(value).length < schema.minProperties) {
      errors.push(`${fieldPath} must contain at least ${schema.minProperties} properties`);
    }
  }
}

function matchesType(value, type) {
  if (type === "array") return Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "object") return isPlainObject(value);
  return typeof value === type;
}

function typeOf(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
