import { DateHelper } from '../services/DateHelper.js?v=12';

/**
 * HomeView
 * -------------------------------------------------------------
 * Verwaltet die Darstellung der Startseite:
 * - Die Mikrohabit-Container über der Eule (deutlich länger/höher, präsenter, lila bei Erledigung)
 * - Das Eulen-Maskottchen:
 *   * Offen: Sanft ausgegraut / ruhend
 *   * Fokus ODER "Etwas anderes getan" ODER Mikrohabit: Vollfarbig
 *   * Offen: Ruhend / grau
 * - Den Fokus-Titel unter der Eule
 * - Den 1. Button ("Heute gemacht!" für den Wochenfokus)
 * - Den 2. Button ("Etwas anderes gemacht, was mir gut getan hat!" für Selbstfürsorge)
 */
export class HomeView {
  constructor() {
    this.microhabitsContainer = document.getElementById('home-microhabits-container');
    this.owlEl = document.getElementById('home-owl-mascot');
    this.owlWrapper = document.getElementById('home-owl-wrapper');
    this.quoteEl = document.getElementById('home-quote-text');
    this.todayBtn = document.getElementById('btn-toggle-today');
    this.careBtn = document.getElementById('btn-toggle-care');
  }

  /**
   * Aktualisiert alle Elemente der Startseite.
   * @param {object} params
   * @param {object|null} params.activeIdea - Aktive Fokus-Idee oder null
   * @param {'focus'|'care'|'open'} params.todayStatus - Heutiger Status für Fokus/Care
   * @param {Array} params.activeMicrohabits - Liste von Idea-Instanzen, die als Mikrohabit gewählt sind
   * @param {Function} params.isMicrohabitCompletedFn - (ideaId) => boolean
   */
  render({ activeIdea, todayStatus, activeMicrohabits = [], isMicrohabitCompletedFn }) {
    this.renderMicrohabits(activeMicrohabits, isMicrohabitCompletedFn);
    this.renderMascot(todayStatus, activeMicrohabits, isMicrohabitCompletedFn);
    this.renderHeadline(activeIdea);
    this.renderTodayButton(activeIdea, todayStatus);
    this.renderCareButton(todayStatus);
  }

  /**
   * Rendert den Container mit der gewählten Mikrohabit über der Eule.
   * Deutlich länger/höher mit angenehmer Präsenz, sodass er neben dem Fokusfenster nicht untergeht.
   * Beim Antippen wird der Container lila.
   */
  renderMicrohabits(activeMicrohabits = [], isMicrohabitCompletedFn) {
    if (!this.microhabitsContainer) return;

    if (activeMicrohabits.length === 0) {
      this.microhabitsContainer.innerHTML = `
        <button 
          type="button" 
          onclick="App.navigate('ideas')" 
          class="w-full py-5 sm:py-6 px-6 sm:px-8 rounded-[1.75rem] sm:rounded-[2.25rem] min-h-[85px] sm:min-h-[96px] text-sm sm:text-base font-bold text-brand-600 bg-white hover:bg-brand-50 border border-dashed border-brand-300 transition-all flex items-center justify-center gap-3 shadow-soft active:scale-95 cursor-pointer"
        >
          <svg class="w-6 h-6 sm:w-7 sm:h-7 text-brand-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22v-9" />
            <path d="M12 13c0-3.5 2.5-6 7-6 0 4.5-2.5 7-7 6z" />
            <path d="M12 17c0-2.5-2-4.5-5.5-4.5 0 3.5 2 5 5.5 4.5z" />
          </svg>
          <span>Mikrohabit im Gedanken-Parkplatz wählen</span>
        </button>
      `;
      return;
    }

    let html = '';
    activeMicrohabits.forEach((habit) => {
      const isDone = isMicrohabitCompletedFn ? isMicrohabitCompletedFn(habit.id) : false;
      const bgClasses = isDone 
        ? 'bg-brand-500 text-white shadow-pill border-brand-600' 
        : 'bg-white text-slate-700 shadow-soft border-surface-border hover:border-brand-300';

      const plantIcon = isDone
        ? `<svg class="w-7 h-7 sm:w-8 sm:h-8 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M12 22v-9" />
             <path d="M12 13c0-3.5 2.5-6 7-6 0 4.5-2.5 7-7 6z" />
             <path d="M12 17c0-2.5-2-4.5-5.5-4.5 0 3.5 2 5 5.5 4.5z" />
           </svg>`
        : `<svg class="w-7 h-7 sm:w-8 sm:h-8 text-brand-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M12 22v-9" />
             <path d="M12 13c0-3.5 2.5-6 7-6 0 4.5-2.5 7-7 6z" />
             <path d="M12 17c0-2.5-2-4.5-5.5-4.5 0 3.5 2 5 5.5 4.5z" />
           </svg>`;

      const checkmark = isDone
        ? `<svg class="w-6 h-6 sm:w-7 sm:h-7 text-white shrink-0 ml-auto" fill="none" stroke="currentColor" stroke-width="2.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`
        : '';

      html += `
        <div 
          onclick="App.toggleMicrohabitToday('${habit.id}')"
          title="Tippen, um für heute als geschafft zu markieren"
          class="microhabit-pill w-full py-5 sm:py-6 md:py-7 px-6 sm:px-8 rounded-[1.75rem] sm:rounded-[2.25rem] min-h-[85px] sm:min-h-[100px] border flex items-center justify-between gap-4 cursor-pointer active:scale-95 select-none ${bgClasses}"
        >
          <div class="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
            ${plantIcon}
            <span class="font-black text-base sm:text-lg md:text-xl tracking-tight truncate">${DateHelper.escapeHtml(habit.title)}</span>
          </div>
          ${checkmark}
        </div>
      `;
    });

    this.microhabitsContainer.innerHTML = html;
  }

