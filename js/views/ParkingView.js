import { DateHelper } from '../services/DateHelper.js';

/**
 * ParkingView
 * -------------------------------------------------------------
 * Verwaltet die Darstellung des Gedanken-Parkplatzes:
 * - Anzeige der Anzahl notierter Ideen
 * - Liste aller Ideen mit Status (Aktiver Wochenfokus, Geparkt, Normal)
 * - Leerer Zustand mit Maskottchen, falls noch keine Ideen existieren
 */
export class ParkingView {
  constructor() {
    this.container = document.getElementById('ideas-list-container');
    this.emptyState = document.getElementById('ideas-empty-state');
    this.countBadge = document.getElementById('badge-ideas-count');
    this.totalStat = document.getElementById('ideas-stat-total');
    this.quickInput = document.getElementById('input-quick-title');
  }

  /**
   * Rendert die Liste der Ideen.
   * @param {Array} ideas - Liste von Idea-Instanzen
   * @param {string|null} activeFocusId - ID des aktuell gewählten Wochenfokus
   */
  render(ideas, activeFocusId) {
    if (!this.container) return;

    // 1. Zähler aktualisieren
    const count = ideas.length;
    if (this.countBadge) this.countBadge.textContent = count;
    if (this.totalStat) this.totalStat.textContent = `${count} ${count === 1 ? 'Idee' : 'Ideen'}`;

    // 2. Leerer Zustand
    if (count === 0) {
      this.container.innerHTML = '';
      if (this.emptyState) this.emptyState.classList.remove('hidden');
      return;
    }

    if (this.emptyState) this.emptyState.classList.add('hidden');

    // 3. Sortieren: Der aktive Fokus steht ganz oben, danach nach Erstelldatum absteigend
    const sorted = [...ideas].sort((a, b) => {
      if (a.id === activeFocusId) return -1;
      if (b.id === activeFocusId) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // 4. HTML für jede Idee erzeugen
    let html = '';

    sorted.forEach((idea) => {
      const isActive = idea.id === activeFocusId;
      const isOtherParked = Boolean(activeFocusId && !isActive);

      let cardClasses = 'group rounded-2xl p-3.5 sm:p-4 transition-all duration-200 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ';

      if (isActive) {
        cardClasses += 'bg-surface-subtle border-brand-300 shadow-sm';
      } else if (isOtherParked) {
        cardClasses += 'bg-white/60 border-slate-100 opacity-50 hover:opacity-90 hover:bg-white';
      } else {
        cardClasses += 'bg-white border-slate-100 hover:border-brand-200 hover:shadow-soft';
      }

      const initial = (idea.title || 'I').charAt(0).toUpperCase();

      html += `
        <div class="${cardClasses}" onclick="App.openModal('${idea.id}')">
          
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-brand-500 text-white' : 'bg-surface-subtle text-slate-400'} font-bold text-xs">
              ${DateHelper.escapeHtml(initial)}
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm sm:text-base font-bold text-slate-800 truncate">${DateHelper.escapeHtml(idea.title)}</h3>
                ${isActive ? `
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white">
                    Aktiver Wochenfokus
                  </span>
                ` : (isOtherParked ? `
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                    Geparkt
                  </span>
                ` : '')}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center" onclick="event.stopPropagation()">
            <button 
              type="button"
              onclick="App.toggleIdeaFocusDirect('${idea.id}')"
              class="p-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${isActive ? 'bg-brand-100 text-brand-700 hover:bg-brand-200' : 'bg-surface-subtle text-slate-500 hover:bg-brand-50 hover:text-brand-700'}"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span>${isActive ? 'Fokus beenden' : 'Als Fokus wählen'}</span>
            </button>

            <button 
              type="button"
              onclick="App.openModal('${idea.id}')"
              class="p-2 text-slate-400 hover:text-brand-600 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

        </div>
      `;
    });

    this.container.innerHTML = html;
  }

  /**
   * Leert das Schnelleingabe-Feld.
   */
  clearInput() {
    if (this.quickInput) {
      this.quickInput.value = '';
    }
  }
}
