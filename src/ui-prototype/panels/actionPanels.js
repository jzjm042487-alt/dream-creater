import { getReachableCells } from "../../game/rules/battleRules.js";
import {
  CHIBI_BASE,
  DIALOGUE_CHOICES,
  TOWN_INTERACTABLES,
  findNearbyTownTarget,
} from "../mockState.js";
import {
  icon,
  iconButton,
  meter,
  panelHeader,
  statusBadge,
} from "../components.js";

const TOWN_ACTION_STATES = {
  idle: { label: "待机", icon: "circle-dot", tone: "neutral" },
  run: { label: "奔跑", icon: "footprints", tone: "good" },
  blocked: { label: "受阻", icon: "triangle-alert", tone: "danger" },
  interact: { label: "互动", icon: "hand", tone: "warning" },
  steal: { label: "偷盗", icon: "hand", tone: "warning" },
  inspect: { label: "调查", icon: "search", tone: "good" },
};

const TOWN_EMOTION_STATES = {
  calm: { label: "平静", icon: "sparkles", tone: "good" },
  focused: { label: "专注", icon: "scan", tone: "warning" },
  alert: { label: "警觉", icon: "eye", tone: "warning" },
  cautious: { label: "戒备", icon: "shield", tone: "danger" },
  confident: { label: "振奋", icon: "circle-check", tone: "good" },
  tense: { label: "紧张", icon: "triangle-alert", tone: "danger" },
};

function renderTownMarker(target, nearbyTargetId) {
  const position = `--town-x: ${target.x}%; --town-y: ${target.y}%;`;
  const isNearby = nearbyTargetId === target.id;

  if (target.kind === "npc") {
    return `
      <div
        class="town-npc-marker ${isNearby ? "is-nearby" : ""}"
        style="${position}"
        aria-label="${target.name}"
      >
        <img src="${target.portrait}" alt="" />
        <span>${target.name}</span>
      </div>
    `;
  }

  return `
    <div
      class="town-place-marker kind-${target.kind} ${isNearby ? "is-nearby" : ""}"
      style="${position}"
      aria-label="${target.name}"
    >
      ${icon(target.icon)}
      <span>${target.name}</span>
    </div>
  `;
}

function renderTownNearbyActions(target) {
  if (!target) {
    return `
      <div class="town-nearby-actions is-empty" aria-label="附近互动">
        ${icon("scan")}
        <span><small>中央街区</small><strong>石街上暂时没有可互动目标</strong></span>
      </div>
    `;
  }

  const actions =
    target.kind === "npc"
      ? `
          <button type="button" data-action="start-dialogue" title="交谈">
            ${icon("message-square")}<span>交谈</span>
          </button>
          <button
            class="is-theft"
            type="button"
            data-action="open-theft"
            data-theft-target-id="${target.id}"
            title="偷盗"
          >
            ${icon("hand")}<span>偷盗</span>
          </button>
          <button type="button" data-action="start-combat" title="挑战">
            ${icon("swords")}<span>挑战</span>
          </button>
        `
      : target.kind === "place"
        ? `
            <button
              class="is-primary"
              type="button"
              data-action="town-enter"
              data-town-target-id="${target.id}"
              title="进入${target.name}"
            >
              ${icon("door-open")}<span>进入</span>
            </button>
          `
        : `
            <button
              class="is-primary"
              type="button"
              data-action="town-examine"
              data-town-target-id="${target.id}"
              title="调查${target.name}"
            >
              ${icon("search")}<span>调查</span>
            </button>
          `;

  return `
    <div class="town-nearby-actions" aria-label="附近互动">
      <div class="town-nearby-copy">
        <small>${icon(target.kind === "npc" ? "user-round" : target.icon)} ${
          target.kind === "npc" ? "附近人物" : target.kind === "place" ? "建筑入口" : "附近物件"
        }</small>
        <strong>${target.name}</strong>
      </div>
      ${actions}
    </div>
  `;
}

