(() => {
  const STORAGE_KEY = "solverelab.phase1.v1";

  const weights = {
    basis: 1,
    breach: 1,
    damage: 1,
    defenses: 1,
    evidence: 2,
    limitation: 2
  };

  const labels = {
    basis: "Nõude alus",
    breach: "Rikkumine",
    damage: "Kahju / summa",
    evidence: "Tõendid",
    defenses: "Vastuväited",
    limitation: "Aegumine"
  };

  const shortNotes = {
    basis: {
      3: "Selgelt tuvastatav.",
      2: "Tuvastatav, kuid mitte kirjalikult.",
      1: "Sisu vajab täpsustamist.",
      0: "Kohustus ei ole tuvastatav."
    },
    breach: {
      3: "Selgelt tuvastatav.",
      2: "Tõenäoline, kuid lünklik.",
      1: "Vaidlustatav.",
      0: "Ei ole kindel."
    },
    damage: {
      3: "Arvutus kontrollitav.",
      2: "Ligikaudne arvutus.",
      1: "Ebamäärane.",
      0: "Rahaliselt määramata."
    },
    evidence: {
      3: "Tõendibaas tugev.",
      2: "Tõendeid on olemas.",
      1: "Tõendeid on piiratud.",
      0: "Tõendid puuduvad."
    },
    defenses: {
      3: "Vaidlusrisk madal.",
      2: "Vaidlusrisk võimalik.",
      1: "Vaidlusrisk suur.",
      0: "Vastuväited väga tugevad."
    },
    limitation: {
      3: "Aegumisohtu ei tuvastatud.",
      2: "Ebatõenäoline.",
      1: "Võimalik.",
      0: "Tõenäoline."
    }
  };

  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");
  const showResultBtn = document.getElementById("showResultBtn");

  const progressLabel = document.getElementById("progressLabel");
  const progressFill = document.getElementById("progressFill");

  const steps = Array.from(document.querySelectorAll(".step"));
  const results = document.getElementById("results");
  const overallStatusDot = document.querySelector("#overallStatus .status__dot");
  const overallText = document.getElementById("overallText");
  const componentGrid = document.getElementById("componentGrid");

  const state = loadState();

  init();

  function init() {
    // restore answers
    for (const [k, v] of Object.entries(state.answers || {})) {
      const el = document.querySelector(`input[name="${k}"][value="${v}"]`);
      if (el) el.checked = true;
    }

    // unlock based on completion
    applyUnlocks();

    // handlers: step headers (accordion-ish)
    steps.forEach(step => {
      const head = step.querySelector(".step__head");
      const body = step.querySelector(".step__body");

      head.addEventListener("click", (e) => {
        // avoid opening by clicking info button
        if (e.target && e.target.classList.contains("info")) return;
        if (step.classList.contains("is-locked")) return;
        const expanded = head.getAttribute("aria-expanded") === "true";
        head.setAttribute("aria-expanded", String(!expanded));
        body.style.display = expanded ? "none" : "block";
      });

      // next/back
      step.querySelectorAll("[data-next]").forEach(btn => {
        btn.addEventListener("click", () => gotoStep(getStepNum(step) + 1));
      });
      step.querySelectorAll("[data-back]").forEach(btn => {
        btn.addEventListener("click", () => gotoStep(getStepNum(step) - 1));
      });

      // info toggles
      step.querySelectorAll(".info").forEach(infoBtn => {
        infoBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const key = infoBtn.getAttribute("data-info");
          const panel = document.querySelector(`.info__panel[data-panel="${key}"]`);
          if (!panel) return;
          panel.hidden = !panel.hidden;
        });
      });
    });

    // answer change save + unlock
    document.querySelectorAll('input[type="radio"]').forEach(r => {
      r.addEventListener("change", () => {
        const name = r.name;
        const value = Number(r.value);
        state.answers = state.answers || {};
        state.answers[name] = value;
        saveState(state);
        applyUnlocks();
      });
    });

    startBtn?.addEventListener("click", () => gotoStep(1));
    resetBtn?.addEventListener("click", resetAll);
    showResultBtn?.addEventListener("click", () => {
      if (!isStepComplete(6)) return; // hard gate
      renderResults();
      results.hidden = false;
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    updateProgress();
  }

  function getStepNum(stepEl) {
    return Number(stepEl.getAttribute("data-step"));
  }

  function isStepComplete(n) {
    const stepEl = steps.find(s => getStepNum(s) === n);
    if (!stepEl) return false;
    const names = Array.from(stepEl.querySelectorAll('input[type="radio"]')).map(i => i.name);
    const uniq = [...new Set(names)];
    return uniq.every(k => state.answers && typeof state.answers[k] === "number");
  }

  function applyUnlocks() {
    // unlock step 1 always
    steps.forEach(s => s.classList.add("is-locked"));
    const s1 = steps.find(s => getStepNum(s) === 1);
    if (s1) s1.classList.remove("is-locked");

    for (let i = 2; i <= 6; i++) {
      const prevComplete = isStepComplete(i - 1);
      const stepEl = steps.find(s => getStepNum(s) === i);
      if (stepEl && prevComplete) stepEl.classList.remove("is-locked");
    }

    // optionally keep current opened step visible
    updateProgress();

    // auto-show if previously finished and results exist
    if (isStepComplete(6)) {
      // don't show automatically; only after "Vaata tulemust"
      // but we can re-enable the results if user had seen them:
      if (state.seenResults) {
        renderResults();
        results.hidden = false;
      }
    }
  }

  function gotoStep(n) {
    if (n < 1) return;
    if (n > 6) return;

    const stepEl = steps.find(s => getStepNum(s) === n);
    if (!stepEl) return;
    if (stepEl.classList.contains("is-locked")) return;

    // close all, open target
    steps.forEach(s => {
      const head = s.querySelector(".step__head");
      const body = s.querySelector(".step__body");
      head.setAttribute("aria-expanded", "false");
      body.style.display = "none";
    });

    const head = stepEl.querySelector(".step__head");
    const body = stepEl.querySelector(".step__body");
    head.setAttribute("aria-expanded", "true");
    body.style.display = "block";

    stepEl.scrollIntoView({ behavior: "smooth", block: "start" });
    updateProgress();
  }

  function updateProgress() {
    const completed = [1,2,3,4,5,6].filter(n => isStepComplete(n)).length;
    progressLabel.textContent = `Samm ${Math.min(completed,6)} / 6`;
    const pct = (completed / 6) * 100;
    progressFill.style.width = `${pct}%`;

    const bar = document.querySelector(".progress__bar");
    if (bar) bar.setAttribute("aria-valuenow", String(completed));
  }

  function computeOverall(a) {
    // a: {basis, breach, damage, evidence, defenses, limitation}
    const maxPoints = 24; // per your model: 1+1+1+1+2+2 weights *3
    let sum = 0;
    for (const k of Object.keys(weights)) {
      const v = Number(a[k] ?? 0);
      sum += v * weights[k];
    }
    const ratio = sum / maxPoints; // 0..1

    const evidence0 = Number(a.evidence) === 0;
    const limitation0 = Number(a.limitation) === 0;

    // thresholds (not shown to user)
    let level = "mid";
    if (ratio >= 0.75) level = "ok";
    else if (ratio >= 0.50) level = "mid";
    else level = "bad";

    // critical constraints
    if (evidence0 || limitation0) {
      if (level === "ok") level = "mid";
      if (evidence0 && limitation0) level = "bad";
    }

    return level;
  }

  function renderResults() {
    const a = state.answers || {};
    const overall = computeOverall(a);

    // lock: results only after click
    state.seenResults = true;
    saveState(state);

    const statusText = overall === "ok"
      ? "🟢 Tugev riskiprofiil"
      : overall === "mid"
        ? "🟡 Mõõdukas riskiprofiil"
        : "🔴 Nõrk riskiprofiil";

    overallText.textContent = statusText;
    overallStatusDot.setAttribute("data-level", overall);

    // component grid
    componentGrid.innerHTML = "";
    const order = ["basis","breach","damage","evidence","defenses","limitation"];
    order.forEach(key => {
      const v = Number(a[key]);
      const lvl = v >= 2 ? (v === 3 ? "ok" : "mid") : "bad";

      const card = document.createElement("div");
      card.className = "kcard";
      card.innerHTML = `
        <div class="kcard__top">
          <div class="kcard__name">${labels[key]}</div>
          <div class="kcard__mark">
            <span class="kdot ${lvl}"></span>
            <span class="muted small">${v >= 2 ? (v === 3 ? "Tugev" : "Piisav") : (v === 1 ? "Nõrk" : "Kriitiline")}</span>
          </div>
        </div>
        <div class="kcard__desc">${shortNotes[key][String(v)] ?? "—"}</div>
      `;
      componentGrid.appendChild(card);
    });
  }

  function resetAll() {
    sessionStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { answers: {}, seenResults: false };
    } catch {
      return { answers: {}, seenResults: false };
    }
  }

  function saveState(s) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {}
  }
})();
