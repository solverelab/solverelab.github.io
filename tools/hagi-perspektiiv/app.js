window.addEventListener("DOMContentLoaded", () => {
  const $ = (sel) => document.querySelector(sel);

  const startBtn   = $("#startBtn");
  const formCard   = $("#formCard");
  const resultCard = $("#resultCard");
  const questionsEl= $("#questions");

  const calcBtn  = $("#calcBtn");
  const resetBtn = $("#resetBtn");

  const riskBadge   = $("#riskBadge");
  const scoreLine   = $("#scoreLine");
  const missingList = $("#missingList");
  const nextSteps   = $("#nextSteps");
  const draftEl     = $("#draft");

  const claimAmountEl = $("#claimAmount");
  const keyDateEl     = $("#keyDate");
  const factsShortEl  = $("#factsShort");

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const required = [startBtn, formCard, resultCard, questionsEl, calcBtn, resetBtn, riskBadge, scoreLine, missingList, nextSteps, draftEl];
  if (required.some(x => !x)) {
    console.error("Puuduvad vajalikud elemendid index.html-is. Kontrolli ID-sid ja et app.js on sama kausta index.html-iga.");
    return;
  }

  function getClaimType() {
    const selected = document.querySelector('input[name="claimType"]:checked');
    return selected ? selected.value : "debt";
  }

  // -----------------------------
  // Küsimused: lihtne keel + selgitus
  // -----------------------------
  const QUESTIONS = {
    base: [
      {
        id: "party_known",
        title: "1. Kelle vastu Sa nõude esitad?",
        question: "Kas Sa tead täpselt, kellelt raha või kohustuse täitmist nõuad (õige inimene või ettevõte)?",
        example: "",
        explanation: "On oluline esitada nõue õigele isikule. Vale kostja korral võib kohus hagi jätta rahuldamata isegi siis, kui Sul on õigus.",
        weight: 14,
        missingText: "Tuvasta vastaspool (nimi, isikukood/registrikood, aadress)."
      },
      {
        id: "claim_defined",
        title: "2. Mida Sa täpselt nõuad?",
        question: "Kas suudad ühe lausega selgelt öelda, mida Sa nõuad ja mis põhjusel?",
        example: "Näide: „Soovin 3 500 eurot tasumata töö eest.“",
        explanation: "Nõue peab olema selge ja arusaadav. Kohus peab aru saama, mida täpselt taotled.",
        weight: 14,
        missingText: "Sõnasta nõue: mida nõuad (summa/tegevus) ja mis alusel."
      },
      {
        id: "amount_known",
        title: "3. Kas nõutav summa on selgelt välja arvutatud?",
        question: "Kas nõutav summa on täpselt teada või on olemas arvutus (nt arve, hinnakiri, kalkulatsioon)?",
        example: "",
        explanation: "Rahasumma peab põhinema dokumentidel või selgel arvutusel. Ilma selleta võib nõue jääda tõendamata.",
        weight: 12,
        missingText: "Koosta summade arvutus ja lisa alusdokumendid (arved, kalkulatsioon)."
      },
      {
        id: "timeline",
        title: "4. Kas sündmuste järjekord on selge?",
        question: "Kas Sul on kirjas kuupäevad ja sündmused: kokkulepe, tähtaeg, rikkumine ja edasised teavitused?",
        example: "",
        explanation: "Kohus hindab asjaolusid ajaliselt. Selge kronoloogia aitab näidata, millal ja kuidas kohustus jäi täitmata.",
        weight: 10,
        missingText: "Pane kirja ajatelg (kuupäevad ja sündmused) + viited tõenditele."
      }
    ],

    // Võlanõue (Sinu 5–8)
    debt: [
      {
        id: "agreement",
        title: "5. Kas kokkulepet saab tõendada?",
        question: "Kas Sul on dokument või muu tõend kokkuleppe kohta (leping, e-kiri, sõnumid, arve vms)?",
        example: "",
        explanation: "Isegi suuline kokkulepe võib olla kehtiv, kuid seda peab suutma tõendada.",
        weight: 16,
        missingText: "Kogu kokku kokkuleppe tõendid (leping, e-kiri, sõnumid, arve)."
      },
      {
        id: "performance",
        title: "6. Kas oled ise oma kohustuse täitnud?",
        question: "Kas saad tõendada, et täitsid oma osa kokkuleppest (nt tegid töö, andsid kauba üle)?",
        example: "",
        explanation: "Üldjuhul saab nõuda tasu või täitmist siis, kui oled ise oma kohustuse täitnud.",
        weight: 12,
        missingText: "Lisa tõendid Sinu soorituse kohta (üleandmine, akt, fotod, kirjavahetus)."
      },
      {
        id: "invoice_or_ack",
        title: "7. Kas kohustuse suurust näitav dokument on olemas?",
        question: "Kas Sul on arve või muu dokument, mis näitab, kui suur kohustus oli?",
        example: "",
        explanation: "Dokument aitab tõendada nõude suurust ja selle aluseid.",
        weight: 12,
        missingText: "Lisa selge alusdokument (arve/võlatunnistus/makseplaan)."
      },
      {
        id: "demand_sent",
        title: "8. Kas oled enne kohtusse pöördumist teavitanud?",
        question: "Kas oled teisele poolele kirjalikult teada andnud, et nõuad tasumist või kohustuse täitmist (nt meeldetuletus, maksenõue)?",
        example: "",
        explanation: "Kuigi see ei ole alati kohustuslik, näitab eelnev teavitamine, et andsid võimaluse vaidlus lahendada ilma kohtuta.",
        weight: 8,
        missingText: "Saada enne hagi kirjalik nõue (tähtaeg + summa + alus + makseandmed)."
      }
    ],

    // Kahju hüvitamine (lihtsustatud, mittejuristi keeles)
    damage: [
      {
        id: "wrongful_act",
        title: "5. Mis läks valesti?",
        question: "Kas suudad selgelt kirjeldada, mida teine pool tegi või jättis tegemata (lepingurikkumine või muu tegu)?",
        example: "",
        explanation: "Kohus peab aru saama, milles rikkumine seisnes ja millal see toimus.",
        weight: 16,
        missingText: "Kirjelda rikkumine/tegu (mis, millal, kuidas, kes) + viited tõenditele."
      },
      {
        id: "damage_amount",
        title: "6. Kas kahju suurus on tõendatav?",
        question: "Kas Sul on arved, hinnapakkumised või muu arvutus, mis näitab kahju suurust?",
        example: "",
        explanation: "Kahju summa peab olema tõendatav – muidu võib kohus seda mitte välja mõista.",
        weight: 14,
        missingText: "Kogu kahju tõendid (arved/hinnapakkumised/kalkulatsioon)."
      },
      {
        id: "causation",
        title: "7. Kas tegu ja kahju on omavahel seotud?",
        question: "Kas saad selgitada, kuidas teise poole tegu põhjustas kahju (tegu → tagajärg)?",
        example: "",
        explanation: "Kui seos pole arusaadav või tõendatav, võib nõue nõrgaks jääda.",
        weight: 10,
        missingText: "Kirjelda põhjuslik seos ja lisa seda toetavad tõendid."
      }
    ]
  };

  function buildQuestionSet() {
    const t = getClaimType();
    return [...QUESTIONS.base, ...(t === "debt" ? QUESTIONS.debt : QUESTIONS.damage)];
  }

  let state = {}; // id -> "yes" | "no" | "na"

  function renderQuestions() {
    const qset = buildQuestionSet();
    questionsEl.innerHTML = "";

    qset.forEach((q) => {
      const wrap = document.createElement("div");
      wrap.className = "q";

      const left = document.createElement("div");
      left.className = "qtext";

      const title = document.createElement("div");
      title.style.fontWeight = "800";
      title.style.marginBottom = "6px";
      title.textContent = q.title;

      const qText = document.createElement("div");
      qText.textContent = q.question;

      left.appendChild(title);
      left.appendChild(qText);

      if (q.example) {
        const ex = document.createElement("div");
        ex.className = "qmeta";
        ex.textContent = q.example;
        left.appendChild(ex);
      }

      const expl = document.createElement("div");
      expl.className = "qmeta";
      expl.innerHTML = `<strong>Selgitus:</strong> ${q.explanation}`;
      left.appendChild(expl);

      const right = document.createElement("div");
      right.className = "answers";

      const opts = [
        { key: "yes", label: "Jah" },
        { key: "no",  label: "Ei" },
        { key: "na",  label: "Ei ole kindel" }
      ];

      opts.forEach((opt) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = opt.label;
        if (state[q.id] === opt.key) b.classList.add("active");
        b.addEventListener("click", () => {
          state[q.id] = opt.key;
          renderQuestions();
          refreshDraftIfVisible();
        });
        right.appendChild(b);
      });

      wrap.appendChild(left);
      wrap.appendChild(right);
      questionsEl.appendChild(wrap);
    });
  }

  function uniq(arr) {
    return [...new Set((arr || []).filter(Boolean))];
  }

  function score() {
    const qset = buildQuestionSet();
    let total = 0;
    const missing = [];

    qset.forEach((q) => {
      const ans = state[q.id] || "na";
      if (ans === "yes") total += q.weight;
      else missing.push(q.missingText);
    });

    total = Math.max(0, Math.min(100, total));
    return { total, missing: uniq(missing) };
  }

  function getDraftFields() {
    const amountRaw = (claimAmountEl?.value || "").trim();
    const keyDate = (keyDateEl?.value || "").trim();
    const factsShort = (factsShortEl?.value || "").trim();
    return {
      amount: amountRaw ? `${amountRaw} EUR` : "",
      keyDate,
      factsShort
    };
  }

  function buildDraft(total) {
    const claimType = getClaimType();
    const f = getDraftFields();

    const title = claimType === "debt"
      ? "Hagiavaldus (võlanõue) – struktuuri mustand"
      : "Hagiavaldus (kahju hüvitamine) – struktuuri mustand";

    const typeLine = claimType === "debt"
      ? "Nõude liik: tasumata rahaline kohustus (leping/arve/laen vms)."
      : "Nõude liik: kahju hüvitamine (lepingurikkumine/delikt vms).";

    return [
      title, "",
      "1. Pooled",
      "- Hageja: [nimi, isikukood/reg nr, aadress, kontakt]",
      "- Kostja: [nimi, isikukood/reg nr, aadress, kontakt]", "",
      "2. Nõue (petitum)",
      `- Nõuan kostjalt: ${f.amount ? f.amount : "[summa] eurot"} + [viivis/intress kui kohaldub] + menetluskulud.`,
      "- Arvutus: [tabel / valem / lisad].", "",
      "3. Asjaolud (ajatelg)",
      `- ${f.keyDate ? f.keyDate : "[kuupäev]"} – sündmus / tähtaeg: ${f.factsShort ? f.factsShort : "..."} (tõend: ...)`,
      "- [kuupäev] – rikkumine ... (tõend: ...)",
      "- [kuupäev] – teavitused/nõuded ... (tõend: ...)", "",
      "4. Õiguslik alus (üldine raam)",
      `- ${typeLine}`, "",
      "5. Tõendid",
      "- 01 [leping/kirjavahetus]",
      "- 02 [arve/kalkulatsioon/hinnapakkumine]",
      "- 03 [maksanõue/meeldetuletus]",
      "- 04 [maksesed/aktid/fotod/tunnistajad/logid]", "",
      "6. Taotlused",
      "- Palun võtta hagi menetlusse.",
      "- Palun mõista kostjalt välja menetluskulud.", "",
      "7. Lisad",
      "- Lisade loetelu (numbritega, sama mis tõendite loendis).", "",
      `Märkus: see on struktuur. Skoor: ${total}/100`
    ].join("\n");
  }

  function buildNextSteps(total) {
    const steps = [];
    steps.push("Koosta 1–2 lehekülje kokkuvõte: pooled, ajatelg, nõue (summa + arvutus), viited tõenditele.");
    steps.push("Koonda tõendid ühte kausta ja nimeta failid loogiliselt (01_leping.pdf, 02_arve.pdf, 03_makse.pdf, ...).");

    if (getClaimType() === "debt") {
      steps.push("Saada kirjalik maksenõue: summa, alus, tähtaeg, makseandmed, viide tõenditele.");
    } else {
      steps.push("Pane kirja rikkumine + põhjuslik seos + kahju suuruse tõendid (arved/hinnapakkumised/kalkulatsioon).");
    }

    if (total < 45) steps.push("Kui risk on kõrge, täienda enne hagi peamisi tõendeid ja ajatelge.");
    else if (total < 70) steps.push("Enne hagi täienda 1–3 nõrka kohta (tõendid, ajatelg, vastuväidete maandamine).");
    else steps.push("Kui põhidokumendid on koos, saad koostada hagi mustandi ja taotlused.");

    return steps;
  }

  function setDraftValue() {
    const { total } = score();
    draftEl.value = buildDraft(total);
  }

  function refreshDraftIfVisible() {
    if (!resultCard.classList.contains("hidden")) setDraftValue();
  }

  function renderResult() {
    const { total, missing } = score();

    riskBadge.textContent =
      total >= 70 ? "ROHELINE — hea lähtekoht" :
      total >= 45 ? "KOLLANE — keskmine risk" :
      "PUNANE — kõrge risk";

    scoreLine.textContent = `Skoor: ${total}/100`;

    missingList.innerHTML = "";
    (missing.length ? missing : ["Tuvastatud nõrkusi ei tulnud vastustest välja (see ei välista erandeid)."])
      .slice(0, 12)
      .forEach((m) => {
        const li = document.createElement("li");
        li.textContent = m;
        missingList.appendChild(li);
      });

    nextSteps.innerHTML = "";
    buildNextSteps(total).slice(0, 8).forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      nextSteps.appendChild(li);
    });

    setDraftValue();

    resultCard.classList.remove("hidden");
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // --- Events ---
  startBtn.addEventListener("click", () => {
    formCard.classList.remove("hidden");
    resultCard.classList.add("hidden");
    state = {};
    renderQuestions();
    formCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  calcBtn.addEventListener("click", renderResult);

  resetBtn.addEventListener("click", () => {
    state = {};
    resultCard.classList.add("hidden");
    renderQuestions();
  });

  const copyBtn = $("#copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(draftEl.value);
        copyBtn.textContent = "Kopeeritud!";
        setTimeout(() => (copyBtn.textContent = "Kopeeri"), 1200);
      } catch {
        alert("Kopeerimine ei õnnestunud. Vali tekst ja kopeeri käsitsi.");
      }
    });
  }

  const printBtn = $("#printBtn");
  if (printBtn) printBtn.addEventListener("click", () => window.print());

  document.querySelectorAll('input[name="claimType"]').forEach((r) => {
    r.addEventListener("change", () => {
      state = {};
      resultCard.classList.add("hidden");
      if (!formCard.classList.contains("hidden")) renderQuestions();
    });
  });

  [claimAmountEl, keyDateEl, factsShortEl].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", refreshDraftIfVisible);
  });
});
