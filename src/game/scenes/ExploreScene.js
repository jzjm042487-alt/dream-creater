import Phaser from "phaser";
import { ASSETS, MAPS } from "../content/maps.js";

const PLAYER_SPEED = 190;

export class ExploreScene extends Phaser.Scene {
  constructor() {
    super("explore");
  }

  preload() {
    for (const [key, url] of ASSETS) {
      this.load.image(key, url);
    }
  }

  create(data = {}) {
    this.store = this.registry.get("store");
    this.ui = this.registry.get("ui");
    const requestedBattleId = new URLSearchParams(
      window.location.search
    ).get("battleId");
    const activeBattle = this.store.getActiveBattle();
    if (activeBattle) {
      this.scene.start("battle", {
        battleId: activeBattle.battleId
      });
      return;
    }
    if (
      requestedBattleId &&
      !data.ignoreTestBattle &&
      !window.__TIANWAI_TEST_BATTLE_STARTED__
    ) {
      window.__TIANWAI_TEST_BATTLE_STARTED__ = true;
      this.scene.start("battle", {
        battleId: requestedBattleId,
        variantId:
          new URLSearchParams(window.location.search).get("variantId") ||
          "default"
      });
      return;
    }
    this.currentInteractable = null;
    this.lastPositionUpdate = 0;
    this.mapId = data.mapId || this.store.getState().scene.id || "world";
    this.map = MAPS[this.mapId] || MAPS.world;

    this.add
      .image(640, 360, this.map.background)
      .setDisplaySize(1280, 720)
      .setDepth(0);

    this.physics.world.setBounds(30, 78, 1220, 612);
    createCharacterTextures(this);

    const entrance =
      data.entrance || this.store.getState().scene.entrance || "default";
    const spawn = data.position || this.map.spawns[entrance] || this.map.spawns.default;
    this.player = this.physics.add
      .sprite(spawn.x, spawn.y, "player-token")
      .setDepth(20)
      .setScale(1.35)
      .setCollideWorldBounds(true);
    this.player.body.setSize(18, 22).setOffset(3, 8);

    this.interactables = this.map.interactables.map((definition) =>
      this.createInteractable(definition)
    );

    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
    });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("game-interact", this.touchInteract);
    });
    this.touchInteract = () => this.interact();
    window.addEventListener("game-interact", this.touchInteract);

    this.ui.hideBattleControls();
    this.ui.closeDialogue();
    this.ui.setSceneName(this.map.name);
    this.ui.setPlayerPosition(this.player.x, this.player.y);

    this.cameras.main.fadeIn(280, 8, 12, 11);
  }

  update(time) {
    const blocked = this.ui.isModalOpen();
    const virtual = this.ui.getVirtualState();
    const left = this.cursors.left.isDown || this.keys.left.isDown || virtual.left;
    const right =
      this.cursors.right.isDown || this.keys.right.isDown || virtual.right;
    const up = this.cursors.up.isDown || this.keys.up.isDown || virtual.up;
    const down =
      this.cursors.down.isDown || this.keys.down.isDown || virtual.down;

    const velocity = new Phaser.Math.Vector2(
      blocked ? 0 : Number(right) - Number(left),
      blocked ? 0 : Number(down) - Number(up)
    );
    if (velocity.lengthSq() > 0) {
      velocity.normalize().scale(PLAYER_SPEED);
      this.player.setVelocity(velocity.x, velocity.y);
      this.player.setFlipX(velocity.x < 0);
      this.player.y += Math.sin(time / 75) * 0.16;
    } else {
      this.player.setVelocity(0, 0);
    }

    this.currentInteractable = this.findNearestInteractable();
    this.ui.setPrompt(
      this.currentInteractable ? this.currentInteractable.definition.name : ""
    );

    if (
      !blocked &&
      (Phaser.Input.Keyboard.JustDown(this.keys.interact) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.space))
    ) {
      this.interact();
    }

    if (time - this.lastPositionUpdate > 80) {
      this.ui.setPlayerPosition(this.player.x, this.player.y);
      this.lastPositionUpdate = time;
    }
  }

  createInteractable(definition) {
    const markerColor =
      definition.color ||
      (definition.kind === "exit" ? 0xd9c68f : 0x84a99a);
    const marker = this.add
      .circle(definition.x, definition.y, definition.kind === "npc" ? 12 : 9)
      .setFillStyle(markerColor, definition.kind === "npc" ? 1 : 0.75)
      .setStrokeStyle(2, 0xf2e6c9, 0.82)
      .setDepth(12);

    if (definition.kind === "npc") {
      marker.setTexture?.("npc-token");
      const token = this.add
        .sprite(definition.x, definition.y, "npc-token")
        .setTint(markerColor)
        .setScale(1.3)
        .setDepth(12);
      marker.setVisible(false);
      token.setFlipX(definition.id === "fang-yuan");
    }

    const label = this.add
      .text(definition.x, definition.y - 30, definition.name, {
        fontFamily: '"Microsoft YaHei", sans-serif',
        fontSize: "14px",
        color: "#f4ead7",
        backgroundColor: "rgba(12, 15, 13, 0.72)",
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(13);

    return { definition, marker, label };
  }

  findNearestInteractable() {
    let nearest = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const interactable of this.interactables) {
      const { definition } = interactable;
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        definition.x,
        definition.y
      );
      if (distance <= definition.radius && distance < nearestDistance) {
        nearest = interactable;
        nearestDistance = distance;
      }
      interactable.label.setAlpha(distance <= definition.radius ? 1 : 0.62);
    }
    return nearest;
  }

  interact() {
    if (!this.currentInteractable || this.ui.isModalOpen()) {
      return;
    }
    const definition = this.currentInteractable.definition;
    if (definition.kind === "exit") {
      this.travel(definition);
      return;
    }
    this.openInteraction(definition.id);
  }

  travel(definition) {
    try {
      this.store.travel(
        definition.target,
        definition.entrance,
        definition.cost || 0
      );
      this.cameras.main.fadeOut(150, 8, 12, 11);
      this.time.delayedCall(160, () => {
        this.scene.restart({
          mapId: definition.target,
          entrance: definition.entrance,
        });
      });
    } catch (error) {
      this.ui.showToast(error.message, "danger");
    }
  }

  openInteraction(id) {
    const state = this.store.getState();
    const interactions = {
      "enter-forest": () => this.openForestEncounter(state),
      "market-stall": () =>
        this.ui.openDialogue({
          speaker: "市集摊位",
          seal: "市",
          text: state.flags.ordinaryTheftDay === state.clock.day
            ? "摊主把钱袋紧紧压在掌下，今天不会再给你机会。"
            : "人潮正好遮住摊主的视线，钱袋挂在伸手可及之处。",
          choices: [
            {
              label: "顺走钱袋中的元石",
              disabled: state.flags.ordinaryTheftDay === state.clock.day,
              run: () => this.runQuest("ordinary-theft"),
            },
            { label: "离开" },
          ],
        }),
      "fang-yuan": () => this.openFangYuan(state),
      clerk: () =>
        this.ui.openDialogue({
          speaker: "客栈伙计",
          seal: "伙",
          text: state.flags.clerkObserved
            ? "他每隔片刻便会去后门换水，柜台会短暂无人。"
            : "伙计忙着招呼酒客，目光却总会扫过柜后的巡夜薄。",
          choices: [
            {
              label: "坐下饮茶，暗中观察",
              disabled: Boolean(state.flags.clerkObserved),
              run: () => this.runQuest("observe-clerk"),
            },
            { label: "不动声色地离开" },
          ],
        }),
      "patrol-ledger": () =>
        this.ui.openDialogue({
          speaker: "巡夜薄",
          seal: "薄",
          text: "薄册压在柜角，记着护院交班和后门巡查的时刻。",
          choices: [
            {
              label: "施展盗术取走关键一页",
              disabled: Boolean(state.flags.patrolSheet),
              run: () => this.runQuest("steal-patrol-sheet"),
            },
            { label: "暂不出手" },
          ],
        }),
      "wine-jars": () =>
        this.ui.openDialogue({
          speaker: "封泥酒坛",
          seal: "酒",
          text: state.flags.correctWineJar
            ? "你已经记住了那只坛子的封泥裂纹。"
            : "数十只酒坛气味混杂，记忆里的异香若有若无。",
          choices: [
            {
              label: "逐一辨认异香",
              disabled: Boolean(state.flags.correctWineJar),
              run: () => this.runQuest("confirm-wine-jar"),
            },
            { label: "退开" },
          ],
        }),
      merchant: () => this.openMerchant(state),
      "back-room": () =>
        this.ui.openDialogue({
          speaker: "后房夹层",
          seal: "盗",
          text:
            state.wineWorm.owner === "merchant"
              ? "酒虫就在封泥后的夹层里。巡夜空档和酒坛位置都会提高胜算。"
              : "夹层已经空了。",
          choices: [
            {
              label: "潜入后房盗取酒虫",
              disabled: state.wineWorm.owner !== "merchant",
              run: () => this.runQuest("steal-back-room"),
            },
            { label: "收手" },
          ],
        }),
      instructor: () =>
        this.ui.openDialogue({
          speaker: "学堂家老",
          seal: "学",
          text: "今日基础课尚有名额。完成吐纳，可领取四块元石补贴。",
          choices: [
            {
              label: "修行两个时段",
              disabled: state.player.essence < 4,
              run: () => this.runQuest("train-at-academy"),
            },
            { label: "离开讲堂" },
          ],
        }),
      bed: () =>
        this.ui.openDialogue({
          speaker: "木床",
          seal: "眠",
          text: "夜色会掩去今日的伤势，也会让方源继续推进他的计划。",
          choices: [
            {
              label: "休息到次日清晨",
              run: () => {
                this.store.sleep();
                this.ui.showToast("天色再次亮起。");
              },
            },
            { label: "还不能睡" },
          ],
        }),
      "floor-hatch": () =>
        this.ui.openDialogue({
          speaker: "床下暗格",
          seal: "藏",
          text:
            state.wineWorm.owner === "player" &&
            state.wineWorm.status === "unhidden"
              ? "暗格干燥隐蔽，足够隔绝酒虫的气息。"
              : "木板下只有一处空暗格。",
          choices: [
            {
              label: "藏匿酒虫",
              disabled:
                state.wineWorm.owner !== "player" ||
                state.wineWorm.status !== "unhidden",
              run: () =>
                this.runDomain(
                  { type: "WINE_WORM_HIDDEN" },
                  "酒虫气息被暗格遮住。"
                ),
            },
            { label: "合上暗格" },
          ],
        }),
      "meditation-mat": () =>
        this.ui.openDialogue({
          speaker: "蒲团",
          seal: "炼",
          text:
            state.wineWorm.status === "hidden"
              ? "酒虫已无外界干扰，可以用真元缓慢磨去野性。"
              : "心神不宁，此刻没有适合炼化的蛊虫。",
          choices: [
            {
              label: "消耗八成真元炼化酒虫",
              disabled:
                state.wineWorm.status !== "hidden" ||
                state.player.essence < 8,
              run: () =>
                this.runDomain(
                  { type: "WINE_WORM_REFINED" },
                  "酒虫彻底归心，修为大涨。"
                ),
            },
            { label: "起身" },
          ],
        }),
    };

    interactions[id]?.();
  }

  openForestEncounter(state) {
    const alreadyCleared = state.flags.forestEncounterDay === state.clock.day;
    this.ui.openDialogue({
      speaker: "竹林猎场",
      seal: "战",
      text: alreadyCleared
        ? "今日被惊动的山兽已经散去，林地暂时安静。"
        : "山石后传来粗重喘息，一头受伤山豕守着八块元石。",
      choices: [
        {
          label: "踏入林地迎战",
          disabled: alreadyCleared || state.clock.tick > 10,
          reason: state.clock.tick > 10 ? "天色太晚，战斗至少需要两个时段" : "",
          run: () =>
            this.scene.start("battle", {
              battleId: "B-D17-01",
              variantId: "default"
            }),
        },
        { label: "绕开" },
      ],
    });
  }

  openFangYuan(state) {
    if (state.wineWorm.owner === "fangYuan") {
      this.ui.openDialogue({
        speaker: "方源",
        seal: "源",
        text: "他袖口有一瞬不自然的停顿。酒虫就藏在那里，而他已经认出了你的来意。",
        choices: [
          {
            label: "截住他，夺回酒虫",
            disabled: state.clock.tick > 10,
            run: () =>
              this.scene.start("battle", {
                battleId: "B-D19-01",
                variantId: "default"
              }),
          },
          { label: "暂避锋芒" },
        ],
      });
      return;
    }

    this.ui.openDialogue({
      speaker: "方源",
      seal: "源",
      text: "他沿街缓行，视线从醉仙楼后门一掠而过。你知道他正等一个混乱的窗口。",
      choices: [
        {
          label: "保持三丈距离尾随",
          disabled: state.wineWorm.owner !== "merchant",
          run: () =>
            this.runQuest("follow-fang-yuan", {
              checkpoints: ["street", "tavern", "alley"],
              minimumDistance: 72,
            }),
        },
        { label: "不与他对视" },
      ],
    });
  }

  openMerchant(state) {
    const price = state.wineWorm.failedAttempts > 0 ? 22 : 18;
    this.ui.openDialogue({
      speaker: "行脚商贩",
      seal: "商",
      text:
        state.wineWorm.owner === "merchant"
          ? `他护着一坛不起眼的浊酒，开价 ${price} 块元石。`
          : "商贩脸色阴沉，那坛浊酒已经不在他手中。",
      choices: [
        {
          label: `以 ${price} 块元石买下浊酒`,
          disabled:
            state.wineWorm.owner !== "merchant" || state.player.stones < price,
          run: () => this.runQuest("buy-wine-worm"),
        },
        {
          label: "花两块元石挑起争执",
          disabled:
            state.wineWorm.owner !== "merchant" || state.player.stones < 2,
          run: () => this.runQuest("tavern-conflict"),
        },
        { label: "继续观察" },
      ],
    });
  }

  runQuest(actionId, context = {}) {
    try {
      this.store.runQuestAction(actionId, context);
      this.ui.showToast(this.store.getJournal().at(-1));
    } catch (error) {
      this.ui.showToast(error.message, "danger");
    }
  }

  runDomain(event, message) {
    try {
      this.store.apply(event, message);
      this.ui.showToast(message);
    } catch (error) {
      this.ui.showToast(error.message, "danger");
    }
  }
}

