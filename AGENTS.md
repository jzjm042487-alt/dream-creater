# 默认分支跳转规则

如果当前分支是 `main`，停止开发。该分支仅保留旧基线和换机跳转说明。

```powershell
git fetch --all --tags
git switch integration/wave05-qingmao
```

切换后读取活动分支根目录的 `AGENTS.md` 并遵循其中的权威文件、禁止事项、
验证门禁和后续任务顺序。不要在 `main` 上提交游戏功能，也不要从
`codex/tactical-combat-wave1` 整分支覆盖活动基线。
