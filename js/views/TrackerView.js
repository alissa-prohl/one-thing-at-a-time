import { DateHelper } from '../services/DateHelper.js?v=2';

/**
 * TrackerView
 * -------------------------------------------------------------
 * Verwaltet die Darstellung des 7-Tage-Wochen-Trackers und des
 * integrierten Monats-Mini-Kalenders:
 * - 4x2-Kachelraster (ideal für Smartphone & Desktop)
 * - 7-Zeilen-Listenansicht (großzügig und lesefreundlich)
 * - 3 Zustände pro Tag:
 *   * 'focus': Wochenfokus gemacht (Lila)
 *   * 'care': Etwas anderes gut getan (Salbeigrün mit Blatt)
 *   * 'open': Offen (Kontur)
 * - Fortschrittsanzeige ("X / 7 Tage")
 * - Mini-Kalender zur freien Auswahl des Starttags
 */
export class TrackerView {
  constructor() {
    this.headlineEl = document.getElementById('tracker-focus-headline');
    this.weekRangeLabel = document.getElementById('tracker-week-range-label');
    this.btnGrid = document.getElementById('btn-view-grid');
    this.btnList = document.getElementById('btn-view-list');
    this.daysContainer = document.getElementById('tracker-days-container');
    this.scoreEl = document.getElementById('tracker-score-days');

    // Mini-Kalender Elemente
    this.calMonthLabel = document.getElementById('calendar-month-label');
    this.calDaysContainer = document.getElementById('calendar-days-container');
  }

  /**
   * Rendert die Wochenansicht.
   * @param {object} params
   * @param {object|null} params.activeIdea - Aktive Idee
   * @param {string[]} params.weekDates - 7 ISO-Datumsstrings
   * @param {Function} params.getDayStatusFn - Funktion (dateStr) => 'focus'|'care'|'open'
   * @param {number} params.completedCount - Wie viele Tage sind positiv (Fokus + Care)
   * @param {string} params.viewMode - 'grid' oder 'list'
   */
  render({ activeIdea, weekDates, getDayStatusFn, completedCount, viewMode }) {
    // 1. Überschrift
    if (this.headlineEl) {
      if (activeIdea) {
        this.headlineEl.textContent = `Fokus der Woche: ${activeIdea.title}`;
      } else {
        this.headlineEl.textContent = 'Fokus der Woche: Kein Fokus gewählt';
      }
    }

    // 2. Datumsspanne im Button anzeigen (z.B. "4. Okt – 10. Okt")
    if (this.weekRangeLabel && weekDates.length === 7) {
      const first = DateHelper.formatDayInfo(weekDates[0]);
      const last = DateHelper.formatDayInfo(weekDates[6]);
      this.weekRangeLabel.textContent = `${first.shortDayMonth} – ${last.shortDayMonth}`;
    }

    // 3. Tab-Buttons Kacheln / Liste
    if (this.btnGrid && this.btnList) {
      if (viewMode === 'list') {
        this.btnGrid.className = 'px-2.5 py-1 rounded-lg transition-colors text-slate-500 hover:text-brand-700';
        this.btnList.className = 'px-2.5 py-1 rounded-lg transition-colors bg-white text-brand-700 shadow-sm';
      } else {
        this.btnGrid.className = 'px-2.5 py-1 rounded-lg transition-colors bg-white text-brand-700 shadow-sm';
        this.btnList.className = 'px-2.5 py-1 rounded-lg transition-colors text-slate-500 hover:text-brand-700';
      }
    }

    // 4. Statistik-Zähler
    if (this.scoreEl) {
      this.scoreEl.textContent = completedCount;
    }

    // 5. Entweder Liste oder Raster rendern
    if (!this.daysContainer) return;

    if (viewMode === 'list') {
      this.renderList(weekDates, getDayStatusFn);
    } else {
      this.renderGrid(weekDates, getDayStatusFn, completedCount);
    }
  }

