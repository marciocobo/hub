/* ── Shared study-page engine ─────────────────────────────────────
   Consumed by ccaf_2026.html, aws_saa_study.html, clf_c02_study.html.
   Each page defines its own data (quizzes, exam bank, flashcards,
   checklist) and calls StudyEngine.init(config) once at the bottom
   of its <script> block. See openspec/changes/unify-and-enhance-
   study-hub/design.md for the schema/behavior this implements. */

/* ═══════════════ Unified progress storage (study-progress-tracking) ═══════════════ */
const PROGRESS_KEY = 'hub_study_progress';
const EXAM_HISTORY_CAP = 20;

function loadAllProgress(){
  try{ const p = JSON.parse(localStorage.getItem(PROGRESS_KEY)); return (p && typeof p==='object') ? p : {}; }
  catch(e){ return {}; }
}
function saveAllProgress(all){
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}
function getCertProgress(certId){
  const all = loadAllProgress();
  if(!all[certId]) all[certId] = { checklist:{}, flashcards:{}, examHistory:[] };
  if(!all[certId].checklist) all[certId].checklist = {};
  if(!all[certId].flashcards) all[certId].flashcards = {};
  if(!all[certId].examHistory) all[certId].examHistory = [];
  return all[certId];
}
function setCertProgress(certId, certData){
  const all = loadAllProgress();
  all[certId] = certData;
  saveAllProgress(all);
}

/* One-time, idempotent, best-effort migration from a page's old
   per-page checklist key into the unified schema. Old key is never
   deleted (design.md Decision 3). */
function migrateLegacyChecklist(certId, legacyKey, arrayFormat){
  const cert = getCertProgress(certId);
  if(Object.keys(cert.checklist).length) return; // already has unified data
  const raw = localStorage.getItem(legacyKey);
  if(!raw) return;
  try{
    const old = JSON.parse(raw);
    if(arrayFormat){
      if(Array.isArray(old)) old.forEach(i=>{ cert.checklist[i]=true; });
    } else if(old && typeof old==='object'){
      Object.keys(old).forEach(i=>{ if(old[i]) cert.checklist[i]=true; });
    }
    setCertProgress(certId, cert);
  }catch(e){ /* corrupted legacy data — ignore, do not touch storage */ }
}

function recordExamAttempt(certId, attempt){
  const cert = getCertProgress(certId);
  cert.examHistory.push(attempt);
  if(cert.examHistory.length > EXAM_HISTORY_CAP){
    cert.examHistory = cert.examHistory.slice(cert.examHistory.length - EXAM_HISTORY_CAP);
  }
  setCertProgress(certId, cert);
  return cert.examHistory;
}

/* Simplified SM-2 (flashcard-spaced-repetition) */
function fcGetState(certId, cardId){
  const cert = getCertProgress(certId);
  return cert.flashcards[cardId] || null;
}
function fcIsDue(certId, cardId){
  const st = fcGetState(certId, cardId);
  if(!st || !st.due) return true;
  return new Date(st.due).getTime() <= Date.now();
}
function fcMark(certId, cardId, known){
  const cert = getCertProgress(certId);
  const prev = cert.flashcards[cardId] || { known:false, interval:0, due:null };
  const interval = known ? Math.min(prev.interval ? prev.interval*2 : 1, 60) : 1;
  const due = new Date(Date.now() + interval*86400000).toISOString();
  const next = { known: !!known, interval, due };
  cert.flashcards[cardId] = next;
  setCertProgress(certId, cert);
  return next;
}

/* progress-export-import (UI lives on index.html; helpers shared here) */
function exportProgressEnvelope(){
  return { version: 1, exportedAt: new Date().toISOString(), progress: loadAllProgress() };
}
function validateProgressEnvelope(obj){
  return !!(obj && typeof obj==='object' && typeof obj.version==='number' && obj.progress && typeof obj.progress==='object');
}
function hasAnyProgress(){
  const all = loadAllProgress();
  return Object.keys(all).some(k=>{
    const c = all[k];
    return c && ((c.checklist && Object.keys(c.checklist).length) || (c.flashcards && Object.keys(c.flashcards).length) || (c.examHistory && c.examHistory.length));
  });
}

