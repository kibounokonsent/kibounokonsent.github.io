/* ==========================================================================
   WORLD CALENDAR — 世界カレンダー（描画ロジック）
   ルート: #/calendar

   設計方針:
   - 年は扱わない（統合暦の「1年の暦」を表示するページのため）
   - 曜日は表示しない
   - 行事があるセルには行事名を直接表示（3件以上は「＋N件」で省略）
   - 行事クリックはモーダルで詳細表示（カレンダー上・EVENTS一覧どちらからでも同じモーダル）
   - 行事に articleId があり、該当記事が実在する場合のみ「詳細を見る →」を表示し、
     既存の記事ページ（#/article/{id}, articleById()）へ接続する
   - イベントデータは js/data/calendar-events.js の CALENDAR_EVENTS を使う
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. 状態
   -------------------------------------------------------------------------- */

const calendarState = {
    month: 8,       // 年は扱わない。月だけを循環させる
    country: '全て'
};

// 月ごとの日数（うるう年の概念を持たないため固定）
const CALENDAR_MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/* --------------------------------------------------------------------------
   2. ユーティリティ
   -------------------------------------------------------------------------- */

// CALENDAR_EVENTSから登場する国名を重複なく取り出す（「全世界」は除く）
function getCalendarCountryList() {
    const set = new Set();
    CALENDAR_EVENTS.forEach(ev => {
        ev.countries.forEach(c => {
            if (c !== '全世界') set.add(c);
        });
    });
    return Array.from(set).sort();
}

// 現在の国フィルターを考慮して、そのイベントを表示すべきか判定
function isEventVisible(ev) {
    if (calendarState.country === '全て') return true;
    return ev.countries.includes('全世界') || ev.countries.includes(calendarState.country);
}

// 指定した月日のイベントを、国フィルターを考慮して取得
function getEventsForDay(month, day) {
    return CALENDAR_EVENTS.filter(ev => ev.month === month && ev.day === day && isEventVisible(ev));
}

// 指定した月の全イベントを、国フィルターを考慮して日付順に取得
function getEventsForMonth(month) {
    return CALENDAR_EVENTS
        .filter(ev => ev.month === month && isEventVisible(ev))
        .sort((a, b) => a.day - b.day);
}

function getDaysInMonth(month) {
    return CALENDAR_MONTH_LENGTHS[month - 1];
}

// idからイベントを取得（モーダル表示用）
function getEventById(id) {
    return CALENDAR_EVENTS.find(ev => ev.id === id);
}

/* --------------------------------------------------------------------------
   3. ページ全体の生成
   -------------------------------------------------------------------------- */

// app.js から #/calendar に遷移した際にこの関数が呼ばれる想定
function renderCalendarPage(container) {
    container.innerHTML = `
        <section class="calendar-page">
            <header class="calendar-page__header">
                <span class="calendar-page__eyebrow">WORLD CALENDAR</span>
                <h1>世界カレンダー</h1>
                <p class="calendar-page__desc">世界各国の祝日・祭り・記念日を閲覧できます。</p>
            </header>

            <div class="calendar-nav">
                <button class="calendar-nav__btn" id="calendar-prev" aria-label="前の月">◀</button>
                <div class="calendar-nav__label" id="calendar-label"></div>
                <button class="calendar-nav__btn" id="calendar-next" aria-label="次の月">▶</button>
            </div>

            <nav class="calendar-filter" id="calendar-filter"></nav>

            <div class="calendar-grid" id="calendar-grid"></div>

            <div class="calendar-events">
                <h2 class="calendar-events__title">EVENTS</h2>
                <p class="calendar-events__month" id="calendar-events-month"></p>
                <div class="calendar-events__list" id="calendar-events-list"></div>
            </div>
        </section>

        <div class="calendar-modal" id="calendar-modal" hidden>
            <div class="calendar-modal__backdrop" id="calendar-modal-backdrop"></div>
            <div class="calendar-modal__card" role="dialog" aria-modal="true">
                <button class="calendar-modal__close" id="calendar-modal-close" aria-label="閉じる">×</button>
                <div class="calendar-modal__body" id="calendar-modal-body"></div>
            </div>
        </div>
    `;

    document.getElementById('calendar-prev').addEventListener('click', () => changeMonth(-1));
    document.getElementById('calendar-next').addEventListener('click', () => changeMonth(1));
    document.getElementById('calendar-modal-close').addEventListener('click', closeEventModal);
    document.getElementById('calendar-modal-backdrop').addEventListener('click', closeEventModal);

    renderCountryFilter();
    renderCalendar();
    renderEventsList();
}

