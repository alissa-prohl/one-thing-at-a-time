/**
 * StorageService
 * -------------------------------------------------------------
 * Kapselt das Speichern und Laden aller App-Daten im localStorage des Browsers.
 * Wenn in Zukunft eine andere Speicherform (z.B. Cloud oder IndexedDB) genutzt
 * werden soll, muss nur diese eine Datei angepasst werden.
 */
export class StorageService {

  static STORAGE_KEY = 'one_thing_at_a_time_data_v4';

  /**
   * Lädt die gespeicherten Daten aus dem localStorage.
   * Gibt saubere Standardwerte zurück, falls noch nichts gespeichert ist.
   * @returns {object} Geladene Daten
   */
  static load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          activeFocusId: parsed.activeFocusId || null,
          weekStartDate: parsed.weekStartDate || null,
          completedDates: Array.isArray(parsed.completedDates) ? parsed.completedDates : [],
          careDates: Array.isArray(parsed.careDates) ? parsed.careDates : [],
          ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
          trackerViewMode: parsed.trackerViewMode || 'grid',
          activeMicrohabitIds: Array.isArray(parsed.activeMicrohabitIds) ? parsed.activeMicrohabitIds : [],
          completedMicrohabitDates: (parsed.completedMicrohabitDates && typeof parsed.completedMicrohabitDates === 'object') ? parsed.completedMicrohabitDates : {}
        };
      }
    } catch (error) {
      console.warn('Hinweis: Konnte gespeicherte Daten nicht laden:', error);
    }

    // Leerer Ausgangszustand
    return {
      activeFocusId: null,
      weekStartDate: null,
      completedDates: [],
      careDates: [],
      ideas: [],
      trackerViewMode: 'grid',
      activeMicrohabitIds: [],
      completedMicrohabitDates: {}
    };
  }

  /**
   * Speichert den aktuellen Zustand im localStorage.
   * @param {object} data - Zu speicherndes Datenobjekt
   */
  static save(data) {
    try {
      const dataToSave = {
        activeFocusId: data.activeFocusId || null,
        weekStartDate: data.weekStartDate || null,
        completedDates: data.completedDates || [],
        careDates: data.careDates || [],
        ideas: data.ideas || [],
        trackerViewMode: data.trackerViewMode || 'grid',
        activeMicrohabitIds: data.activeMicrohabitIds || [],
        completedMicrohabitDates: data.completedMicrohabitDates || {}
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Hinweis: Konnte Daten nicht im localStorage speichern:', error);
    }
  }
}
