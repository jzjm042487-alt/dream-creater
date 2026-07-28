import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const contractName = "2026-07-28-wave05-integration-contract.md";
const contractPath = `${repoRoot}docs/superpowers/specs/${contractName}`;

test("publishes one Wave 0.5 authority and content bridge", () => {
  assert.equal(existsSync(contractPath), true, `${contractName} must exist`);

  const source = readFileSync(contractPath, "utf8");
  for (const heading of [
    "## 2. 权威层级",
    "## 3. 不可回退的产品决策",
    "## 4. 跨角色接口",
    "## 5. Wave 1 入口"
  ]) {
    assert.match(source, new RegExp(`^${heading}$`, "m"));
  }

  assert.match(source, /禁止直接执行或 `eval`/);
  assert.match(source, /`D_`、`I_`、`B_`/);
  assert.match(source, /RUNTIME_PANEL_TO_PROTOTYPE/);
  assert.match(source, /theftMastery[\s\S]*20/);
  assert.match(source, /Q01/);
});

test("points every active design authority to the Wave 0.5 contract", () => {
  const activeDocs = [
    "README.md",
    "docs/game-design/gu-zhen-ren-tianwai-daojuben-gdd.md",
    "docs/superpowers/specs/2026-07-26-character-state-portrait-ui-design.md",
    "docs/superpowers/specs/2026-07-26-low-rank-gu-acquisition-and-care-design.md",
    "docs/superpowers/specs/2026-07-26-qing-mao-mvp-complete-script-design.md",
    "docs/superpowers/specs/2026-07-27-qing-mao-simplified-mvp-design.md",
    "docs/superpowers/specs/2026-07-27-qing-mao-mvp-stateful-dialogue-script-design.md",
    "docs/superpowers/specs/2026-07-27-qing-mao-mvp-visual-ui-action-production-design.md",
    "docs/superpowers/specs/2026-07-27-tactical-combat-ai-and-enemy-balance-design.md",
    "systems/demo-v2-rules.md",
    "systems/theft-system-design.md"
  ];

  for (const file of activeDocs) {
    const source = readFileSync(`${repoRoot}${file}`, "utf8");
    assert.match(source, new RegExp(contractName.replaceAll(".", "\\.")), file);
  }
});
