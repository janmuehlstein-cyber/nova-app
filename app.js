const $ = (id) => document.getElementById(id);
const today = new Date();
const dateFmt = new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
$('todayLine').textContent = dateFmt.format(today);
$('calendarToday').textContent = new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'long',year:'numeric'}).format(today);
$('eventDate').value = new Date().toISOString().slice(0,10);

document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===btn));
  document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
  $(btn.dataset.tab+'Panel').classList.add('active');
}));

$('messageInput').addEventListener('input', e => $('charCount').textContent = `${e.target.value.length} Zeichen`);

function analyzeMessage(raw){
  const s = raw.toLowerCase();
  const hasQuestion = /\\?|kannst du|könntest du|weißt du|wann|wo/.test(s);
  const urgent = /dringend|sofort|jetzt|wichtig|problem|hilfe/.test(s);
  const emotional = /traurig|enttäuscht|verletzt|liebe|vermiss|streit|sauer|wütend|tut mir leid/.test(s);
  const scheduling = /heute|morgen|uhr|treffen|zeit|termin|schule|training|später/.test(s);
  let category='Allgemein', title='Sachliche Nachricht', note='Die Nachricht wirkt zunächst wie eine normale Unterhaltung. Eine kurze, klare Antwort passt wahrscheinlich gut.';
  let reply='Alles klar, danke dir für die Nachricht!';
  if(emotional){category='Persönlich';title='Persönliches Thema';note='Hier geht es möglicherweise um Gefühle oder eine persönliche Situation. Antworte aufmerksam und vermeide eine vorschnelle oder automatische Zusage.';reply='Danke, dass du mir das sagst. Ich möchte darauf eingehen und in Ruhe darüber sprechen.';}
  else if(urgent){category='Dringend';title='Möglicherweise wichtig';note='Die Nachricht enthält Hinweise auf Zeitdruck oder ein Problem. Prüfe den Inhalt selbst, bevor du antwortest.';reply='Ich habe deine Nachricht gesehen. Ich kümmere mich darum und melde mich so bald wie möglich.';}
  else if(scheduling){category='Termin / Planung';title='Organisatorische Nachricht';note='Es geht wahrscheinlich um Zeitplanung oder einen Termin. Prüfe deinen Kalender, bevor du eine feste Zeit bestätigst.';reply='Danke! Ich schaue kurz in meinen Kalender und gebe dir dann Bescheid, welche Zeit bei mir passt.';}
  else if(hasQuestion){category='Frage';title='Eine Antwort wird erwartet';note='Die Person stellt vermutlich eine konkrete Frage. Beantworte sie direkt, wenn du die nötigen Informationen hast.';reply='Gute Frage – ich prüfe das kurz und gebe dir Bescheid.';}
  return {category,title,note,reply};
}
$('analyzeBtn').addEventListener('click',()=>{
  const raw=$('messageInput').value.trim();
  if(!raw){$('messageInput').focus();return;}
  const a=analyzeMessage(raw);
  $('analysisTitle').textContent=a.title;$('categoryPill').textContent=a.category;
  $('analysisText').textContent=a.note;$('suggestionText').textContent=a.reply;
  $('result').classList.remove('hidden');
  $('result').scrollIntoView({behavior:'smooth',block:'nearest'});
});
$('copyBtn').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('suggestionText').textContent);$('copyBtn').textContent='Kopiert ✓';setTimeout(()=>$('copyBtn').textContent='Text kopieren',1600);}
  catch(e){$('copyBtn').textContent='Bitte Text markieren';}
});
$('editBtn').addEventListener('click',()=>$('messageInput').focus());

const KEY='nova_events_v1';
function getEvents(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
function saveEvents(events){localStorage.setItem(KEY,JSON.stringify(events));renderEvents()}
function renderEvents(){
  const events=getEvents().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const list=$('eventList');list.innerHTML='';
  if(!events.length){list.innerHTML='<div class="empty">Noch keine Termine gespeichert.</div>';return;}
  events.forEach(ev=>{
    const item=document.createElement('div');item.className='event-item';
    const main=document.createElement('div');const title=document.createElement('div');title.className='event-main';title.textContent=ev.title;
    const time=document.createElement('div');time.className='event-time';time.textContent=new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(ev.date+'T12:00:00'))+(ev.time?' · '+ev.time:'');
    main.append(title,time);const del=document.createElement('button');del.className='delete-event';del.textContent='×';del.setAttribute('aria-label','Termin löschen');del.onclick=()=>saveEvents(getEvents().filter(x=>x.id!==ev.id));
    item.append(main,del);list.append(item);
  });
}
$('eventForm').addEventListener('submit',e=>{
  e.preventDefault();const title=$('eventTitle').value.trim(),date=$('eventDate').value;
  if(!title||!date)return;
  const events=getEvents();events.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title,date,time:$('eventTime').value});
  saveEvents(events);$('eventTitle').value='';$('eventTime').value='';
});
$('clearDataBtn').addEventListener('click',()=>{if(confirm('Möchtest du wirklich alle lokal gespeicherten NOVA-Termine löschen?')){localStorage.removeItem(KEY);renderEvents();}});
renderEvents();

if('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}