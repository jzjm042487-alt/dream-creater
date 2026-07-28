import Phaser from "phaser";
import { GameStateStore } from "./game/GameStateStore.js";
import { BattleScene } from "./game/scenes/BattleScene.js";
import { ExploreScene } from "./game/scenes/ExploreScene.js";
import { GameUI } from "./game/ui/GameUI.js";

const store = new GameStateStore();
const ui = new GameUI(store);

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-canvas",
  width: 1280,
  height: 720,
  backgroundColor: "#0c100e",
  pixelArt: true,
  render: {
    antialias: false,
    roundPixels: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [ExploreScene, BattleScene],
  callbacks: {
    preBoot(currentGame) {
      currentGame.registry.set("store", store);
      currentGame.registry.set("ui", ui);
    },
  },
});

ui.bindSystemActions({
  onSave: () => {
    store.save();
    ui.showToast("进度已保存。");
  },
  onLoad: () => {
    try {
      store.load();
      restartCurrentScene();
      ui.showToast("存档已读取。");
    } catch (error) {
      ui.showToast(error.message, "danger");
    }
  },
  onReset: () => {
    store.reset();
    restartCurrentScene();
    ui.showToast("新的推演已经开始。");
  },
  onAdvanceTick: () => {
    try {
      store.advanceTick();
    } catch (error) {
      ui.showToast(error.message, "danger");
    }
  },
  onDifficultyChange: (difficultyId) => {
    try {
      store.setBattleDifficulty(difficultyId);
      ui.showToast("敌方难度将在下一场战斗生效。");
    } catch (error) {
      ui.showToast(error.message, "danger");
    }
  }
});

function restartCurrentScene() {
  game.scene.stop("battle");
  game.scene.stop("explore");
  const activeBattle = store.getActiveBattle();
  if (activeBattle) {
    game.scene.start("battle", {
      battleId: activeBattle.battleId
    });
    return;
  }
  const state = store.getState();
  game.scene.start("explore", {
    mapId: state.scene.id,
    entrance: state.scene.entrance,
  });
}

window.__TIANWAI_GAME__ = {
  game,
  store,
};
