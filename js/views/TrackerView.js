import { DateHelper } from '../services/DateHelper.js?v=12';

/**
 * TrackerView
 * -------------------------------------------------------------
 * Verwaltet die Darstellung des 7-Tage-Wochen-Trackers und des
 * integrierten Monats-Mini-Kalenders:
 * - 4x2-Kachelraster (ideal für Smartphone & Desktop)
 * - 7-Zeilen-Listenansicht (großzügig und lesefreundlich)
 * - Harmonische Eulen-Zustände pro Tag:
 *   * Vollfarbige Eule: Fokus ODER "Etwas anderes getan"
 *   * Vollfarbige Eule MIT Blatt am Ohr: Zusätzlich Mikrohabit geschafft
 *   * Graue Kontur: Offener Tag
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
   * @param {Function} params.getMascotStatusFn - Funktion (dateStr) => { colored: boolean, hasFocus: boolean, hasCare: boolean, hasMain: boolean, hasMicro: boolean, plant: boolean }
   * @param {number} params.completedCount - Wie viele Tage sind positiv
   * @param {string} params.viewMode - 'grid' oder 'list'
   */
  render({ activeIdea, weekDates, getMascotStatusFn, completedCount, viewMode }) {
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
      this.renderList(weekDates, getMascotStatusFn);
    } else {
      this.renderGrid(weekDates, getMascotStatusFn, completedCount);
    }
  }

  /**
   * Rendert die 7 Tage als vertikale Liste.
   */
  renderList(weekDates, getMascotStatusFn) {
    let html = '<div class="space-y-3">';

    weekDates.forEach((dateStr) => {
      const mascot = getMascotStatusFn ? getMascotStatusFn(dateStr) : { colored: false, hasFocus: false, hasCare: false, hasMicro: false };
      const dayInfo = DateHelper.formatDayInfo(dateStr);

      let itemBgClass = 'bg-white border-slate-100 hover:border-brand-200';
      let statusText = 'Offen';
      let statusTextColor = 'text-slate-400';

      if (mascot.hasFocus && mascot.hasMicro) {
        itemBgClass = 'bg-surface-subtle border-brand-200 shadow-sm';
        statusText = 'Fokus + Mikrohabit';
        statusTextColor = 'text-brand-700';
      } else if (mascot.hasCare && mascot.hasMicro) {
        itemBgClass = 'bg-surface-subtle border-brand-200 shadow-sm';
        statusText = 'Gut getan + Mikrohabit';
        statusTextColor = 'text-brand-700';
      } else if (mascot.hasFocus) {
        itemBgClass = 'bg-surface-subtle border-brand-200 shadow-sm';
        statusText = 'Fokus geschafft';
        statusTextColor = 'text-brand-700';
      } else if (mascot.hasCare) {
        itemBgClass = 'bg-surface-subtle border-brand-200 shadow-sm';
        statusText = 'Gut getan';
        statusTextColor = 'text-brand-700';
      } else if (mascot.hasMicro) {
        itemBgClass = 'bg-surface-subtle border-brand-200 shadow-sm';
        statusText = 'Mikrohabit geschafft';
        statusTextColor = 'text-brand-700';
      }

      html += `
        <button 
          type="button"
          onclick="App.toggleTrackerDay('${dateStr}')"
          title="${mascot.colored ? 'Antippen zum Zurücksetzen' : 'Antippen zum Eintragen'}"
          class="w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex items-center justify-between text-left transition-all duration-200 border cursor-pointer ${itemBgClass} ${dayInfo.isToday ? 'ring-2 ring-brand-500 ring-offset-2' : ''}"
        >
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl sm:rounded-2xl flex items-center justify-center font-extrabold text-xs sm:text-sm ${
              dayInfo.isToday 
                ? 'bg-brand-500 text-white shadow-xs' 
                : (mascot.colored ? 'bg-surface-subtle text-brand-700 border border-surface-border' : 'bg-surface-subtle text-slate-400 border border-surface-border')
            }">
              ${dayInfo.weekday}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base sm:text-lg font-bold text-slate-800">${dayInfo.formattedDate}</span>
                ${dayInfo.isToday ? `
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-brand-100 text-brand-700">
                    Heute
                  </span>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3.5">
            <div class="flex items-center gap-2 text-right">
              ${mascot.hasFocus ? `
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 inline shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" title="Fokus geschafft">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              ` : ''}
              ${mascot.hasCare ? `
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 inline shrink-0" fill="currentColor" viewBox="0 0 24 24" title="Etwas anderes getan, was mir gut getan hat">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              ` : ''}
              ${mascot.hasMicro ? `
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 inline shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" title="Mikrohabit geschafft">
                  <path d="M12 22v-9" />
                  <path d="M12 13c0-3.5 2.5-6 7-6 0 4.5-2.5 7-7 6z" />
                  <path d="M12 17c0-2.5-2-4.5-5.5-4.5 0 3.5 2 5 5.5 4.5z" />
                </svg>
              ` : ''}
              <span class="text-xs sm:text-sm font-bold ${statusTextColor}">
                ${statusText}
              </span>
            </div>
            <div class="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center">
              ${mascot.colored ? `
                <img src="owl.png" alt="Gemacht" class="w-10 h-10 sm:w-11 sm:h-11 object-contain select-none transform transition-transform group-hover:scale-110">
              ` : `
                <svg viewBox="0 0 100 100" class="w-10 h-10 sm:w-11 sm:h-11 text-slate-300 stroke-current fill-none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
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
              `}
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
  renderGrid(weekDates, getMascotStatusFn, completedCount) {
    let html = '<div class="grid grid-cols-4 sm:grid-cols-7 gap-2.5 sm:gap-3.5">';

    weekDates.forEach((dateStr) => {
      const mascot = getMascotStatusFn ? getMascotStatusFn(dateStr) : { colored: false, hasFocus: false, hasCare: false, hasMicro: false };
      const dayInfo = DateHelper.formatDayInfo(dateStr);

      let tileBgClass = 'bg-white border-slate-100 hover:border-brand-200';
      if (mascot.colored) {
        tileBgClass = 'bg-surface-subtle border-brand-200 shadow-sm';
      }

      html += `
        <button 
          type="button"
          onclick="App.toggleTrackerDay('${dateStr}')"
          title="${mascot.colored ? 'Antippen zum Zurücksetzen' : 'Antippen zum Eintragen'}"
          class="group relative rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-between text-center transition-all duration-200 border cursor-pointer ${tileBgClass} ${dayInfo.isToday ? 'ring-2 ring-brand-500 ring-offset-2' : ''} min-h-[125px] sm:min-h-[145px]"
        >
          <div class="space-y-0.5">
            <span class="block text-xs sm:text-sm font-extrabold ${dayInfo.isToday ? 'text-brand-700' : 'text-slate-600'}">
              ${dayInfo.weekday}
            </span>
            <span class="block text-[11px] sm:text-xs font-semibold text-slate-400">
              ${dayInfo.dayNumber}.
            </span>
          </div>

          <div class="my-2 sm:my-3 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
            ${mascot.colored ? `
              <img 
                src="owl.png" 
                alt="Gemacht" 
                class="w-full h-full object-contain select-none transform transition-transform group-hover:scale-110"
              >
            ` : `
              <svg 
                viewBox="0 0 100 100" 
                class="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 group-hover:text-brand-400 stroke-current fill-none transition-colors" 
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
            `}
          </div>

          <div class="flex items-center justify-center gap-1.5 min-h-[22px]">
            ${dayInfo.isToday ? `
              <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-100 text-brand-700">
                Heute
              </span>
            ` : ''}
            ${mascot.hasFocus ? `
              <svg class="w-4 h-4 text-brand-600 inline shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" title="Fokus geschafft">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            ` : ''}
            ${mascot.hasCare ? `
              <svg class="w-4 h-4 text-brand-600 inline shrink-0" fill="currentColor" viewBox="0 0 24 24" title="Etwas anderes getan, was mir gut getan hat">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            ` : ''}
            ${mascot.hasMicro ? `
              <svg class="w-4 h-4 text-brand-600 inline shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" title="Mikrohabit geschafft">
                <path d="M12 22v-9" />
                <path d="M12 13c0-3.5 2.5-6 7-6 0 4.5-2.5 7-7 6z" />
                <path d="M12 17c0-2.5-2-4.5-5.5-4.5 0 3.5 2 5 5.5 4.5z" />
              </svg>
            ` : ''}
            ${!dayInfo.isToday && !mascot.hasFocus && !mascot.hasCare && !mascot.hasMicro ? `
              <span class="inline-block text-xs font-semibold text-slate-300">—</span>
            ` : ''}
          </div>
        </button>
      `;
    });

    // 8. Kachel auf Smartphones für perfekte Symmetrie im 4x2-Raster
    html += `
      <div class="sm:hidden rounded-2xl sm:rounded-3xl p-3 bg-surface-subtle border border-surface-border flex flex-col items-center justify-center text-center min-h-[125px]">
        <span class="text-xs font-bold text-slate-500">Gemacht</span>
        <span class="text-lg font-black text-brand-700 my-1">${completedCount} / 7</span>
        <span class="text-[10px] font-semibold text-slate-400">Tage</span>
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
