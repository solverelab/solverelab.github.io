window.addEventListener("DOMContentLoaded", () => {
  const $ = (sel) => document.querySelector(sel);

  // --- Elements (must exist) ---
  const startBtn   = $("#startBtn");
  const formCard   = $("#formCard");
  const resultCard = $("#resultCard");
  const questionsEl= $("#questions");

  const calcBtn  = $("#calcBtn");
  const resetBtn = $("#resetBtn");

  const riskBadge  = $("#riskBadge");
  const scoreLine  = $("#scoreLine");
  const missingList= $("#missingList");
  const nextSteps  = $("#nextSteps");
  const draftEl    = $("#draft");

  const claimAmountEl = $("#claimAmount");
  const keyDateEl     = $("#keyDate");
  const factsShortEl  = $("#factsShort");

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Safety: if core elements missing, stop early (prevents silent failures)
  const required = [startBtn, formCard, resultCard, questionsEl, calcBtn, resetBtn, riskBadge, scoreLine, missingList, nextSteps, draftEl];
  if (required.some(x => !x)) {
    console.error("Puuduvad vajalikud elemendid index.html-is. Kontrolli ID-sid ja et app.js on sama kausta index.html-iga.");
    return;
  }

  function getClaimType() {
    const selected = document.querySelector('input[name="claimType"]:checked');
    return selected ? selected.value : "debt";
  }

  const QUESTIONS = {
    base: [
      { id:"party_known", text:"Kas tead täpselt, kelle vastu nõue on (õige isik/ettevõte)?", weight:14, bucket:"basis",
        missingText:"Tuvasta vastaspool (nimi, isikukood/registrikood, aadress)." },
      { id:"claim_defined", text:"Kas saad nõude sisu ühe lausega sõnastada (mida nõuad ja miks)?", weight:14, bucket:"basis",
        missingText:"Sõnasta nõue: mida nõuad (summa/tegevus) ja mis alusel." },
      { id:"amount_known", text:"Kas summa on selge (või on olemas arvutusloogika ja alusdokumendid)?", weight:12, bucket:"basis",
        missingText:"Koosta summade arvutus ja lisa alusdokumendid (arved, kalkulatsioon)." },
      { id:"timeline", text:"Kas Sul on ajatelg (kuupäevad: kokkulepe/sündmus, tähtaeg, rikkumine, teavitused)?", weight:10, bucket:"evidence",
        missingText:"Pane kirja ajatelg (kuupäevad ja sündmused) + viited tõenditele." }
    ],
    debt: [
      { id:"agreement", text:"Kas oli leping / tellimus / kokkulepe, mida saad tõendada (leping, e-kiri, sõnumid, arve)?", weight:16, bucket:"basis",
        missingText:"Kogu kokku kokkuleppe tõendid (leping, e-kiri, sõnumid, arve)." },
      { id:"performance", text:"Kas saad tõendada, et Sinu poolne sooritus tehti (kaup/teenus üle antud, töö tehtud)?", weight:12, bucket:"evidence",
        missingText:"Lisa tõendid soorituse kohta (üleandmine, akt, fotod, kirjavahetus)." },
      { id:"invoice_or_ack", text:"Kas Sul on arve või muu dokument, mis näitab kohustuse suurust?", weight:12, bucket:"evidence",
        missingText:"Lisa selge alusdokument (arve/võlatunnistus/makseplaan)." },
      { id:"demand_sent", text:"Kas oled enne hagi kirjalikult nõudega teavitanud (meeldetuletus / maksenõue)?", weight:8, bucket:"process",
        missingText:"Saada enne hagi kirjalik nõue (tähtaeg + summa + alus + makseandmed)." }
    ],
    damage: [
      { id:"wrongful_act", text:"Kas saad kirjeldada õigusvastase teo / lepingurikkumise (mis täpselt tehti valesti)?", weight:16, bucket:"basis",
        missingText:"Kirjelda rikkumine/tegu (mis, millal, kuidas, kes) + viited tõenditele." },
      { id:"damage_amount", text:"Kas saad kahju suuruse dokumenteerida (arved, hinnapakkumised, paranduskulud)?", weight:14, bucket:"evidence",
        missingText:"Kogu kahju tõendid (arved/hinnapakkumised/kalkulatsioon)." },
      { id:"causation", text:"Kas põhjuslik seos on loogiline ja tõendatav (tegu → kahju)?", weight:10, bucket:"basis",
        missingText:"Kirjelda põhjuslik seos ja lisa seda toetavad tõendid." }
    ]
  };

  function buildQuestionSet(){
    const t = getClaimType();
    return [...QUESTIONS.base, ...(t==="debt" ? QUESTIONS.debt : QUESTIONS.damage)];
  }

  let state = {}; // id -> "yes" | "no" | "na"

  function renderQuestions(){
    const qset = buildQuestionSet();
    questionsEl.innerHTML = "";

    qset.forEach((q) => {
      const wrap = document.createElement("div");
      wrap.className = "q";

      const left = document.createElement("div");
      left.className = "qtext";
      left.textContent = q.text;

      const right = document.createElement("div");
      right.className = "answers";

      ["yes","no","na"].forEach((opt) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = opt==="yes" ? "Jah" : opt==="no" ? "Ei" : "Ei tea";
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

  function uniq(arr){
    return [...new Set((arr||[]).filter(Boolean))];
  }

  function score(){
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

  function getDraftFields(){
    const amountRaw = (claimAmountEl?.value || "").trim();
    const keyDate = (keyDateEl?.value || "").trim();
    const factsShort = (factsShortEl?.value || "").trim();
    return {
      amount: amountRaw ? `${amountRaw} EUR` : "",
      keyDate,
      factsShort
    };
  }

  function buildDraft(total){
    const claimType = getClaimType();
    const f = getDraftFields();

    const title = claimType==="debt"
      ? "Hagiavaldus (võlanõue) – struktuuri mustand"
      : "Hagiavaldus (kahju hüvitamine) – struktuuri mustand";

    const typeLine = claimType==="debt"
      ? "Nõude liik: tasumata rahaline kohustus (leping/arve/laen vms)."
      : "Nõude liik: kahju hüvitamine (lepingurikkumine/delikt vms).";

    return [
      title,"",
      "1. Pooled",
      "- Hageja: [nimi, isikukood/reg nr, aadress, kontakt]",
      "- Kostja: [nimi, isikukood/reg nr, aadress, kontakt]",
      "",
      "2. Nõue (petitum)",
      `- Nõuan kostjalt: ${f.amount ? f.amount : "[summa] eurot"} + [viivis/intress kui kohaldub] + menetluskulud.`,
      "- Arvutus: [tabel / valem / lisad].",
      "",
      "3. Asjaolud (ajatelg)",
      `- ${f.keyDate ? f.keyDate : "[kuupäev]"} – sündmus / tähtaeg: ${f.factsShort ? f.factsShort : "..."} (tõend: ...)`,
      "- [kuupäev] – rikkumine ... (tõend: ...)",
      "- [kuupäev] – teavitused/nõuded ... (tõend: ...)",
      "",
      "4. Õiguslik alus (üldine raam)",
      `- ${typeLine}`,
      "",
      "5. Tõendid",
      "- 01 [leping/kirjavahetus]",
      "- 02 [arve/kalkulatsioon/hinnapakkumine]",
      "- 03 [maksanõue/meeldetuletus]",
      "- 04 [maksesed/aktid/fotod/tunnistajad/logid]",
      "",
      "6. Taotlused",
      "- Palun võtta hagi menetlusse.",
      "- Palun mõista kostjalt välja menetluskulud.",
      "",
      "7. Lisad",
      "- Lisade loetelu (numbritega, sama mis tõendite loendis).",
      "",
      `Märkus: see on struktuur. Skoor: ${total}/100`
    ].join("\n");
  }

  function buildNextSteps(total, missing){
    const steps = [];
    steps.push("Koosta 1–2 lehekülje kokkuvõte: pooled, ajatelg, nõue (summa + arvutus), viited tõenditele.");
    steps.push("Koonda tõendid ühte kausta ja nimeta failid loogiliselt (01_leping.pdf, 02_arve.pdf, 03_makse.pdf, ...).");

    if (getClaimType()==="debt"){
      steps.push("Saada kirjalik maksenõue: summa, alus, tähtaeg, makseandmed, viide tõenditele.");
    } else {
      steps.push("Pane kirja rikkumine + põhjuslik seos + kahju suuruse tõendid (arved/hinnapakkumised/kalkulatsioon).");
    }

    if (total < 45) steps.push("Kui risk on kõrge, lase enne hagi tähtaeg, alus ja vastaspool üle kontrollida.");
    else if (total < 70) steps.push("Enne hagi täienda 1–3 nõrka kohta (tõendid, ajatelg, vastuväidete maandamine).");
    else steps.push("Kui põhidokumendid on koos ja riskid kontrollitud, saad koostada hagi mustandi ja taotlused.");

    if ((missing||[]).some(m => (m||"").toLowerCase().includes("ajatelg"))) {
      steps.push("Loo ajatelg koos tõendiviidetega — see teeb hagi oluliselt tugevamaks.");
    }

    return steps;
  }

  function setDraftValue(){
    const { total } = score();
    draftEl.value = buildDraft(total);
  }

  function refreshDraftIfVisible(){
    if (!resultCard.classList.contains("hidden")) setDraftValue();
  }

  function renderResult(){
    const { total, missing } = score();

    riskBadge.textContent = total>=70 ? "ROHELINE — hea lähtekoht"
      : total>=45 ? "KOLLANE — keskmine risk"
      : "PUNANE — kõrge risk";

    scoreLine.textContent = `Skoor: ${total}/100`;

    missingList.innerHTML = "";
    (missing.length ? missing : ["Tuvastatud nõrkusi ei tulnud vastustest välja (see ei välista erandeid)."])
      .slice(0,12)
      .forEach((m)=>{
        const li=document.createElement("li");
        li.textContent=m;
        missingList.appendChild(li);
      });

    nextSteps.innerHTML = "";
    buildNextSteps(total, missing).slice(0,8).forEach((s)=>{
      const li=document.createElement("li");
      li.textContent=s;
      nextSteps.appendChild(li);
    });

    setDraftValue();

    resultCard.classList.remove("hidden");
    resultCard.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  // --- Events ---
  startBtn.addEventListener("click", () => {
    formCard.classList.remove("hidden");
    resultCard.classList.add("hidden");
    state = {};
    renderQuestions();
    formCard.scrollIntoView({ behavior:"smooth", block:"start" });
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
      try{
        await navigator.clipboard.writeText(draftEl.value);
        copyBtn.textContent="Kopeeritud!";
        setTimeout(()=>copyBtn.textContent="Kopeeri",1200);
      }catch{
        alert("Kopeerimine ei õnnestunud. Vali tekst ja kopeeri käsitsi.");
      }
    });
  }

  const printBtn = $("#printBtn");
  if (printBtn) printBtn.addEventListener("click", ()=>window.print());

  document.querySelectorAll('input[name="claimType"]').forEach((r)=>{
    r.addEventListener("change", ()=>{
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
