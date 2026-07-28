# 2026-07-28 换设备迁移手册

## 1. 旧设备收尾状态

本次审核已经完成：

- 所有 worktree 均无未提交的跟踪文件。
- stash 为空。
- `integration/wave05-qingmao` 已跟踪远端。
- 原本未推送的 `codex/tactical-combat-wave1` 15 个提交已经推送。
- 本机 `.superpowers/` 中仍有价值的设计可视稿已迁入 `docs/archive/brainstorming/`。
- 阶段截图已迁入 `docs/handoff/captures/`。
- `.env`、私钥、凭据文件均不存在于项目目录。
- `node_modules/`、`dist/`、日志和测试结果继续保持忽略。

换设备前可选执行两件事：

1. 需要保留本地试玩进度时，导出浏览器 localStorage。
2. 以后要重新抽取原著索引时，单独备份原著输入文本。

## 2. 新设备环境

已验证环境：

- Git `2.52.0.windows.1`
- Node.js `24.11.1`
- npm `11.6.2`
- Playwright `1.62.0`
- Vite `8.1.5`

项目依赖要求 Node.js `^20.19.0` 或 `>=22.12.0`。推荐新设备继续使用 Node 24 LTS
兼容版本和 npm 11。还需要 Google Chrome，因为 Playwright 配置使用 `channel: "chrome"`。

## 3. 克隆与恢复

```powershell
git clone https://github.com/jzjm042487-alt/dream-creater.git
cd dream-creater
git fetch --all --tags
git switch integration/wave05-qingmao
git status --short --branch
npm ci
npx playwright install chrome
```

预期：

- 当前分支跟踪 `origin/integration/wave05-qingmao`。
- 工作区没有修改。
- `npm ci` 完全依据已提交的 `package-lock.json` 安装。

不要复制旧设备的 `node_modules/` 或 `dist/`。本次归档后仓库 Git 数据约 130 MiB，
安装依赖约 230 MiB，生产构建约 50 MiB；建议至少预留 1 GiB 空间。

## 4. 完整验证

```powershell
node scripts/validate-contracts.mjs
node scripts/validate-content.mjs
node scripts/validate-canon.mjs
npm test
npm run build
npm run test:e2e
```

Wave 0.5 审核基准：

- 合同校验：26 个 JSON、9 个内容文件。
- 内容校验：9 个文件。
- 原著校验：1915 个章节定位、88 个已核验蛊名、2 个精选文件。
- 测试：92 项，其中 90 通过、2 项为明确的 NPC 动作图待办。
- 端到端：17 项通过。
- 构建：通过，允许现存的 chunk 大小警告。

启动试玩：

```powershell
npm run dev -- --port 4173 --strictPort
```

- 主游戏：`http://127.0.0.1:4173/`
- UI 原型：`http://127.0.0.1:4173/ui.html`

## 5. 浏览器存档

Git 不保存浏览器 localStorage。当前两个键是：

- `tianwai-daojuren-save-v2`
- `tianwai-mvp-save`

旧设备浏览器开发者工具中执行：

```javascript
JSON.stringify(Object.fromEntries(
  ["tianwai-daojuren-save-v2", "tianwai-mvp-save"]
    .map((key) => [key, localStorage.getItem(key)])
))
```

把输出作为私人迁移文本保存，不要提交到 Git。新设备在同一站点开发者工具中执行：

```javascript
const saves = JSON.parse("替换为转义后的迁移文本");
for (const [key, value] of Object.entries(saves)) {
  if (value !== null) localStorage.setItem(key, value);
}
location.reload();
```

## 6. 原著输入文件

仓库已提交全部运行时索引，因此普通开发、构建和验证不需要小说原文。
只有重新运行 `scripts/extract-canon.mjs` 时需要外部输入。

已使用输入的指纹：

| 字段 | 值 |
| --- | --- |
| 文件名 | `蛊真人.txt` |
| 字节数 | `13,304,057` |
| 编码 | `gbk` |
| SHA-256 | `e48d91ad4d7b62fb60986050e735ffe634bc552d797945114d7e46034202708e` |
| 状态 | 不完整原文，缺失范围见 source manifest |

该文件不应提交到 GitHub。若你仍持有它，应通过私人存储单独转移，并在新设备校验 SHA-256：

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath 'C:\private\蛊真人.txt'
```

提取命令见 `systems/canon/README.md`。

## 7. 接续战斗分支

查看战斗分支而不污染活动基线：

```powershell
git fetch origin
git switch --create codex/tactical-combat-wave1 --track origin/codex/tactical-combat-wave1
npm ci
npm test
npm run validate:battle
npm run build
npm run test:e2e
```

若本地已经存在该分支，使用 `git switch codex/tactical-combat-wave1`。
不要从该分支继续编写剧情或偷盗系统。集成战斗时从活动基线另建分支，并参照项目盘点中的
分批移植顺序。

## 8. 不由 Git 迁移的内容

- GitHub、Codex 和其他服务的登录凭据。
- 本地 Codex task/worktree 元数据。
- 浏览器 localStorage。
- 小说原文。
- `node_modules/`、`dist/`、Playwright 测试结果和开发日志。
- `.superpowers/` 会话服务状态；其中有价值的可视稿已经归档。

完成迁移后，以 `git status --short --branch` 无修改、全套验证通过作为恢复成功标准。
