(function () {
  "use strict";

  // -------- Helpers --------
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  };

  function safeNumberFromText(txt) {
    if (!txt) return null;
    const cleaned = String(txt).replace(/\s/g, "").replace(",", ".");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  function formatDateISOToEE(iso) {
    if (!iso) return "";
    // iso = yyyy-mm-dd
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return iso;
    return `${m[3]}.${m[2]}.${m[1]}`;
  }

  // -------- DOM --------
  const startBtn = $("#startBtn");
  const formCard = $("#formCard");
  const resultCard = $("#resultCard");
  const questionsWrap = $("#questions");

  const resetBtn = $("#resetBtn");
  const calcBtn = $("#calcBtn");

  const riskBadge = $("#riskBadge");
  const scoreLine = $("#scoreLine");
  const missingList = $("#missingList");
  const nextSteps = $("#nextSteps");

  const draft = $("#draft");
  const copyBtn = $("#copyBtn");
  const printBtn = $("#printBtn");

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Optional inputs
  const claimAmountInput = $("#claimAmount");
  const keyDateInput = $("#keyDate");
  const factsShortInput = $("#factsShort");

  // -------- Questions (non-jurist friendly) --------
  // NOTE: You asked earlier to avoid forcing the defendant name: we keep it optional.
  const QUESTIONS = [
    {
      id: "q1",
      title: "1. Kelle vastu Sa nõude esitad?",
      q: "Kas Sa tead täpselt, kellelt raha või kohustuse täitmist nõuad (õige inimene või ettevõte)?",
      explain: "Oluline on esitada nõue õigele isikule. Vale vastaspoole korral võib nõue jääda rahuldamata ka siis, kui Sul on sisuliselt õigus.",
      weight: 2,
    },
    {
      id: "q2",
      title: "2. Mida Sa täpselt nõuad?",
      q: "Kas suudad ühe lausega selgelt öelda, mida Sa nõuad ja mis põhjusel? (nt „Soovin 3 500 eurot tasumata töö eest.“)",
      explain: "Nõue peab olema selge ja arusaadav. Kohus peab aru saama, mida täpselt taotled.",
      weight: 2,
    },
    {
      id: "q3",
      title: "3. Kas nõutav summa on selgelt välja arvutatud?",
      q: "Kas nõutav summa on täpselt teada või on olemas arvutus (nt arve, hinnakiri, kalkulatsioon)?",
      explain: "Rahasumma peab põhinema dokumentidel või selgel arvutusel. Ilma selleta võib nõue jääda tõendamata.",
      weight: 2,
    },
    {
      id: "q4",
      title: "4. Kas sündmuste järjekord on selge?",
      q: "Kas Sul on kirjas kuupäevad ja sündmused: kokkulepe, tähtaeg, rikkumine ja edasised teavitused?",
      explain: "Kohus hindab asjaolusid ajaliselt. Selge kronoloogia aitab näidata, millal ja kuidas kohustus jäi täitmata.",
      weight: 1,
    },
    {
      id: "q5",
      title: "5. Kas kokkulepet saab tõendada?",
      q: "Kas Sul on dokument või muu tõend kokkuleppe kohta (leping, e-kiri, sõnumid, arve vms)?",
      explain: "Isegi suuline kokkulepe võib olla kehtiv, kuid seda peab suutma tõendada.",
      weight: 2,
    },
    {
      id: "q6",
      title: "6. Kas oled ise oma kohustuse täitnud?",
      q: "Kas saad tõendada, et täitsid oma osa kokkuleppest (nt tegid töö, andsid kauba üle)?",
      explain: "Üldjuhul saab nõuda täitmist või tasu siis, kui oled ise oma kohustuse täitnud.",
      weight: 2,
    },
    {
      id: "q7",
      title: "7. Kas kohustuse suurust näitav dokument on olemas?",
      q: "Kas Sul on arve või muu dokument, mis näitab, kui suur kohustus oli?",
      explain: "Dokument aitab tõendada nõude suurust ja selle aluseid.",
      weight: 1,
    },
    {
      id: "q8",
      title: "8. Kas oled enne kohtusse pöördumist teavitanud?",
      q: "Kas oled teisele poolele kirjalikult teada andnud, et nõuad tasumist või kohustuse täitmist (nt meeldetuletus, maksenõue)?",
      explain: "See ei ole alati kohustuslik, kuid näitab, et andsid võimaluse vaidlus lahendada ilma kohtuta.",
      weight: 1,
    },
  ];

  const OPTIONS = [
    { value: "yes", label: "Jah", score: 0 },
    { value: "no", label: "Ei", score: 1 },
    { value: "unsure", label: "Ei ole kindel", score: 0.5 },
  ];

  // -------- Render questions --------
  function renderQuestions() {
    if (!questionsWrap) return;
    questionsWrap.innerHTML = "";

    QUESTIONS.forEach((item) => {
      const block = el("div", "qblock");

      const h = el("h3", "qtitle");
      h.textContent = item.title;
      block.appendChild(h);

      const p = el("p", "qtext");
      p.textContent = item.q;
      block.appendChild(p);

      const row = el("div", "qoptions");
      OPTIONS.forEach((opt) => {
        const label = el("label", "qopt");
        const input = el("input");
        input.type = "radio";
        input.name = item.id;
        input.value = opt.value;

        // default: "unsure"
        if (opt.value === "unsure") input.checked = true;

        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + opt.label));
        row.appendChild(label);
      });
      block.appendChild(row);

      const exp = el("p", "qexplain");
      exp.textContent = "Selgitus: " + item.explain;
      block.appendChild(exp);

      questionsWrap.appendChild(block);
    });
  }

  function getAnswers() {
    const answers = {};
    QUESTIONS.forEach((q) => {
      const chosen = document.querySelector(`input[name="${q.id}"]:checked`);
      answers[q.id] = chosen ? chosen.value : "unsure";
    });
    return answers;
  }

  // -------- Risk calc --------
  function calcRisk(answers) {
    let raw = 0;
    let max = 0;

    const missing = [];
    QUESTIONS.forEach((q) => {
      const v = answers[q.id] || "unsure";
      const opt = OPTIONS.find((o) => o.value === v) || OPTIONS[2];

      raw += opt.score * q.weight;
      max += 1 * q.weight;

      if (v === "no") missing.push(q.title.replace(/^\d+\.\s*/, ""));
      if (v === "unsure") missing.push(q.title.replace(/^\d+\.\s*/, "") + " (vajab täpsustamist)");
    });

    const ratio = max > 0 ? raw / max : 0;

    let level = "Madal risk";
    let badgeClass = "badge ok";
    if (ratio >= 0.60) { level = "Kõrge risk"; badgeClass = "badge bad"; }
    else if (ratio >= 0.30) { level = "Keskmine risk"; badgeClass = "badge mid"; }

    const scorePct = Math.round((ratio * 100));

    return { ratio, scorePct, level, badgeClass, missing };
  }

  function buildNextSteps(riskObj) {
    const steps = [];
    // Generic, safe steps
    steps.push("Kogu kokku asjakohased dokumendid ja suhtlus (e-kirjad, sõnumid, arved, lepingud).");
    steps.push("Pane kirja lühike ajajoon: kokkulepe → tähtaeg → rikkumine → teavitused.");
    steps.push("Tee selgeks nõude summa: arvutus + alusdokumendid.");
    steps.push("Kui võimalik, saada vastaspoolele kirjalik meeldetuletus/maksenõue (koos tähtajaga).");

    if (riskObj.level === "Keskmine risk" || riskObj.level === "Kõrge risk") {
      steps.push("Täpsusta nõude adressaat (õige isik/ettevõte) ja vajadusel kontrolli andmeid (äriregister vms).");
      steps.push("Kui risk püsib kõrge, kaalu professionaalset ülevaatust (dokumendid + strateegia).");
    }

    return steps;
  }

  // -------- Draft generation (simple skeleton) --------
  function buildDraft() {
    const claimType = (document.querySelector('input[name="claimType"]:checked') || {}).value || "debt";
    const amount = safeNumberFromText(claimAmountInput ? claimAmountInput.value : "") ;
    const keyDate = keyDateInput ? keyDateInput.value : "";
    const factsShort = factsShortInput ? factsShortInput.value : "";

    const amountLine = amount != null ? `${amount.toFixed(2)} EUR` : "[summa] EUR";
    const dateLine = keyDate ? formatDateISOToEE(keyDate) : "[kuupäev]";

    const title = claimType === "damage" ? "Hagiavaldus (kahju hüvitamine) — struktuuri mustand" : "Hagiavaldus (võlanõue) — struktuuri mustand";

    return [
      title,
      "",
      "1. Pooled",
      "- Hageja: [nimi, isikukood/reg nr, aadress, kontakt]",
      "- Kostja: [nimi, isikukood/reg nr, aadress, kontakt]  (valikuline — täida, kui tead)",
      "",
      "2. Nõue (petitum)",
      `- Nõuan kostjalt: ${amountLine} + [viivis/intress kui kohaldub] + menetluskulud.`,
      "- Arvutus: [tabel / valem / lisad].",
      "",
      "3. Asjaolud (ajatelg)",
      `- ${dateLine} — sündmus / tähtaeg: [kirjeldus] (tõend: ...)`,
      "- [kuupäev] — rikkumine ... (tõend: ...)",
      "- [kuupäev] — teavitused/nõuded ... (tõend: ...)",
      "",
      "4. Õiguslik alus (lühidalt)",
      "- [leping / seadus / delikt] (selgita 2–5 lausega, miks on õigus nõuda).",
      "",
      "5. Tõendid",
      "- Tõend 1: ...",
      "- Tõend 2: ...",
      "",
      "6. Lisad",
      "- Lisa 1: ...",
      "- Lisa 2: ...",
      "",
      "Lühike faktikirjeldus (Sinu sisend):",
      factsShort ? `- ${factsShort}` : "- [kirjuta 1–3 lauset]"
    ].join("\n");
  }

  // -------- Events --------
  function show(elm) { if (elm) elm.classList.remove("hidden"); }
  function hide(elm) { if (elm) elm.classList.add("hidden"); }

  if (startBtn) {
    startBtn.addEventListener("click", function () {
      renderQuestions();
      show(formCard);
      hide(resultCard);
      // scroll to questions
      formCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      // reset optional fields
      if (claimAmountInput) claimAmountInput.value = "";
      if (keyDateInput) keyDateInput.value = "";
      if (factsShortInput) factsShortInput.value = "";

      // reset questions to "unsure"
      QUESTIONS.forEach((q) => {
        const unsure = document.querySelector(`input[name="${q.id}"][value="unsure"]`);
        if (unsure) unsure.checked = true;
      });

      hide(resultCard);
    });
  }

  if (calcBtn) {
    calcBtn.addEventListener("click", function () {
      const answers = getAnswers();
      const risk = calcRisk(answers);

      // badge
      if (riskBadge) {
        riskBadge.className = risk.badgeClass;
        riskBadge.textContent = risk.level;
      }
      if (scoreLine) scoreLine.textContent = `Skoor: ${risk.scorePct} / 100`;

      // missing
      if (missingList) {
        missingList.innerHTML = "";
        if (risk.missing.length === 0) {
          const li = el("li");
          li.textContent = "Olulised punktid on esialgselt kaetud.";
          missingList.appendChild(li);
        } else {
          risk.missing.slice(0, 12).forEach((m) => {
            const li = el("li");
            li.textContent = m;
            missingList.appendChild(li);
          });
        }
      }

      // next steps
      if (nextSteps) {
        nextSteps.innerHTML = "";
        buildNextSteps(risk).forEach((s) => {
          const li = el("li");
          li.textContent = s;
          nextSteps.appendChild(li);
        });
      }

      // draft
      if (draft) draft.value = buildDraft();

      show(resultCard);
      resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
      if (!draft) return;
      try {
        await navigator.clipboard.writeText(draft.value);
        alert("Mustand kopeeritud.");
      } catch (e) {
        // fallback
        draft.focus();
        draft.select();
        document.execCommand("copy");
        alert("Mustand kopeeritud.");
      }
    });
  }

  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  // Render questions only after start; but if user reloads mid-page, keep safe:
  // do nothing here.
})();
