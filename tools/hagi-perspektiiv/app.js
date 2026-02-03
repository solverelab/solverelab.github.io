(() => {
  const STAGES = [
    {
      id: "facts",
      title: "Etapp I — Faktiline struktuur",
      intro: "Selles etapis kontrollime, kas nõude faktiline alus on piisavalt selge ja struktureeritud.",
      questions: [
        {
          id: "chronology",
          text: "Kas Sul on sündmuste selge kronoloogia?",
          hint: "Kronoloogia tähendab loogilist ja ajaliselt järjestatud ülevaadet: mis juhtus, millal, kes osales ja mis oli tagajärg.",
          weight: 2
        },
        {
          id: "breach",
          text: "Kas vastaspool rikkus konkreetset kohustust?",
          hint: "Kahju hüvitamist saab nõuda siis, kui teine pool rikkus lepingut, seadusest tulenevat kohustust või käitus hooletult. Kui rikkumist ei saa selgelt kirjeldada, on nõue nõrk.",
          weight: 2,
          answers: ["Jah", "Võimalik", "Ei tea"]
        },
        {
          id: "causation",
          text: "Kas rikkumine põhjustas Sinu kahju?",
          hint: "Põhjuslik seos tähendab, et kahju peab olema rikkumise tagajärg. Kui kahju tekkis muul põhjusel või oleks tekkinud niikuinii, suureneb risk.",
          weight: 2
        }
      ]
    },
    {
      id: "loss",
      title: "Etapp II — Kahju ja nõudesumma",
      intro: "Selles etapis kontrollime, kas kahju on arvutatav ja dokumentidega toetatud.",
      questions: [
        {
          id: "calculable",
          text: "Kas kahju on rahaliselt arvutatav?",
          hint: "Kohtus tuleb esitada konkreetne nõudesumma. Üldine soov “õiglust saada” ei ole nõue — kahju peab olema arvutatav.",
          weight: 2,
          answers: ["Jah", "Ligikaudselt", "Ei"]
        },
        {
          id: "loss_docs",
          text: "Kas Sul on dokumendid, mis kahju tõendavad?",
          hint: "Arved, hinnapakkumised, eksperthinnang või muud alusdokumendid muudavad kahju tõendamise oluliselt tugevamaks.",
          weight: 2
        }
      ]
    },
    {
      id: "evidence",
      title: "Etapp III — Tõendite kontroll",
      intro: "Selles etapis hindame, kas olemasolevad tõendid on piisavad ja kooskõlas.",
      questions: [
        {
          id: "objective_evidence",
          text: "Millised objektiivsed tõendid Sul olemas on?",
          hint: "Objektiivsed tõendid (leping, kirjavahetus, arved, fotod, tunnistajad) on tugevamad kui üksnes suuline väide.",
          type: "multi",
          options: [
            { value: "leping", label: "Leping" },
            { value: "kirjavahetus", label: "Kirjavahetus" },
            { value: "arved", label: "Arved" },
            { value: "fotod", label: "Fotod" },
            { value: "tunnistajad", label: "Tunnistajad" },
            { value: "puuduvad", label: "Puuduvad" }
          ],
          weight: 2
        },
        {
          id: "evidence_consistent",
          text: "Kas tõendid on omavahel kooskõlas?",
          hint: "Kui tõendid räägivad üksteisele vastu või on ebaselged, võib see nõude usaldusväärsust vähendada.",
          weight: 2,
          answers: ["Jah", "Vajavad täpsustamist", "On vastuolulised"]
        }
      ]
    },
    {
      id: "legal",
      title: "Etapp IV — Õiguslik raamistik",
      intro: "Selles etapis kontrollime, kas õiguslik loogika on arusaadav ja kas võib olla tähtaegade risk.",
      questions: [
        {
          id: "legal_basis",
          text: "Kas tead, miks seadus annab Sulle õiguse nõuda?",
          hint: "Õiguslik alus tähendab lihtsat põhjendust: millist õigust rikuti ja miks see annab Sulle nõudeõiguse.",
          weight: 2
        },
        {
          id: "limitation",
          text: "Kas nõue võib olla aegunud?",
          hint: "Üldjuhul kehtib nõuetele 3-aastane tähtaeg alates ajast, mil said (või pidid saama) teada kahju tekkimisest ja sellest, kes kahju põhjustas. Kui tähtaeg võib olla möödunud ja vastaspool sellele tugineb, ei saa kohus nõuet rahuldada.",
          weight: 2,
          answers: ["Ei", "Võimalik", "Ei tea"]
        }
      ]
    },
    {
      id: "risk",
      title: "Etapp V — Menetlusrisk ja otsus",
      intro: "Selles etapis hinnatakse vastaspoole võimalikke vastuväiteid ja menetluskulude riski.",
      questions: [
        {
          id: "counterarguments",
          text: "Kas vastaspool võib esitada põhjendatud vastuväite?",
          hint: "Kohtuvaidlus tähendab kahe poole argumentide võrdlemist. Mõtle läbi, mis on vastaspoole kõige tugevam vastuväide.",
          weight: 2,
          answers: ["Ei", "Jah", "Ei tea"]
        },
        {
          id: "cost_risk",
          text: "Kas oled arvestanud menetluskulude riskiga?",
          hint: "Kui hagi jäetakse rahuldamata, võib tekkida kohustus kanda vastaspoole menetluskulud. Kohtusse pöördumine on rahaline risk.",
          weight: 2
        }
      ]
    }
  ];

  const DEFAULT_ANSWERS = ["Jah", "Osaliselt", "Ei"];
  const SCORE_MAP = {
    "Jah": 2, "Osaliselt": 1, "Ei": 0,
    "Võimalik": 1, "Ei tea": 0,
    "Ligikaudselt": 1,
    "Vajavad täpsustamist": 1, "On vastuolulised": 0
  };

  const STORAGE_KEY = "solverelab_hagi_perspektiiv_v4";
  let state = loadState() || { stageIndex: 0, answers: {} };

  const stageTitle = document.getElementById("stageTitle");
  const stageIntro = document.getElementById("stageIntro");
  const questionForm = document.getElementById("questionForm");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const resetBtn = document.getElementById("resetBtn");
  const jumpToReportBtn = document.getElementById("jumpToReportBtn");

  const reportCard = document.getElementById("reportCard");
  const reportBadges = document.getElementById("reportBadges");
  const overallAssessment = document.getElementById("overallAssessment");
  const keyRisks = document.getElementById("keyRisks");
  const nextSteps = document.getElementById("nextSteps");
  const stageSummary = document.getElementById("stageSummary");

  const backToToolBtn = document.getElementById("backToToolBtn");
  const downloadReportBtn = document.getElementById("downloadReportBtn");
  const printBtn = document.getElementById("printBtn");

  renderStage();

  prevBtn.addEventListener("click", () => {
    if (state.stageIndex > 0) {
      state.stageIndex -= 1;
      saveState();
      reportCard.hidden = true;
      renderStage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  nextBtn.addEventListener("click", () => {
    if (state.stageIndex < STAGES.length - 1) {
      state.stageIndex += 1;
      saveState();
      reportCard.hidden = true;
      renderStage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      openReport();
    }
  });

  resetBtn.addEventListener("click", () => {
    state = { stageIndex: 0, answers: {} };
    saveState();
    reportCard.hidden = true;
    renderStage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  jumpToReportBtn.addEventListener("click", openReport);

  backToToolBtn.addEventListener("click", () => {
    reportCard.hidden = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  downloadReportBtn.addEventListener("click", () => {
    const txt = buildReportText();
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solverelab-noude-eelanaluuus-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  printBtn.addEventListener("click", () => window.print());

  function renderStage() {
    const st = STAGES[state.stageIndex];
    stageTitle.textContent = st.title;
    stageIntro.textContent = st.intro;

    questionForm.innerHTML = "";
    st.questions.forEach((q) => questionForm.appendChild(renderQuestion(q)));

    prevBtn.disabled = state.stageIndex === 0;
    nextBtn.textContent = state.stageIndex === STAGES.length - 1 ? "Vaata raportit →" : "Järgmine →";
  }

  function renderQuestion(q) {
    const wrap = document.createElement("div");
    wrap.className = "q";

    const h = document.createElement("h3");
    h.textContent = q.text;

    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = q.hint;

    const opts = document.createElement("div");
    opts.className = "opts";

    if (q.type === "multi") {
      const current = Array.isArray(state.answers[q.id]) ? state.answers[q.id] : [];
      q.options.forEach((opt) => {
        const label = document.createElement("label");
        label.className = "opt";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = q.id;
        input.value = opt.value;
        input.checked = current.includes(opt.value);

        input.addEventListener("change", () => {
          let arr = Array.isArray(state.answers[q.id]) ? [...state.answers[q.id]] : [];

          if (input.checked) {
            if (opt.value === "puuduvad") arr = ["puuduvad"];
            else {
              arr = arr.filter(v => v !== "puuduvad");
              if (!arr.includes(opt.value)) arr.push(opt.value);
            }
          } else {
            arr = arr.filter(v => v !== opt.value);
          }

          state.answers[q.id] = arr;
          saveState();
        });

        const span = document.createElement("span");
        span.textContent = opt.label;

        label.appendChild(input);
        label.appendChild(span);
        opts.appendChild(label);
      });
    } else {
      const answers = q.answers || DEFAULT_ANSWERS;
      const current = state.answers[q.id] || "";

      answers.forEach((a) => {
        const label = document.createElement("label");
        label.className = "opt";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = q.id;
        input.value = a;
        input.checked = current === a;

        input.addEventListener("change", () => {
          state.answers[q.id] = a;
          saveState();
        });

        const span = document.createElement("span");
        span.textContent = a;

        label.appendChild(input);
        label.appendChild(span);
        opts.appendChild(label);
      });
    }

    wrap.appendChild(h);
    wrap.appendChild(hint);
    wrap.appendChild(opts);
    return wrap;
  }

  function openReport() {
    renderReport();
    reportCard.hidden = false;
    reportCard.scrollIntoView({ behavior: "smooth" });
  }

  function renderReport() {
    const summary = evaluate();

    reportBadges.innerHTML = "";
    reportBadges.appendChild(makeBadge(`Riskitase: ${summary.riskLevel}`));
    reportBadges.appendChild(makeBadge(`Kuupäev: ${new Date().toLocaleDateString("et-EE")}`, true));

    overallAssessment.textContent = summary.overallText;

    keyRisks.innerHTML = "";
    summary.keyRisks.forEach((r) => {
      const li = document.createElement("li");
      li.textContent = r;
      keyRisks.appendChild(li);
    });

    nextSteps.innerHTML = "";
    summary.nextSteps.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      nextSteps.appendChild(li);
    });

    stageSummary.innerHTML = "";
    summary.stageSummaries.forEach((st) => {
      const div = document.createElement("div");
      div.className = "muted";
      div.style.marginBottom = "8px";
      div.innerHTML = `<strong>${st.title}:</strong> ${st.text}`;
      stageSummary.appendChild(div);
    });
  }

  function makeBadge(text, subtle = false) {
    const span = document.createElement("span");
    span.className = subtle ? "badge subtle" : "badge";
    span.textContent = text;
    return span;
  }

  function buildReportText() {
    const s = evaluate();
    const lines = [];
    lines.push("NÕUDE EELANALÜÜSI RAPORT");
    lines.push("Koostatud metoodika alusel vastuste põhjal.");
    lines.push(`Kuupäev: ${new Date().toLocaleDateString("et-EE")}`);
    lines.push("");
    lines.push(`Üldhinnang: ${s.riskLevel}`);
    lines.push(s.overallText);
    lines.push("");
    lines.push("Peamised riskid:");
    s.keyRisks.forEach((r) => lines.push(`- ${r}`));
    lines.push("");
    lines.push("Soovitatud järgmised sammud:");
    s.nextSteps.forEach((n, i) => lines.push(`${i + 1}. ${n}`));
    lines.push("");
    lines.push("Kokkuvõte etappide kaupa:");
    s.stageSummaries.forEach((st) => lines.push(`- ${st.title}: ${st.text}`));
    lines.push("");
    lines.push("Märkus: Raport on informatiivne ega asenda õigusnõustamist.");
    return lines.join("\n");
  }

  function evaluate() {
    const stageSummaries = STAGES.map((st) => {
      const { stageScorePct } = scoreStage(st);

      const text =
        stageScorePct >= 75
          ? "Eelduslikult piisav selles etapis."
          : stageScorePct >= 45
            ? "Siin on puudujääke — enne hagi esitamist tasub täpsustada."
            : "Siin on kriitilisi lünki — enne kohtusse pöördumist on vaja tugevdada.";

      return { title: shortTitle(st.title), text };
    });

    const flags = collectFlags();
    const riskScore = flags.riskScore;

    const riskLevel =
      riskScore <= 33 ? "Madal" :
      riskScore <= 66 ? "Keskmine" :
      "Kõrge";

    const overallText =
      riskLevel === "Madal"
        ? "Nõudel on eelduslikult selge faktiline ja õiguslik alus. Peamine fookus peaks olema dokumentide korrastamisel ja vastaspoole võimalike vastuväidete läbi mõtlemisel."
        : riskLevel === "Keskmine"
          ? "Nõude aluses esineb puudujääke, mis võivad kohtumenetluses tekitada riski. Soovitav on enne hagi esitamist täpsustada faktid, tugevdada tõendibaasi ja selgitada õiguslikku loogikat."
          : "Nõude faktiline või õiguslik alus on praegusel kujul ebapiisav. Soovitav on hagi esitamist edasi lükata, koguda puuduolevad tõendid ja kontrollida nõude eeldused (sh tähtaeg).";

    const keyRisks = flags.keyRisks.length ? flags.keyRisks : ["Olulisi kriitilisi riske ei tuvastatud vastuste põhjal."];
    const nextSteps = buildNextSteps(riskLevel, flags);

    return { riskLevel, overallText, keyRisks, nextSteps, stageSummaries };
  }

  function shortTitle(full) {
    const parts = full.split("—");
    return (parts[1] || full).trim();
  }

  function buildNextSteps(riskLevel, flags) {
    const steps = [];

    if (flags.hasAegumineRisk) {
      steps.push("Kontrolli tähtaegu: üldjuhul kehtib nõuetele 3-aastane tähtaeg alates ajast, mil said (või pidid saama) teada kahju tekkimisest ja vastutavast isikust.");
    }

    steps.push("Koosta kirjalik kronoloogia (mis juhtus, millal, kes osales, mis oli tagajärg).");
    steps.push("Koosta tõendite loetelu ja seosta iga oluline väide vähemalt ühe tõendiga.");

    if (flags.hasKahjuProblem) {
      steps.push("Koosta kahju arvutus (summad, kuupäevad, alusdokumendid), et nõudesumma oleks selge ja põhjendatav.");
    }
    if (flags.hasEvidenceConflict) {
      steps.push("Korrasta vastuolud tõendites ja täpsusta selgitused.");
    }
    if (flags.hasLegalBasisGap) {
      steps.push("Sõnasta lihtne õiguslik loogika: mis kohustust rikuti ja miks see annab nõudeõiguse (leping / seadusest tulenev kohustus / hooletus).");
    }

    if (riskLevel === "Madal") {
      steps.push("Koosta kirjalik nõue vastaspoolele enne kohtusse pöördumist ja hinda kompromissivõimalust.");
    } else if (riskLevel === "Keskmine") {
      steps.push("Enne hagi esitamist tugevda nõude alus: täpsusta faktid, lisa dokumendid, mõtle läbi vastuväited.");
    } else {
      steps.push("Ära esita hagi enne, kui kriitilised lüngad on täidetud (kronoloogia/tõendid/kahju/õiguslik loogika).");
      steps.push("Kaalu kohtuvälist lahendust, kui tõendibaas ei võimalda nõuet veenvalt tõendada.");
    }

    return [...new Set(steps)];
  }

  function collectFlags() {
    const a = state.answers;
    const keyRisks = [];
    let riskScore = 0;

    const chronology = a["chronology"];
    if (chronology === "Ei") { keyRisks.push("Kronoloogia on ebaselge — faktiline alus võib jääda segaseks."); riskScore += 18; }
    if (chronology === "Osaliselt") { keyRisks.push("Kronoloogia vajab täpsustamist — täida lüngad ja fikseeri kuupäevad."); riskScore += 10; }

    const breach = a["breach"];
    if (breach === "Ei tea") { keyRisks.push("Rikkumine on ebaselge — määra, millist kohustust rikuti."); riskScore += 18; }
    if (breach === "Võimalik") { keyRisks.push("Rikkumine on osaliselt selge — sõnasta konkreetne kohustus ja rikkumise tegu/tegematajätmine."); riskScore += 10; }

    const causation = a["causation"];
    if (causation === "Ei") { keyRisks.push("Põhjuslik seos on nõrk — selgita seos samm-sammult."); riskScore += 18; }
    if (causation === "Osaliselt") { keyRisks.push("Põhjuslik seos vajab täpsustamist."); riskScore += 10; }

    const calculable = a["calculable"];
    if (calculable === "Ei") { keyRisks.push("Kahju ei ole arvutatav — nõudesumma peab olema konkreetne."); riskScore += 16; }
    if (calculable === "Ligikaudselt") { keyRisks.push("Kahju on osaliselt arvutatav — vaja täpsemat arvutust."); riskScore += 8; }

    const lossDocs = a["loss_docs"];
    if (lossDocs === "Ei") { keyRisks.push("Kahju tõendavad dokumendid puuduvad."); riskScore += 16; }
    if (lossDocs === "Osaliselt") { keyRisks.push("Kahju dokumendid on osalised — kogu alusdokumendid."); riskScore += 8; }

    const ev = Array.isArray(a["objective_evidence"]) ? a["objective_evidence"] : [];
    if (ev.includes("puuduvad") || ev.length === 0) { keyRisks.push("Objektiivseid tõendeid on vähe — tugevda tõendibaasi."); riskScore += 14; }

    const evidenceCons = a["evidence_consistent"];
    const hasEvidenceConflict = evidenceCons === "On vastuolulised";
    if (hasEvidenceConflict) { keyRisks.push("Tõendid on vastuolulised — korrasta vastuolud."); riskScore += 14; }
    if (evidenceCons === "Vajavad täpsustamist") { keyRisks.push("Tõendid vajavad täpsustamist."); riskScore += 7; }

    const legalBasis = a["legal_basis"];
    const hasLegalBasisGap = legalBasis === "Ei" || legalBasis === "Osaliselt";
    if (legalBasis === "Ei") { keyRisks.push("Õiguslik loogika on ebaselge."); riskScore += 14; }
    if (legalBasis === "Osaliselt") { keyRisks.push("Õiguslik loogika vajab täpsustamist."); riskScore += 7; }

    const lim = a["limitation"];
    const hasAegumineRisk = lim === "Võimalik" || lim === "Ei tea";
    if (lim === "Võimalik") { keyRisks.push("Võimalik aegumise risk — kontrolli tähtaegu."); riskScore += 20; }
    if (lim === "Ei tea") { keyRisks.push("Aegumise küsimus on kontrollimata — see võib olla kriitiline risk."); riskScore += 20; }

    const counter = a["counterarguments"];
    // PARANDUS: "nõrgaim lüli"
    if (counter === "Jah") { keyRisks.push("Vastaspoolel võib olla tugev vastuväide — mõtle läbi enda nõrgaim lüli."); riskScore += 8; }
    if (counter === "Ei tea") { keyRisks.push("Vastaspoole vastuväiteid pole hinnatud."); riskScore += 10; }

    const cost = a["cost_risk"];
    if (cost === "Ei") { keyRisks.push("Menetluskulude risk on arvestamata."); riskScore += 10; }
    if (cost === "Osaliselt") { keyRisks.push("Menetluskulude risk vajab täpsemat läbi mõtlemist."); riskScore += 5; }

    return {
      riskScore: Math.min(100, riskScore),
      keyRisks: [...new Set(keyRisks)],
      hasAegumineRisk,
      hasKahjuProblem: (calculable === "Ei" || calculable === "Ligikaudselt" || lossDocs === "Ei" || lossDocs === "Osaliselt"),
      hasEvidenceConflict,
      hasLegalBasisGap
    };
  }

  function scoreStage(stage) {
    let max = 0;
    let got = 0;

    stage.questions.forEach((q) => {
      const w = q.weight || 1;
      max += 2 * w;

      const ans = state.answers[q.id];
      if (q.type === "multi") {
        const arr = Array.isArray(ans) ? ans : [];
        const score = (arr.length === 0 || arr.includes("puuduvad")) ? 0 : 2;
        got += score * w;
      } else {
        const score = SCORE_MAP[ans];
        if (score !== undefined) got += score * w;
      }
    });

    return { stageScorePct: max === 0 ? 0 : Math.round((got / max) * 100) };
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }
})();
