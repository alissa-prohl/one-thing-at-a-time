import { DateHelper } from '../services/DateHelper.js?v=12';

/**
 * ParkingView
 * -------------------------------------------------------------
 * Verwaltet die Darstellung des Gedanken-Parkplatzes:
 * - Anzeige der Anzahl notierter Ideen
 * - Liste aller Ideen mit Status (Aktiver Wochenfokus, Mikrohabit, Geparkt)
 * - Direkte Buttons für Fokus & Mikrohabit
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
   * @param {string[]} [activeMicrohabitIds] - IDs der als Mikrohabit aktiven Ideen
   */
  render(ideas, activeFocusId, activeMicrohabitIds = []) {
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

    // 3. Sortieren: Aktiver Fokus ganz oben, dann Mikrohabits, danach nach Erstelldatum absteigend
    const sorted = [...ideas].sort((a, b) => {
      const aIsFocus = a.id === activeFocusId;
      const bIsFocus = b.id === activeFocusId;
      if (aIsFocus) return -1;
      if (bIsFocus) return 1;

      const aIsMicro = a.isMicrohabit || activeMicrohabitIds.includes(a.id);
      const bIsMicro = b.isMicrohabit || activeMicrohabitIds.includes(b.id);
      if (aIsMicro && !bIsMicro) return -1;
      if (!aIsMicro && bIsMicro) return 1;

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // 4. HTML für jede Idee erzeugen
    let html = '';

    sorted.forEach((idea) => {
      const isActiveFocus = idea.id === activeFocusId;
      const isMicrohabit = Boolean(idea.isMicrohabit || activeMicrohabitIds.includes(idea.id));
      const isOtherParked = Boolean((activeFocusId || activeMicrohabitIds.length > 0) && !isActiveFocus && !isMicrohabit);

      let cardClasses = 'group rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-200 border flex items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none active:scale-[0.99] ';

      if (isActiveFocus) {
        cardClasses += 'bg-surface-subtle border-brand-300 shadow-sm';
      } else if (isMicrohabit) {
        cardClasses += 'bg-[#FAF6FD] border-brand-200 shadow-sm';
      } else if (isOtherParked) {
        cardClasses += 'bg-white/60 border-slate-100 opacity-60 hover:opacity-90 hover:bg-white';
      } else {
        cardClasses += 'bg-white border-slate-100 hover:border-brand-200 hover:shadow-soft';
      }

      const initial = (idea.title || 'I').charAt(0).toUpperCase();

      html += `
        <div class="${cardClasses}" onclick="App.openModal('${idea.id}')">
          
          <div class="flex items-center gap-3.5 flex-1 min-w-0">
            <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
              isActiveFocus ? 'bg-brand-500 text-white shadow-xs' : (isMicrohabit ? 'bg-brand-100 text-brand-700' : 'bg-surface-subtle text-slate-400')
            } font-extrabold text-xs sm:text-sm">
              ${DateHelper.escapeHtml(initial)}
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base sm:text-lg font-bold text-slate-800 truncate">${DateHelper.escapeHtml(idea.title)}</h3>
                ${isActiveFocus ? `
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-brand-500 text-white shadow-xs">
                    Aktiver Wochenfokus
                  </span>
                ` : ''}
                ${isMicrohabit ? `
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-brand-100 text-brand-700 flex items-center gap-1">
                    <svg class="w-3 h-3 text-brand-600 inline shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22v-9" />
                      <path d="M12 13c0-3.5 2.5-6 7-6 0 4.5-2.5 7-7 6z" />
                      <path d="M12 17c0-2.5-2-4.5-5.5-4.5 0 3.5 2 5 5.5 4.5z" />
                    </svg>
                    <span>Mikrohabit</span>
                  </span>
                ` : ''}
                ${(!isActiveFocus && !isMicrohabit && isOtherParked) ? `
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
                    Geparkt
                  </span>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="text-slate-400 group-hover:text-brand-600 transition-colors shrink-0 p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
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
