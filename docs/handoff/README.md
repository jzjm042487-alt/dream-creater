# 换设备交接索引

日期：2026-07-28

当前活动分支：`integration/wave05-qingmao`

迁移检查点：`wave0.5-handoff-20260728-r2`

## 必读文件

- [`2026-07-28-project-inventory.md`](2026-07-28-project-inventory.md)
  记录当前项目进度、分支关系、已完成资产、未完成项和下一步。
- [`2026-07-28-device-migration.md`](2026-07-28-device-migration.md)
  给出旧设备收尾、新设备恢复、浏览器存档转移和完整验证命令。
- [`2026-07-28-asset-manifest.json`](2026-07-28-asset-manifest.json)
  列出视觉资产、生产源图、历史可视稿和交接截图的字节数、SHA-256 与 PNG 尺寸。
- [`captures/`](captures/)
  保存 Wave 0 与 Wave 0.5 的阶段画面证据。
- [`../archive/brainstorming/`](../archive/brainstorming/)
  保存原先只存在于本机 `.superpowers/` 中的有效设计可视稿。

## 权威边界

本目录负责交接，不取代游戏设计权威。跨角色和 Wave 1 的最高约束仍是
[`2026-07-28-wave05-integration-contract.md`](../superpowers/specs/2026-07-28-wave05-integration-contract.md)。

新智能体应先读取仓库根目录的 `AGENTS.md`。GitHub 默认 `main` 已放置跳转说明，
普通克隆后会引导切换到活动分支。

新设备只需克隆 Git 仓库并切换到活动分支即可恢复代码、剧情、契约、索引和已提交美术。
`node_modules/`、`dist/`、日志、测试结果、浏览器本地存档和小说原文不在 Git 中。
