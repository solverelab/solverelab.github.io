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

  const progressSection = document.querySelector(".progress");
  const progressLabel = document.getElementById("progressLabel");
  const progressFill = document.getElementById("progressFill");

  const steps = Array.from(document.querySelectorAll(".step"));
  const results = document.getElementById("results");
  const overallStatusDot = document.querySelector("#overallStatus .status__dot");
  const overallText = document.getElementById("overallText");
  const componentGrid = document.getElementById("componentGrid");

  // II FAAS DOM
  const reasonsCard = document.getElementById("reasonsCard");
  const reasonsList = document.getElementById("reasonsList");
  const conditionsCard = document.getElementById("conditionsCard");
  const conditionsList = document.getElementById("conditionsList");
  const actionCard = document.getElementById("actionCard");
  const actionList = document.getElementById("actionList");

  const state = loadState();

  init();

  function init() {
    // peida lähtesta kuni kasutaja alustab
    if (resetBtn) resetBtn.hidden = true;

    // kui on varasemaid vastuseid, näita lähtesta kohe
    if (resetBtn && state.answers && Object.keys(state.answers).length > 0) {
      resetBtn.hidden = false;
    }

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
      if (!head || !body) return;

      head.addEventListener("click", (e) => {
        // kui klikitakse lisainfo nupule/elemendile, ära toggle samm
        if (e.target && e.target.closest && e.target.closest(".info")) return;
        if (step.classList.contains("is-locked")) return;

        const expanded = head.getAttribute("aria-expanded") === "true";
        head.setAttribute("aria-expanded", String(!expanded));
        body.style.display = expanded ? "none" : "block";
      });

      // next/back
      step.querySelectorAll("[data-next]").forEach(btn => {
        btn.addEventListener("click", () => {
          const n = getStepNum(step);
          if (!isStepComplete(n)) return;
          gotoStep(n + 1);
        });
      });

      step.querySelectorAll("[data-back]").forEach(btn => {
        btn.addEventListener("click", () => gotoStep(getStepNum(step) - 1));
      });

      // info toggles (+ klaviatuur)
      step.querySelectorAll(".info").forEach(infoBtn => {
        const toggleInfo = (ev) => {
          ev.stopPropagation();
          const key = infoBtn.getAttribute("data-info");
          const panel = document.querySelector(`.info__panel[data-panel="${key}"]`);
          if (!panel) return;
          panel.hidden = !panel.hidden;
        };

        infoBtn.addEventListener("click", toggleInfo);
        infoBtn.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            toggleInfo(ev);
          }
        });
      });
    });

    // answer change save + unlock (+ re-render if results visible)
    document.querySelectorAll('input[type="radio"]').forEach(r => {
      r.addEventListener("change", () => {
        const name = r.name;
        const value = Number(r.value);
        state.answers = state.answers || {};
        state.answers[name] = value;
        saveState(state);
        applyUnlocks();

        if (results && !results.hidden && isStepComplete(6)) {
          renderResults();
        }
      });
    });

    startBtn?.addEventListener("click", () => {
      if (resetBtn) resetBtn.hidden = false;

      // 1) scroll progressi juurde
      if (progressSection) {
        progressSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // 2) avame Samm 1 väikese viivitusega
      window.setTimeout(() => {
        gotoStep(1);
      }, 250);
    });

    resetBtn?.addEventListener("click", resetAll);

    showResultBtn?.addEventListener("click", () => {
      if (!isStepComplete(6)) return;

      state.seenResults = true;
      saveState(state);

      renderResults();
      if (results) results.hidden = false;
      if (results) results.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    updateProgress();
    updateShowResultButton();
    updateNextButtons();
  }

  function updateShowResultButton() {
    if (!showResultBtn) return;
    showResultBtn.disabled = !isStepComplete(6);
  }

  function updateNextButtons() {
    // iga sammu "Järgmine" disabled kuni sammu vastus on valitud
    for (let n = 1; n <= 5; n++) {
      const stepEl = steps.find(s => getStepNum(s) === n);
      if (!stepEl) continue;

      const nextBtn = stepEl.querySelector('[data-next]');
      if (!nextBtn) continue;

      nextBtn.disabled = !isStepComplete(n);
    }
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
    steps.forEach(s => s.classList.add("is-locked"));
    const s1 = steps.find(s => getStepNum(s) === 1);
    if (s1) s1.classList.remove("is-locked");

    for (let i = 2; i <= 6; i++) {
      const prevComplete = isStepComplete(i - 1);
      const stepEl = steps.find(s => getStepNum(s) === i);
      if (stepEl && prevComplete) stepEl.classList.remove("is-locked");
    }

    updateProgress();
    updateShowResultButton();
    updateNextButtons();

    if (isStepComplete(6) && state.seenResults) {
      renderResults();
      if (results) results.hidden = false;
    }
  }

  function gotoStep(n) {
    if (n < 1 || n > 6) return;

    const stepEl = steps.find(s => getStepNum(s) === n);
    if (!stepEl) return;
    if (stepEl.classList.contains("is-locked")) return;

    steps.forEach(s => {
      const head = s.querySelector(".step__head");
      const body = s.querySelector(".step__body");
      if (!head || !body) return;
      head.setAttribute("aria-expanded", "false");
      body.style.display = "none";
    });

    const head = stepEl.querySelector(".step__head");
    const body = stepEl.querySelector(".step__body");
    if (!head || !body) return;

    head.setAttribute("aria-expanded", "true");
    body.style.display = "block";

    stepEl.scrollIntoView({ behavior: "smooth", block: "start" });
    updateProgress();
    updateShowResultButton();
    updateNextButtons();
  }

  function updateProgress() {
    const completed = [1, 2, 3, 4, 5, 6].filter(n => isStepComplete(n)).length;
    if (progressLabel) progressLabel.textContent = `Samm ${Math.min(completed, 6)} / 6`;
    const pct = (completed / 6) * 100;
    if (progressFill) progressFill.style.width = `${pct}%`;

    const bar = document.querySelector(".progress__bar");
    if (bar) bar.setAttribute("aria-valuenow", String(completed));
  }

  function computeOverall(a) {
    const maxPoints = 24;
    let sum = 0;
    for (const k of Object.keys(weights)) {
      const v = Number(a[k] ?? 0);
      sum += v * weights[k];
    }
    const ratio = sum / maxPoints;

    const evidence0 = Number(a.evidence) === 0;
    const limitation0 = Number(a.limitation) === 0;

    let level = "mid";
    if (ratio >= 0.75) level = "ok";
    else if (ratio >= 0.50) level = "mid";
    else level = "bad";

    if (evidence0 || limitation0) {
      if (level === "ok") level = "mid";
      if (evidence0 && limitation0) level = "bad";
    }

    return level;
  }

  // -----------------------
  // II FAAS — templates + generaatorid
  // -----------------------

  function decide(a) {
    const overall = computeOverall(a);
    if (overall === "ok") return "JAH";
    if (overall === "mid") return "TINGIMUSLIKULT";
    return "EI";
  }

  function pickReasons(a) {
    const reasons = [];
    const decision = decide(a);

    const weakCount = ["basis", "breach", "damage", "evidence", "defenses", "limitation"]
      .map(k => Number(a[k]))
      .filter(v => v <= 1).length;

    const add = (key, text) => {
      if (!text) return;
      if (reasons.some(r => r.key === key)) return;
      reasons.push({ key, text });
    };

    const T = {
      limitation: {
        0: "Aegumise risk võib oluliselt piirata nõude maksmapanekut ja vajab esmast kontrolli.",
        1: "Aegumisküsimus on ebaselge ning vajab täpsustamist enne edasist sammu.",
        2: (decision !== "JAH") ? "Aegumisoht ei näi tõenäoline, kuid mõistlik on teha kontroll." : "",
        3: ""
      },
      evidence: {
        0: "Asjakohased tõendid ei toeta väidet piisaval määral; enne edasist sammu on vaja tõendibaasi täiendada.",
        1: "Tõendite maht või kvaliteet võib olla ebapiisav; risk sõltub sellest, kas tõendeid saab juurde.",
        2: (decision !== "JAH") ? "Tõendeid on olemas, kuid nende katvus vajab kriitilist ülevaatust." : "",
        3: ""
      },
      basis: {
        0: "Kohustuse olemasolu ei ole esialgse hinnangu alusel tuvastatav; nõude alus vajab ümber sõnastamist ja allikate kinnitamist.",
        1: "Kohustuse sisu vajab olulist täpsustamist, et nõude alus oleks selge.",
        2: "",
        3: ""
      },
      breach: {
        0: "Rikkumise olemasolu või seos kohustusega ei ole piisavalt tuvastatav; vaja on selgemat rikkumise kirjeldust.",
        1: "Rikkumise seos konkreetse kohustusega võib olla vaieldav ja vajab täpsustamist.",
        2: "",
        3: ""
      },
      damage: {
        0: "Nõude suurus ei ole rahaliselt määratletud ega põhjendatud; vaja on arvutuskäiku ja alusandmeid.",
        1: "Nõude suurus vajab täiendavat põhjendust ja selgemat arvutuskäiku.",
        2: "",
        3: ""
      },
      defenses: {
        0: "Võimalikud vastuväited võivad oluliselt piirata nõude elujõulisust; vaja on koostada vastuväidete käsitlus.",
        1: "Vaidlusrisk on arvestatav; mõistlik on kaardistada peamised vastuväited ja vastused neile.",
        2: "",
        3: ""
      },
      weakCount:
        "Mitme riskikoha koosesinemine suurendab ebakindlust; enne edasist sammu tasub nõrku komponente sihipäraselt parandada."
    };

    if (Number(a.limitation) <= 1) add("limitation", T.limitation[Number(a.limitation)]);
    if (Number(a.evidence) <= 1) add("evidence", T.evidence[Number(a.evidence)]);

    const core = ["basis", "breach", "damage"]
      .map(k => ({ k, v: Number(a[k]) }))
      .filter(x => x.v <= 1)
      .sort((x, y) => x.v - y.v);

    for (const x of core.slice(0, 2)) add(x.k, T[x.k][x.v]);

    if (Number(a.defenses) <= 1) add("defenses", T.defenses[Number(a.defenses)]);

    if (reasons.length < 3 && weakCount >= 4) add("weakCount", T.weakCount);

    return reasons.slice(0, 3);
  }

  function generateConditions(a) {
    const decision = decide(a);
    if (decision === "JAH") return [];

    const cond = [];
    const add = (t) => {
      if (!t) return;
      if (cond.includes(t)) return;
      if (cond.length >= 3) return;
      cond.push(t);
    };

    if (Number(a.limitation) <= 1) add("Aegumise küsimus vajab kontrolli.");
    if (Number(a.evidence) <= 1) add("Tõendibaasi tuleb täiendada.");

    const coreWeak = ["basis", "breach", "damage"].some(k => Number(a[k]) <= 1);
    if (coreWeak) add("Nõude tuuma komponent vajab täpsustamist (alus/rikkumine/kahju).");

    if (Number(a.defenses) === 0) add("Vastuväidete käsitlus on vajalik.");

    return cond;
  }

  function generateActionPlan(a) {
    // [{ key, title, items: [string|{html}] }]
    const plan = [];

    const addSection = (key, title, items) => {
      if (!items || items.length === 0) return;
      plan.push({ key, title, items });
    };

    if (Number(a.basis) <= 1) {
      addSection("basis", "Nõude alus", [
        "Kirjuta ühe lausega üles: – kes pidi midagi tegema – mida täpselt pidi tegema – millal pidi tegema.",
        "Pane kirja, millele see kohustus tugines (nt leping, kokkulepe, kirjavahetus, seadus).",
        "Kirjelda 3–5 lühilausena, mis oli kohustuse sisu (ilma hinnangute ja oletusteta).",
        "Mõtle, mida Sa tegelikult nõuad (nt raha, kohustuse täitmist, kahju hüvitamist)."
      ]);
    }

    if (Number(a.breach) <= 1) {
      addSection("breach", "Rikkumine", [
        "Kirjelda faktina, mida tehti valesti, hilinemisega või jäeti tegemata.",
        "Seo rikkumine konkreetse kohustusega (st millist lubadust või kokkulepet ei täidetud).",
        "Koosta lihtne kronoloogia: – kuupäev – mis toimus – millest see selgub (nt e-kiri, arve, sõnum)."
      ]);
    }

    if (Number(a.damage) <= 1) {
      addSection("damage", "Kahju", [
        "Pane kirja, millest nõude summa koosneb.",
        "Kirjuta lahti arvutuskäik (nt summa × periood, konkreetne arve, kuludokumendid).",
        "Erista: – tegelik kahju – hinnangulised või tulevased kulud.",
        "Mõtle läbi, miks just see rikkumine kahju tekitas (st kuidas rikkumine viis rahalise kaotuseni).",
        { html: 'Viivise ja intressi kalkulaator: <a href="https://viivisekalkulaator.ee/calculator/debt" target="_blank" rel="noopener">viivisekalkulaator.ee</a>' }
      ]);
    }

    if (Number(a.evidence) <= 1) {
      addSection("evidence", "Tõendid", [
        "Koosta nimekiri olemasolevatest tõenditest (nt leping, kirjavahetus, arve, akt, foto).",
        "Märgi iga tõendi juurde, millist väidet see kinnitab (nt kohustuse olemasolu, rikkumise toimumine, kahju suurus).",
        "Mõtle, kas mõne olulise väite kohta on tõend puudu.",
        "Koonda failid ühtsesse loogilisse struktuuri (nt kaustad või failinimed)."
      ]);
    }

    if (Number(a.defenses) <= 1) {
      addSection("defenses", "Vastuväited", [
        "Mõtle, millistele väidetele teine pool võiks vastu vaielda.",
        "Pane kirja 2–3 kõige tõenäolisemat vastuväidet.",
        "Kirjuta iga vastuväite juurde lühike vastus (fakt + olemasolev tõend).",
        "Märgi, milline vastuväide tundub Sulle kõige nõrgem koht."
      ]);
    }

    if (Number(a.limitation) <= 1) {
      addSection("limitation", "Aegumine", [
        "Pane kirja olulised kuupäevad: – millal kokkulepe sõlmiti – millal rikkumine toimus – millal kahju ilmnes – millal teist poolt teavitati (kui teavitati).",
        "Mõtle, millal nõue muutus tegelikult sissenõutavaks (st hetk, mil teisel poolel oleks tulnud kohustus täita).",
        "Kontrolli, kas vahepeal toimus midagi, mis võis aega mõjutada (nt kirjavahetus, osaline tasumine, läbirääkimised).",
        "Mõtle, kas Sinu juhtum võib kuuluda valdkonda, kus tähtajad on tavapärasest erinevad (nt töö-, üüri- või tarbijavaidlus).",
        "Kui Sa ei ole kindel, on mõistlik seda käsitleda riskina ja arvestada sellega edasiste sammude planeerimisel."
      ]);
    }

    return plan;
  }

  function renderPhase2(a) {
    if (!reasonsCard || !reasonsList || !conditionsCard || !conditionsList || !actionCard || !actionList) {
      return;
    }

    const decision = decide(a);
    const reasons = pickReasons(a);
    const conditions = generateConditions(a);
    const plan = generateActionPlan(a);

    // Põhjendused
    reasonsList.innerHTML = "";
    reasons.forEach(r => {
      const li = document.createElement("li");
      li.textContent = r.text;
      reasonsList.appendChild(li);
    });
    reasonsCard.hidden = reasons.length === 0;

    // Tingimused
    conditionsList.innerHTML = "";
    conditions.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      conditionsList.appendChild(li);
    });
    conditionsCard.hidden = (decision === "JAH" || conditions.length === 0);

    // Tööplaan: sektsioonid (collapsible)
    actionList.innerHTML = "";

    plan.forEach(sec => {
      const li = document.createElement("li");
      li.className = "plansec";
      li.setAttribute("aria-expanded", "false"); // vaikimisi kinni

      const head = document.createElement("div");
      head.className = "plansec__head";
      head.setAttribute("role", "button");
      head.setAttribute("tabindex", "0");
      head.setAttribute("aria-label", sec.title);

      const title = document.createElement("div");
      title.className = "plansec__title";
      title.textContent = sec.title;

      const chev = document.createElement("div");
      chev.className = "plansec__chev";
      chev.textContent = "▼";

      head.appendChild(title);
      head.appendChild(chev);

      const ul = document.createElement("ul");
      ul.className = "plansec__items";

      sec.items.forEach(item => {
        const i = document.createElement("li");
        if (typeof item === "string") {
          i.textContent = item;
        } else if (item && typeof item === "object" && item.html) {
          i.innerHTML = item.html;
        }
        ul.appendChild(i);
      });

      const toggle = () => {
        const expanded = li.getAttribute("aria-expanded") === "true";
        li.setAttribute("aria-expanded", expanded ? "false" : "true");
      };

      head.addEventListener("click", toggle);
      head.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });

      li.appendChild(head);
      li.appendChild(ul);
      actionList.appendChild(li);
    });

    // esimene sektsioon lahti (kui olemas)
    const first = actionList.querySelector(".plansec");
    if (first) first.setAttribute("aria-expanded", "true");

    actionCard.hidden = plan.length === 0;
  }

  // -----------------------
  // I FAAS tulemuse render
  // -----------------------
  function renderResults() {
    const a = state.answers || {};
    const overall = computeOverall(a);

    state.seenResults = true;
    saveState(state);

    const statusText =
      overall === "ok" ? "🟢 Tugev riskiprofiil"
      : overall === "mid" ? "🟡 Mõõdukas riskiprofiil"
      : "🔴 Nõrk riskiprofiil";

    if (overallText) overallText.textContent = statusText;
    if (overallStatusDot) overallStatusDot.setAttribute("data-level", overall);

    if (!componentGrid) return;
    componentGrid.innerHTML = "";

    const order = ["basis", "breach", "damage", "evidence", "defenses", "limitation"];
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
            <span class="muted small">${
              v >= 2 ? (v === 3 ? "Tugev" : "Piisav") : (v === 1 ? "Nõrk" : "Kriitiline")
            }</span>
          </div>
        </div>
        <div class="kcard__desc">${shortNotes[key][String(v)] ?? "—"}</div>
      `;
      componentGrid.appendChild(card);
    });

    // II FAAS
    renderPhase2(a);
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
