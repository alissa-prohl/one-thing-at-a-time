import { DateHelper } from '../services/DateHelper.js';

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
   */
  constructor({ startDate, completedDates, careDates, viewMode } = {}) {
    this.startDate = startDate || DateHelper.getTodayISO();
    this.completedDates = Array.isArray(completedDates) ? [...completedDates] : [];
    this.careDates = Array.isArray(careDates) ? [...careDates] : [];
    this.viewMode = viewMode === 'list' ? 'list' : 'grid';
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
   * Zählt alle positiven Tage der aktuellen 7 Tage (Fokus + Selbstfürsorge).
   * Beide zählen für das persönliche Wohlbefinden.
   * @returns {number}
   */
  getCompletedCountForCurrentWeek() {
    const weekDates = this.getWeekDates();
    return weekDates.reduce((count, dateStr) => {
      const isPositive = this.isDateCompleted(dateStr) || this.isDateCare(dateStr);
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
      viewMode: this.viewMode
    };
  }
}