/* ═══════════════ Dashboard navigation ═══════════════ */
let _titles = {};
function P(id, el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const target = document.getElementById('page-'+id);
  if(target) target.classList.add('active');
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('active'));
  if(el) el.classList.add('active');
  const tb = document.getElementById('tbtitle');
  if(tb) tb.textContent = _titles[id] || id;
  const main = document.getElementById('main');
  if(main) main.scrollTo(0,0);
  window.scrollTo(0,0);
  if(id==='home') setTimeout(animBars,150);
}
function animBars(){
  document.querySelectorAll('.dbf[data-t]').forEach(e=>{ e.style.width = e.dataset.t+'%'; });
}
window.P = P;

/* ═══════════════ Per-domain quiz engine ═══════════════ */
function buildQ(cid, qs){
  const el = document.getElementById(cid); if(!el) return;
  const sq = qs.map(q=>{ const n=q.o.length, ix=[...Array(n).keys()].sort(()=>Math.random()-.5); return {...q, o: ix.map(i=>q.o[i]), a: ix.indexOf(q.a)}; });
  const st = { qs: sq, cur:0, score:0, ans:false };
  window['_q'+cid] = st;
  renderQ(el, st);
}
function renderQ(el, st){
  const q = st.qs[st.cur];
  el.innerHTML = `<div style="font-size:15px;font-weight:600;margin-bottom:14px;line-height:1.5">${st.cur+1}. ${q.q}</div>
${q.o.map((o,i)=>`<button class="qo" onclick="pickQ(this,${i},'_q${el.id}')">${o}</button>`).join('')}
<div class="qfb" id="fb_${el.id}"></div>
<div class="qnav">
${st.cur>0?`<button class="btn bg" onclick="navQ('${el.id}',-1)">← Ant.</button>`:''}
<span class="qc">${st.cur+1}/${st.qs.length} · Acertos: ${st.score}</span>
${st.cur<st.qs.length-1?`<button class="btn bp" onclick="navQ('${el.id}',1)" style="margin-left:auto">Próx. →</button>`:`<button class="btn bp" onclick="finQ('${el.id}')" style="margin-left:auto">Ver resultado</button>`}
</div>`;
}
window.pickQ = function(btn, idx, stk){
  const st = window[stk]; if(st.ans) return; st.ans = true;
  const q = st.qs[st.cur];
  btn.closest('[id]').querySelectorAll('.qo').forEach((o,i)=>{
    if(i===q.a) o.classList.add('correct');
    else if(i===idx && idx!==q.a) o.classList.add('wrong');
    o.disabled = true;
  });
  if(idx===q.a) st.score++;
  const fb = document.getElementById('fb_'+stk.replace('_q',''));
  if(fb){ fb.textContent = (idx===q.a?'✅ Correto! ':'❌ Incorreto. ')+q.e; fb.className = 'qfb show '+(idx===q.a?'ok':'bad'); }
};
window.navQ = function(eid, dir){
  const st = window['_q'+eid]; st.cur = Math.max(0, Math.min(st.qs.length-1, st.cur+dir)); st.ans=false; renderQ(document.getElementById(eid), st);
};
window.finQ = function(eid){
  const st = window['_q'+eid]; const pct = Math.round((st.score/st.qs.length)*100);
  const col = pct>=72?'#34d399':pct>=50?'#fbbf24':'#f87171';
  document.getElementById(eid).innerHTML = `<div style="text-align:center;padding:20px"><div style="font-size:48px;font-weight:800;color:${col}">${pct}%</div><div style="font-size:16px;font-weight:600;margin:8px 0">${st.score}/${st.qs.length} corretas</div><div style="color:var(--text2);font-size:14px;margin-bottom:20px">${pct>=72?'🏆 Aprovado!':pct>=50?'📚 Quase lá!':'🔁 Continue estudando.'}</div><button class="btn bp" onclick="restQ('${eid}')">↺ Refazer</button></div>`;
};
window.restQ = function(eid){ const st = window['_q'+eid]; st.cur=0; st.score=0; st.ans=false; renderQ(document.getElementById(eid), st); };

