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
    questStates: ids.stableIds.questStates,
    locations: ids.stableIds.locations,
    events: ids.stableIds.events,
    gu: ids.stableIds.gu,
    emotions: ids.stableIds.emotions,
    relationshipDimensions: ids.stableIds.relationshipDimensions,
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
    eventKinds: ids.systemIds.eventKinds
  };
}

export function validateSchema(value, schema, registry, fieldPath = "$", rootDir = CONTRACTS) {
  const errors = [];
  visit(value, schema, fieldPath, errors, registry, rootDir);
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
  if (normalized.includes("/characters/")) return path.join(CONTRACTS, "character.schema.json");
  if (normalized.includes("/quests/")) return path.join(CONTRACTS, "quest.schema.json");
  if (normalized.includes("/dialogue/")) return path.join(CONTRACTS, "dialogue.schema.json");
  if (normalized.includes("/events/")) return path.join(CONTRACTS, "event.schema.json");
  if (base.includes("relationship")) return path.join(CONTRACTS, "relationship.schema.json");
  if (base.includes("wilderness-map") || base === "demo-v2.json") {
    return path.join(CONTRACTS, "wilderness-map.schema.json");
  }
  if (base.includes("character")) return path.join(CONTRACTS, "character.schema.json");
  if (base.includes("quest")) return path.join(CONTRACTS, "quest.schema.json");
  if (base.includes("dialogue")) return path.join(CONTRACTS, "dialogue.schema.json");
  if (base.includes("event")) return path.join(CONTRACTS, "event.schema.json");
  return null;
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
