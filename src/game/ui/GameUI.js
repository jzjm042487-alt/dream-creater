const PERIODS = [
  "卯正",
  "辰初",
  "辰正",
  "巳初",
  "巳正",
  "午初",
  "午正",
  "未初",
  "未正",
  "申初",
  "申正",
  "酉初",
  "酉正",
];

export class GameUI {
  constructor(store) {
    this.store = store;
    this.root = document.querySelector("#game-root");
    this.dialogue = document.querySelector("[data-dialogue]");
    this.battlePanel = document.querySelector("[data-battle-panel]");
    this.toastTimer = null;
    this.virtualState = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    document
      .querySelector("[data-close-dialogue]")
      .addEventListener("click", () => this.closeDialogue());

    this.bindTouchControls();
    this.store.subscribe((state) => this.render(state));
    this.render(this.store.getState());
  }

  bindSystemActions({ onSave, onLoad, onReset, onAdvanceTick }) {
    document.querySelector("[data-save]").addEventListener("click", onSave);
    document.querySelector("[data-load]").addEventListener("click", onLoad);
    document.querySelector("[data-reset]").addEventListener("click", onReset);
    document
      .querySelector("[data-quest-toggle]")
      .addEventListener("click", () => this.toggleQuestRail());
    document
      .querySelector("[data-advance-tick]")
      .addEventListener("click", onAdvanceTick);

    if (new URLSearchParams(window.location.search).has("testMode")) {
      document.querySelector("[data-test-controls]").hidden = false;
    }
  }

  toggleQuestRail() {
    const rail = document.querySelector("[data-quest-rail]");
    if (window.matchMedia("(max-height: 600px)").matches) {
      rail.classList.toggle("is-open");
      return;
    }
    rail.classList.toggle("is-hidden");
  }

  render(state) {
    document.querySelector("[data-hp]").textContent =
      `${state.player.hp}/${state.player.maxHp}`;
    document.querySelector("[data-essence]").textContent =
      `${state.player.essence}/${state.player.maxEssence}`;
    document.querySelector("[data-stones]").textContent = state.player.stones;
    document.querySelector("[data-testid='clock']").textContent =
      `${dayLabel(state.clock.day)} · ${PERIODS[state.clock.tick] || "夜深"}`;

    const ownerText = {
      merchant: "酒虫仍在客栈商贩手中",
      player:
        state.wineWorm.status === "refined"
          ? "酒虫已经炼化，成为你的第一份底蕴"
          : state.wineWorm.status === "hidden"
            ? "酒虫已藏入暗格，可以开始炼化"
            : "酒虫已经到手，先去住处藏匿",
      fangYuan: "酒虫已落入方源手中，可在山寨截击",
    };
    document.querySelector("[data-quest-state]").textContent =
      ownerText[state.wineWorm.owner] || "酒虫去向不明";

    const steps = getQuestSteps(state);
    const stepList = document.querySelector("[data-quest-steps]");
    stepList.replaceChildren(
      ...steps.map(({ text, done }) => {
        const item = document.createElement("li");
        item.textContent = text;
        if (done) {
          item.classList.add("done");
        }
        return item;
      })
    );

    document.querySelector("[data-fang-stance]").textContent =
      describeFangYuanReaction(state.fangYuan);
  }

  setSceneName(name) {
    document.querySelector("[data-testid='scene-name']").textContent = name;
  }

  setPlayerPosition(x, y) {
    this.root.dataset.playerX = Math.round(x);
    this.root.dataset.playerY = Math.round(y);
  }

  setPrompt(label) {
    const prompt = document.querySelector("[data-prompt]");
    prompt.hidden = !label || this.isModalOpen();
    document.querySelector("[data-prompt-label]").textContent = label || "";
  }

