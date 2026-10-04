/**
 * DateHelper
 * -------------------------------------------------------------
 * Zentrale Hilfsklasse für alle Datums- und Kalenderberechnungen.
 * Vermeidet doppelten Code (DRY-Prinzip) und macht Datumsoperationen
 * im gesamten Projekt einfach und einheitlich verständlich.
 */
export class DateHelper {

  /**
   * Gibt das heutige Datum im Format YYYY-MM-DD zurück.
   * Beispiel: "2026-10-04"
   */
  static getTodayISO() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Rechnet eine bestimmte Anzahl von Tagen zu einem ISO-Datum hinzu oder ab.
   * Funktioniert sicher über Monats- und Jahresgrenzen hinweg.
   * @param {string} isoDateString - Datum als "YYYY-MM-DD"
   * @param {number} days - Anzahl Tage (+7, -7, +1, etc.)
   * @returns {string} Neues Datum als "YYYY-MM-DD"
   */
  static addDays(isoDateString, days) {
    const [y, m, d] = isoDateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);

    const nextYear = date.getFullYear();
    const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
    const nextDay = String(date.getDate()).padStart(2, '0');
    return `${nextYear}-${nextMonth}-${nextDay}`;
  }

  /**
   * Formatiert ein ISO-Datum in nutzerfreundliche deutsche Angaben.
   * @param {string} isoDateString - Datum als "YYYY-MM-DD"
   * @returns {object} Objekt mit Wochentag, formatiertem Text und "isToday"-Status
   */
  static formatDayInfo(isoDateString) {
    const [y, m, d] = isoDateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);

    const weekdayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const monthNames = [
      'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
      'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
    ];

    return {
      weekday: weekdayNames[date.getDay()],
      formattedDate: `${d}. ${monthNames[date.getMonth()]}`,
      shortDayMonth: `${d}. ${monthNames[date.getMonth()]}`,
      dayNumber: d,
      isToday: isoDateString === this.getTodayISO()
    };
  }

  /**
   * Gibt den vollständigen deutschen Monatsnamen zurück (0 = Januar, 11 = Dezember).
   * @param {number} monthIndex - Index 0 bis 11
   * @returns {string} z.B. "Oktober"
   */
  static getMonthName(monthIndex) {
    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return monthNames[monthIndex] || '';
  }

  /**
   * Gibt die Anzahl der Tage in einem bestimmten Monat zurück.
   * @param {number} year - z.B. 2026
   * @param {number} monthIndex - 0 bis 11
   * @returns {number} z.B. 31
   */
  static getDaysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  /**
   * Berechnet den Offset für die Wochentage im Mini-Kalender.
   * Europäische Woche: Mo = 0, Di = 1, ..., So = 6
   * @param {number} year - z.B. 2026
   * @param {number} monthIndex - 0 bis 11
   * @returns {number} Leere Spalten vor dem 1. Tag des Monats
   */
  static getFirstDayOffset(year, monthIndex) {
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay(); // 0 = So, 1 = Mo
    return (firstDayOfWeek + 6) % 7;
  }

  /**
   * Hilfsfunktion zum sicheren Encodieren von Benutzereingaben (XSS-Schutz).
   * @param {string} text - Roher Eingabetext
   * @returns {string} Sicherer Text für HTML-Ausgabe
   */
  static escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