/* ═══════════════ Practice exam engine (+ exam-attempt-history) ═══════════════ */
let _examCertId=null, _EXAM=[], _EL=0, _examMinutes=90, _passScore=700;
let eQ=[], eIdx=0, eAns={}, eFlags=new Set(), eTi=null, eSec=0, eDone=false;

function renderExamHistory(){
  const container = document.getElementById('exam-history');
  if(!container) return;
  const cert = getCertProgress(_examCertId);
  const hist = cert.examHistory.slice().reverse();
  if(!hist.length){ container.innerHTML = '<div class="hist-empty">Nenhuma tentativa registrada ainda.</div>'; return; }
  container.innerHTML = hist.map(a=>{
    const d = new Date(a.date);
    const dateStr = isNaN(d.getTime()) ? a.date : d.toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
    const pass = a.score >= _passScore;
    return `<div class="hist-row"><span class="hist-score" style="color:${pass?'var(--green)':'var(--red)'}">${a.score}</span><span class="hist-date">${dateStr} · ${a.pct}%</span></div>`;
  }).join('');
}

window.startExam = function(){
  eQ = [..._EXAM].sort(()=>Math.random()-.5).map(q=>{ const n=q.o.length, ix=[...Array(n).keys()].sort(()=>Math.random()-.5); return {...q, o: ix.map(i=>q.o[i]), a: ix.indexOf(q.a)}; });
  eIdx=0; eAns={}; eFlags=new Set(); eDone=false;
  document.getElementById('exam-start').style.display='none';
  document.getElementById('exam-body').style.display='block';
  document.getElementById('exam-result').style.display='none';
  eSec = _examMinutes*60; if(eTi) clearInterval(eTi);
  eTi = setInterval(()=>{
    eSec--; const m=Math.floor(eSec/60), s=eSec%60;
    const cl=document.getElementById('exam-clock');
    cl.textContent=(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
    cl.style.color = eSec<600 ? 'var(--red)' : 'var(--yellow)';
    if(eSec<=0){ clearInterval(eTi); finishExam(); }
  },1000);
  renderExamQ();
};
function renderExamQ(){
  const q = eQ[eIdx];
  document.getElementById('exam-qnum').textContent = 'Questão '+(eIdx+1)+' de '+_EL;
  document.getElementById('exam-bf').style.width = ((eIdx+1)/_EL*100)+'%';
  document.getElementById('exam-domain').textContent = q.d;
  document.getElementById('exam-q').textContent = q.q;
  document.getElementById('exam-score-live').textContent = 'Respondidas: '+Object.keys(eAns).length+' | Marcadas: '+eFlags.size;
  const sel = eAns[eIdx];
  document.getElementById('exam-opts').innerHTML = q.o.map((o,i)=>
    `<button class="qo${sel===i?' correct':''}" onclick="eSelect(${i})">${String.fromCharCode(65+i)}. ${o}</button>`).join('');
  document.getElementById('exam-dots').innerHTML = eQ.map((_,i)=>
    `<div style="width:18px;height:18px;border-radius:4px;cursor:pointer;font-size:9px;display:flex;align-items:center;justify-content:center;color:var(--text3);background:${eAns[i]!==undefined?'var(--green)':eFlags.has(i)?'var(--yellow)':i===eIdx?'var(--accent)':'var(--bg3)'};border:1px solid var(--border)" onclick="eGoto(${i})">${i+1}</div>`).join('');
}
window.eSelect = function(i){ if(eDone) return; eAns[eIdx]=i; renderExamQ(); };
window.eGoto = function(i){ eIdx=i; renderExamQ(); };
window.examNav = function(d){ eIdx = Math.max(0, Math.min(_EL-1, eIdx+d)); renderExamQ(); };
window.examFlag = function(){ if(eFlags.has(eIdx)) eFlags.delete(eIdx); else eFlags.add(eIdx); renderExamQ(); };
window.finishExam = function(){
  clearInterval(eTi); eDone=true;
  let correct=0; const domCnt={}, domCorr={};
  eQ.forEach((q,i)=>{ domCnt[q.d]=(domCnt[q.d]||0)+1; if(eAns[i]===q.a){ correct++; domCorr[q.d]=(domCorr[q.d]||0)+1; } });
  const pct = Math.round(correct/_EL*100); const scaled = Math.round(correct/_EL*1000);
  const pass = scaled >= _passScore;
  const byDomain = {};
  Object.keys(domCnt).forEach(d=>{ byDomain[d] = [domCorr[d]||0, domCnt[d]]; });
  recordExamAttempt(_examCertId, { date: new Date().toISOString(), score: scaled, pct, byDomain });
  const domHtml = Object.keys(domCnt).sort().map(d=>{
    const p = Math.round((domCorr[d]||0)/domCnt[d]*100);
    return `<div class="rcard ${p>=72?'rc':'rw'}"><strong>${d}</strong>: ${domCorr[d]||0}/${domCnt[d]} (${p}%)<div class="result-bar"><div class="result-fill" style="width:${p}%;background:${p>=72?'var(--green)':'var(--red)'}"></div></div></div>`;
  }).join('');
  const wrongHtml = eQ.map((q,i)=>eAns[i]!==q.a
    ? `<div class="rcard rw"><strong>Q${i+1} [${q.d}]</strong> ${q.q}<br><span style="color:var(--red)">Sua resposta: ${q.o[eAns[i]]!==undefined?q.o[eAns[i]]:'—'}</span><br><span style="color:var(--green)">Correta: ${q.o[q.a]}</span><br><span style="color:var(--text3);font-size:12px">${q.e||''}</span></div>`
    : '').join('');
  document.getElementById('exam-body').style.display='none';
  document.getElementById('exam-result').style.display='block';
  document.getElementById('exam-result-card').innerHTML = `
<div style="text-align:center;padding:20px 0 28px">
<div style="font-size:64px;font-weight:800;color:${pass?'var(--green)':'var(--red)'}">${scaled}</div>
<div style="color:var(--text2);margin-bottom:8px">pontos · ${correct}/${_EL} corretas (${pct}%)</div>
<div style="display:inline-block;padding:8px 24px;border-radius:99px;font-weight:700;background:${pass?'rgba(52,211,153,.15)':'rgba(248,113,113,.15)'};color:${pass?'var(--green)':'var(--red)'};border:1px solid ${pass?'var(--green)':'var(--red)'}">
${pass?'✅ APROVADO — Parabéns!':'❌ Abaixo do mínimo — Continue praticando'}
</div>
</div>
<h3 style="font-size:15px;margin-bottom:12px">Por Domínio</h3>${domHtml}
${wrongHtml?`<h3 style="font-size:15px;margin:20px 0 12px;color:var(--text2)">Revisão de Erros</h3>${wrongHtml}`:''}
<div style="margin-top:20px;display:flex;gap:10px">
<button class="btn bp" onclick="document.getElementById('exam-start').style.display='block';document.getElementById('exam-result').style.display='none'">↺ Refazer</button>
<button class="btn bg" onclick="P('home',document.getElementById('nhome'))">← Dashboard</button>
</div>`;
  renderExamHistory();
};

/* ═══════════════ Flashcards (+ flashcard-spaced-repetition) ═══════════════ */
let _fcCertId=null, _FCS=[], fcIdx=0, fcFilt=[];

function fcOrderByDue(cards){
  const due=[], later=[];
  cards.forEach(c=>{ (fcIsDue(_fcCertId, c._id) ? due : later).push(c); });
  return due.concat(later);
}
function renderFCTags(){
  const tagsEl = document.getElementById('fc-tags'); if(!tagsEl) return;
  const doms = [...new Set(_FCS.map(f=>f.d))];
  tagsEl.innerHTML =
    '<button class="btn bp" style="font-size:12px;padding:5px 12px" onclick="setFCDom(null,this)">Todos</button>'+
    doms.map(d=>`<button class="btn bg" style="font-size:12px;padding:5px 12px" onclick="setFCDom('${d}',this)">${d}</button>`).join('');
}
window.setFCDom = function(d, btn){
  const base = d ? _FCS.filter(f=>f.d===d) : [..._FCS];
  fcFilt = fcOrderByDue(base); fcIdx=0;
  document.querySelectorAll('#fc-tags button').forEach(b=>b.className='btn bg');
  if(btn) btn.className='btn bp';
  renderFC();
};
function renderFC(){
  if(!fcFilt.length) return;
  const c = fcFilt[fcIdx];
  document.getElementById('fc-dom').textContent = c.d;
  document.getElementById('fc-dom2').textContent = c.d;
  document.getElementById('fc-front').textContent = c.f;
  document.getElementById('fc-back').textContent = c.b;
  document.getElementById('fc-ctr').textContent = (fcIdx+1)+' / '+fcFilt.length;
  document.getElementById('fc-card').classList.remove('flipped');
  const badge = document.getElementById('fc-due-badge');
  if(badge){
    const st = fcGetState(_fcCertId, c._id);
    badge.style.display = (st && !fcIsDue(_fcCertId, c._id)) ? 'none' : (st ? 'inline-block' : 'none');
  }
}
window.flipFC = function(){ document.getElementById('fc-card').classList.toggle('flipped'); };
window.fcNav = function(d){ if(!fcFilt.length) return; fcIdx=(fcIdx+d+fcFilt.length)%fcFilt.length; renderFC(); };
window.shuffleFC = function(){ fcFilt=[...fcFilt].sort(()=>Math.random()-.5); fcIdx=0; renderFC(); };
window.fcMarkKnown = function(){ if(!fcFilt.length) return; fcMark(_fcCertId, fcFilt[fcIdx]._id, true); fcNav(1); };
window.fcMarkUnknown = function(){ if(!fcFilt.length) return; fcMark(_fcCertId, fcFilt[fcIdx]._id, false); fcNav(1); };

document.addEventListener('keydown', e=>{
  const page = document.getElementById('page-flashcards');
  if(page && page.classList.contains('active')){
    if(e.key==='ArrowLeft') fcNav(-1);
    if(e.key==='ArrowRight') fcNav(1);
    if(e.key===' '){ e.preventDefault(); flipFC(); }
  }
});

/* ═══════════════ Checklist (study-progress-tracking) ═══════════════ */
/* Adapter A: static markup already in the page (.chi#chi{i}), used by clf/saa */
function initChecklistStatic(certId, total, opts){
  const cert = getCertProgress(certId);
  const barId = (opts && opts.barId) || 'cpf';
  const txtId = (opts && opts.txtId) || 'cp-txt';
  function updateCP(){
    const done = Object.values(cert.checklist).filter(Boolean).length;
    const pct = total ? (done/total*100) : 0;
    const bar = document.getElementById(barId); if(bar) bar.style.width = pct+'%';
    const txt = document.getElementById(txtId); if(txt) txt.textContent = done+' / '+total+' concluídos';
    const ptext = document.getElementById('ptext'); if(ptext) ptext.textContent = done+' / '+total+' itens';
    const gpbar = document.getElementById('gpbar'); if(gpbar) gpbar.style.width = pct+'%';
  }
  window.toggleChi = function(i){
    cert.checklist[i] = !cert.checklist[i];
    if(!cert.checklist[i]) delete cert.checklist[i];
    setCertProgress(certId, cert);
    const el = document.getElementById('chi'+i);
    if(el) el.classList.toggle('ck', !!cert.checklist[i]);
    updateCP();
  };
  Object.keys(cert.checklist).forEach(i=>{ if(cert.checklist[i]) document.getElementById('chi'+i)?.classList.add('ck'); });
  updateCP();
}
/* Adapter B: data-driven groups rendered by the engine, used by ccaf */
function initChecklistGrouped(certId, groups, urls, opts){
  const cert = getCertProgress(certId);
  const containerId = (opts && opts.containerId) || 'chklist';
  const barId = (opts && opts.barId) || 'cpfill';
  const txtId = (opts && opts.txtId) || 'cptxt';
  const flat = groups.flatMap(g=>g.items);
  function render(){
    let offset=0;
    const el = document.getElementById(containerId);
    if(el){
      el.innerHTML = groups.map(g=>{
        const items = g.items.map((t,li)=>{
          const gi = offset+li;
          const ck = !!cert.checklist[gi];
          const url = urls && urls[gi];
          const link = url
            ? `<a class="chi-link" href="${url}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Abrir documentação">↗</a>`
            : `<a class="chi-link" href="#" onclick="event.stopPropagation();P('resources',document.getElementById('nresources'));return false;" title="Ver Recursos">📚</a>`;
          return `<div class="chi${ck?' ck':''}" onclick="tck(${gi})"><div class="chb">${ck?'<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0d1117" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}</div><div class="cht">${t}${link}</div></div>`;
        }).join('');
        offset += g.items.length;
        return `<div style="font-size:14px;font-weight:700;color:var(--accent2);margin:20px 0 10px;padding-top:12px;border-top:1px solid var(--border)">${g.g}</div><div class="card" style="padding:12px 20px">${items}</div>`;
      }).join('');
    }
    const done = Object.values(cert.checklist).filter(Boolean).length;
    const pct = flat.length ? Math.round(done/flat.length*100) : 0;
    const bar = document.getElementById(barId); if(bar) bar.style.width = pct+'%';
    const txt = document.getElementById(txtId); if(txt) txt.textContent = done+' de '+flat.length+' completos ('+pct+'%)';
    const ptext = document.getElementById('ptext'); if(ptext) ptext.textContent = done+'/'+flat.length+' itens';
    const gpbar = document.getElementById('gpbar'); if(gpbar) gpbar.style.width = pct+'%';
  }
  window.tck = function(i){
    cert.checklist[i] = !cert.checklist[i];
    if(!cert.checklist[i]) delete cert.checklist[i];
    setCertProgress(certId, cert);
    render();
  };
  render();
}

/* ═══════════════ Sidebar (mobile) ═══════════════ */
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
}
window.toggleSidebar = toggleSidebar;
function wireSidebarMobile(){
  const overlay = document.getElementById('overlay');
  if(overlay) overlay.addEventListener('click', function(){
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
  });
  document.querySelectorAll('.ni').forEach(function(ni){
    ni.addEventListener('click', function(){
      if(window.innerWidth<=768){
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('open');
      }
    });
  });
}

