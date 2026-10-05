import { DateHelper } from '../services/DateHelper.js?v=2';

/**
 * WeekTracker Model
 * -------------------------------------------------------------
 * Verwaltet den Zustand der 7-Tage-Wochenansicht:
 * - Welcher Tag ist der Starttag der angezeigten 7 Tage?
 * - An welchen Tagen wurde der Fokus erledigt (completedDates)?
 * - An welchen Tagen wurde etwas für die Selbstfürsorge getan (careDates)?
 * - Welche Ansicht ist aktiv ('grid' = Kacheln oder 'list' = Liste)?
 */
export class WeekTracker {
  /**
   * Erzeugt eine neue Tracker-Instanz.
   * @param {object} params
   * @param {string} [params.startDate] - Startdatum als "YYYY-MM-DD" (Standard: heute)
   * @param {string[]} [params.completedDates] - Array mit Daten, an denen der Fokus gemacht wurde
   * @param {string[]} [params.careDates] - Array mit Daten, an denen etwas Anderes gutgetan hat
   * @param {string} [params.viewMode] - 'grid' oder 'list'
   * @param {object} [params.completedMicrohabitDates] - Map: dateStr -> Array von erledigten Mikrohabit-IDs
   */
  constructor({ startDate, completedDates, careDates, viewMode, completedMicrohabitDates } = {}) {
    this.startDate = startDate || DateHelper.getTodayISO();
    this.completedDates = Array.isArray(completedDates) ? [...completedDates] : [];
    this.careDates = Array.isArray(careDates) ? [...careDates] : [];
    this.viewMode = viewMode === 'list' ? 'list' : 'grid';
    this.completedMicrohabitDates = (completedMicrohabitDates && typeof completedMicrohabitDates === 'object') ? { ...completedMicrohabitDates } : {};
  }

