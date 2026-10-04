/**
 * HomeView
 * -------------------------------------------------------------
 * Verwaltet die Darstellung der Startseite:
 * - Das Eulen-Maskottchen:
 *   * Offen: Sanft ausgegraut / ruhend
 *   * Fokus gemacht: Vollfarbig
 *   * Etwas anderes gut getan: Vollfarbig + feiner Salbeiblatt-Zweig & zarter Lichtschein
 * - Den Fokus-Titel unter der Eule
 * - Den 1. Button ("Heute gemacht!" für den Wochenfokus)
 * - Den 2. Button ("Etwas anderes gemacht, was mir gut getan hat!" für Selbstfürsorge)
 */
export class HomeView {
  constructor() {
    this.owlEl = document.getElementById('home-owl-mascot');
    this.owlWrapper = document.getElementById('home-owl-wrapper');
    this.leafBadge = document.getElementById('home-owl-leaf-badge');
    this.quoteEl = document.getElementById('home-quote-text');
    this.todayBtn = document.getElementById('btn-toggle-today');
    this.careBtn = document.getElementById('btn-toggle-care');
  }

  /**
   * Aktualisiert alle Elemente der Startseite.
   * @param {object} params
   * @param {object|null} params.activeIdea - Aktive Idee oder null
   * @param {'focus'|'care'|'open'} params.todayStatus - Heutiger Status
   */
  render({ activeIdea, todayStatus }) {
    this.renderMascot(todayStatus);
    this.renderHeadline(activeIdea);
    this.renderTodayButton(activeIdea, todayStatus);
    this.renderCareButton(todayStatus);
  }

  /**
   * Eule:
   * - 'open': Grau/ruhend
   * - 'focus': Vollfarbig
   * - 'care': Vollfarbig + zartes Salbeiblatt am Ohr + sanfter Lichtschein
   */
  renderMascot(todayStatus) {
    if (!this.owlEl) return;

    if (todayStatus === 'care') {
      // Vollfarbig + Blatt sichtbar + sanftes Glühen
      this.owlEl.className = 'w-full h-full object-contain select-none transition-all duration-500 filter-none opacity-100';
      if (this.leafBadge) {
        this.leafBadge.classList.remove('owl-leaf-hidden');
        this.leafBadge.classList.add('owl-leaf-visible');
      }
      if (this.owlWrapper) {
        this.owlWrapper.classList.add('owl-care-glow');
      }
    } else if (todayStatus === 'focus') {
      // Vollfarbig, aber ohne Blatt
      this.owlEl.className = 'w-full h-full object-contain select-none transition-all duration-500 filter-none opacity-100';
      if (this.leafBadge) {
        this.leafBadge.classList.remove('owl-leaf-visible');
        this.leafBadge.classList.add('owl-leaf-hidden');
      }
      if (this.owlWrapper) {
        this.owlWrapper.classList.remove('owl-care-glow');
      }
    } else {
      // Ausgegraut / ruhend
      this.owlEl.className = 'w-full h-full object-contain select-none transition-all duration-500 filter grayscale contrast-90 opacity-60';
      if (this.leafBadge) {
        this.leafBadge.classList.remove('owl-leaf-visible');
        this.leafBadge.classList.add('owl-leaf-hidden');
      }
      if (this.owlWrapper) {
        this.owlWrapper.classList.remove('owl-care-glow');
      }
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
      this.todayBtn.className = 'w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 bg-surface-subtle text-slate-400 border border-surface-border opacity-50 cursor-not-allowed flex items-center justify-center gap-2.5';
      this.todayBtn.innerHTML = `
        <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"/>
        </svg>
        <span>Heute gemacht!</span>
      `;
    } else if (todayStatus === 'focus') {
      this.todayBtn.disabled = false;
      this.todayBtn.className = 'w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 bg-brand-500 hover:bg-brand-600 text-white shadow-pill transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer';
      this.todayBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        <span>Heute gemacht</span>
      `;
    } else {
      this.todayBtn.disabled = false;
      this.todayBtn.className = 'w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 bg-surface-subtle hover:bg-brand-100 text-brand-700 border border-surface-border shadow-sm transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer';
      this.todayBtn.innerHTML = `
        <svg class="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"/>
        </svg>
        <span>Heute gemacht!</span>
      `;
    }
  }

  /**
   * 2. Zweiter Button: "Etwas anderes gemacht, was mir gut getan hat!"
   * Immer klickbar (auch ohne gewählten Wochenfokus).
   */
  renderCareButton(todayStatus) {
    if (!this.careBtn) return;

    if (todayStatus === 'care') {
      this.careBtn.className = 'w-full py-3 sm:py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 bg-[#48B031] hover:bg-[#3FA029] text-white shadow-pill transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer';
      this.careBtn.innerHTML = `
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        <span>Etwas anderes gemacht</span>
      `;
    } else {
      this.careBtn.className = 'w-full py-3 sm:py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 bg-white/90 hover:bg-[#F2F7F3] text-slate-600 hover:text-[#2E7A1C] border border-surface-border shadow-sm transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer';
      this.careBtn.innerHTML = `
        <div class="w-4 h-4 shrink-0">
          <svg viewBox="0 0 100 100" fill="none" class="w-full h-full overflow-visible">
            <path d="M 22 20 C 44 10, 74 22, 88 48 C 96 64, 88 82, 74 85 C 50 90, 26 70, 22 20 Z" fill="#52C439" stroke="#18181B" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>
            <path d="M 25 22 C 42 15, 68 24, 82 46 C 74 38, 48 24, 25 22 Z" fill="#98EB72"/>
            <path d="M 92 98 C 88 88, 80 80, 74 72 C 64 58, 52 46, 40 34" fill="none" stroke="#18181B" stroke-width="8" stroke-linecap="round"/>
          </svg>
        </div>
        <span>Etwas anderes gemacht, was mir gut getan hat!</span>
      `;
    }
  }
}