  /**
   * Eule:
   * - Vollfarbig bei Fokus ODER "Etwas anderes getan" ODER Mikrohabit
   * - Offen: Ruhend / grau
   */
  renderMascot(todayStatus, activeMicrohabits = [], isMicrohabitCompletedFn) {
    if (!this.owlEl) return;

    const hasMain = (todayStatus === 'focus' || todayStatus === 'care');
    const hasMicro = Boolean(
      activeMicrohabits && 
      activeMicrohabits.length > 0 && 
      activeMicrohabits.some((h) => isMicrohabitCompletedFn && isMicrohabitCompletedFn(h.id))
    );

    const isColored = hasMain || hasMicro;

    if (isColored) {
      this.owlEl.className = 'w-full h-full object-contain select-none transition-all duration-500 filter-none opacity-100';
    } else {
      this.owlEl.className = 'w-full h-full object-contain select-none transition-all duration-500 filter grayscale contrast-90 opacity-60';
    }
  }

  /**
   * Fokus-Titel direkt unter der Eule.
   */
  renderHeadline(activeIdea) {
    if (!this.quoteEl) return;

    if (activeIdea) {
      this.quoteEl.textContent = activeIdea.title;
    } else {
      this.quoteEl.textContent = 'Kein Fokus gewählt';
    }
  }

  /**
   * 1. Haupt-Button: "Heute gemacht!" (für den Wochenfokus)
   */
  renderTodayButton(activeIdea, todayStatus) {
    if (!this.todayBtn) return;

    if (!activeIdea) {
      this.todayBtn.disabled = true;
      this.todayBtn.className = 'w-full py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl sm:rounded-3xl font-extrabold text-sm sm:text-base md:text-lg transition-all duration-300 bg-surface-subtle text-slate-400 border border-surface-border opacity-50 cursor-not-allowed flex items-center justify-center gap-2.5';
      this.todayBtn.innerHTML = `
        <svg class="w-5 h-5 text-slate-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"/>
        </svg>
        <span>Heute gemacht!</span>
      `;
    } else if (todayStatus === 'focus') {
      this.todayBtn.disabled = false;
      this.todayBtn.className = 'w-full py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl sm:rounded-3xl font-extrabold text-sm sm:text-base md:text-lg transition-all duration-300 bg-brand-500 hover:bg-brand-600 text-white shadow-pill transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer';
      this.todayBtn.innerHTML = `
        <svg class="w-5 h-5 fill-none shrink-0" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        <span>Heute gemacht!</span>
      `;
    } else {
      this.todayBtn.disabled = false;
      this.todayBtn.className = 'w-full py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl sm:rounded-3xl font-extrabold text-sm sm:text-base md:text-lg transition-all duration-300 bg-surface-subtle hover:bg-brand-100 text-brand-700 border border-surface-border shadow-sm transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer';
      this.todayBtn.innerHTML = `
        <svg class="w-5 h-5 text-brand-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"/>
        </svg>
        <span>Heute gemacht!</span>
      `;
    }
  }

  /**
   * 2. Zweiter Button: "Etwas anderes gemacht, was mir gut getan hat!"
   * Wird ebenfalls LILA beim Antippen, da beides gleichwertig gut ist.
   * Behält stets das HERZ (kein Haken!), wenn ausgewählt!
   */
  renderCareButton(todayStatus) {
    if (!this.careBtn) return;

    if (todayStatus === 'care') {
      this.careBtn.className = 'w-full py-3 sm:py-3.5 px-5 sm:px-7 rounded-2xl sm:rounded-3xl font-bold text-xs sm:text-sm md:text-base transition-all duration-300 bg-brand-500 hover:bg-brand-600 text-white shadow-pill transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer';
      this.careBtn.innerHTML = `
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0 fill-current" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span>Etwas anderes gemacht, was mir gut getan hat!</span>
      `;
    } else {
      this.careBtn.className = 'w-full py-3 sm:py-3.5 px-5 sm:px-7 rounded-2xl sm:rounded-3xl font-bold text-xs sm:text-sm md:text-base transition-all duration-300 bg-surface-subtle hover:bg-brand-100 text-brand-700 border border-surface-border shadow-sm transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer';
      this.careBtn.innerHTML = `
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-brand-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
        <span>Etwas anderes gemacht, was mir gut getan hat!</span>
      `;
    }
  }
}