/* --------------------------------------------------------------------------
   4. 国別フィルター
   -------------------------------------------------------------------------- */

function renderCountryFilter() {
    const filterEl = document.getElementById('calendar-filter');
    if (!filterEl) return;

    const countries = ['全て', ...getCalendarCountryList()];

    filterEl.innerHTML = countries.map(c => `
        <button
            class="calendar-filter__btn${c === calendarState.country ? ' is-active' : ''}"
            data-country="${c}"
        >${c}</button>
    `).join('');

    filterEl.querySelectorAll('.calendar-filter__btn').forEach(btn => {
        btn.addEventListener('click', () => filterCountry(btn.dataset.country));
    });
}

function filterCountry(country) {
    calendarState.country = country;
    closeEventModal();
    renderCountryFilter();
    renderCalendar();
    renderEventsList();
}

/* --------------------------------------------------------------------------
   5. カレンダー本体
   年・曜日は扱わない。1日〜月末までを7列で並べるだけ。
   -------------------------------------------------------------------------- */

function renderCalendar() {
    const gridEl = document.getElementById('calendar-grid');
    const labelEl = document.getElementById('calendar-label');
    if (!gridEl || !labelEl) return;

    const { month } = calendarState;
    labelEl.textContent = `${month}月`;

    const daysInMonth = getDaysInMonth(month);
    let cellsHtml = '';

    for (let day = 1; day <= daysInMonth; day++) {
        const events = getEventsForDay(month, day);
        cellsHtml += renderCalendarCell(day, events);
    }

    gridEl.innerHTML = `
        <div class="calendar-cells">
            ${cellsHtml}
        </div>
    `;

    gridEl.querySelectorAll('.calendar-cell.has-event').forEach(cell => {
        cell.addEventListener('click', () => {
            const day = parseInt(cell.dataset.day, 10);
            const events = getEventsForDay(month, day);
            if (events.length === 1) {
                openEventModal(events[0]);
            } else if (events.length > 1) {
                openDayEventsModal(month, day, events);
            }
        });
    });
}

// 1セル分のHTMLを作る。行事は最大2件名前を表示し、それ以上は「＋N件」で省略
function renderCalendarCell(day, events) {
    const MAX_NAMES = 2;
    const shown = events.slice(0, MAX_NAMES);
    const restCount = events.length - shown.length;

    const namesHtml = shown.map(ev => `
        <span class="calendar-cell__event-name">${ev.name}</span>
    `).join('');

    const moreHtml = restCount > 0
        ? `<span class="calendar-cell__more">＋${restCount}件</span>`
        : '';

    return `
        <button
            class="calendar-cell${events.length ? ' has-event' : ''}"
            data-day="${day}"
        >
            <span class="calendar-cell__day">${day}</span>
            ${events.length ? `
                <span class="calendar-cell__events">
                    ${namesHtml}
                    ${moreHtml}
                </span>
            ` : ''}
        </button>
    `;
}

/* --------------------------------------------------------------------------
   6. 月移動（年は増減させない。12月→1月、1月→12月で循環）
   -------------------------------------------------------------------------- */

function changeMonth(delta) {
    let next = calendarState.month + delta;

    if (next > 12) next = 1;
    if (next < 1) next = 12;

    calendarState.month = next;

    closeEventModal();
    renderCalendar();
    renderEventsList();
}

