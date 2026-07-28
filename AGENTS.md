# 项目接续规则

## 1. 开始任何工作之前

确认当前分支：

```powershell
git status --short --branch
```

活动开发只能从 `integration/wave05-qingmao` 开始。若当前是 `main`，先执行：

```powershell
git fetch --all --tags
git switch integration/wave05-qingmao
```

按顺序阅读：

1. `docs/handoff/README.md`
2. `docs/handoff/2026-07-28-project-inventory.md`
3. `docs/handoff/2026-07-28-device-migration.md`
4. `docs/superpowers/specs/2026-07-28-wave05-integration-contract.md`
5. 与当前任务直接相关的设计规格和契约

迁移恢复点是 `wave0.5-handoff-20260728-r2`。

## 2. 当前阶段

项目处于 Wave 0.5 集成基线，尚未正式展开全量 Wave 1。

- `/` 是 Phaser 可行走的 Q01 酒虫纵向切片。
- `/ui.html` 是 16 视图的完整 UI、山寨行走和方向旅行原型。
- 青茅山编剧生产包有 10 个文件、144 条唯一记录。
- Q01 路线 A 已有端到端流程；路线 B、C 和失败转移有规则测试。
- Q02 至 Q05 是已批准编剧输入，尚未全部编译成运行时结构化数据。
- 视觉资产清单覆盖 104 个文件，详见 `docs/handoff/2026-07-28-asset-manifest.json`。
- 原著生成索引可直接使用；小说原文不在 Git 中。

## 3. 已冻结产品决策

- 玩家是唯一主角，方源是普通、可竞争、可冲突、可死亡的 NPC。
- 方源只使用分类关系、已知事实和直接冲突，不使用全局数值警觉。
- 不引入行动点、功绩、数值好感、数值怀疑或原轨同步率。
- 偷盗是主技能，一次选择、一次判定，随机种子和游标必须可存档、可复现。
- 主线始终有合法继续路径；支线和奇遇允许拒绝、失败、过期或被他人取得。
- 野图使用前后左右隐式寻路，20 步只保底普通目的地，不暴露隐藏地点。
- 运行时内容使用稳定语义 ID；`UIxx` 只属于原型展示。
- 新剧情不得直接在场景组件中硬编码第二套任务、偷盗或关系规则。

发生文档冲突时，以 Wave 0.5 集成契约定义的权威层级裁决。

## 4. 活动代码与历史代码

继续开发：

- `src/main.js`
- `src/game/`
- `src/ui-prototype/`
- `contracts/`
- `systems/`
- `docs/game-design/qing-mao-mvp-script/`

只保留回归，不继续开发：

- `src/app.js`
- `src/gameState.js`
- `src/content.js`
- `tests/gameState.test.js`

## 5. Wave 1 推荐顺序

1. 把 Q01 及其主线前置编译为结构化谓词、原子动作、节点和稳定 ID。
2. 覆盖 Q01 成功、失去、拒绝、错过、读档不重掷和主线不断档。
3. 补齐两个明确跳过的 NPC 专用地图动作图测试与资产。
4. 从 `codex/tactical-combat-wave1` 选择性移植一场 Q01 相关遭遇。
5. 战斗接入稳定后，再开始 Q02；不要同时数据化 Q02 至 Q05。

`codex/tactical-combat-wave1` 有 15 个已推送提交和完整战斗实现，但它基于 Wave 0.5
之前的系统基线，保留旧行动点、旧方源警觉和旧偷盗语义。禁止整分支覆盖或直接合并。
应从活动分支另建集成分支，按战斗数据、纯规则、状态持久化、场景接入和测试分批移植。

## 6. 每次交付门禁

```powershell
node scripts/validate-contracts.mjs
node scripts/validate-content.mjs
node scripts/validate-canon.mjs
npm test
npm run build
npm run test:e2e
```

当前基准是 90 项测试通过、2 项 NPC 动作图待办和 17 项端到端通过。
构建允许现存的 chunk 大小警告，不允许新增失败。

## 7. 不进入 Git 的内容

- `node_modules/`、`dist/`、日志和测试输出
- `.env`、凭据和私钥
- 浏览器 localStorage 存档
- 小说原文
- Codex 本地 task/worktree 元数据

若阶段、活动分支或后续任务顺序发生变化，同时更新 `AGENTS.md` 和 `docs/handoff/`。
