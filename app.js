// NOVA WebApp MVP - app.js mit intelligenter Kalenderprüfung

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Calendar DOM Elements
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const eventList = document.getElementById('event-list');
    const addEventBtn = document.getElementById('add-event-btn');
    
    // Modal Elements
    const eventModal = document.getElementById('event-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const eventForm = document.getElementById('event-form');
    const eventTitleInput = document.getElementById('event-title');
    const eventDateInput = document.getElementById('event-date');
    const eventTimeInput = document.getElementById('event-time');

    // App State
    let messages = [
        { id: 1, sender: 'nova', text: 'Hallo! Ich bin NOVA, deine smarte Assistenz. Wie kann ich dir heute helfen?', time: getCurrentTime() }
    ];

    let events = loadEvents();
    let currentDate = new Date();

    // Initialize App
    initChat();
    initCalendar();

    // --- TAB NAVIGATION ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            if (targetTab === 'calendar') {
                renderCalendar();
            }
        });
    });

    // --- CHAT LOGIC ---
    function initChat() {
        renderMessages();
        
        sendButton.addEventListener('click', handleSendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }

    function renderMessages() {
        chatMessages.innerHTML = '';
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', msg.sender);
            
            messageDiv.innerHTML = `
                <div class="message-bubble">
                    <p>${escapeHTML(msg.text)}</p>
                    <span class="message-time">${msg.time}</span>
                </div>
            `;
            chatMessages.appendChild(messageDiv);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function handleSendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // User message hinzufügen
        messages.push({
            id: Date.now(),
            sender: 'user',
            text: text,
            time: getCurrentTime()
        });

        userInput.value = '';
        renderMessages();

        // NOVA denkt nach... Antwort generieren
        setTimeout(() => {
            const novaReply = handleNovaResponse(text);
            messages.push({
                id: Date.now() + 1,
                sender: 'nova',
                text: novaReply,
                time: getCurrentTime()
            });
            renderMessages();
            renderEventsList(); // Falls durch den Chat ein Event erstellt wurde
        }, 600);
    }

    // --- INTELLIGENTE NOVA ANTWORT & KALENDER-ABGLEICH ---
    function handleNovaResponse(userText) {
        const lowerText = userText.toLowerCase();

        // 1. Prüfen, ob es sich um einen Termin/Anfrage handelt
        const isAppointmentQuery = lowerText.includes('termin') || 
                                   lowerText.includes('morgen') || 
                                   lowerText.includes('heute') || 
                                   lowerText.includes('montag') || 
                                   lowerText.includes('dienstag') || 
                                   lowerText.includes('mittwoch') || 
                                   lowerText.includes('donnerstag') || 
                                   lowerText.includes('freitag') || 
                                   lowerText.includes('samstag') || 
                                   lowerText.includes('sonntag') || 
                                   lowerText.includes('uhr') ||
                                   lowerText.includes('wann');

        if (isAppointmentQuery) {
            // Versuche ein Datum aus dem Text zu filtern (vereinfachte MVP-Prüfung)
            // Wir prüfen, ob bereits Events in unserem NOVA-Kalender eingetragen sind
            const conflictingEvents = events.filter(event => {
                const eventTitleLower = event.title.toLowerCase();
                // Prüfen ob Wochentage oder Begriffe übereinstimmen
                const days = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag', 'morgen', 'heute'];
                for (let day of days) {
                    if (lowerText.includes(day) && (event.date.includes(day) || eventTitleLower.includes(day))) {
                        return true;
                    }
                }
                return false;
            });

            // Wenn Kollisionen da sind oder Termine an dem Tag existieren
            if (conflictingEvents.length > 0 || events.length > 0 && lowerText.includes('zeit')) {
                return `Da habe ich leider schon was vor (${conflictingEvents[0]?.title || 'bereits ein Termin eingetragen'}).`;
            } else {
                // Natürlich wirkende positive Antwort
                // Extrahiere Wochentag falls vorhanden für die Antwort
                let dayString = "Das";
                const foundDay = ['nächsten montag', 'nächsten dienstag', 'nächsten mittwoch', 'nächsten donnerstag', 'nächsten freitag', 'morgen', 'heute'].find(d => lowerText.includes(d));
                
                if (foundDay) {
                    return `${foundDay.charAt(0).toUpperCase() + foundDay.slice(1)} passt gut, da hab ich noch nichts vor!`;
                }
                return "Das passt zeitlich gut bei mir, ich habe nichts im Kalender stehen.";
            }
        }

        // 2. Standard-Antworten für andere Themen
        if (lowerText.includes('hallo') || lowerText.includes('hi')) {
            return 'Hallo! Schön, von dir zu hören. Was kann ich für dich tun?';
        } else if (lowerText.includes('wie geht es dir')) {
            return 'Mir geht es als NOVA hervorragend und ich bin bereit dir zu helfen!';
        } else {
            // Fallback
            return 'Alles klar, ich habe mir das Notierte angeschaut und halte dich auf dem Laufenden!';
        }
    }

    // --- CALENDAR LOGIC ---
    function initCalendar() {
        renderCalendar();
        renderEventsList();

        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        addEventBtn.addEventListener('click', () => {
            eventModal.style.display = 'block';
            eventDateInput.value = new Date().toISOString().split('T')[0];
        });

        closeBtn.addEventListener('click', () => {
            eventModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === eventModal) {
                eventModal.style.display = 'none';
            }
        });

        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newEvent = {
                id: Date.now(),
                title: eventTitleInput.value,
                date: eventDateInput.value,
                time: eventTimeInput.value || '00:00'
            };

            events.push(newEvent);
            saveEvents(events);
            
            eventModal.style.display = 'none';
            eventForm.reset();
            renderCalendar();
            renderEventsList();
        });
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
        calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

        calendarGrid.innerHTML = `
            <div class="day-name">Mo</div>
            <div class="day-name">Di</div>
            <div class="day-name">Mi</div>
            <div class="day-name">Do</div>
            <div class="day-name">Fr</div>
            <div class="day-name">Sa</div>
            <div class="day-name">So</div>
        `;

        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; 
        const totalDays = new Date(year, month + 1, 0).getDate();

        // Leere Felder am Monatsanfang
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyCell);
        }

        // Tage des Monats render
        for (let day = 1; day <= totalDays; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            
            const formattedMonth = String(month + 1).padStart(2, '0');
            const formattedDay = String(day).padStart(2, '0');
            const dateString = `${year}-${formattedMonth}-${formattedDay}`;

            dayCell.innerHTML = `<span class="day-number">${day}</span>`;

            // Prüfen ob Events an diesem Tag existieren
            const dayEvents = events.filter(e => e.date === dateString);
            if (dayEvents.length > 0) {
                dayCell.classList.add('has-event');
                const indicator = document.createElement('div');
                indicator.classList.add('event-indicator');
                dayCell.appendChild(indicator);
            }

            dayCell.addEventListener('click', () => {
                eventModal.style.display = 'block';
                eventDateInput.value = dateString;
            });

            calendarGrid.appendChild(dayCell);
        }
    }

    function renderEventsList() {
        eventList.innerHTML = '';
        if (events.length === 0) {
            eventList.innerHTML = '<p class="no-events">Keine Termine eingetragen.</p>';
            return;
        }

        // Nach Datum sortieren
        const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedEvents.forEach(ev => {
            const item = document.createElement('div');
            item.classList.add('event-item');
            item.innerHTML = `
                <div class="event-info">
                    <h4>${escapeHTML(ev.title)}</h4>
                    <p>${ev.date} ${ev.time ? 'um ' + ev.time : ''}</p>
                </div>
                <button class="delete-event-btn" data-id="${ev.id}">&times;</button>
            `;
            eventList.appendChild(item);
        });

        // Event Löschen Buttons verknüpfen
        document.querySelectorAll('.delete-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(e.target.getAttribute('data-id'));
                events = events.filter(ev => ev.id !== id);
                saveEvents(events);
                renderCalendar();
                renderEventsList();
            });
        });
    }

    // --- HELPER FUNCTIONS ---
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    function loadEvents() {
        const saved = localStorage.getItem('nova_events');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'Projekt-Meeting', date: '2026-06-10', time: '10:00' },
            { id: 2, title: 'Sport', date: '2026-06-12', time: '18:30' }
        ];
    }

    function saveEvents(evs) {
        localStorage.setItem('nova_events', JSON.stringify(evs));
    }
});
