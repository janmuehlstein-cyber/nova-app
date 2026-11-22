const $ = (id) => document.getElementById(id);

const dateFmt = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});
const shortDateFmt = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit', month: '2-digit', year: 'numeric'
});

// Use local calendar dates instead of UTC dates to avoid off-by-one errors.
function toLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const today = new Date();
$('todayLine').textContent = dateFmt.format(today);
$('calendarToday').textContent = shortDateFmt.format(today);
$('eventDate').value = toLocalDateValue(today);

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(tab => {
      const active = tab === btn;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
    const panel = $(btn.dataset.tab + 'Panel');
    if (panel) panel.classList.add('active');
  });
});

$('messageInput').addEventListener('input', event => {
  $('charCount').textContent = `${event.target.value.length} Zeichen`;
  $('result').classList.add('hidden');
});

function analyzeMessage(raw) {
  const s = raw.toLocaleLowerCase('de-DE');
  const hasQuestion = /\\?|kannst du|könntest du|weißt du|wann|wo/.test(s);
  const urgent = /dringend|sofort|jetzt|wichtig|problem|hilfe/.test(s);
  const emotional = /traurig|enttäuscht|verletzt|liebe|vermiss|streit|sauer|wütend|tut mir leid/.test(s);
  const scheduling = /heute|morgen|uhr|treffen|zeit|termin|schule|training|später/.test(s);

  let category = 'Allgemein';
  let title = 'Sachliche Nachricht';
  let note = 'Die Nachricht wirkt zunächst wie eine normale Unterhaltung. Eine kurze, klare Antwort passt wahrscheinlich gut.';
  let reply = 'Alles klar, danke dir für die Nachricht!';

  if (emotional) {
    category = 'Persönlich';
    title = 'Persönliches Thema';
    note = 'Hier geht es möglicherweise um Gefühle oder eine persönliche Situation. Antworte aufmerksam und vermeide eine vorschnelle oder automatische Zusage.';
    reply = 'Danke, dass du mir das sagst. Ich möchte darauf eingehen und in Ruhe darüber sprechen.';
  } else if (urgent) {
    category = 'Dringend';
    title = 'Möglicherweise wichtig';
    note = 'Die Nachricht enthält Hinweise auf Zeitdruck oder ein Problem. Prüfe den Inhalt selbst, bevor du antwortest.';
    reply = 'Ich habe deine Nachricht gesehen. Ich kümmere mich darum und melde mich so bald wie möglich.';
  } else if (scheduling) {
    category = 'Termin / Planung';
    title = 'Organisatorische Nachricht';
    note = 'Es geht wahrscheinlich um Zeitplanung oder einen Termin. Prüfe deinen Kalender, bevor du eine feste Zeit bestätigst.';
    reply = 'Danke! Ich schaue kurz in meinen Kalender und gebe dir dann Bescheid, welche Zeit bei mir passt.';
  } else if (hasQuestion) {
    category = 'Frage';
    title = 'Eine Antwort wird erwartet';
    note = 'Die Person stellt vermutlich eine konkrete Frage. Beantworte sie direkt, wenn du die nötigen Informationen hast.';
    reply = 'Gute Frage – ich prüfe das kurz und gebe dir Bescheid.';
  }

  return { category, title, note, reply };
}

