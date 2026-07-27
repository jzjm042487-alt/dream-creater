# 青茅山 MVP 状态对话生产剧本

版本：`2.0`

本目录是可直接转录为任务数据的生产剧本。玩家是唯一主角；剧情不会按日自动播放，也没有镜头、
动作或旁白。玩家在地图上找到满足条件的角色或物件，完成一次对话或交互，写入状态，再于后续
交互中触发新的内容。

设计依据：
[`2026-07-27-qing-mao-mvp-stateful-dialogue-script-design.md`](../../superpowers/specs/2026-07-27-qing-mao-mvp-stateful-dialogue-script-design.md)

## 文件

| 文件 | 职责 |
| --- | --- |
| `00-quest-overview.md` | 主线、五条支线、系统流程与完整走查 |
| `01-main-quest.md` | 创建角色、身份、开窍、学堂、商队、狼潮与离山 |
| `02-q01-wine-worm.md` | Q01《月下酒虫》 |
| `03-q02-flower-wine-inheritance.md` | Q02《花酒遗藏》 |
| `04-q03-jia-jin-sheng-case.md` | Q03《贾金生遗案》 |
| `05-q04-nine-leaf-vitality-grass.md` | Q04《九叶生机草》 |
| `06-q05-qing-shu-fate.md` | Q05《青书的死局》 |
| `07-npc-state-dialogue.md` | 结算后与日常状态对白 |
| `08-schedules-states-rewards.md` | 状态字典、时间表、奖励与唯一物品归属 |

旧版按日期连续播放的六个剧本文件仅在重写期间保留作素材，完成迁移后删除。

## 记录类型

- `dialogue`：NPC 开场，一轮 2–4 个玩家口头选择，每项独立回应并结束。
- `interaction`：物件提示，一轮若干地图操作，每项写明事实结果并结束。
- `bark`：NPC 对当前已知状态的一句回应，不推进新任务。

所有记录必须具有：

```text
类型 / ID / 所属 / 拥有者 / 地点
available_from / expires_after / priority / topic
requires / excludes / once / on_expire
```

没有内容的字段写 `none`。普通选择的 `[判定]` 写 `none`；需要判定时必须分别写 `[成功]` 与
`[失败]`，两条结果各自包含回应、写入和 `END`。一次对话结束后才允许触发后续记录。

## 优先级

| 值 | 用途 |
| ---: | --- |
| 100 | 永久离山与不可逆世界状态 |
| 80 | 当前任务关键决定 |
| 70 | 成功、失败、拒绝与错过结算 |
| 60 | 新任务与推进节点 |
| 30 | 状态回应 |
| 10 | 普通日常回应 |

日期只开放或关闭记录，不自动播放对白。`expires_after` 包含所写时段。第 30 日晚结束仍未主动
离山时，系统直接结算紧急流亡；这是唯一不由地图交互启动的剧情推进。

## 验证

```powershell
node --test tests/qingMaoDialogueScript.test.js
```

本轮只交付生产剧本和静态内容校验；运行时任务解析器、战斗、地图、存档和 UI 接入另行实现。
