import { DateHelper } from '../services/DateHelper.js';

/**
 * WeekTracker Model
 * -------------------------------------------------------------
 * Verwaltet den Zustand der 7-Tage-Wochenansicht:
 * - Welcher Tag ist der Starttag der angezeigten 7 Tage?
 * - An welchen Tagen wurde der Fokus bisher erledigt?
 * - Welche Ansicht ist aktiv ('grid' = Kacheln oder 'list' = Liste)?
 */
export class WeekTracker {
  /**
   * Erzeugt eine neue Tracker-Instanz.
   * @param {object} params
   * @param {string} [params.startDate] - Startdatum als "YYYY-MM-DD" (Standard: heute)
   * @param {string[]} [params.completedDates] - Array erledigter ISO-Daten
   * @param {string} [params.viewMode] - 'grid' oder 'list'
   */
  constructor({ startDate, completedDates, viewMode } = {}) {
    this.startDate = startDate || DateHelper.getTodayISO();
    this.completedDates = Array.isArray(completedDates) ? [...completedDates] : [];
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
   * Prüft, ob ein bestimmtes Datum als erledigt markiert ist.
   * @param {string} dateStr - Datum als "YYYY-MM-DD"
   * @returns {boolean}
   */
  isDateCompleted(dateStr) {
    return this.completedDates.includes(dateStr);
  }

  /**
   * Schaltet den Erledigt-Status eines Datums um (An/Aus).
   * @param {string} dateStr - Datum als "YYYY-MM-DD"
   * @returns {boolean} Neuer Status (true = erledigt, false = offen)
   */
  toggleDate(dateStr) {
    const index = this.completedDates.indexOf(dateStr);
    if (index > -1) {
      this.completedDates.splice(index, 1);
      return false;
    } else {
      this.completedDates.push(dateStr);
      return true;
    }
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
   * Zählt, wie viele der 7 Tage in der aktuell sichtbaren Woche erledigt sind.
   * @returns {number}
   */
  getCompletedCountForCurrentWeek() {
    const weekDates = this.getWeekDates();
    return weekDates.reduce((count, dateStr) => {
      return count + (this.isDateCompleted(dateStr) ? 1 : 0);
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
   * Serialisierung für die Speicherung.
   * @returns {object}
   */
  toJSON() {
    return {
      startDate: this.startDate,
      completedDates: this.completedDates,
      viewMode: this.viewMode
    };
  }
}