function createCharacterTextures(scene) {
  if (!scene.textures.exists("player-token")) {
    const graphics = scene.make.graphics({ add: false });
    graphics.fillStyle(0x171c1d).fillRect(5, 10, 16, 18);
    graphics.fillStyle(0x6f2730).fillRect(4, 21, 18, 4);
    graphics.fillStyle(0xd1a071).fillRect(8, 4, 10, 9);
    graphics.fillStyle(0x111314).fillRect(7, 2, 12, 5);
    graphics.fillStyle(0xc2b177).fillRect(8, 29, 5, 3);
    graphics.fillRect(17, 29, 5, 3);
    graphics.generateTexture("player-token", 26, 32);
    graphics.destroy();
  }

  if (!scene.textures.exists("npc-token")) {
    const graphics = scene.make.graphics({ add: false });
    graphics.fillStyle(0xffffff).fillRect(5, 10, 16, 18);
    graphics.fillStyle(0xd4a57a).fillRect(8, 4, 10, 9);
    graphics.fillStyle(0x17191a).fillRect(7, 2, 12, 5);
    graphics.fillStyle(0x3d3130).fillRect(8, 29, 5, 3);
    graphics.fillRect(17, 29, 5, 3);
    graphics.generateTexture("npc-token", 26, 32);
    graphics.destroy();
  }
}
