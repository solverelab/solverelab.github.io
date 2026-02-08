(() => {
  // Shared storage across ET/RU (your choice = 1)
  const STORAGE_KEY = "solverelab.phase1.v1";

  const weights = {
    basis: 1,
    breach: 1,
    damage: 1,
    defenses: 1,
    evidence: 2,
    limitation: 2
  };

  // RU-only text pack (NO ET strings here)
  const T = {
    progressPrefix: "Шаг",
    progressOf: "/ 6",
    statusText: {
      ok: "🟢 Сильный риск-профиль",
      mid: "🟡 Умеренный риск-профиль",
      bad: "🔴 Слабый риск-профиль"
    },
    labels: {
      basis: "Основание требования",
      breach: "Нарушение",
      damage: "Ущерб / сумма",
      evidence: "Доказательства",
      defenses: "Возражения",
      limitation: "Срок давности"
    },
    gradeWord: (v) =>
      (v >= 2 ? (v === 3 ? "Сильный" : "Достаточный") : (v === 1 ? "Слабый" : "Критический")),
    shortNotes: {
      basis: {
        3: "Основание чётко определимо.",
        2: "Основание есть, но без письменного подтверждения.",
        1: "Требуется уточнение содержания обязанности.",
        0: "Основание не определяется."
      },
      breach: {
        3: "Нарушение чётко установимо.",
        2: "Вероятно, но подтверждено неполностью.",
        1: "Спорно.",
        0: "Неясно."
      },
      damage: {
        3: "Расчёт проверяем.",
        2: "Приблизимый расчёт.",
        1: "Неопределённо.",
        0: "В деньгах не определено."
      },
      evidence: {
        3: "Сильная доказательственная база.",
        2: "Доказательства есть.",
        1: "Доказательства ограниченные.",
        0: "Доказательства отсутствуют."
      },
      defenses: {
        3: "Низкий риск спора.",
        2: "Риск спора возможен.",
        1: "Высокий риск спора.",
        0: "Возражения могут быть очень сильными."
      },
      limitation: {
        3: "Риск давности не выявлен.",
        2: "Маловероятно.",
        1: "Возможно.",
        0: "Вероятно."
      }
    },
    phase2: {
      reasons: {
        limitation: {
          0: "Риск истечения срока давности может существенно ограничить предъявление требования и требует первичной проверки.",
          1: "Вопрос давности неясен и требует уточнения перед следующим шагом.",
          2: "Риск давности не выглядит вероятным, но разумно выполнить проверку.",
          3: ""
        },
        evidence: {
          0: "Доказательства недостаточно поддерживают утверждение; перед следующим шагом необходимо усилить доказательственную базу.",
          1: "Объём или качество доказательств может быть недостаточным; риск зависит от возможности получить дополнительные доказательства.",
          2: "Доказательства есть, но их покрытие требует критической проверки.",
          3: ""
        },
        basis: {
          0: "Наличие обязанности по первичной оценке не определяется; основание требования требует переформулирования и подтверждения источников.",
          1: "Содержание обязанности требует существенного уточнения, чтобы основание было ясным.",
          2: "",
          3: ""
        },
        breach: {
          0: "Наличие нарушения или его связь с обязанностью недостаточно определимы; требуется более чёткое описание нарушения.",
          1: "Связь нарушения с конкретной обязанностью может быть спорной и требует уточнения.",
          2: "",
          3: ""
        },
        damage: {
          0: "Сумма требования не определена и не обоснована; нужен расчёт и исходные данные.",
          1: "Сумма требования требует дополнительного обоснования и более ясного расчёта.",
          2: "",
          3: ""
        },
        defenses: {
          0: "Потенциальные возражения могут существенно снизить жизнеспособность требования; необходима проработка возражений.",
          1: "Риск спора существенный; разумно определить ключевые возражения и ответы на них.",
          2: "",
          3: ""
        },
        weakCount:
          "Совокупность нескольких зон риска повышает неопределённость; перед следующим шагом целесообразно целенаправленно улучшить слабые компоненты."
      },
      conditions: {
        limitation: "Вопрос срока давности требует проверки.",
        evidence: "Необходимо усилить доказательственную базу.",
        core: "Требуется уточнение ключевого компонента требования (основание/нарушение/сумма).",
        defenses0: "Необходима проработка возражений."
      },
      action: {
        basisTitle: "Основание требования",
        basis: [
          "Запишите одним предложением: — кто должен был что-то сделать — что именно — когда.",
          "Укажите, на чём основана обязанность (договор, договорённость, переписка, закон).",
          "Опишите 3–5 короткими фразами содержание обязанности (без оценок и предположений).",
          "Уточните, что именно вы требуете (деньги, исполнение, возмещение ущерба)."
        ],
        breachTitle: "Нарушение",
        breach: [
          "Опишите фактами, что было сделано неверно, с задержкой или не сделано.",
          "Свяжите нарушение с конкретной обязанностью (какое обещание/условие не выполнено).",
          "Составьте простую хронологию: — дата — что произошло — из чего это следует (письмо, счёт, сообщение)."
        ],
        damageTitle: "Ущерб / сумма",
        damage: [
          "Запишите, из чего складывается сумма требования.",
          "Раскройте расчёт (сумма × период, конкретный счёт, документы расходов).",
          "Разделите: — фактический ущерб — оценочные/будущие расходы.",
          "Продумайте причинную связь: почему именно это нарушение привело к денежным потерям.",
          { html: 'Калькулятор пени/процентов: <a href="https://viivisekalkulaator.ee/calculator/debt" target="_blank" rel="noopener">viivisekalkulaator.ee</a>' }
        ],
        evidenceTitle: "Доказательства",
        evidence: [
          "Составьте список имеющихся доказательств (договор, переписка, счёт, акт, фото).",
          "Укажите для каждого доказательства, какое утверждение оно подтверждает (обязанность, нарушение, сумму).",
          "Проверьте, по каким ключевым утверждениям доказательств не хватает.",
          "Соберите файлы в логичную структуру (папки/названия)."
        ],
        defensesTitle: "Возражения",
        defenses: [
          "Подумайте, с чем другая сторона может спорить.",
          "Запишите 2–3 наиболее вероятных возражения.",
          "Для каждого возражения напишите короткий ответ (факт + имеющееся доказательство).",
          "Отметьте, какое возражение является самым слабым местом."
        ],
        limitationTitle: "Срок давности",
        limitation: [
          "Запишите ключевые даты: — заключение договорённости — нарушение — проявление ущерба — уведомление другой стороны (если было).",
          "Определите, когда требование стало фактически подлежащим исполнению (когда обязанность должна была быть выполнена).",
          "Проверьте, было ли что-то, что могло повлиять на сроки (переписка, частичная оплата, переговоры).",
          "Оцените, не относится ли случай к сфере с иными сроками (трудовые, аренда, потребительские споры).",
          "Если вы не уверены, разумно считать это риском при планировании дальнейших шагов."
        ]
      }
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

  // Phase 2 DOM
  const reasonsCard = document.getElementById("reasonsCard");
  const reasonsList = document.getElementById("reasonsList");
  const conditionsCard = document.getElementById("conditionsCard");
  const conditionsList = document.getElementById("conditionsList");
  const actionCard = document.getElementById("actionCard");
  const actionList = document.getElementById("actionList");

  const state = loadState();
  init();

  function init() {
    if (resetBtn) resetBtn.hidden = true;
    if (resetBtn && state.answers && Object.keys(state.answers).length > 0) resetBtn.hidden = false;

    // restore answers
    for (const [k, v] of Object.entries(state.answers || {})) {
      const el = document.querySelector(`input[name="${k}"][value="${v}"]`);
      if (el) el.checked = true;
    }

    applyUnlocks();

    // step handlers
    steps.forEach(step => {
      const head = step.querySelector(".step__head");
      const body = step.querySelector(".step__body");

      head.addEventListener("click", (e) => {
        const target = e.target;
        if (target && target.classList && target.classList.contains("info")) return;
        if (step.classList.contains("is-locked")) return;

        const expanded = head.getAttribute("aria-expanded") === "true";
        head.setAttribute("aria-expanded", String(!expanded));
        body.style.display = expanded ? "none" : "block";
        step.classList.toggle("is-open", !expanded);
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

      // info toggles
      step.querySelectorAll(".info").forEach(infoBtn => {
        const toggle = (e) => {
          e.stopPropagation();
          const key = infoBtn.getAttribute("data-info");
          const panel = document.querySelector(`.info__panel[data-panel="${key}"]`);
          if (!panel) return;
          panel.hidden = !panel.hidden;
        };
        infoBtn.addEventListener("click", toggle);
        infoBtn.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle(e);
          }
        });
      });
    });

    // radio changes
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

      if (progressSection) {
        progressSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }

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

    steps.forEach(s => {
      const n = getStepNum(s);
      s.classList.toggle("is-done", isStepComplete(n));
    });

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
      head.setAttribute("aria-expanded", "false");
      body.style.display = "none";
      s.classList.remove("is-open");
    });

    const head = stepEl.querySelector(".step__head");
    const body = stepEl.querySelector(".step__body");
    head.setAttribute("aria-expanded", "true");
    body.style.display = "block";
    stepEl.classList.add("is-open");

    stepEl.scrollIntoView({ behavior: "smooth", block: "start" });
    updateProgress();
    updateShowResultButton();
    updateNextButtons();
  }

  function updateProgress() {
    const completed = [1, 2, 3, 4, 5, 6].filter(n => isStepComplete(n)).length;
    if (progressLabel) progressLabel.textContent = `${T.progressPrefix} ${Math.min(completed, 6)} ${T.progressOf}`;
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

  // Internal decision enums (not displayed)
  function decide(a) {
    const overall = computeOverall(a);
    if (overall === "ok") return "YES";
    if (overall === "mid") return "CONDITIONAL";
    return "NO";
  }

  function pickReasons(a) {
    const reasons = [];
    const decision = decide(a);

    const weakCount = ["basis","breach","damage","evidence","defenses","limitation"]
      .map(k => Number(a[k]))
      .filter(v => v <= 1).length;

    const add = (key, text) => {
      if (!text) return;
      if (reasons.some(r => r.key === key)) return;
      reasons.push({ key, text });
    };

    const R = T.phase2.reasons;

    if (Number(a.limitation) <= 1) add("limitation", R.limitation[Number(a.limitation)]);
    if (Number(a.evidence) <= 1) add("evidence", R.evidence[Number(a.evidence)]);

    const core = ["basis","breach","damage"]
      .map(k => ({ k, v: Number(a[k]) }))
      .filter(x => x.v <= 1)
      .sort((x,y) => x.v - y.v);

    for (const x of core.slice(0,2)) add(x.k, R[x.k][x.v]);

    if (Number(a.defenses) <= 1) add("defenses", R.defenses[Number(a.defenses)]);

    if (reasons.length < 3 && weakCount >= 4) add("weakCount", R.weakCount);

    // if decision is strong, keep reasons concise
    if (decision === "YES") return reasons.slice(0, 2);

    return reasons.slice(0, 3);
  }

  function generateConditions(a) {
    const decision = decide(a);
    if (decision === "YES") return [];

    const cond = [];
    const add = (t) => {
      if (!t) return;
      if (cond.includes(t)) return;
      if (cond.length >= 3) return;
      cond.push(t);
    };

    const C = T.phase2.conditions;

    if (Number(a.limitation) <= 1) add(C.limitation);
    if (Number(a.evidence) <= 1) add(C.evidence);

    const coreWeak = ["basis","breach","damage"].some(k => Number(a[k]) <= 1);
    if (coreWeak) add(C.core);

    if (Number(a.defenses) === 0) add(C.defenses0);

    return cond;
  }

  function generateActionPlan(a) {
    const plan = [];
    const A = T.phase2.action;

    const addSection = (key, title, items) => {
      if (!items || items.length === 0) return;
      plan.push({ key, title, items });
    };

    if (Number(a.basis) <= 1) addSection("basis", A.basisTitle, A.basis);
    if (Number(a.breach) <= 1) addSection("breach", A.breachTitle, A.breach);
    if (Number(a.damage) <= 1) addSection("damage", A.damageTitle, A.damage);
    if (Number(a.evidence) <= 1) addSection("evidence", A.evidenceTitle, A.evidence);
    if (Number(a.defenses) <= 1) addSection("defenses", A.defensesTitle, A.defenses);
    if (Number(a.limitation) <= 1) addSection("limitation", A.limitationTitle, A.limitation);

    return plan;
  }

  function renderPhase2(a) {
    if (!reasonsCard || !reasonsList || !conditionsCard || !conditionsList || !actionCard || !actionList) return;

    const decision = decide(a);
    const reasons = pickReasons(a);
    const conditions = generateConditions(a);
    const plan = generateActionPlan(a);

    // reasons
    reasonsList.innerHTML = "";
    reasons.forEach(r => {
      const li = document.createElement("li");
      li.textContent = r.text;
      reasonsList.appendChild(li);
    });
    reasonsCard.hidden = reasons.length === 0;

    // conditions
    conditionsList.innerHTML = "";
    conditions.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      conditionsList.appendChild(li);
    });
    conditionsCard.hidden = (decision === "YES" || conditions.length === 0);

    // action plan (collapsible)
    actionList.innerHTML = "";

    plan.forEach(sec => {
      const li = document.createElement("li");
      li.className = "plansec";
      li.setAttribute("aria-expanded", "false");

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
        if (typeof item === "string") i.textContent = item;
        else if (item && typeof item === "object" && item.html) i.innerHTML = item.html;
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

    const first = actionList.querySelector(".plansec");
    if (first) first.setAttribute("aria-expanded", "true");

    actionCard.hidden = plan.length === 0;
  }

  function renderResults() {
    const a = state.answers || {};
    const overall = computeOverall(a);

    state.seenResults = true;
    saveState(state);

    if (overallText) overallText.textContent = T.statusText[overall] || "—";
    if (overallStatusDot) overallStatusDot.setAttribute("data-level", overall);

    if (!componentGrid) return;
    componentGrid.innerHTML = "";

    const order = ["basis","breach","damage","evidence","defenses","limitation"];
    order.forEach(key => {
      const v = Number(a[key]);
      const lvl = v >= 2 ? (v === 3 ? "ok" : "mid") : "bad";

      const card = document.createElement("div");
      card.className = "kcard";
      card.innerHTML = `
        <div class="kcard__top">
          <div class="kcard__name">${T.labels[key]}</div>
          <div class="kcard__mark">
            <span class="kdot ${lvl}"></span>
            <span class="muted small">${T.gradeWord(v)}</span>
          </div>
        </div>
        <div class="kcard__desc">${T.shortNotes[key][String(v)] ?? "—"}</div>
      `;
      componentGrid.appendChild(card);
    });

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