  /**
   * Rendert die 7 Tage als vertikale Liste.
   */
  renderList(weekDates, getDayStatusFn) {
    let html = '<div class="space-y-2">';

    weekDates.forEach((dateStr) => {
      const status = getDayStatusFn(dateStr);
      const dayInfo = DateHelper.formatDayInfo(dateStr);

      let itemBgClass = 'bg-white border-slate-100 hover:border-brand-200';
      let statusText = 'Offen';
      let statusTextColor = 'text-slate-400';

      if (status === 'focus') {
        itemBgClass = 'bg-surface-subtle border-brand-200 shadow-sm';
        statusText = 'Gemacht';
        statusTextColor = 'text-brand-700';
      } else if (status === 'care') {
        itemBgClass = 'bg-[#F1F6F2] border-[#C3D9C7] shadow-sm';
        statusText = 'Etwas anderes gemacht';
        statusTextColor = 'text-[#3E7329]';
      }

      html += `
        <button 
          type="button"
          onclick="App.toggleTrackerDay('${dateStr}')"
          class="w-full rounded-2xl p-3 sm:p-4 flex items-center justify-between text-left transition-all duration-200 border ${itemBgClass} ${dayInfo.isToday ? 'ring-2 ring-brand-500' : ''}"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
              dayInfo.isToday 
                ? 'bg-brand-500 text-white' 
                : (status === 'care' ? 'bg-[#E3EFE5] text-[#2F5F20] border border-[#C3D9C7]' : 'bg-surface-subtle text-brand-700 border border-surface-border')
            }">
              ${dayInfo.weekday}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-slate-800">${dayInfo.formattedDate}</span>
                ${dayInfo.isToday ? `
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700">
                    Heute
                  </span>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs font-semibold ${statusTextColor}">
              ${statusText}
            </span>
            <div class="w-10 h-10 flex items-center justify-center">
              ${status === 'focus' ? `
                <img src="owl.png" alt="Gemacht" class="w-9 h-9 object-contain select-none transform transition-transform group-hover:scale-110">
              ` : (status === 'care' ? `
                <div class="relative w-9 h-9 flex items-center justify-center">
                  <img src="owl.png" alt="Etwas anderes gemacht" class="w-full h-full object-contain select-none transform transition-transform group-hover:scale-110">
                  <div class="absolute -top-1 -right-1 w-4 h-4 drop-shadow-sm">
                    <svg viewBox="0 0 100 100" fill="none" class="w-full h-full overflow-visible">
                      <path d="M 22 20 C 44 10, 74 22, 88 48 C 96 64, 88 82, 74 85 C 50 90, 26 70, 22 20 Z" fill="#52C439" stroke="#18181B" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>
                      <path d="M 25 22 C 42 15, 68 24, 82 46 C 74 38, 48 24, 25 22 Z" fill="#98EB72"/>
                      <path d="M 92 98 C 88 88, 80 80, 74 72 C 64 58, 52 46, 40 34" fill="none" stroke="#18181B" stroke-width="8" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
              ` : `
                <svg viewBox="0 0 100 100" class="w-9 h-9 text-slate-300 stroke-current fill-none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M 28 30 C 20 18, 18 16, 32 18 C 40 20, 60 20, 68 18 C 82 16, 80 18, 72 30 C 86 44, 88 74, 78 86 C 70 94, 30 94, 22 86 C 12 74, 14 44, 28 30 Z" />
                  <circle cx="36" cy="42" r="14" />
                  <circle cx="64" cy="42" r="14" />
                  <path d="M 50 42 C 49 40, 51 40, 50 42" stroke-width="3.5" />
                  <circle cx="38" cy="42" r="2.5" fill="currentColor" />
                  <circle cx="62" cy="42" r="2.5" fill="currentColor" />
                  <path d="M 47 48 Q 50 56 53 48 Z" />
                  <path d="M 33 72 Q 50 82 67 72" />
                  <path d="M 22 54 Q 26 68 23 76" />
                  <path d="M 78 54 Q 74 68 77 76" />
                  <path d="M 35 91 Q 39 95 43 91" />
                  <path d="M 57 91 Q 61 95 65 91" />
                </svg>
              `)}
            </div>
          </div>
        </button>
      `;
    });

    html += '</div>';
    this.daysContainer.innerHTML = html;
  }

  /**
   * Rendert die 7 Tage im responsiven Raster (4x2 auf dem Smartphone, 7 Spalten auf dem Desktop).
   */
  renderGrid(weekDates, getDayStatusFn, completedCount) {
    let html = '<div class="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-2.5">';

    weekDates.forEach((dateStr) => {
      const status = getDayStatusFn(dateStr);
      const dayInfo = DateHelper.formatDayInfo(dateStr);

      let tileBgClass = 'bg-white border-slate-100 hover:border-brand-200';
      if (status === 'focus') {
        tileBgClass = 'bg-surface-subtle border-brand-200 shadow-sm';
      } else if (status === 'care') {
        tileBgClass = 'bg-[#F1F6F2] border-[#C3D9C7] shadow-sm';
      }

      html += `
        <button 
          type="button"
          onclick="App.toggleTrackerDay('${dateStr}')"
          class="group relative rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-between text-center transition-all duration-200 border ${tileBgClass} ${dayInfo.isToday ? 'ring-2 ring-brand-500 ring-offset-1' : ''}"
        >
          <div class="space-y-0.5">
            <span class="block text-xs font-bold ${dayInfo.isToday ? 'text-brand-700' : 'text-slate-600'}">
              ${dayInfo.weekday}
            </span>
            <span class="block text-[11px] font-medium text-slate-400">
              ${dayInfo.dayNumber}.
            </span>
          </div>

          <div class="my-2 sm:my-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            ${status === 'focus' ? `
              <img 
                src="owl.png" 
                alt="Gemacht" 
                class="w-full h-full object-contain select-none transform transition-transform group-hover:scale-110"
              >
            ` : (status === 'care' ? `
              <div class="relative w-full h-full flex items-center justify-center">
                <img 
                  src="owl.png" 
                  alt="Etwas anderes gemacht" 
                  class="w-full h-full object-contain select-none transform transition-transform group-hover:scale-110"
                >
                <div class="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm">
                  <svg viewBox="0 0 100 100" fill="none" class="w-full h-full overflow-visible">
                    <path d="M 22 20 C 44 10, 74 22, 88 48 C 96 64, 88 82, 74 85 C 50 90, 26 70, 22 20 Z" fill="#52C439" stroke="#18181B" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>
                    <path d="M 25 22 C 42 15, 68 24, 82 46 C 74 38, 48 24, 25 22 Z" fill="#98EB72"/>
                    <path d="M 92 98 C 88 88, 80 80, 74 72 C 64 58, 52 46, 40 34" fill="none" stroke="#18181B" stroke-width="8" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
            ` : `
              <svg 
                viewBox="0 0 100 100" 
                class="w-8 h-8 sm:w-11 sm:h-11 text-slate-300 group-hover:text-brand-400 stroke-current fill-none transition-colors" 
                stroke-width="3" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
              >
                <path d="M 28 30 C 20 18, 18 16, 32 18 C 40 20, 60 20, 68 18 C 82 16, 80 18, 72 30 C 86 44, 88 74, 78 86 C 70 94, 30 94, 22 86 C 12 74, 14 44, 28 30 Z" />
                <circle cx="36" cy="42" r="14" />
                <circle cx="64" cy="42" r="14" />
                <path d="M 50 42 C 49 40, 51 40, 50 42" stroke-width="3.5" />
                <circle cx="38" cy="42" r="2.5" fill="currentColor" />
                <circle cx="62" cy="42" r="2.5" fill="currentColor" />
                <path d="M 47 48 Q 50 56 53 48 Z" />
                <path d="M 33 72 Q 50 82 67 72" />
                <path d="M 22 54 Q 26 68 23 76" />
                <path d="M 78 54 Q 74 68 77 76" />
                <path d="M 35 91 Q 39 95 43 91" />
                <path d="M 57 91 Q 61 95 65 91" />
              </svg>
            `)}
          </div>

          <div>
            ${dayInfo.isToday ? `
              <span class="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-brand-100 text-brand-700">
                Heute
              </span>
            ` : (status === 'focus' ? `
              <svg class="w-3 h-3 text-brand-600 inline" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            ` : (status === 'care' ? `
              <div class="inline-flex items-center gap-0.5 text-[#3E7329]">
                <div class="w-3 h-3 inline-block">
                  <svg viewBox="0 0 100 100" fill="none" class="w-full h-full overflow-visible">
                    <path d="M 22 20 C 44 10, 74 22, 88 48 C 96 64, 88 82, 74 85 C 50 90, 26 70, 22 20 Z" fill="#52C439" stroke="#18181B" stroke-width="9"/>
                  </svg>
                </div>
              </div>
            ` : `
              <span class="inline-block text-[10px] font-medium text-slate-400">—</span>
            `))}
          </div>
        </button>
      `;
    });

    // 8. Kachel auf Smartphones für perfekte Symmetrie im 4x2-Raster
    html += `
      <div class="sm:hidden rounded-2xl p-2.5 bg-surface-subtle border border-surface-border flex flex-col items-center justify-center text-center">
        <span class="text-[10px] font-bold text-slate-500">Gemacht</span>
        <span class="text-base font-black text-brand-700 my-1">${completedCount} / 7</span>
        <span class="text-[9px] text-slate-400">Tage</span>
      </div>
    `;

    html += '</div>';
    this.daysContainer.innerHTML = html;
  }

