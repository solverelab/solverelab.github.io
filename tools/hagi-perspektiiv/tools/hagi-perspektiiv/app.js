window.addEventListener("DOMContentLoaded", () => {
  const CONTACT_EMAIL = "solvere.lab@gmail.com";
  const $ = (sel) => document.querySelector(sel);

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Elements
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

  const emailLink = $("#emailLink");
  if (emailLink) {
    emailLink.href = `mailto:${encodeURIComponent(CONTACT_EMAIL)}?subject=${encodeURIComponent("Hagi perspektiivi küsimus")}`;
    emailLink.textContent = CONTACT_EMAIL;
  }

  // Optional draft fields (no defendant)
  const claimAmountEl = $("#claimAmount");
  const keyDateEl = $("#keyDate");
  const factsShortEl = $("#factsShort");

  const QUESTIONS = {
    base: [
      { id:"party_known", text:"Kas tead täpselt, kelle vastu nõue on (õige isik/ettevõte, nimi ja/või registrikood)?",
        hint:"Vale vastaspool = suur menetlusrisk.", weight:14, missingText:"Tuvasta vastaspool (nimi, isikukood/registrikood, aadress).", bucket:"basis" },
      { id:"claim_defined", text:"Kas saad nõude sisu ühe lausega sõnastada (mida nõuad ja miks)?",
        hint:"Nõue peab olema arusaadav ja konkreetne.", weight:14, missingText:"Sõnasta nõue: mida nõuad (summa/tegevus) ja mis alusel.", bucket:"basis" },
      { id:"amount_known", text:"Kas summa on selge (või on olemas arvutusloogika ja alusdokumendid)?",
        hint:"Ebaselge summa = nõrk koht ja vaidluskoht.", weight:12, missingText:"Koosta summade arvutus ja lisa alusdokumendid (arved, kalkulatsioon).", bucket:"basis" },
      { id:"timeline", text:"Kas sul on ajatelg (kuupäevad: kokkulepe/sündmus, tähtaeg, rikkumine, teavitused)?",
        hint:"Ajatelg teeb nõude tõendamise palju lihtsamaks.", weight:10, missingText:"Pane kirja ajatelg (kuupäevad ja sündmused) + viited tõenditele.", bucket:"evidence" }
    ],
    debt: [
      { id:"agreement", text:"Kas oli leping / tellimus / kokkulepe, mida saad tõendada (kirjalik, e-kiri, sõnumid, arve)?",
        hint:"Kirjalik jälg on suur pluss.", weight:16, missingText:"Kogu kokku kokkuleppe tõendid (leping, e-kiri, sõnumid, arve).", bucket:"basis" },
      { id:"performance", text:"Kas saad tõendada, et sinu poolne sooritus tehti (kaup/teenus üle antud, töö tehtud)?",
        hint:"Kui tegu oli tööga, siis aktid/fotod/suhtlus aitavad.", weight:12, missingText:"Lisa tõendid soorituse kohta (üleandmine, akt, fotod, kirjavahetus).", bucket:"evidence" },
      { id:"invoice_or_ack", text:"Kas sul on arve, võlatunnistus või muu selge dokument, mis näitab kohustuse suurust?",
        hint:"Üks selge dokument võib kanda kogu nõuet.", weight:12, missingText:"Lisa selge alusdokument (arve/võlatunnistus/makseplaan).", bucket:"evidence" },
      { id:"demand_sent", text:"Kas oled võlgnikku enne hagi kirjalikult nõudega teavitanud (meeldetuletus / maksenõue)?",
        hint:"Praktikas aitab vaidluse fookust ja kuluriski.", weight:8, missingText:"Saada enne hagi kirjalik nõue (tähtaeg + summa + alus + makseandmed).", bucket:"process" },
      { id:"defense_risk", text:"Kas on tõenäoline, et vastaspool esitab sisulise vastuväite (nt puudus, osaline täitmine, tasaarvestus)?",
        hint:"Jah = risk, sest vaidlus muutub sisuliseks.", risk:10, missingText:"Kaardista võimalikud vastuväited ja kogu nende vastu tõendid.", bucket:"risk", invert:true }
    ],
    damage: [
      { id:"wrongful_act", text:"Kas saad kirjeldada õigusvastase teo / lepingurikkumise (mis täpselt tehti valesti)?",
        hint:"Kahjunõue vajab selget rikkumise kirjeldust.", weight:16, missingText:"Kirjelda rikkumine/tegu (mis, millal, kuidas, kes) + viited tõenditele.", bucket:"basis" },
      { id:"damage_amount", text:"Kas saad kahju suuruse dokumenteerida (arved, hinnapakkumised, paranduskulud, saamata jäänud tulu arvestus)?",
        hint:"Ilma summata pole kahjunõue „valmis”.", weight:14, missingText:"Kogu kahju tõendid (arved/hinnapakkumised/kalkulatsioon).", bucket:"evidence" },
      { id:"causation", text:"Kas põhjuslik seos on loogiline ja tõendatav (tegu → kahju)?",
        hint:"Kui seos on nõrk, on risk suur.", weight:10, missingText:"Kirjelda põhjuslik seos ja lisa seda toetavad tõendid.", bucket:"basis" },
      { id:"fault_or_liability", text:"Kas vastutus on põhjendatav (hooletus/tahtlus või lepinguline vastutus)?",
        hint:"Kahju nõuab üldjuhul vastutuse eelduste täitmist.", weight:8, missingText:"Täpsusta vastutuse alus (lepingurikkumine/delikt) ja selle eeldused sinu loogikas.", bucket:"basis" },
      { id:"alternative_cause", text:"Kas vastaspool saab usutavalt väita alternatiivset kahju põhjust (mitte tema tegu)?",
        hint:"Jah = risk, sest vaidlus muutub tõendamisvaidluseks.", risk:10, missingText:"Kaardista alternatiivsed põhjused ja kogu nende välistamiseks tõendeid.", bucket:"risk", invert:true }
    ],
    evidence_and_flags: [
      { id:"two_sources", text:"Kas sul on vähemalt 2 sõltumatut tõendiallikat (nt dokument + makse + kirjavahetus)?",
        hint:"Mitu allikat tugevdab.", weight:10, missingText:"Lisa vähemalt 2 eri tüüpi tõendit (dokument/makse/sõnum/foto/akt).", bucket:"evidence" },
      { id:"objective", text:"Kas sul on objektiivne tõend või kolmanda isiku tugi (foto, akt, tunnistaja, logi)?",
        hint:"Vaidluse korral väga väärtuslik.", weight:8, missingText:"Leia objektiivne tõend (foto/akt/tunnistaja/logi) ja fikseeri see.", bucket:"evidence" },
      { id:"older_than_3y", text:"Kas vaidluse tekkimisest / sündmusest on möödas üle 3 aasta?",
        hint:"Võib viidata aegumiskahtlusele; kontrolli üle.", risk:14, missingText:"Kontrolli tähtaegu (aegumine) konkreetse nõude liigist lähtudes.", bucket:"risk", invert:true },
      { id:"unknown_address", text:"Kas vastaspoole aadress/kättesaamine on ebaselge (välismaal, teadmata elukoht, “kadunud”)?",
        hint:"Kättetoimetamine võib venida.", risk:6, missingText:"Tuvasta kättetoimetamise aadress (rahvastikuregister/Äriregister) või plaani alternatiivid.", bucket:"process", invert:true },
      { id:"low_value", text:"Kas nõude väärtus on väike (nt alla ~300–500 €), nii et kulurisk võib olla ebaproportsionaalne?",
        hint:"Praktiline kaalutlus.", risk:4, missingText:"Kaalu proportsionaalsust: kas on mõistlikum kompromiss, maksegraafik vms.", bucket:"process", invert:true }
    ]
  };

  function getClaimType(){
    const selected = document.querySelector('input[name="claimType"]:checked');
    return selected ? selected.value : "debt";
  }

  function buildQuestionSet(){
    const t = getClaimType();
    return [...QUESTIONS.base, ...(t==="debt" ? QUESTIONS.debt : QUESTIONS.damage), ...QUESTIONS.evidence_and_flags];
  }

  let state = {};

  function renderQuestions(){
    if (!questionsEl) return;
    const qset = buildQuestionSet();
    questionsEl.innerHTML = "";

    qset.forEach((q) => {
      const wrap = document.createElement("div");
      wrap.className = "q";

      const left = document.createElement("div");
      left.className = "qtext";
      left.innerHTML = `<div>${q.text}</div><div class="qmeta">${q.hint || ""}</div>`;

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
          // Mustand värskendab ka vastuste muutumisel (kui tulemus on nähtav)
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
    let basis=0, evidence=0, process=0, risk=0;
    const missing = [];

    qset.forEach((q) => {
      const ans = state[q.id] || "na";

      if (q.weight){
        if (ans === "yes"){
          if (q.bucket==="basis") basis += q.weight;
          if (q.bucket==="evidence") evidence += q.weight;
          if (q.bucket==="process") process += q.weight;
        } else {
          missing.push(q.missingText);
        }
      }

      if (q.risk){
        const isRisk = q.invert ? (ans === "yes") : (ans === "no");
        if (isRisk){
          risk += q.risk;
          missing.push(q.missingText);
        }
      }
    });

    const total = Math.max(0, Math.min(100, basis + evidence + Math.min(process,10) - Math.min(risk,20)));
    return { total, missing: uniq(missing) };
  }

  function buildNextSteps(total, missing){
    const steps = [];
    steps.push("Koosta 1–2 lehekülje kokkuvõte: pooled, ajatelg, nõue (summa + arvutus), viited tõenditele.");
    steps.push("Koonda tõendid ühte kausta ja nimeta failid loogiliselt (01_leping.pdf, 02_arve.pdf, 03_makse.pdf, ...).");

    if ((missing||[]).some(m => (m||"").toLowerCase().includes("aegum"))){
      steps.push("Kontrolli tähtaegu (aegumine) konkreetse nõude liigist lähtudes enne, kui kulutad aega hagi kirjutamisele.");
    }

    if (getClaimType()==="debt"){
      steps.push("Saada kirjalik maksenõue: summa, alus, tähtaeg, makseandmed, viide tõenditele.");
    } else {
      steps.push("Pane kirja rikkumine + põhjuslik seos + kahju suuruse tõendid (arved/hinnapakkumised/kalkulatsioon).");
    }

    if (total < 45) steps.push("Kui risk on kõrge, küsi enne hagi lühike teise pilgu kontroll (tähtaeg, alus, vastaspool).");
    else if (total < 70) steps.push("Enne hagi täienda 1–3 nõrka kohta (tõendid, ajatelg, vastuväidete maandamine).");
    else steps.push("Kui põhidokumendid on koos ja riskid kontrollitud, saad koostada hagi mustandi ja taotlused.");

    return steps;
  }

  function getDraftFields(){
    const amountRaw = (claimAmountEl && claimAmountEl.value || "").trim();
    const keyDate = (keyDateEl && keyDateEl.value || "").trim();
    const factsShort = (factsShortEl && factsShortEl.value || "").trim();
    const amount = amountRaw ? `${amountRaw} EUR` : "";
    return { amount, keyDate, factsShort };
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
      "- Kirjelda lühidalt, miks kostjal on kohustus ja miks nõue on põhjendatud.",
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
      "- [vajadusel lisataotlused: tunnistajad, ekspertiis, tõendite nõudmine].",
      "",
      "7. Lisad",
      "- Lisade loetelu (numbritega, sama mis tõendite loendis).",
      "",
      `Märkus: see on struktuur. Skoor: ${total}/100`
    ].join("\n");
  }

  function setDraftValue(){
    if (!draftEl) return;
    const { total } = score();
    draftEl.value = buildDraft(total);
  }

  function refreshDraftIfVisible(){
    if (resultCard && !resultCard.classList.contains("hidden")) {
      setDraftValue();
    }
  }

  function renderResult(){
    const { total, missing } = score();

    if (riskBadge){
      riskBadge.textContent = total>=70 ? "ROHELINE — hea lähtekoht"
        : total>=45 ? "KOLLANE — keskmine risk"
        : "PUNANE — kõrge risk";
    }

    if (scoreLine) scoreLine.textContent = `Skoor: ${total}/100`;

    if (missingList){
      missingList.innerHTML = "";
      const items = (missing.length ? missing : ["Tuvastatud nõrkusi ei tulnud vastustest välja (see ei välista erandeid)."]);
      items.slice(0,12).forEach((m)=>{
        const li=document.createElement("li"); li.textContent=m; missingList.appendChild(li);
      });
    }

    if (nextSteps){
      nextSteps.innerHTML = "";
      buildNextSteps(total, missing).slice(0,8).forEach((s)=>{
        const li=document.createElement("li"); li.textContent=s; nextSteps.appendChild(li);
      });
    }

    // Mustand pannakse alati (välistab “tühja kasti” olukorra)
    setDraftValue();

    if (resultCard){
      resultCard.classList.remove("hidden");
      resultCard.scrollIntoView({ behavior:"smooth", block:"start" });
    }
  }

  if (startBtn){
    startBtn.addEventListener("click", () => {
      if (formCard) formCard.classList.remove("hidden");
      if (resultCard) resultCard.classList.add("hidden");
      renderQuestions();
      if (formCard) formCard.scrollIntoView({ behavior:"smooth", block:"start" });
    });
  }

  if (calcBtn) calcBtn.addEventListener("click", renderResult);

  if (resetBtn){
    resetBtn.addEventListener("click", () => {
      state = {};
      if (resultCard) resultCard.classList.add("hidden");
      renderQuestions();
      // ära kuva tulemust, aga hoia mustandi loogika valmis
    });
  }

  if (copyBtn){
    copyBtn.addEventListener("click", async () => {
      try{
        if (!draftEl) return;
        await navigator.clipboard.writeText(draftEl.value);
        copyBtn.textContent="Kopeeritud!";
        setTimeout(()=>copyBtn.textContent="Kopeeri",1200);
      }catch{
        alert("Kopeerimine ei õnnestunud. Vali tekst ja kopeeri käsitsi.");
      }
    });
  }

  if (printBtn) printBtn.addEventListener("click", ()=>window.print());

  document.querySelectorAll('input[name="claimType"]').forEach((r)=>{
    r.addEventListener("change", ()=>{
      state = {};
      if (resultCard) resultCard.classList.add("hidden");
      if (formCard && !formCard.classList.contains("hidden")) renderQuestions();
    });
  });

  // Live update draft fields (when result visible)
  [claimAmountEl, keyDateEl, factsShortEl].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", () => refreshDraftIfVisible());
  });
});
