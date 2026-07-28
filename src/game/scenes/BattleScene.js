import Phaser from "phaser";
import { getPlayerPlans } from "../rules/battleRules.js";

const CELL_SIZE = 72;
const GRID_X = 352;
const GRID_Y = 104;
const DIFFICULTY_LABELS = Object.freeze({
  ai_difficulty_beginner: "入门",
  ai_difficulty_standard: "标准",
  ai_difficulty_hard: "困难",
  ai_difficulty_prodigy: "天骄"
});
const ACTION_LABELS = Object.freeze({
  battle_action_basic_melee: "肉搏",
  battle_action_defend: "防御",
  battle_action_retreat: "撤退",
  battle_action_pass: "等待",
  battle_action_moonblade: "月刃",
  battle_action_jade_skin: "玉皮",
  battle_action_earth_listen: "地听",
  battle_action_vitality_leaf: "生机叶",
  battle_action_enemy_charge: "突进",
  battle_action_enemy_ranged_strike: "远袭",
  battle_action_enemy_shell_guard: "甲壳守势",
  battle_action_boss_gather_force: "蓄势",
  battle_action_boss_pounce: "扑杀"
});

export class BattleScene extends Phaser.Scene {
  constructor() {
    super("battle");
  }

  create({ battleId = null, variantId = "default" } = {}) {
    this.store = this.registry.get("store");
    this.ui = this.registry.get("ui");
    this.finished = false;
    this.lastEnemySummaries = [];
    this.boardObjects = [];

    const active = this.store.getActiveBattle();
    if (active) {
      if (battleId && active.battleId !== battleId) {
        throw new Error(
          `cannot start ${battleId} while ${active.battleId} is active`
        );
      }
      this.battle = active;
    } else {
      if (!battleId) battleId = "B-D17-01";
      const started = this.store.startBattle(battleId, variantId);
      if (started.mode === "directResult") {
        this.scene.start("explore");
        return;
      }
      this.battle = started;
    }

    this.selectedDestination = {
      ...this.battle.player.position
    };
    this.ui.closeDialogue();
    this.ui.setPrompt("");
    this.ui.setSceneName(`战斗 ${this.battle.battleId}`);
    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.handleShutdown,
      this
    );
    this.updateTestState();
    this.drawBattle();