function renderTownMovement(state) {
  const position = state.ui.townPosition ?? { x: 44, y: 56 };
  const nearbyTarget = findNearbyTownTarget(position);
  const actionState =
    TOWN_ACTION_STATES[state.ui.townAction] ?? TOWN_ACTION_STATES.idle;
  const emotionState =
    TOWN_EMOTION_STATES[state.ui.townEmotion] ??
    (nearbyTarget?.kind === "npc"
      ? TOWN_EMOTION_STATES.alert
      : TOWN_EMOTION_STATES.calm);

  return `
    <article class="panel-page town-movement-page" data-testid="panel-UI12">
      ${panelHeader({
        id: "UI12",
        eyebrow: "局部场景 / 古月山寨",
        title: "山寨街区",
        summary: "酉时将近，学堂、酒楼与弟子住处之间仍有人来往，方源正穿过中央石街。",
        tools: `
          ${iconButton("locate-fixed", "回到中央街区", "reset-town-position")}
          ${iconButton("door-open", "前往山寨外道", "leave-town")}
        `,
      })}
      <section
        class="town-free-move-scene panel-scroll"
        data-town-x="${position.x}"
        data-town-y="${position.y}"
      >
        <img
          class="town-scene-background"
          src="/assets/game/environments/village.png"
          alt="古月山寨街区"
        />
        <div class="town-scene-shade"></div>
        <div class="town-scene-copy">
          <span>${icon("map-pin")} 古月山寨</span>
          <strong>中央街区</strong>
          <small>第 ${state.world.day} 日 · ${state.world.time}</small>
          <div class="town-player-state-hud">
            <span class="tone-${actionState.tone}" data-town-action>
              ${icon(actionState.icon)}
              <i>动作</i>
              <b>${actionState.label}</b>
            </span>
            <span class="tone-${emotionState.tone}" data-town-emotion>
              ${icon(emotionState.icon)}
              <i>心境</i>
              <b>${emotionState.label}</b>
            </span>
          </div>
        </div>

        ${TOWN_INTERACTABLES.map((target) =>
          renderTownMarker(target, nearbyTarget?.id)
        ).join("")}

        <div
          class="town-player-marker ${state.ui.townMoving ? "is-moving" : ""} ${
            state.ui.townBlocked ? "is-blocked" : ""
          } is-facing-${state.ui.townFacing ?? "up"}"
          style="
            --town-x: ${position.x}%;
            --town-y: ${position.y}%;
          "
        >
          <div class="town-player-sprite">
            <img class="town-player-idle-frame" src="${state.player.portrait}" alt="${state.player.name}" />
            <div class="town-player-run-sheet" aria-hidden="true"></div>
          </div>
          <span>${state.player.name}</span>
        </div>

        ${renderTownNearbyActions(nearbyTarget)}

        <div class="town-control-cluster">
          <div class="town-move-pad" role="group" aria-label="移动角色">
            <button
              class="move-up"
              type="button"
              data-action="town-move"
              data-direction-id="up"
              aria-label="向上移动"
              title="向上移动"
            >${icon("chevron-up")}</button>
            <button
              class="move-left"
              type="button"
              data-action="town-move"
              data-direction-id="left"
              aria-label="向左移动"
              title="向左移动"
            >${icon("chevron-left")}</button>
            <button
              class="move-interact"
              type="button"
              data-action="town-interact"
              aria-label="与附近目标互动"
              title="互动"
              ${nearbyTarget ? "" : "disabled"}
            >${icon("hand")}</button>
            <button
              class="move-right"
              type="button"
              data-action="town-move"
              data-direction-id="right"
              aria-label="向右移动"
              title="向右移动"
            >${icon("chevron-right")}</button>
            <button
              class="move-down"
              type="button"
              data-action="town-move"
              data-direction-id="down"
              aria-label="向下移动"
              title="向下移动"
            >${icon("chevron-down")}</button>
          </div>
        </div>
      </section>
    </article>
  `;
}

