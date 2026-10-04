/**
 * HomeView
 * -------------------------------------------------------------
 * Verwaltet die Darstellung der Startseite:
 * - Das Eulen-Maskottchen (farblos wenn offen, bunt wenn heute erledigt)
 * - Den Fokus-Titel unter der Eule
 * - Den "Heute gemacht!"-Button (deaktiviert ohne Fokus, klickbar mit Fokus)
 */
export class HomeView {
  constructor() {
    this.owlEl = document.getElementById('home-owl-mascot');
    this.quoteEl = document.getElementById('home-quote-text');
    this.todayBtn = document.getElementById('btn-toggle-today');
  }

  /**
   * Aktualisiert alle Elemente der Startseite.
   * @param {object} params
   * @param {object|null} params.activeIdea - Aktive Idee oder null
   * @param {boolean} params.isTodayDone - Ob der heutige Tag erledigt ist
   */
  render({ activeIdea, isTodayDone }) {
    this.renderMascot(isTodayDone);
    this.renderHeadline(activeIdea);
    this.renderTodayButton(activeIdea, isTodayDone);
  }

  /**
   * Eule: Bunt wenn heute erledigt, sanft ausgegraut wenn noch offen.
   */
  renderMascot(isTodayDone) {
    if (!this.owlEl) return;

    if (isTodayDone) {
      this.owlEl.className = 'w-full h-full object-contain animate-gentle-float select-none transition-all duration-500 filter-none opacity-100';
    } else {
      this.owlEl.className = 'w-full h-full object-contain animate-gentle-float select-none transition-all duration-500 filter grayscale contrast-90 opacity-60';
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
   * "Heute gemacht!"-Button mit 3 klaren Zuständen:
   * 1. Kein Fokus: Deaktiviert, ausgegraut
   * 2. Fokus vorhanden, heute erledigt: Lila mit Häkchen ("Heute gemacht")
   * 3. Fokus vorhanden, heute offen: Helles Flieder mit Kreis ("Heute gemacht!")
   */
  renderTodayButton(activeIdea, isTodayDone) {
    if (!this.todayBtn) return;

    if (!activeIdea) {
      this.todayBtn.disabled = true;
      this.todayBtn.className = 'w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 bg-surface-subtle text-slate-400 border border-surface-border opacity-50 cursor-not-allowed flex items-center justify-center gap-2.5';
      this.todayBtn.innerHTML = `
        <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"/>
        </svg>
        <span>Heute gemacht!</span>
      `;
    } else if (isTodayDone) {
      this.todayBtn.disabled = false;
      this.todayBtn.className = 'w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 bg-brand-500 hover:bg-brand-600 text-white shadow-pill transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer';
      this.todayBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        <span>Heute gemacht</span>
      `;
    } else {
      this.todayBtn.disabled = false;
      this.todayBtn.className = 'w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 bg-surface-subtle hover:bg-brand-100 text-brand-700 border border-surface-border shadow-sm transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer';
      this.todayBtn.innerHTML = `
        <svg class="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"/>
        </svg>
        <span>Heute gemacht!</span>
      `;
    }
  }
}