$('analyzeBtn').addEventListener('click', () => {
  const raw = $('messageInput').value.trim();
  if (!raw) {
    $('messageInput').focus();
    $('messageInput').setAttribute('aria-invalid', 'true');
    return;
  }
  $('messageInput').removeAttribute('aria-invalid');

  const analysis = analyzeMessage(raw);
  $('analysisTitle').textContent = analysis.title;
  $('categoryPill').textContent = analysis.category;
  $('analysisText').textContent = analysis.note;
  $('suggestionText').textContent = analysis.reply;
  $('result').classList.remove('hidden');
  $('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

$('copyBtn').addEventListener('click', async () => {
  const text = $('suggestionText').textContent;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(text);
    $('copyBtn').textContent = 'Kopiert ✓';
    window.setTimeout(() => { $('copyBtn').textContent = 'Text kopieren'; }, 1600);
  } catch {
    $('copyBtn').textContent = 'Bitte Text markieren';
  }
});

$('editBtn').addEventListener('click', () => $('messageInput').focus());

const KEY = 'nova_events_v1';

// Apple Calendar bridge: import and export standard iCalendar (.ics) files.
function icsUnescape(value) {
  return value.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
}
function icsEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
function unfoldIcs(text) {
  return text.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
}
function parseIcsDate(line) {
  if (!line) return null;
  const parts = line.split(':');
  const meta = parts.shift();
  const value = parts.join(':').trim();
  const dateOnly = /VALUE=DATE/.test(meta) || /^\d{8}$/.test(value);
  if (dateOnly) return { date: `${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}`, time: '' };
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
  if (!match) return null;
  if (match[7]) {
    const utc = new Date(Date.UTC(+match[1], +match[2]-1, +match[3], +match[4], +match[5], +(match[6] || 0)));
    return { date: toLocalDateValue(utc), time: `${String(utc.getHours()).padStart(2,'0')}:${String(utc.getMinutes()).padStart(2,'0')}` };
  }
  return { date: `${match[1]}-${match[2]}-${match[3]}`, time: `${match[4]}:${match[5]}` };
}
function parseIcsEvents(text) {
  const lines = unfoldIcs(text);
  const events = [];
  let current = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { current = {}; continue; }
    if (line === 'END:VEVENT') {
      if (current?.SUMMARY && current?.DTSTART) {
        const parsed = parseIcsDate(current.DTSTART);
        if (parsed && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) {
          events.push({ id: current.UID || `ics-${Date.now()}-${events.length}`, title: icsUnescape(current.SUMMARY).slice(0,70), ...parsed, imported: true });
        }
      }
      current = null; continue;
    }
    if (!current) continue;
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const key = line.slice(0, colon).split(';')[0].toUpperCase();
    if (['UID','SUMMARY','DTSTART'].includes(key)) current[key] = line.slice(colon+1);
  }
  return events;
}
function downloadIcs() {
  const events = getEvents();
  const stamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//NOVA//Personal Calendar 0.3//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
  for (const event of events) {
    const uid = `${event.id}@nova.local`;
    const start = event.date.replace(/-/g,'') + (event.time ? `T${event.time.replace(':','')}00` : '');
    const endDate = event.date.replace(/-/g,'');
    lines.push('BEGIN:VEVENT',`UID:${uid}`,`DTSTAMP:${stamp}`,`DTSTART${event.time ? '' : ';VALUE=DATE'}:${start}`,`SUMMARY:${icsEscape(event.title)}`,'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'NOVA-Kalender.ics';
  document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  $('calendarSyncNote').textContent = `${events.length} NOVA-Termin(e) als .ics exportiert. Öffne die Datei mit Apple Kalender.`;
}
$('importCalendarBtn').addEventListener('click', () => $('calendarFileInput').click());
$('calendarFileInput').addEventListener('change', async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const imported = parseIcsEvents(await file.text());
    if (!imported.length) { alert('In dieser Datei wurden keine unterstützten Termine gefunden.'); return; }
    const existing = getEvents();
    const seen = new Set(existing.map(item => `${item.title}|${item.date}|${item.time || ''}`));
    let added = 0;
    for (const item of imported) {
      const fingerprint = `${item.title}|${item.date}|${item.time || ''}`;
      if (seen.has(fingerprint)) continue;
      existing.push({ id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`, title: item.title, date: item.date, time: item.time || '' });
      seen.add(fingerprint); added++;
    }
    if (saveEvents(existing)) $('calendarSyncNote').textContent = `${added} Termin(e) importiert · ${imported.length-added} Duplikat(e) übersprungen.`;
  } catch { alert('Die Kalenderdatei konnte nicht gelesen werden. Bitte verwende eine gültige .ics-Datei.'); }
  event.target.value = '';
});
$('exportCalendarBtn').addEventListener('click', downloadIcs);


function getEvents() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(stored)
      ? stored.filter(event =>
          event &&
          typeof event.id === 'string' &&
          typeof event.title === 'string' &&
          typeof event.date === 'string' &&
          /^\d{4}-\d{2}-\d{2}$/.test(event.date) &&
          (typeof event.time === 'string' || event.time === '')
        )
      : [];
  } catch {
    return [];
  }
}

function saveEvents(events) {
  try {
    localStorage.setItem(KEY, JSON.stringify(events));
    renderEvents();
    return true;
  } catch {
    alert('Die Termine konnten nicht gespeichert werden. Möglicherweise ist der Browser-Speicher voll oder deaktiviert.');
    return false;
  }
}

function renderEvents() {
  const events = getEvents().sort((a, b) =>
    (a.date + (a.time || '')) .localeCompare(b.date + (b.time || ''))
  );
  const list = $('eventList');
  list.replaceChildren();

  if (!events.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'Noch keine Termine gespeichert.';
    list.append(empty);
    return;
  }

  events.forEach(event => {
    const item = document.createElement('div');
    item.className = 'event-item';

    const main = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'event-main';
    title.textContent = event.title;

    const time = document.createElement('div');
    time.className = 'event-time';
    const readableDate = shortDateFmt.format(new Date(`${event.date}T12:00:00`));
    time.textContent = readableDate + (event.time ? ` · ${event.time}` : '');

    main.append(title, time);

    const del = document.createElement('button');
    del.className = 'delete-event';
    del.type = 'button';
    del.textContent = '×';
    del.setAttribute('aria-label', `Termin ${event.title} löschen`);
    del.addEventListener('click', () => {
      saveEvents(getEvents().filter(entry => entry.id !== event.id));
    });

    item.append(main, del);
    list.append(item);
  });
}

$('eventForm').addEventListener('submit', event => {
  event.preventDefault();
  const title = $('eventTitle').value.trim();
  const date = $('eventDate').value;
  const time = $('eventTime').value;

  if (!title || !date) return;
  if (date < toLocalDateValue()) {
    alert('Bitte wähle ein heutiges oder zukünftiges Datum.');
    $('eventDate').focus();
    return;
  }

  const events = getEvents();
  events.push({
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    date,
    time
  });

  if (saveEvents(events)) {
    $('eventTitle').value = '';
    $('eventTime').value = '';
    $('eventDate').value = toLocalDateValue();
  }
});

$('clearDataBtn').addEventListener('click', () => {
  if (!confirm('Möchtest du wirklich alle lokal gespeicherten NOVA-Termine löschen?')) return;
  try {
    localStorage.removeItem(KEY);
    renderEvents();
  } catch {
    alert('Die lokalen Daten konnten nicht gelöscht werden.');
  }
});

renderEvents();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // The app remains usable if offline support cannot be registered.
    });
  });
}