  openDialogue({ speaker, text, seal, choices = [] }) {
    document.querySelector("[data-speaker]").textContent = speaker;
    document.querySelector("[data-speaker-seal]").textContent =
      seal || speaker.slice(0, 1);
    document.querySelector("[data-dialogue-text]").textContent = text;
    const choiceContainer = document.querySelector("[data-dialogue-choices]");
    choiceContainer.replaceChildren(
      ...choices.map((choice) => {
        const button = document.createElement("button");
        button.type = "button";
        button.disabled = Boolean(choice.disabled);
        button.textContent = choice.label;
        button.title = choice.reason || choice.description || choice.label;
        button.addEventListener("click", () => {
          try {
            choice.run?.();
            if (choice.keepOpen !== true) {
              this.closeDialogue();
            }
          } catch (error) {
            this.showToast(error.message, "danger");
          }
        });
        return button;
      })
    );
    this.dialogue.hidden = false;
    this.setPrompt("");
  }

  closeDialogue() {
    this.dialogue.hidden = true;
  }

  isModalOpen() {
    return !this.dialogue.hidden;
  }

  showToast(message, tone = "neutral") {
    const toast = document.querySelector("[data-toast]");
    toast.textContent = message;
    toast.dataset.tone = tone;
    toast.hidden = false;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  }

  showBattleControls(status, actions) {
    this.battlePanel.hidden = false;
    document.querySelector("[data-battle-status]").textContent = status;
    const container = document.querySelector("[data-battle-actions]");
    container.replaceChildren(
      ...actions.map((action) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = action.label;
        button.disabled = Boolean(action.disabled);
        button.title = action.reason || action.label;
        button.addEventListener("click", action.run);
        return button;
      })
    );
  }

  hideBattleControls() {
    this.battlePanel.hidden = true;
  }

  getVirtualState() {
    return { ...this.virtualState };
  }

  bindTouchControls() {
    document.querySelectorAll("[data-touch]").forEach((button) => {
      const control = button.dataset.touch;
      if (control === "interact") {
        button.addEventListener("pointerdown", () => {
          window.dispatchEvent(new CustomEvent("game-interact"));
        });
        return;
      }

      const press = (event) => {
        event.preventDefault();
        this.virtualState[control] = true;
      };
      const release = (event) => {
        event.preventDefault();
        this.virtualState[control] = false;
      };
      button.addEventListener("pointerdown", press);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("pointerleave", release);
    });
  }
}

function describeFangYuanReaction(fangYuan) {
  if (Object.values(fangYuan.directConflicts || {}).some(Boolean)) {
    return "与你发生过直接冲突";
  }
  if (fangYuan.knownFacts?.playerHasWineWorm) {
    return "知道你持有酒虫";
  }
  if (fangYuan.knownFacts?.playerCompetesForWineWorm) {
    return "已将你视为竞争者";
  }
  return "尚未在意你";
}

function getQuestSteps(state) {
  if (state.wineWorm.owner === "player") {
    return [
      {
        text: "取得酒虫",
        done: true,
      },
      {
        text: "藏入住处暗格",
        done: ["hidden", "refined"].includes(state.wineWorm.status),
      },
      {
        text: "消耗八成真元炼化",
        done: state.wineWorm.status === "refined",
      },
    ];
  }

  if (state.wineWorm.owner === "fangYuan") {
    return [
      { text: "前往山寨寻找方源", done: false },
      { text: "在战斗中施展妙手空空", done: false },
      { text: "带着酒虫脱离战场", done: false },
    ];
  }

  return [
    { text: "摸清伙计交班", done: Boolean(state.flags.clerkObserved) },
    {
      text: "取得巡夜空档",
      done: Boolean(state.flags.patrolSheet || state.flags.patrolHint),
    },
    { text: "确认异香酒坛", done: Boolean(state.flags.correctWineJar) },
  ];
}

function dayLabel(day) {
  const labels = [
    "零",
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
    "十",
  ];
  const value =
    day <= 10
      ? labels[day]
      : day < 20
        ? `十${labels[day - 10]}`
        : String(day);
  return `第${value}日`;
}
