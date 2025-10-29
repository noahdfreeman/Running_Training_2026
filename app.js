// Loads schedule.csv, renders weekly view, and saves checkmarks in localStorage.
const CSV_URL = 'schedule.csv';

const tbody = document.querySelector('#plan tbody');
const weekPicker = document.querySelector('#weekPicker');
const weekRangeEl = document.querySelector('#weekRange');
const weekMilesEl = document.querySelector('#weekMiles');
const progressEl = document.querySelector('#progress');

const btnPrev = document.querySelector('#prevWeek');
const btnNext = document.querySelector('#nextWeek');
const btnShowAll = document.querySelector('#showAll');
const btnShowWeek = document.querySelector('#showWeek');
const btnReset = document.querySelector('#resetChecks');

let rows = [];
let showingAll = false;

function parseCSV(text){
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(',');
  return lines.map(line=>{
    // Minimal CSV parser (handles quoted Notes)
    const parts=[]; let cur='', q=false;
    for (let i=0;i<line.length;i++){
      const c=line[i];
      if (c==='"'){ q=!q; continue; }
      if (c===',' && !q){ parts.push(cur); cur=''; continue; }
      cur+=c;
    }
    parts.push(cur);
    const obj = {};
    headers.forEach((h,i)=>obj[h.trim()] = (parts[i]||'').trim());
    obj.DateISO = obj.Date;
    obj.jsDate = new Date(obj.DateISO + 'T00:00:00');
    obj.Distance = parseFloat(obj.Distance)||0;
    return obj;
  });
}

function startOfWeek(d){ const x=new Date(d); const wd=(x.getDay()+6)%7; x.setDate(x.getDate()-wd); x.setHours(0,0,0,0); return x; }
function endOfWeek(d){ const x=startOfWeek(d); x.setDate(x.getDate()+6); return x; }
function fmt(d){ return d.toLocaleDateString(undefined,{month:'short',day:'numeric'}); }
function weekLabel(d){ const a=startOfWeek(d), b=endOfWeek(d); return `${fmt(a)} – ${fmt(b)}, ${b.getFullYear()}`; }

function render(forDate){
  tbody.innerHTML='';
  const so = startOfWeek(forDate), eo=endOfWeek(forDate);
  const view = showingAll ? rows : rows.filter(r=>r.jsDate>=so && r.jsDate<=eo);

  let miles=0, done=0, runs=0;

  view.forEach(r=>{
    const tr=document.createElement('tr');
    tr.dataset.workout = r.Workout;
    const doneKey = `done:${r.DateISO}`;

    tr.innerHTML = `
      <td>${r.Date}</td>
      <td>${r.Day}</td>
      <td>${r.Phase}</td>
      <td>${r.Workout}</td>
      <td class="num">${r.Distance ? r.Distance.toFixed(1) : ''}</td>
      <td>${r.Notes}</td>
      <td class="doneCell"><input type="checkbox" ${localStorage.getItem(doneKey)?'checked':''} aria-label="Done"></td>
    `;

    tr.querySelector('input').addEventListener('change', e=>{
      if (e.target.checked) localStorage.setItem(doneKey,'1');
      else localStorage.removeItem(doneKey);
      updateStats(forDate);
    });

    tbody.appendChild(tr);

    if (!showingAll){
      if (r.Distance) miles += r.Distance;
      if (r.Workout !== 'X'){ runs++; if (localStorage.getItem(doneKey)) done++; }
    }
  });

  weekRangeEl.textContent = showingAll ? 'Entire plan' : weekLabel(forDate);
  weekMilesEl.textContent = showingAll ? '' : `Week: ${miles.toFixed(1)} mi`;
  progressEl.textContent = showingAll ? '' : `Done: ${runs? Math.round(100*done/runs):0}%`;
}
function updateStats(d){ render(d); }

function setWeekInput(date){
  const d=startOfWeek(date);
  const jan4=new Date(d.getFullYear(),0,4);
  const week=Math.ceil((((d-jan4)/86400000)+((jan4.getDay()+6)%7)+1)/7);
  weekPicker.value = `${d.getFullYear()}-W${String(week).padStart(2,'0')}`;
}

async function init(){
  const text = await fetch(CSV_URL).then(r=>r.text());
  rows = parseCSV(text);

  const start = rows.find(r=>r.DateISO>='2025-11-09')?.jsDate || rows[0].jsDate;
  setWeekInput(start);
  render(start);

  weekPicker.addEventListener('change',()=>{
    const [y,w]=weekPicker.value.split('-W').map(Number);
    const jan4=new Date(y,0,4); // ISO anchor
    const monday=new Date(jan4.getTime()+(((w-1)*7-((jan4.getDay()+6)%7))*86400000));
    render(monday);
  });

  btnPrev.onclick = ()=>{ const first=document.querySelector('#plan tbody td');
    const now= first? new Date(first.textContent+'T00:00:00'):new Date();
    const d=startOfWeek(now); d.setDate(d.getDate()-7); setWeekInput(d); render(d); };

  btnNext.onclick = ()=>{ const first=document.querySelector('#plan tbody td');
    const now= first? new Date(first.textContent+'T00:00:00'):new Date();
    const d=startOfWeek(now); d.setDate(d.getDate()+7); setWeekInput(d); render(d); };

  btnShowAll.onclick = ()=>{ showingAll=true; render(rows[0].jsDate); };
  btnShowWeek.onclick = ()=>{ showingAll=false; const today=new Date(); setWeekInput(today); render(today); };
  btnReset.onclick = ()=>{ if(confirm('Clear all checkmarks?')){
    Object.keys(localStorage).forEach(k=>{ if(k.startsWith('done:')) localStorage.removeItem(k); });
    render(new Date());
  }};
}

init();