function renderDialogue(state) {
  return `
    <article class="panel-page classic-dialogue-page" data-testid="panel-UI11">
      ${panelHeader({
        id: "UI11",
        eyebrow: "角色立绘 / 对话 / 选项",
        title: "花酒行者洞口",
        summary: "对话只展示场景、说话角色和当前可做的选择，选择后立即推进。",
        tools: `
          ${iconButton("history", "查看对话记录", "show-dialogue-history")}
          ${iconButton("volume-2", "切换语音", "toggle-voice")}
        `,
      })}
      <div class="classic-dialogue-scene panel-scroll">
        <img
          class="classic-dialogue-background"
          src="/assets/game/environments/forest-battle.png"
          alt=""
        />
        <div class="classic-scene-shade"></div>
        <div class="classic-speaker">
          <img src="${CHIBI_BASE}/chibi_fang_yuan.png" alt="古月方源" />
        </div>
        <div class="classic-dialogue-box">
          <div class="classic-speaker-name">
            <span>古月旁支</span>
            <strong>古月方源</strong>
          </div>
          <p>${state.ui.dialogueLine}</p>
          <small>他的目光从酒坛移到你的袖口，没有停留太久。</small>
        </div>
        <div class="classic-choice-list" aria-label="对话选项">
          ${DIALOGUE_CHOICES.map(
            (choice, index) => `
              <button
                type="button"
                data-action="select-dialogue-choice"
                data-choice-id="${choice.id}"
                class="${state.ui.activeDialogueChoice === choice.id ? "is-selected" : ""}"
              >
                <span>${index + 1}</span>
                <strong>${choice.label}</strong>
                ${icon("chevron-right")}
              </button>
            `
          ).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderBattleCell(state, x, y, reachable) {
  const battle = state.combat;
  const isPlayer = battle.player.x === x && battle.player.y === y;
  const isEnemy = battle.enemy.x === x && battle.enemy.y === y;
  const isReachable = reachable.has(`${x},${y}`) && !isPlayer;
  const selectedAction = state.ui.battleAction;
  const distance = Math.abs(battle.player.x - x) + Math.abs(battle.player.y - y);
  const targetable =
    isEnemy &&
    ((selectedAction === "ATTACK" && distance <= 1) ||
      (selectedAction === "STEAL_ESSENCE" && distance <= 2));
  const cellAction = isEnemy ? "battle-target" : isReachable ? "battle-move" : "";

  return `
    <button
      type="button"
      class="battle-cell ${isReachable ? "is-reachable" : ""} ${targetable ? "is-targetable" : ""}"
      data-x="${x}"
      data-y="${y}"
      ${cellAction ? `data-action="${cellAction}"` : "disabled"}
      aria-label="${
        isPlayer
          ? `古月砚所在格 ${x + 1},${y + 1}`
          : isEnemy
            ? `古月方源所在格 ${x + 1},${y + 1}`
            : isReachable
              ? `移动到 ${x + 1},${y + 1}`
              : `地面 ${x + 1},${y + 1}`
      }"
    >
      <span class="battle-tile"></span>
      ${
        isPlayer
          ? `
            <span class="battle-piece player-piece">
              <span class="piece-health"><i style="width: ${(battle.player.hp / battle.player.maxHp) * 100}%"></i></span>
              <img src="${CHIBI_BASE}/chibi_player.png" alt="古月砚" />
              <strong>砚</strong>
            </span>
          `
          : ""
      }
      ${
        isEnemy
          ? `
            <span class="battle-piece enemy-piece">
              <span class="piece-health"><i style="width: ${(battle.enemy.hp / battle.enemy.maxHp) * 100}%"></i></span>
              <img src="${CHIBI_BASE}/chibi_fang_yuan.png" alt="古月方源" />
              <strong>源</strong>
            </span>
          `
          : ""
      }
    </button>
  `;
}

function renderCombat(state) {
  const battle = state.combat;
  const reachable = new Set(
    state.ui.battleMoved
      ? []
      : getReachableCells(battle).map(({ x, y }) => `${x},${y}`)
  );
  const selectedAction = state.ui.battleAction;
  const resultCopy = {
    victory: ["胜利", "古月方源倒下，战斗经验与修为已经结算。", "good"],
    defeat: ["战败", "你失去行动能力，本场战斗结束。", "danger"],
    escaped: ["已撤离", "你从棋盘边缘脱离了战斗。", "warning"],
  }[battle.result];

  return `
    <article class="panel-page grid-combat-page" data-testid="panel-UI13">
      ${panelHeader({
        id: "UI13",
        eyebrow: "8 × 6 棋盘 / 移动后攻击",
        title: "洞口遭遇战",
        summary: "点击亮起的格子移动，进入攻击距离后选择普攻或蛊术，再点击目标。",
        tools: `
          ${iconButton("rotate-ccw", "重新开始战斗", "reset-battle")}
          ${iconButton("scroll-text", "查看战斗记录", "show-combat-log")}
        `,
      })}
      <div class="grid-combat-layout panel-scroll">
        <section class="battle-board-shell section-block">
          <div class="battle-turn-line">
            <span>${icon("swords")} ${battle.result ? "战斗结束" : "你的回合"}</span>
            <small>${battle.width} × ${battle.height} · 先移动，再出招</small>
          </div>
          <div class="battle-board" role="grid" aria-label="八乘六战斗棋盘">
            ${Array.from({ length: battle.height }, (_, y) =>
              Array.from({ length: battle.width }, (_, x) =>
                renderBattleCell(state, x, y, reachable)
              ).join("")
            ).join("")}
          </div>
          <div class="battle-board-legend">
            <span><i class="legend-reachable"></i>可移动</span>
            <span><i class="legend-target"></i>可攻击</span>
            <span>${icon("door-open")} 走到边缘可撤离</span>
          </div>
        </section>

        <section class="battle-command-panel section-block">
          <div class="section-title">
            <span>${icon("crosshair")} 行动</span>
            ${statusBadge(
              selectedAction
                ? selectedAction === "ATTACK"
                  ? "等待选择目标"
                  : "蛊术已选择"
                : "等待指令",
              selectedAction ? "warning" : "neutral"
            )}
          </div>
          <div class="combat-resources">
            ${meter({
              label: "生命",
              value: battle.player.hp,
              max: battle.player.maxHp,
              tone: "cinnabar",
              compact: true,
            })}
            ${meter({
              label: "青铜真元",
              value: battle.player.essence,
              max: battle.player.maxEssence,
              tone: "jade",
              compact: true,
            })}
          </div>
          <div class="grid-combat-actions">
            <button
              type="button"
              data-action="battle-select-action"
              data-battle-action-id="ATTACK"
              class="${selectedAction === "ATTACK" ? "is-selected" : ""}"
              ${battle.result ? "disabled" : ""}
            >
              ${icon("sword")}<span><strong>近身攻击</strong><small>相邻 1 格 · 8 伤害</small></span>
            </button>
            <button
              type="button"
              data-action="battle-select-action"
              data-battle-action-id="STEAL_ESSENCE"
              class="${selectedAction === "STEAL_ESSENCE" ? "is-selected" : ""}"
              ${battle.result || battle.player.essence < 4 ? "disabled" : ""}
            >
              ${icon("sparkles")}<span><strong>盗元蛊术</strong><small>距离 2 格 · 消耗 4 真元</small></span>
            </button>
            <button type="button" data-action="battle-defend" ${battle.result ? "disabled" : ""}>
              ${icon("shield")}<span><strong>防御</strong><small>减半下一次受伤</small></span>
            </button>
            <button
              type="button"
              data-action="battle-escape"
              ${battle.result || !(
                battle.player.x === 0 ||
                battle.player.y === 0 ||
                battle.player.x === battle.width - 1 ||
                battle.player.y === battle.height - 1
              ) ? "disabled" : ""}
            >
              ${icon("log-out")}<span><strong>撤离</strong><small>仅棋盘边缘可用</small></span>
            </button>
          </div>
          <div class="battle-instruction">
            ${icon(selectedAction ? "mouse-pointer-click" : "move")}
            <p>${
              selectedAction
                ? "现在点击棋盘上的敌人。若距离不够，先点击亮起格子靠近。"
                : state.ui.battleMoved
                  ? "本回合移动完成，选择攻击、蛊术或防御。"
                  : "绿色格子是本回合可达范围。移动不会结束你的回合。"
            }</p>
          </div>
        </section>

        <aside class="battle-status-panel section-block">
          <div class="section-title">
            <span>${icon("users")} 参战者</span>
            <small>1 对 1</small>
          </div>
          <div class="combatant-summary player-summary">
            <img src="${CHIBI_BASE}/chibi_player.png" alt="" />
            <span><strong>${state.player.name}</strong><small>${state.player.rank}</small></span>
            <b>${battle.player.hp}/${battle.player.maxHp}</b>
          </div>
          <div class="combatant-summary enemy-summary">
            <img src="${CHIBI_BASE}/chibi_fang_yuan.png" alt="" />
            <span><strong>古月方源</strong><small>一转初阶</small></span>
            <b>${battle.enemy.hp}/${battle.enemy.maxHp}</b>
          </div>
          <div class="battle-win-rule">
            ${icon("skull")}
            <p>生命归零即死亡。方源没有额外保护，玩家也可以从边缘撤离。</p>
          </div>
          ${
            resultCopy
              ? `
                <div class="battle-result tone-${resultCopy[2]}">
                  ${icon(resultCopy[2] === "good" ? "trophy" : resultCopy[2] === "danger" ? "skull" : "door-open")}
                  <span><strong>${resultCopy[0]}</strong><small>${resultCopy[1]}</small></span>
                </div>
              `
              : ""
          }
        </aside>
      </div>
    </article>
  `;
}

export function renderActionPanel(panelId, state) {
  switch (panelId) {
    case "UI11":
      return renderDialogue(state);
    case "UI12":
      return renderTownMovement(state);
    case "UI13":
      return renderCombat(state);
    default:
      return "";
  }
}
