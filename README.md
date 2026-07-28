# 天外盗剧本 Demo

本仓库正在从 Wave 0 的玩法验证进入 Wave 0.5 集成基线。最高层边界见
`docs/superpowers/specs/2026-07-28-wave05-integration-contract.md`。

## 活动入口

| 入口 | 角色 | 活动源码 |
| --- | --- | --- |
| `/` | Phaser 可行走酒虫纵向切片 | `src/main.js`、`src/game/` |
| `/ui.html` | 完整 UI、山寨行走和方向旅行交互原型 | `src/ui-prototype/` |

两套入口共享精简系统决策。新增剧情数据必须先通过 `contracts/` 注册，不得直接在场景组件中
增加第二套任务、偷盗或方源警觉规则。

## 历史代码

`src/app.js`、`src/gameState.js` 和 `src/content.js` 是最早的 Wave 0 文本验证器，
不参与 Vite 的两个活动入口。`tests/gameState.test.js` 只保留其回归价值；Wave 1 不在这些文件上
继续开发。

## 验证

```powershell
node scripts/validate-contracts.mjs
node scripts/validate-content.mjs
node scripts/validate-canon.mjs
npm test
npm run build
npm run test:e2e
```