  /**
   * Rendert den Monatskalender im Auswahl-Modal.
   * @param {Date} calendarViewDate - Monat/Jahr zur Ansicht
   * @param {string} currentStartDate - Aktuelles Startdatum der Woche
   */
  renderCalendar(calendarViewDate, currentStartDate) {
    if (!this.calMonthLabel || !this.calDaysContainer) return;

    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();

    this.calMonthLabel.textContent = `${DateHelper.getMonthName(month)} ${year}`;

    const offset = DateHelper.getFirstDayOffset(year, month);
    const daysInMonth = DateHelper.getDaysInMonth(year, month);
    const todayStr = DateHelper.getTodayISO();

    let html = '';

    // Leere Platzhalter vor dem ersten Tag des Monats
    for (let i = 0; i < offset; i++) {
      html += `<div class="p-1"></div>`;
    }

    // Tage des Monats
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = dateStr === currentStartDate;
      const isToday = dateStr === todayStr;

      html += `
        <button 
          type="button"
          onclick="App.setStartDateDirect('${dateStr}')" 
          class="w-7 h-7 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
            isSelected 
              ? 'bg-brand-500 text-white font-bold shadow-sm' 
              : (isToday ? 'bg-brand-100 text-brand-700 font-bold' : 'hover:bg-surface-subtle text-slate-700')
          }"
        >
          ${d}
        </button>
      `;
    }

    this.calDaysContainer.innerHTML = html;
  }
}
