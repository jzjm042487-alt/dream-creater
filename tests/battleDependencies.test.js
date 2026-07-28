import test from "node:test";
import assert from "node:assert/strict";

test("approved battle libraries expose the required APIs", async () => {
  const mistreevous = await import("mistreevous");
  const easyStarModule = await import("easystarjs");
  const fastCheck = await import("fast-check");

  assert.equal(typeof mistreevous.BehaviourTree, "function");
  assert.equal("SUCCEEDED" in mistreevous.State, true);
  assert.equal(typeof (easyStarModule.default ?? easyStarModule).js, "function");
  assert.equal(typeof fastCheck.default.assert, "function");
  assert.equal(typeof fastCheck.default.property, "function");
});
