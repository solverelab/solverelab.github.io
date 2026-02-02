document.addEventListener("DOMContentLoaded", () => {

  const $ = (sel) => document.querySelector(sel);

  const startBtn = $("#startBtn");
  const formCard = $("#formCard");
  const resultCard = $("#resultCard");
  const questionsEl = $("#questions");

  const calcBtn = $("#calcBtn");
  const resetBtn = $("#resetBtn");
  const copyBtn = $("#copyBtn");
  const printBtn = $("#printBtn");

  const riskBadge = $("#riskBadge");
  const scoreLine = $("#scoreLine");
  const missingList = $("#missingList");
  const nextSteps = $("#nextSteps");
  const draftEl = $("#draft");

  const claimAmountEl = $("#claimAmount");
  const keyDateEl = $("#keyDate");
  const factsShortEl = $("#factsShort");

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function getClaimType() {
    const selected = document.querySelector('input[name="claimType"]:checked');
    return selected ? selected.value : "debt";
  }

  const QUESTIONS = {
    base: [
      { id:"party", text:"Kas tead täpselt, kelle vastu nõue on?", weight:14, bucket:"basis", missing:"Tuvasta vastaspool (nimi, isikukood/reg nr)." },
      { id:"claim_defined", text:"Kas suudad nõude ühe lausega sõnastada?", weight:14, bucket:"basis", missing:"Sõnasta nõue selgelt (mida nõuad ja miks)." },
      { id:"amount", text:"Kas summa on selge ja dokumenteeritud?", weight:12, bucket:"basis", missing:"Koosta arvutus ja lisa alusdokumendid." },
      { id:"timeline", text:"Kas Sul on selge ajatelg (kuupäevad)?", weight:10, bucket:"evidence", missing:"Koosta ajatelg kuupäevade ja viidetega tõenditele." }
    ],
    debt: [
      { id:"agreement", text:"Kas kokkulepe on tõendatav (leping, e-kiri, arve)?", weight:16, bucket:"basis", missing:"Kogu kokku kokkuleppe tõendid." },
      { id:"performance", text:"Kas saad tõendada oma soorituse?", weight:12, bucket:"evidence", missing:"Lisa soorituse tõendid (akt, makse, foto vms)." },
      { id:"demand", text:"Kas oled enne hagi saatnud kirjaliku nõude?", weight:8, bucket:"process", missing:"Saada kirjalik maksenõue enne hagi." }
    ],
    damage: [
      { id:"wrongful", text:"Kas rikkumine on selgelt kirjeldatav?", weight:16, bucket:"basis", missing:"Kirjelda rikkumine ja selle asjaolud." },
      { id:"damage_amount", text:"Kas kahju suurus on dokumenteeritud?", weight:14, bucket:"evidence", missing:"Lisa arved/kalkulatsioon kahju kohta." },
      { id:"causation", text:"Kas põhjuslik seos on loogiline ja tõendatav?", weight:10, bucket:"basis", missing:"Selgita põhjuslik seos (tegu → kahju)." }
    ]
  };

  let state = {};

  function buildQuestionSet() {
    const type = getClaimType();
    return [
      ...QUESTIONS.base,
      ...(type === "debt" ? QUESTIONS.debt : QUESTIONS.damage)
    ];
  }

  function renderQuestions() {
    const qset = buildQuestionSet();
    questionsEl.innerHTML = "";

    qset.forEach(q => {
      const wrap = document.createElement("div");
      wrap.className = "q";

      const left = document.createElement("div");
      left.className = "qtext";
      left.textContent = q.text;

      const right = document.createElement("div");
      right.className = "answers";

      ["yes","no"].forEach(opt => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = opt === "yes" ? "Jah" : "Ei";
        if (state[q.id] === opt) b.classList.add("active");
        b.addEventListener("click", () => {
          state[q.id] = opt;
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

  function score() {
    const qset = buildQuestionSet();
    let total = 0;
    const missing = [];

    qset.forEach(q => {
      if (state[q.id] === "yes") {
        total += q.weight;
      } else {
        missing.push(q.missing);
      }
    });

    return { total: Math.min(total,100), missing };
  }

  function buildDraft(total) {
    const type = getClaimType();
    const amount = claimAmountEl?.value ? claimAmountEl.value + " EUR" : "[summa]";
    const date = keyDateEl?.value || "[kuupäev]";
    const facts = factsShortEl?.value || "...";

    return `
Hagiavaldus – struktuuri mustand

1. Pooled
- Hageja: [nimi, isikukood/reg nr, aadress, kontakt]
- Kostja: [nimi, isikukood/reg nr, aadress, kontakt]

2. Nõue
- Nõuan kostjalt: ${amount} + viivis/intress + menetluskulud.

3. Asjaolud
- ${date} – ${facts}

4. Õiguslik alus
- ${type === "debt" ? "Võlanõue (leping/arve/laen)." : "Kahju hüvitamine (lepingurikkumine/delikt)."}

5. Tõendid
- [leping/arve/kirjavahetus]
- [maksanõue]
- [muu tõend]

Skoor: ${total}/100
`;
  }

  function renderResult() {
    const { total, missing } = score();

    riskBadge.textContent =
      total >= 70 ? "ROHELINE – hea lähtekoht" :
      total >= 40 ? "KOLLANE – keskmine risk" :
      "PUNANE – kõrge risk";

    scoreLine.textContent = `Skoor: ${total}/100`;

    missingList.innerHTML = "";
    missing.forEach(m => {
      const li = document.createElement("li");
      li.textContent = m;
      missingList.appendChild(li);
    });

    draftEl.value = buildDraft(total);

    resultCard.classList.remove("hidden");
    resultCard.scrollIntoView({behavior:"smooth"});
  }

  function refreshDraftIfVisible() {
    if (!resultCard.classList.contains("hidden")) {
      const { total } = score();
      draftEl.value = buildDraft(total);
    }
  }

  startBtn?.addEventListener("click", () => {
    formCard.classList.remove("hidden");
    renderQuestions();
  });

  calcBtn?.addEventListener("click", renderResult);

  resetBtn?.addEventListener("click", () => {
    state = {};
    resultCard.classList.add("hidden");
    renderQuestions();
  });

  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(draftEl.value);
      copyBtn.textContent = "Kopeeritud!";
      setTimeout(() => copyBtn.textContent = "Kopeeri", 1200);
    } catch {
      alert("Kopeerimine ei õnnestunud.");
    }
  });

  printBtn?.addEventListener("click", () => window.print());

  document.querySelectorAll('input[name="claimType"]').forEach(r => {
    r.addEventListener("change", () => {
      state = {};
      resultCard.classList.add("hidden");
      renderQuestions();
    });
  });

});