/* ═══════════════ Public init ═══════════════ */
const StudyEngine = {
  init(config){
    _titles = config.titles || {};
    setTimeout(animBars, 300);

    if(config.quizzes){
      Object.keys(config.quizzes).forEach(k=>buildQ('q'+k, config.quizzes[k]));
    }

    if(config.exam){
      _examCertId = config.certId;
      _EXAM = config.exam;
      _EL = _EXAM.length;
      _examMinutes = config.examMinutes || 90;
      _passScore = config.passScore || 700;
      renderExamHistory();
    }

    if(config.flashcards){
      _fcCertId = config.certId;
      _FCS = config.flashcards;
      _FCS.forEach((c,i)=>{ c._id = i; });
      fcFilt = fcOrderByDue([..._FCS]);
      renderFCTags();
      renderFC();
    }

    if(config.checklist){
      if(config.checklist.mode==='grouped'){
        migrateLegacyChecklist(config.certId, config.checklist.legacyKey, true);
        initChecklistGrouped(config.certId, config.checklist.groups, config.checklist.urls, config.checklist);
      } else {
        migrateLegacyChecklist(config.certId, config.checklist.legacyKey, false);
        initChecklistStatic(config.certId, config.checklist.total, config.checklist);
      }
    }

    wireSidebarMobile();
  }
};
window.StudyEngine = StudyEngine;
