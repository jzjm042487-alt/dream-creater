import Phaser from "phaser";
import {
  createBattleState,
  getReachableCells,
  reduceBattle,
} from "../rules/battleRules.js";

const CELL_SIZE = 76;
const GRID_X = 336;
const GRID_Y = 126;

export class BattleScene extends Phaser.Scene {
  constructor() {
    super("battle");
  }

  create({ kind = "forest", returnMap = "world" } = {}) {
    this.store = this.registry.get("store");
    this.ui = this.registry.get("ui");
    this.kind = kind;
    this.returnMap = returnMap;
    this.finished = false;
    this.hasMoved = false;

    this.add
      .image(640, 360, "forest-battle")
      .setDisplaySize(1280, 720)
      .setDepth(0);
    this.add.rectangle(640, 360, 1280, 720, 0x080b0a, 0.18).setDepth(1);

    const persistentState =
      kind === "fangYuan"
        ? {
            ...this.store.getState(),
            flags: {
              ...this.store.getState().flags,
              fangYuanActionWindow: true,
            },
          }
        : this.store.getState();
    this.battle = createBattleState(kind, persistentState);
    this.ui.closeDialogue();
    this.ui.setPrompt("");
    this.ui.setSceneName(kind === "fangYuan" ? "山寨截杀" : "竹林猎场");
    this.drawBattle();
  }

  drawBattle() {
    this.boardObjects?.forEach((object) => object.destroy());
    this.boardObjects = [];

    const grid = this.add.graphics().setDepth(5);
    grid.fillStyle(0x0b0e0c, 0.32);
    grid.fillRect(GRID_X, GRID_Y, CELL_SIZE * 8, CELL_SIZE * 6);
    grid.lineStyle(1, 0xe6d2a5, 0.3);
    for (let x = 0; x <= 8; x += 1) {
      grid.lineBetween(
        GRID_X + x * CELL_SIZE,
        GRID_Y,
        GRID_X + x * CELL_SIZE,
        GRID_Y + CELL_SIZE * 6
      );
    }
    for (let y = 0; y <= 6; y += 1) {
      grid.lineBetween(
        GRID_X,
        GRID_Y + y * CELL_SIZE,
        GRID_X + CELL_SIZE * 8,
        GRID_Y + y * CELL_SIZE
      );
    }
    this.boardObjects.push(grid);

    if (!this.hasMoved && !this.battle.result) {
      for (const cell of getReachableCells(this.battle)) {
        const zone = this.add
          .rectangle(
            GRID_X + cell.x * CELL_SIZE + CELL_SIZE / 2,
            GRID_Y + cell.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE - 4,
            CELL_SIZE - 4,
            0x79a68d,
            cell.x === this.battle.player.x && cell.y === this.battle.player.y
              ? 0.08
              : 0.2
          )
          .setDepth(6)
          .setInteractive({ useHandCursor: true });
        zone.on("pointerdown", () => {
          if (
            cell.x === this.battle.player.x &&
            cell.y === this.battle.player.y
          ) {
            return;
          }
          this.perform({ type: "MOVE", x: cell.x, y: cell.y }, true);
        });
        this.boardObjects.push(zone);
      }
    }

    const player = this.add
      .circle(...cellCenter(this.battle.player), 22, 0x242b2d, 1)
      .setStrokeStyle(3, 0xd9b96e)
      .setDepth(10);
    const playerLabel = this.add
      .text(...cellCenter(this.battle.player), "盗", tokenTextStyle())
      .setOrigin(0.5)
      .setDepth(11);
    const enemyColor = this.kind === "fangYuan" ? 0x8196a5 : 0x8f4b3d;
    const enemy = this.add
      .circle(...cellCenter(this.battle.enemy), 22, enemyColor, 1)
      .setStrokeStyle(3, 0xeee0bf)
      .setDepth(10);
    const enemyLabel = this.add
      .text(
        ...cellCenter(this.battle.enemy),
        this.kind === "fangYuan" ? "源" : "豕",
        tokenTextStyle()
      )
      .setOrigin(0.5)
      .setDepth(11);
    this.boardObjects.push(player, playerLabel, enemy, enemyLabel);

    const distance = Math.abs(this.battle.player.x - this.battle.enemy.x) +
      Math.abs(this.battle.player.y - this.battle.enemy.y);
    const edge =
      this.battle.player.x === 0 ||
      this.battle.player.y === 0 ||
      this.battle.player.x === 7 ||
      this.battle.player.y === 5;
    this.ui.showBattleControls(
      `你 ${this.battle.player.hp}/${this.battle.player.maxHp} 命 · ` +
        `${this.battle.player.essence} 真元　` +
        `${this.kind === "fangYuan" ? "方源" : "山豕"} ${this.battle.enemy.hp}/${this.battle.enemy.maxHp} 命`,
      [
        {
          label: "斩击",
          disabled: distance > 1,
          reason: "需与目标相邻",
          run: () => this.perform({ type: "ATTACK" }),
        },
        {
          label: "守势",
          run: () => this.perform({ type: "DEFEND" }),
        },
        {
          label: "妙手空空",
          disabled:
            distance > 1 ||
            this.battle.sleightUsed ||
            this.battle.player.essence < 3,
          reason: "相邻时消耗三点真元",
          run: () => this.perform({ type: "SLEIGHT_OF_HAND" }),
        },
        {
          label: "盗元",
          disabled:
            distance > 2 ||
            this.battle.player.essence < 4 ||
            this.battle.player.stealEssenceCooldown > 0,
          reason: "两格内消耗四点真元",
          run: () => this.perform({ type: "STEAL_ESSENCE" }),
        },
        {
          label: "脱离",
          disabled: !edge,
          reason: "移动到战场边缘后可脱离",
          run: () => this.perform({ type: "ESCAPE" }),
        },
      ]
    );
  }

