// ---------------------------------------------------------------------------
// Events calendar, fed by a public Google Calendar (API v3, read-only key).
// Config comes from window.VTC_CAL = { calendarId, apiKey, sampleUrl } which the
// calendar-config partial emits. When calendarId or apiKey is empty, we run in
// MOCK MODE against the bundled sample JSON so local dev needs no Google setup.
// ---------------------------------------------------------------------------

const cfg = () => window.VTC_CAL || {};
const mockMode = () => !(cfg().calendarId && cfg().apiKey);

// Parse an API event into a plain shape the templates use.
function normalize(item) {
  const allDay = !!(item.start && item.start.date);
  const start = new Date(allDay ? item.start.date + 'T00:00:00' : item.start.dateTime);
  const end = item.end
    ? new Date(item.end.date ? item.end.date + 'T00:00:00' : item.end.dateTime)
    : start;
  return {
    id: item.id,
    title: item.summary || '(untitled event)',
    description: item.description || '',
    location: item.location || '',
    link: item.htmlLink || '',
    allDay,
    start,
    end,
    dayKey: localDayKey(start),
  };
}

function localDayKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// Fetch events between two dates (inclusive start, exclusive end).
async function fetchEvents(timeMin, timeMax) {
  if (mockMode()) {
    const res = await fetch(cfg().sampleUrl);
    if (!res.ok) throw new Error('sample data unavailable');
    const data = await res.json();
    return (data.items || [])
      .map(normalize)
      .filter((e) => e.start >= timeMin && e.start < timeMax)
      .sort((a, b) => a.start - b.start);
  }
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(cfg().calendarId) + '/events');
  url.search = new URLSearchParams({
    key: cfg().apiKey,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error('calendar request failed: ' + res.status);
  const data = await res.json();
  return (data.items || []).map(normalize);
}

const fmtTime = (d) =>
  d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(' ', ' ');
const fmtLongDate = (d) =>
  d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

// Escape HTML, then turn bare URLs into links. Lets the calendar editor link an
// event to a post/page just by pasting the URL into the event description.
function linkifyDescription(text) {
  const escaped = String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  return escaped.replace(/https?:\/\/[^\s<]+[^\s<.,)!?]/g, (url) =>
    `<a href="${url}" target="_blank" rel="noopener" class="font-medium text-brand-700 underline hover:text-brand-500">${url.replace(/^https?:\/\//, '')}</a>`);
}

export function registerCalendarComponents(Alpine) {
  // Full month view (embedded on /events/)
  Alpine.data('vtcCalendar', () => ({
    year: 0,
    month: 0, // 0-based
    events: [],
    loading: true,
    failed: false,
    selected: null,
    mock: mockMode(),

    init() {
      const now = new Date();
      this.year = now.getFullYear();
      this.month = now.getMonth();
      this.load();
    },

    get monthLabel() {
      return new Date(this.year, this.month, 1).toLocaleDateString([], { month: 'long', year: 'numeric' });
    },

    // 42 cells (6 weeks), Sunday-first.
    get days() {
      const first = new Date(this.year, this.month, 1);
      const gridStart = new Date(first);
      gridStart.setDate(1 - first.getDay());
      const todayKey = localDayKey(new Date());
      return Array.from({ length: 42 }, (_, i) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + i);
        const key = localDayKey(date);
        return {
          key,
          num: date.getDate(),
          inMonth: date.getMonth() === this.month,
          isToday: key === todayKey,
          events: this.events.filter((e) => e.dayKey === key),
        };
      });
    },

    // Agenda view (mobile): this month's events grouped by day.
    get agenda() {
      const groups = [];
      for (const e of this.events) {
        const last = groups[groups.length - 1];
        if (last && last.key === e.dayKey) last.events.push(e);
        else groups.push({ key: e.dayKey, label: fmtLongDate(e.start), events: [e] });
      }
      return groups;
    },

    async load() {
      this.loading = true;
      this.failed = false;
      this.selected = null;
      try {
        const timeMin = new Date(this.year, this.month, 1);
        const timeMax = new Date(this.year, this.month + 1, 1);
        this.events = await fetchEvents(timeMin, timeMax);
      } catch (err) {
        console.error(err);
        this.failed = true;
        this.events = [];
      } finally {
        this.loading = false;
      }
    },

    prev() { this.month--; if (this.month < 0) { this.month = 11; this.year--; } this.load(); },
    next() { this.month++; if (this.month > 11) { this.month = 0; this.year++; } this.load(); },
    today() { const now = new Date(); this.year = now.getFullYear(); this.month = now.getMonth(); this.load(); },

    select(e) { this.selected = this.selected && this.selected.id === e.id ? null : e; },
    timeLabel(e) { return e.allDay ? 'All day' : fmtTime(e.start) + ' – ' + fmtTime(e.end); },
    descHtml(e) { return linkifyDescription(e.description); },
    dateLabel(e) { return fmtLongDate(e.start); },
  }));

  // "Next up" widget (events page): the N soonest upcoming events.
  Alpine.data('vtcUpcoming', (count = 3) => ({
    events: [],
    loading: true,
    failed: false,

    async init() {
      try {
        const now = new Date();
        const horizon = new Date(now);
        horizon.setFullYear(now.getFullYear() + 1);
        const events = await fetchEvents(now, horizon);
        this.events = events.slice(0, count);
      } catch (err) {
        console.error(err);
        this.failed = true;
      } finally {
        this.loading = false;
      }
    },

    monthShort(e) { return e.start.toLocaleDateString([], { month: 'short' }); },
    dayNum(e) { return e.start.getDate(); },
    when(e) {
      const date = e.start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      return e.allDay ? date : date + ' · ' + fmtTime(e.start);
    },
  }));
}