  /**
   * Gibt ein Array von 7 aufeinanderfolgenden ISO-Datumsstrings zurück,
   * beginnend mit dem aktuellen Startdatum.
   * @returns {string[]} z.B. ["2026-10-04", "2026-10-05", ...]
   */
  getWeekDates() {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(DateHelper.addDays(this.startDate, i));
    }
    return dates;
  }

  /**
   * Ermittelt den aktuellen Status eines Tages:
   * - 'focus': Wochenfokus heute gemacht
   * - 'care': Etwas anderes gemacht, was gut getan hat
   * - 'open': Noch nichts eingetragen
   * @param {string} dateStr - Datum als "YYYY-MM-DD"
   * @returns {'focus'|'care'|'open'}
   */
  getDayStatus(dateStr) {
    if (this.completedDates.includes(dateStr)) return 'focus';
    if (this.careDates.includes(dateStr)) return 'care';
    return 'open';
  }

  /**
   * Prüft, ob der Wochenfokus an diesem Datum erledigt wurde.
   * @param {string} dateStr
   * @returns {boolean}
   */
  isDateCompleted(dateStr) {
    return this.completedDates.includes(dateStr);
  }

  /**
   * Prüft, ob an diesem Datum etwas Anderes getan wurde, was gut getan hat.
   * @param {string} dateStr
   * @returns {boolean}
   */
  isDateCare(dateStr) {
    return this.careDates.includes(dateStr);
  }

  /**
   * Schaltet den "Heute gemacht!"-Fokus-Status für ein Datum um.
   * Falls an dem Tag bereits "care" aktiv war, wird es durch "focus" ersetzt.
   * @param {string} dateStr - Datum als "YYYY-MM-DD"
   * @returns {'focus'|'open'} Neuer Status
   */
  toggleFocusDate(dateStr) {
    // Falls Selbstfürsorge eingetragen war, entfernen
    const careIndex = this.careDates.indexOf(dateStr);
    if (careIndex > -1) {
      this.careDates.splice(careIndex, 1);
    }

    const focusIndex = this.completedDates.indexOf(dateStr);
    if (focusIndex > -1) {
      this.completedDates.splice(focusIndex, 1);
      return 'open';
    } else {
      this.completedDates.push(dateStr);
      return 'focus';
    }
  }

  /**
   * Schaltet den "Etwas anderes getan"-Status für ein Datum um.
   * Falls an dem Tag bereits der Wochenfokus aktiv war, wird er durch "care" ersetzt.
   * @param {string} dateStr - Datum als "YYYY-MM-DD"
   * @returns {'care'|'open'} Neuer Status
   */
  toggleCareDate(dateStr) {
    // Falls Fokus eingetragen war, entfernen
    const focusIndex = this.completedDates.indexOf(dateStr);
    if (focusIndex > -1) {
      this.completedDates.splice(focusIndex, 1);
    }

    const careIndex = this.careDates.indexOf(dateStr);
    if (careIndex > -1) {
      this.careDates.splice(careIndex, 1);
      return 'open';
    } else {
      this.careDates.push(dateStr);
      return 'care';
    }
  }

  /**
   * Abwärtskompatible Hilfsmethode für das direkte Umschalten aus dem Tracker.
   * @param {string} dateStr
   */
  toggleDate(dateStr) {
    return this.toggleFocusDate(dateStr);
  }

  /**
   * Verschiebt das Startdatum um die angegebene Anzahl Tage (z.B. +7 oder -7).
   * @param {number} days
   */
  shiftDays(days) {
    this.startDate = DateHelper.addDays(this.startDate, days);
  }

  /**
   * Setzt das Startdatum direkt auf ein bestimmtes Datum.
   * @param {string} dateStr
   */
  setStartDate(dateStr) {
    this.startDate = dateStr;
  }

  /**
   * Setzt das Startdatum direkt auf das heutige Datum zurück.
   */
  setStartDateToToday() {
    this.startDate = DateHelper.getTodayISO();
  }

  /**
   * Prüft, ob eine bestimmte Mikrohabit an einem Datum erledigt wurde.
   * @param {string} dateStr
   * @param {string} ideaId
   * @returns {boolean}
   */
  isMicrohabitCompleted(dateStr, ideaId) {
    const list = this.completedMicrohabitDates[dateStr];
    return Array.isArray(list) && list.includes(ideaId);
  }

  /**
   * Schaltet den Erledigt-Status einer bestimmten Mikrohabit für ein Datum um.
   * @param {string} dateStr
   * @param {string} ideaId
   * @returns {boolean} Neuer Zustand (true = erledigt, false = offen)
   */
  toggleMicrohabitDate(dateStr, ideaId) {
    if (!this.completedMicrohabitDates[dateStr]) {
      this.completedMicrohabitDates[dateStr] = [];
    }
    const index = this.completedMicrohabitDates[dateStr].indexOf(ideaId);
    if (index > -1) {
      this.completedMicrohabitDates[dateStr].splice(index, 1);
      return false;
    } else {
      this.completedMicrohabitDates[dateStr].push(ideaId);
      return true;
    }
  }

  /**
   * Prüft, ob an einem Tag die aktiven Mikrohabits erledigt wurden.
   * Wenn aktive Mikrohabits vorhanden sind, müssen alle aktiven erledigt sein.
   * @param {string} dateStr
   * @param {string[]} activeMicrohabitIds
   * @returns {boolean}
   */
  hasMicrohabitsCompleted(dateStr, activeMicrohabitIds = []) {
    if (!activeMicrohabitIds || activeMicrohabitIds.length === 0) {
      // Falls keine spezifischen IDs übergeben wurden, prüfen ob überhaupt eine Habit an dem Tag eingetragen ist
      const list = this.completedMicrohabitDates[dateStr];
      return Array.isArray(list) && list.length > 0;
    }
    return activeMicrohabitIds.every((id) => this.isMicrohabitCompleted(dateStr, id));
  }

  /**
   * Berechnet das Erscheinungsbild des Eulen-Maskottchens nach der Nutzer-Vorgabe:
   * - Vollfarbige Eule: Bei Fokus ODER "Etwas anderes getan" ODER Mikrohabit
   * - Grau/ruhend: Wenn an dem Tag gar nichts eingetragen ist
   *
   * @param {string} dateStr
   * @param {string[]} activeMicrohabitIds
   * @returns {{ colored: boolean, hasMain: boolean, hasMicro: boolean, plant: boolean, leaf: boolean }}
   */
  getMascotStatus(dateStr, activeMicrohabitIds = []) {
    const hasFocus = this.isDateCompleted(dateStr);
    const hasCare = this.isDateCare(dateStr);
    const hasMain = hasFocus || hasCare;
    const hasMicro = this.hasMicrohabitsCompleted(dateStr, activeMicrohabitIds);

    return {
      colored: hasMain || hasMicro,
      hasFocus,
      hasCare,
      hasMain,
      hasMicro,
      plant: hasMicro,
      leaf: hasMicro
    };
  }

  /**
   * Zählt alle positiven Tage der aktuellen 7 Tage (Fokus, Selbstfürsorge oder Mikrohabit).
   * @param {string[]} [activeMicrohabitIds]
   * @returns {number}
   */
  getCompletedCountForCurrentWeek(activeMicrohabitIds = []) {
    const weekDates = this.getWeekDates();
    return weekDates.reduce((count, dateStr) => {
      const isPositive = this.isDateCompleted(dateStr) || 
                         this.isDateCare(dateStr) || 
                         this.hasMicrohabitsCompleted(dateStr, activeMicrohabitIds);
      return count + (isPositive ? 1 : 0);
    }, 0);
  }

  /**
   * Schaltet zwischen Kachelansicht ('grid') und Listenansicht ('list') um.
   * @param {string} mode - 'grid' oder 'list'
   */
  setViewMode(mode) {
    this.viewMode = mode === 'list' ? 'list' : 'grid';
  }

  /**
   * Serialisierung für die Speicherung im localStorage.
   * @returns {object}
   */
  toJSON() {
    return {
      startDate: this.startDate,
      completedDates: this.completedDates,
      careDates: this.careDates,
      viewMode: this.viewMode,
      completedMicrohabitDates: this.completedMicrohabitDates
    };
  }
}
