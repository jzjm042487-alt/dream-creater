# Dream Creater 开发入口

`main` 是旧基线和默认克隆入口，不是当前开发分支。不要在此分支继续实现剧情、系统或美术。

当前活动基线：

- 分支：`integration/wave05-qingmao`
- 迁移标签：`wave0.5-handoff-20260728-r2`
- 战斗实验分支：`codex/tactical-combat-wave1`

克隆后执行：

```powershell
git fetch --all --tags
git switch integration/wave05-qingmao
npm ci
```

切换后先阅读：

1. `AGENTS.md`
2. `docs/handoff/README.md`
3. `docs/handoff/2026-07-28-project-inventory.md`
4. `docs/handoff/2026-07-28-device-migration.md`
5. `docs/superpowers/specs/2026-07-28-wave05-integration-contract.md`

活动分支包含完整代码、剧情、契约、美术、资产清单、阶段进度和后续工作说明。