  perform(action, movementOnly = false) {
    if (this.finished) {
      return;
    }
    try {
      this.battle = reduceBattle(this.battle, action);
      if (movementOnly) {
        this.hasMoved = true;
      } else {
        this.hasMoved = false;
      }
      this.drawBattle();
      if (this.battle.result) {
        this.finishBattle();
      }
    } catch (error) {
      this.ui.showToast(error.message, "danger");
    }
  }

  finishBattle() {
    this.finished = true;
    try {
      this.store.commitBattle(this.battle);
    } catch (error) {
      this.finished = false;
      this.ui.showToast(error.message, "danger");
      return;
    }

    const wonWine =
      this.kind === "fangYuan" &&
      (this.battle.wineContested || this.battle.result === "victory");
    const resultText = {
      victory: wonWine
        ? "方源退开半步。你从他的袖中夺回了酒虫。"
        : "山豕倒地，石缝里的八块元石归你所有。",
      escaped: wonWine
        ? "你带着刚刚偷到的酒虫退出战场。"
        : "你成功摆脱了追击。",
      defeat: "你在住处醒来，损失了部分元石，时间也已来到次日。",
    };
    this.ui.openDialogue({
      speaker: "战果",
      seal: "胜",
      text: resultText[this.battle.result],
      choices: [
        {
          label: "返回青茅山",
          run: () => {
            this.ui.hideBattleControls();
            this.store.travel(this.returnMap, "default", 0);
            this.scene.start("explore", {
              mapId: this.returnMap,
              entrance: "default",
            });
          },
        },
      ],
    });
  }
}

function cellCenter(entity) {
  return [
    GRID_X + entity.x * CELL_SIZE + CELL_SIZE / 2,
    GRID_Y + entity.y * CELL_SIZE + CELL_SIZE / 2,
  ];
}

function tokenTextStyle() {
  return {
    fontFamily: '"Microsoft YaHei", sans-serif',
    fontSize: "20px",
    fontStyle: "bold",
    color: "#f6ead0",
  };
}
