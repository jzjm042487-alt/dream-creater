# 《蛊真人：天外盗剧本》成年角色三态立绘与 UI 规范

版本：`1.0-simplified`

状态：青茅山精简 MVP 活动规格。

## 1. 文档目的
本规范定义成年角色在对话、角色查看和地图交互结果中的三态立绘表现，只解决三件事：

1. 正确复用已生产的成年角色立绘。
2. 用直接标签切换正常、外衣失窃和贴身物品失窃状态。
3. 不扩大状态模拟，同时给偷盗结果清楚、克制的即时反馈。

唯一规则源为 `docs/superpowers/specs/2026-07-27-qing-mao-simplified-mvp-design.md`。UI 接入由 `2026-07-27-qing-mao-mvp-visual-ui-action-production-design.md` 约束。发生冲突时，以唯一规则源为准。

本轮不创建、修改、重命名或移动任何图片。

## 2. 适用范围
首批继续复用五名已确认成年角色：

| 角色 ID | 角色 | 主要出现位置 |
| --- | --- | --- |
| `npc_clan_steward` | 家族成年女执事 | 内务、资源与家族事务 |
| `npc_caravan_manager` | 商队成年女管事 | 交易、商队与离山信息 |
| `npc_demonic_cultivator` | 成年魔道女蛊师 | 传承、禁忌情报与战斗 |
| `npc_medicine_physician` | 成年药堂女医师 | 治疗、药堂与蛊虫反噬 |
| `npc_tavern_keeper` | 成年酒馆老板娘 | 酒肆、流言与情报 |

进入三态系统的角色必须满足：

- 设定年龄不低于 18 岁。
- 数据中存在 `isAdult: true`。
- 三态资源已存在于资产清单。
- 内容节点明确指定表现标签。

未成年角色不得配置贴身物品偷盗条目，也不得进入本规范的失窃三态。普通路人和没有三态资源的角色只使用正常立绘或既有头像。

## 3. 已删除的复杂状态
以下旧设计不再运行：

- 六维情绪数值、强度阈值、主导情绪排序和解析公式。
- 信任、怀疑、嫌疑人、警觉值和关系门槛。
- 失窃事件记录、发现阶段、证据、追查、反击任务和归还流程。
- 原主人、所有权、非法持有和物品洗白。
- 安抚、谈判、调查和事后处理按钮。
- 每日情绪衰减、重复结算标记和长期负面状态。

旧数据与旧资源可以保留，但活动 MVP 不读取、显示或更新这些字段。

## 4. 核心原则
### 4.1 直接反馈
内容节点直接指定立绘，不由数值推导。运行时只读取：

- 一个 `portraitTag`。
- 零个或一个 `emotionTag`。
- 零个或一个表现型 Debuff。

不存在隐藏的第二套解析规则。

### 4.2 一眼区分
隐藏文字和图标后，测试者仍应区分正常、外衣失窃和贴身物品失窃。状态变化不能只靠红叉、标题或颜色表达。

### 4.3 身份一致
同一角色三态必须保持面部结构、年龄感、体型、镜头距离、发型主体、职业主色、代表性道具、画面尺寸、缩放和眼睛高度。

### 4.4 克制表达
- 不展示裸体或具体贴身衣物。
- 不使用透明衣料。
- 不强调身体部位。
- 不使用窥视镜头或暗示性姿势。
- 所有状态保持完整不透明遮蔽。

## 5. 三个直接表现标签
允许的 `portraitTag` 只有：

```text
portrait_normal
portrait_outerwear_missing
portrait_close_worn_missing
```

没有标签时默认 `portrait_normal`，内容不得创建第四个服装状态。

### 5.1 `portrait_normal`
视觉要求：

- 穿着完整职业服装。
- 肩背自然，视线稳定。
- 可以持有职业识别物。
- 使用场景本身的正常光色。

适用于初次见面、日常对话、地图交互前和作者明确重置后的场景。

### 5.2 `portrait_outerwear_missing`
视觉要求：

- 正式外袍明显缺失。
- 保留完整、高领、不透明的中衣。
- 使用既有披肩、备用斗篷或收紧衣领动作维持遮蔽。
- 肩部略微内收，一只手固定披肩或领口。
- 另一只手可以握令牌、账册、药箱、酒壶或蛊虫容器。

默认可搭配 `embarrassed`、`guarded`、`angry` 或 `composed`。该状态必须调用现有完整差分图，不能临时删除原图衣层。

### 5.3 `portrait_close_worn_missing`
视觉要求：

- 外袍保持完整、闭合并系紧。
- 画面中不显示失窃物实物。
- 通过视线、肩颈、手势和身体朝向表达窘迫或防御。
- 可以握住护身物、职业道具或袖口。
- 使用克制轮廓光，不使用身体聚焦光效。

默认可搭配 `embarrassed`、`angry`、`guarded` 或 `composed`。该标签只表达“贴身物品已经被偷”，不表达具体衣物层结构。

