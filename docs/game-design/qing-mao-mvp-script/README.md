# 青茅山 MVP 状态对话生产剧本

本目录是青茅山 Demo 的叙事生产包。它以
`docs/superpowers/specs/2026-07-27-qing-mao-mvp-stateful-dialogue-script-design.md`
为设计依据，负责主线、支线、NPC 状态对话、场景交互与日期推进内容。

## 权威边界

1. 本目录与状态对话设计文档负责叙事记录、触发条件和剧情结果。
2. `2026-07-27-qing-mao-simplified-mvp-design.md` 负责系统排除项、主线不断档和 Demo 范围。
3. `contracts/` 负责运行时 ID、JSON 结构与跨模块接口。
4. Markdown 中的条件是编剧标记；进入运行时前必须转换为结构化谓词和动作，禁止直接执行或 `eval` 文本表达式。

发生冲突时，有状态剧本决定“故事如何发生”，简化版设计决定“哪些全局系统不进入 Demo”。二者共同遵守以下产品约束：

- 主线始终保留至少一条合法推进路线，不依赖方源存活、友善或合作。
- 支线可以过期、失败、被拒绝或被其他人物解决，但必须留下可理解的世界反馈。
- 允许地点、日期、物品、知识、世界状态和 NPC 状态条件。
- 不使用数值好感、信任、怀疑、全局方源警觉或世界纠偏值作为门槛。
- 方源是普通 NPC 与竞争者，其警觉和反制通过人物状态、对话与事件表现。
- 偷盗只进行一次判定；可产生即时资源代价和关系状态变化，不建立长期追踪或赃物溯源链。
- 锁定选项应显示本地化原因；每次交互至少提供一个可执行的继续或退出选项。

## 文件清单

| 文件 | 内容 |
| --- | --- |
| `00-production-overview.md` | 生产范围、记录格式、变量与交付约定 |
| `01-main-quest.md` | D00-D30 主线记录 |
| `02-side-quest-q01.md` | Q01 支线记录 |
| `03-side-quest-q02.md` | Q02 支线记录 |
| `04-side-quest-q03.md` | Q03 支线记录 |
| `05-side-quest-q04.md` | Q04 支线记录 |
| `06-side-quest-q05.md` | Q05 支线记录 |
| `07-npc-state-dialogue.md` | NPC 状态、关系和世界反馈对话 |
| `08-schedules-states-rewards.md` | 日程、状态、奖励与回收规则 |

## 记录类型

- `dialogue`：带说话者和选项的对话。
- `interaction`：调查、拾取、偷盗、机关等场景交互。
- `bark`：短句反馈，不进入完整对话流程。

每条记录使用以下头字段：

```text
type
id
owner
location
available_from
expires_after
priority
topic
requires
excludes
once
on_expire
```

字段可以省略不适用项，但 `type`、`id`、`owner`、`location` 和 `priority` 必须存在。`id` 在整个生产包内唯一。

## 优先级

| 优先级 | 用途 |
| --- | --- |
| `critical` | 当前主线唯一推进记录 |
| `main` | 主线推进、关键分歧和主线补偿 |
| `side` | 可过期支线与角色机会 |
| `ambient` | 世界反馈、闲谈和重复短句 |

同一对象同时满足多条记录时，优先显示高优先级记录；同优先级按更具体的条件优先，再按文件顺序稳定选择。

## 日期与不断档

- 日期只开放或关闭记录，不自动播放剧情。
- 推进日期前应结算当日到期内容并写入结果状态。
- 主线关键机会错过后必须生成补偿路径，不能要求读档。
- 只有 D30 的紧急离寨属于强制世界结算；它仍需给玩家一个可执行的离场选择。

## 验证

```powershell
node --test tests/qingMaoDialogueScript.test.js
```