    if (this.battle.phase === "enemy" && !this.battle.result) {
      this.time.delayedCall(0, () => this.performEnemyPhase());
    }
  }

  drawBattle() {
    this.boardObjects.forEach((object) => object.destroy());
    this.boardObjects = [];
    this.drawBackdrop();
    this.drawGrid();
    this.drawUnits();
    this.drawControls();
    this.updateTestState();
  }

  drawBackdrop() {
    if (this.textures.exists("forest-battle")) {
      const backdrop = this.add
        .image(640, 360, "forest-battle")
        .setDisplaySize(1280, 720)
        .setDepth(0);
      this.boardObjects.push(backdrop);
    } else {
      const backdrop = this.add
        .rectangle(640, 360, 1280, 720, 0x18221d, 1)
        .setDepth(0);
      this.boardObjects.push(backdrop);
    }
    const veil = this.add
      .rectangle(640, 360, 1280, 720, 0x080b0a, 0.34)
      .setDepth(1);
    this.boardObjects.push(veil);
  }

  drawGrid() {
    const blocked = new Set(
      this.battle.board.blockedCells.map(
        (cell) => `${cell.x},${cell.y}`
      )
    );
    const plans =
      this.battle.phase === "player" && !this.battle.result
        ? getPlayerPlans(this.battle)
        : [];
    const destinations = new Set(
      plans.map(
        (plan) => `${plan.destination.x},${plan.destination.y}`
      )
    );
    const grid = this.add.graphics().setDepth(5);
    grid.fillStyle(0x0b0e0c, 0.5);
    grid.fillRect(
      GRID_X,
      GRID_Y,
      CELL_SIZE * this.battle.board.width,
      CELL_SIZE * this.battle.board.height
    );
    grid.lineStyle(1, 0xe6d2a5, 0.28);
    for (let x = 0; x <= this.battle.board.width; x += 1) {
      grid.lineBetween(
        GRID_X + x * CELL_SIZE,
        GRID_Y,
        GRID_X + x * CELL_SIZE,
        GRID_Y + CELL_SIZE * this.battle.board.height
      );
    }
    for (let y = 0; y <= this.battle.board.height; y += 1) {
      grid.lineBetween(
        GRID_X,
        GRID_Y + y * CELL_SIZE,
        GRID_X + CELL_SIZE * this.battle.board.width,
        GRID_Y + y * CELL_SIZE
      );
    }
    this.boardObjects.push(grid);

    for (let y = 0; y < this.battle.board.height; y += 1) {
      for (let x = 0; x < this.battle.board.width; x += 1) {
        const key = `${x},${y}`;
        if (blocked.has(key)) {
          const obstacle = this.add
            .rectangle(
              ...cellCenter({ x, y }),
              CELL_SIZE - 10,
              CELL_SIZE - 10,
              0x343b35,
              0.94
            )
            .setStrokeStyle(2, 0x778177, 0.9)
            .setDepth(7);
          this.boardObjects.push(obstacle);
          continue;
        }
        if (!destinations.has(key)) continue;
        const selected =
          this.selectedDestination.x === x &&
          this.selectedDestination.y === y;
        const zone = this.add
          .rectangle(
            ...cellCenter({ x, y }),
            CELL_SIZE - 6,
            CELL_SIZE - 6,
            selected ? 0xd4b25f : 0x6d9d83,
            selected ? 0.34 : 0.18
          )
          .setStrokeStyle(
            selected ? 2 : 1,
            selected ? 0xf2d98d : 0x87b39a,
            0.9
          )
          .setDepth(6)
          .setInteractive({ useHandCursor: true });
        zone.on("pointerdown", () => {
          this.selectedDestination = { x, y };
          this.drawBattle();
        });
        this.boardObjects.push(zone);
      }
    }
  }

  drawUnits() {
    const player = this.add
      .circle(
        ...cellCenter(this.battle.player.position),
        22,
        0x20292b,
        1
      )
      .setStrokeStyle(3, 0xd9b96e)
      .setDepth(10);
    const playerLabel = this.add
      .text(
        ...cellCenter(this.battle.player.position),
        "我",
        tokenTextStyle()
      )
      .setOrigin(0.5)
      .setDepth(11);
    this.boardObjects.push(player, playerLabel);

    this.battle.enemies.forEach((enemy, index) => {
      if (enemy.hp <= 0) return;
      const token = this.add
        .circle(
          ...cellCenter(enemy.position),
          22,
          index === 0 ? 0x8f4b3d : 0x76534d,
          1
        )
        .setStrokeStyle(3, 0xeee0bf)
        .setDepth(10);
      const label = this.add
        .text(
          ...cellCenter(enemy.position),
          String(index + 1),
          tokenTextStyle()
        )
        .setOrigin(0.5)
        .setDepth(11);
      this.boardObjects.push(token, label);
    });
  }

  drawControls() {
    const player = this.battle.player;
    const enemyText = this.battle.enemies
      .map(
        (enemy, index) =>
          `敌${index + 1} ${enemy.hp}/${enemy.maxHp}`
      )
      .join("  ");
    const status =
      `第${this.battle.round}回合  ` +
      `你 ${player.hp}/${player.maxHp} 命 ${player.essence}/${player.maxEssence} 真元  ` +
      enemyText;
    const plans =
      this.battle.phase === "player" && !this.battle.result
        ? getPlayerPlans(this.battle).filter(
            (plan) =>
              plan.destination.x === this.selectedDestination.x &&
              plan.destination.y === this.selectedDestination.y
          )
        : [];
    const actions = plans.map((plan) => ({
      label: actionLabel(plan, this.battle),
      run: () => this.performPlayerPlan(plan)
    }));
    this.ui.showBattleControls(status, actions, {
      difficultyLabel:
        DIFFICULTY_LABELS[this.battle.difficultyId] ??
        this.battle.difficultyId,
      waiting: this.battle.phase !== "player"
    });
  }

  performPlayerPlan(plan) {
    if (this.finished || this.battle.phase !== "player") return;
    try {
      const committed = this.store.submitPlayerPlan(plan);
      this.battle = committed.state;
      this.selectedDestination = {
        ...this.battle.player.position
      };
      this.drawBattle();
      if (this.battle.result) {
        this.finishBattle();
        return;
      }
      this.performEnemyPhase();
    } catch (error) {
      this.ui.showToast(error.message, "danger");
    }
  }

  performEnemyPhase() {
    if (this.finished || this.battle.result) return;
    try {
      const committed = this.store.advanceEnemyPhase();
      this.lastEnemySummaries = committed.summaries;
      this.battle = committed.state;
      this.selectedDestination = {
        ...this.battle.player.position
      };
      this.drawBattle();
      if (this.battle.result) this.finishBattle();
    } catch (error) {
      this.ui.showToast(error.message, "danger");
    }
  }

  finishBattle() {
    if (this.finished) return;
    this.finished = true;
    const result = this.battle.result;
    const returnScene = { ...this.battle.returnScene };
    try {
      this.store.finishBattle((state) => {
        if (
          this.battle.battleId === "B-D17-01" &&
          state.flags &&
          state.clock
        ) {
          state.flags.forestEncounterDay = state.clock.day;
        }
        return state;
      });
    } catch (error) {
      this.finished = false;
      this.ui.showToast(error.message, "danger");
      return;
    }

    this.ui.hideBattleControls();
    const resultText = {
      victory: "敌手已经失去战斗能力。",
      retreat: "你沿战场边缘安全撤离。",
      defeat: "你负伤醒来，本次战斗已经结束。"
    };
    this.ui.openDialogue({
      speaker: "战果",
      seal: "战",
      text: resultText[result],
      choices: [
        {
          label: "返回",
          run: () => {
            this.ui.hideBattleControls();
            const destination = legacySceneFor(returnScene);
            this.store.travel(
              destination.id,
              destination.entrance,
              0
            );
            this.scene.start("explore", {
              mapId: destination.id,
              entrance: destination.entrance,
              ignoreTestBattle: true
            });
          }
        }
      ]
    });
  }

  updateTestState() {
    const root = document.querySelector("#game-root");
    root.dataset.battleId = this.battle.battleId;
    root.dataset.battleEnemyCount = String(
      this.battle.enemies.filter((enemy) => enemy.hp > 0).length
    );
    root.dataset.battleBoard = `${this.battle.board.width}x${this.battle.board.height}`;
    root.dataset.battleDifficulty = this.battle.difficultyId;
  }

  handleShutdown() {
    const root = document.querySelector("#game-root");
    delete root.dataset.battleId;
    delete root.dataset.battleEnemyCount;
    delete root.dataset.battleBoard;
    delete root.dataset.battleDifficulty;
    this.ui.hideBattleControls();
  }
}

function actionLabel(plan, battle) {
  const base =
    ACTION_LABELS[plan.action.actionId] ?? plan.action.actionId;
  if (!plan.action.targetUnitId) return base;
  const targetIndex = battle.enemies.findIndex(
    (enemy) => enemy.unitId === plan.action.targetUnitId
  );
  return targetIndex >= 0 ? `${base}·敌${targetIndex + 1}` : base;
}

function cellCenter(cell) {
  return [
    GRID_X + cell.x * CELL_SIZE + CELL_SIZE / 2,
    GRID_Y + cell.y * CELL_SIZE + CELL_SIZE / 2
  ];
}

function tokenTextStyle() {
  return {
    fontFamily: '"Microsoft YaHei", sans-serif',
    fontSize: "18px",
    fontStyle: "bold",
    color: "#f6ead0"
  };
}

function legacySceneFor(scene) {
  if (scene.id === "loc_qingmao_wilderness") {
    return { id: "world", entrance: "default" };
  }
  if (scene.id === "loc_gu_yue_village") {
    return { id: "village", entrance: scene.entrance };
  }
  return scene;
}