## 6. 作者指定情绪标签
允许的 `emotionTag` 只有：

```text
neutral
embarrassed
angry
guarded
composed
```

规则：

- 同一时刻至多一个 `emotionTag`，也可以为空。
- 标签由场景或偷盗条目直接指定。
- 标签只选择既有表情、视线或色调差分。
- 标签没有数值、等级、阈值或衰减速度。
- 标签不能改变任务解锁、偷盗成功率或人物关系。

| 标签 | 视觉语义 | 禁止延伸 |
| --- | --- | --- |
| `neutral` | 中性、日常 | 不代表信任 |
| `embarrassed` | 回避视线、动作收紧 | 不生成情绪数值 |
| `angry` | 眉眼收紧、直接注视 | 不自动开战 |
| `guarded` | 侧身、手靠近防身物 | 不生成长期戒备 |
| `composed` | 控制呼吸、维持职业姿态 | 不提供检定加成 |

## 7. 角色表演差异
五名角色可以使用相同语义标签，但不能使用完全相同的姿势：

| 角色 | 正常 | 外衣失窃 | 贴身物品失窃 |
| --- | --- | --- | --- |
| 家族女执事 | 端正持账册 | 固定披肩并确认场面秩序 | 收紧外袍，握令牌维持官面克制 |
| 商队女管事 | 自信审视交易对象 | 一手固定披肩，一手核对账目 | 冷静直视，收起账册并准备应战 |
| 魔道女蛊师 | 松弛但危险 | 不后退，手靠近蛊虫容器 | 正面锁定目标，保持战斗姿态 |
| 药堂女医师 | 冷静持药箱 | 整理遮蔽，再检查自身状态 | 侧身收紧衣袖，维持专业距离 |
| 酒馆老板娘 | 热络并观察客人 | 社交笑意收起，借披肩遮蔽 | 保持外袍闭合，用目光表达压力 |

表演差异只服务当前画面，不写入行为模拟。

## 8. 偷盗成功的原子表现
服装或贴身物品偷盗成功时，按以下顺序：

1. 消耗当前地图访问内对该角色的尝试资格。
2. 从当前可偷清单移除所选物品。
3. 将物品作为普通物品加入玩家行囊。
4. 直接写入条目声明的 `portraitTag`。
5. 写入零个或一个 `emotionTag`。
6. 若条目声明表现型 Debuff，则应用该效果。
7. 在地图交互覆盖层显示成功、物品与表现变化。
8. 保存。
9. 事件结束。

第 9 步之后不创建后续处理入口。物品进入行囊后与其他普通物品使用相同表现。

### 8.1 标签覆盖
- 偷走外衣时写入 `portrait_outerwear_missing`。
- 后续偷走贴身物品时直接写入 `portrait_close_worn_missing`。
- 作者安排角色换装或获得替代品时，可以直接写回 `portrait_normal`。

新标签直接替换旧标签。不保存变更历史，也不要求找回原物才能重置。

### 8.2 持续期
`portraitLifetime` 只允许：

- `scene`：离开当前场景后读取下一场景配置。
- `untilAuthoredReset`：保持当前标签，直到内容明确覆盖。

服装或贴身物品偷盗默认使用 `untilAuthoredReset`，短暂对话表情默认使用 `scene`。

## 9. 可选表现型 Debuff
单次成功最多应用一个 `debuff_suppressed`，应用窗口只允许 `currentScene` 或 `nextBattle`。

### 9.1 `currentScene`
立即添加持续期为 `scene` 的 `debuff_suppressed`，离开当前地图、对话或战斗后自动清除。

### 9.2 `nextBattle`
写入一个 `pendingBattleDebuff`：

- 只记录 Debuff ID 与应用窗口。
- 目标下次进入战斗时立即消费。
- 在该场战斗内作为 `scene` 状态生效。
- 战斗结束后清除。

同一角色最多一个待生效 Debuff。再次获得相同效果时刷新，不叠加数值。该效果只改变已声明的战斗数值，不生成剧情分支。

## 10. 地图 Q 版
地图 Q 版永远不随 `portraitTag`、`emotionTag`、`debuff_suppressed` 或偷盗结果换图。

资源键只由角色 ID 决定：

```text
chibi_<character_id>.png
```

文件名不得追加 `normal`、`outerwear_missing`、`close_worn_missing` 或情绪名。

地图 NPC 始终使用完整正常着装和中性待机外观。移动只允许整体平移、水平翻转和轻微待机起伏。

## 11. UI 接入
### 11.1 对话
对话节点读取当前 `portraitTag` 与 `emotionTag`。台词框只显示角色名和台词，不显示状态计算过程。标签变化可以在下一句对白前淡入。

### 11.2 地图交互结果
偷盗成功时，覆盖层可以显示获得物品图标、一句成功文本、更新后的当前立绘，以及 Debuff 名称与持续窗口。关闭后返回地图，事件结束。

