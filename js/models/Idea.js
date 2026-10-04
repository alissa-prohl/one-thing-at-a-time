/**
 * Idea Model
 * -------------------------------------------------------------
 * Repräsentiert eine einzelne Idee bzw. ein Vorhaben auf dem Gedanken-Parkplatz.
 * Enthält die Daten sowie die Logik zur Aktualisierung von Inhalten.
 */
export class Idea {
  /**
   * Erzeugt eine neue Idee.
   * @param {object} params
   * @param {string} [params.id] - Eindeutige ID (Standard: Zeitstempel-basiert)
   * @param {string} params.title - Kurztitel der Idee
   * @param {string} [params.what] - Ausführlichere Beschreibung: "Was genau?"
   * @param {string} [params.why] - Motivation: "Warum?"
   * @param {string} [params.createdAt] - Erstellungszeitpunkt als ISO-String
   */
  constructor({ id, title, what, why, createdAt } = {}) {
    this.id = id || 'idea-' + Date.now();
    this.title = (title || '').trim();
    this.what = (what || this.title).trim();
    this.why = (why || '').trim();
    this.createdAt = createdAt || new Date().toISOString();
  }

  /**
   * Aktualisiert Inhalt und Begründung der Idee.
   * Wenn das "Was" kurz und einzeilig ist, wird auch der Titel automatisch angepasst.
   * @param {string} what - Was genau möchte ich tun?
   * @param {string} why - Warum möchte ich das tun?
   */
  update(what, why) {
    this.what = (what || '').trim();
    this.why = (why || '').trim();

    if (this.what.length > 0 && this.what.length <= 60 && !this.what.includes('\n')) {
      this.title = this.what;
    }
  }

  /**
   * Wandelt die Idee in ein einfaches JSON-Objekt zur Speicherung um.
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      what: this.what,
      why: this.why,
      createdAt: this.createdAt
    };
  }

  /**
   * Erzeugt eine Idea-Instanz aus geladenen JSON-Rohdaten.
   * @param {object} json
   * @returns {Idea}
   */
  static fromJSON(json) {
    return new Idea({
      id: json.id,
      title: json.title,
      what: json.what,
      why: json.why,
      createdAt: json.createdAt
    });
  }
}