/* --------------------------------------------------------------------------
   7. EVENTS一覧（その月の行事を日付順に常時表示）
   -------------------------------------------------------------------------- */

function renderEventsList() {
    const monthEl = document.getElementById('calendar-events-month');
    const listEl = document.getElementById('calendar-events-list');
    if (!monthEl || !listEl) return;

    const { month } = calendarState;
    monthEl.textContent = `${month}月の行事`;

    const events = getEventsForMonth(month);

    if (!events.length) {
        listEl.innerHTML = `<p class="calendar-events__empty">この月の行事はありません。</p>`;
        return;
    }

    listEl.innerHTML = events.map(ev => `
        <button class="calendar-event-row" data-id="${ev.id}">
            <span class="calendar-event-row__date">${ev.month}月${ev.day}日</span>
            <span class="calendar-event-row__name">${ev.name}</span>
            <span class="calendar-event-row__meta">${ev.type} ・ ${ev.countries.join('・')}</span>
        </button>
    `).join('');

    listEl.querySelectorAll('.calendar-event-row').forEach(row => {
        row.addEventListener('click', () => {
            const ev = getEventById(row.dataset.id);
            if (ev) openEventModal(ev);
        });
    });
}

/* --------------------------------------------------------------------------
   8. モーダル
   -------------------------------------------------------------------------- */

function openEventModal(ev) {
    const modalEl = document.getElementById('calendar-modal');
    const bodyEl = document.getElementById('calendar-modal-body');
    if (!modalEl || !bodyEl) return;

    bodyEl.innerHTML = `
        <h3 class="calendar-modal__name">${ev.name}</h3>
        <p class="calendar-modal__date">${ev.month}月${ev.day}日</p>

        <div class="calendar-modal__meta">
            <span class="calendar-modal__type">${ev.type}</span>
            <span class="calendar-modal__countries">${ev.countries.join('・')}</span>
        </div>

        <p class="calendar-modal__desc">${ev.description}</p>

        ${ev.established ? `
            <p class="calendar-modal__established">制定：統合暦${ev.established}年</p>
        ` : ''}

        ${ev.relatedHistory ? `
            <div class="calendar-modal__history">
                <p class="calendar-modal__history-label">関連する歴史</p>
                <p class="calendar-modal__history-name">${ev.relatedHistory}</p>
                <a href="#/timeline" class="calendar-modal__link">歴史年表を見る →</a>
            </div>
        ` : ''}

        ${(ev.articleId && typeof articleById === 'function' && articleById(ev.articleId)) ? `
            <a href="#/article/${ev.articleId}" class="calendar-modal__link calendar-modal__link--article">詳細を見る →</a>
        ` : ''}
    `;

    modalEl.hidden = false;
}

// 同じ日に複数の行事があり、セルから開いた場合はその日の一覧をモーダルに出す
function openDayEventsModal(month, day, events) {
    const modalEl = document.getElementById('calendar-modal');
    const bodyEl = document.getElementById('calendar-modal-body');
    if (!modalEl || !bodyEl) return;

    bodyEl.innerHTML = `
        <h3 class="calendar-modal__name">${month}月${day}日の行事</h3>
        <div class="calendar-modal__day-list">
            ${events.map(ev => `
                <button class="calendar-modal__day-item" data-id="${ev.id}">
                    <span class="calendar-modal__day-item-name">${ev.name}</span>
                    <span class="calendar-modal__day-item-meta">${ev.type} ・ ${ev.countries.join('・')}</span>
                </button>
            `).join('')}
        </div>
    `;

    bodyEl.querySelectorAll('.calendar-modal__day-item').forEach(item => {
        item.addEventListener('click', () => {
            const ev = getEventById(item.dataset.id);
            if (ev) openEventModal(ev);
        });
    });

    modalEl.hidden = false;
}

function closeEventModal() {
    const modalEl = document.getElementById('calendar-modal');
    if (modalEl) modalEl.hidden = true;
}