### 11.3 角色资料
角色资料只显示当前立绘与公开人物资料，不显示失窃记录、衣物槽位、嫌疑对象或后续操作。

## 12. 最小数据契约
角色活动表现最少包含：

```json
{
  "characterId": "npc_clan_steward",
  "isAdult": true,
  "presentation": {
    "portraitTag": "portrait_outerwear_missing",
    "emotionTag": "guarded",
    "portraitLifetime": "untilAuthoredReset"
  },
  "pendingBattleDebuff": {
    "debuffId": "debuff_suppressed",
    "applyOn": "nextBattle"
  }
}
```

字段规则：

- `emotionTag` 与 `pendingBattleDebuff` 可以为 `null`。
- `portraitTag` 不从其他字段计算。
- 读档直接恢复已保存标签。
- 载入不得重新触发物品奖励或 Debuff 应用。

内容事件增量最少包含：

```json
{
  "targetCharacterId": "npc_clan_steward",
  "portraitTag": "portrait_outerwear_missing",
  "emotionTag": "guarded",
  "portraitLifetime": "untilAuthoredReset",
  "debuffId": "debuff_suppressed",
  "debuffWindow": "nextBattle"
}
```

不需要 Debuff 时省略最后两个字段。

## 13. 现有资产映射
| 语义标签 | 既有文件主干 |
| --- | --- |
| `portrait_normal` | `portrait_<character_id>_normal.png` |
| `portrait_outerwear_missing` | `portrait_<character_id>_outerwear_missing.png` |
| `portrait_close_worn_missing` | `portrait_<character_id>_privacy_layer_missing.png` |

第三项只保留旧文件名兼容。运行时、内容和 UI 一律使用 `portrait_close_worn_missing` 语义，不把旧文件名当成状态字段。

资产根目录：

```text
docs/game-design/assets/character-state-ui/portraits/
```

参考与审校资源：

```text
docs/game-design/assets/character-state-ui-reference-v2.png
docs/game-design/assets/character-state-ui/reviews/
```

参考图只用于确认身份、姿态与遮蔽，不作为运行时布局或数据结构。旧数值情绪图标和共享阈值效果不在活动 MVP 加载，文件保持不变。

## 14. 图片技术规格
- 画布为 `1024 x 1536`，透明 RGBA。
- 运行时直接使用现有 PNG。
- 三态保持相同角色缩放和眼睛高度。
- 头部纵向偏差不得超过画面高度的 `5%`。
- 主体位于横向 `8%..92%`、纵向 `4%..100%`。
- 面部位于横向 `20%..80%`、纵向 `8%..38%`。
- 手势与代表性道具位于横向 `5%..95%`、纵向 `12%..96%`。
- 立绘不包含台词、按钮、状态文字或背景。

本轮禁止补画新差分、修改现有身体或衣物、重命名图片，或把审校拼图当运行时立绘。

## 15. 异常与降级
### 15.1 非成年角色
若 `isAdult` 不为 `true`，拒绝贴身物品偷盗条目，忽略失窃表现标签并记录内容校验错误。

### 15.2 资源缺失
若状态图片不存在，使用既有中性剪影占位并在开发环境显示缺失路径。不得错误回退到正常立绘，正式构建必须报告错误。

### 15.3 非法标签
未知 `portraitTag` 或 `emotionTag` 必须校验失败。运行时不得临时拼接文件名或创建新状态。

### 15.4 存读档
保存保留当前表现标签与一个可选的下场战斗 Debuff。读取后立绘与保存前一致，物品不重复进入行囊，已消费 Debuff 不重新出现，地图 Q 版仍使用固定资源。

## 16. 验收
### 16.1 视觉
- 隐藏文字后仍能区分三态。
- 三态可以立即认出是同一角色。
- 外衣失窃保持完整不透明中衣或披肩遮蔽。
- 贴身物品失窃保持完整闭合外袍。
- 没有裸体、透明衣料、具体贴身衣物或暗示性镜头。
- 五名角色的姿态符合各自职业。

### 16.2 UI
- 对话同一时刻只显示一张主立绘。
- 偷盗成功立即切换 `portraitTag`。
- 同一时刻至多一个 `emotionTag`。
- 结果覆盖层关闭后直接返回地图。
- 1366 x 768 下立绘、台词和按钮不重叠。
- 地图 Q 版在三态切换前后资源完全相同。

### 16.3 数据
- 活动数据没有六维情绪或解析公式。
- 偷盗成功后物品直接进入普通行囊。
- 表现切换不依赖衣物槽位或事件记录。
- 一次成功最多应用一个表现型 Debuff。
- `nextBattle` 效果只消费一次。
- 读档不重复奖励或重播成功结算。

## 17. MVP 不包含
- Live2D、骨骼动画或逐数值表情插值。
- 普通路人三态。
- 超过三个服装表现标签。
- 具体贴身物品插画。
- 地图 Q 版服装或情绪差分。
- 偷盗成功后的持续处置玩法。
- 通过情绪或服装状态解锁任务。
