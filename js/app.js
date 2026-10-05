import { Idea } from './models/Idea.js?v=12';
import { WeekTracker } from './models/WeekTracker.js?v=12';
import { DateHelper } from './services/DateHelper.js?v=12';
import { StorageService } from './services/StorageService.js?v=12';
import { HomeView } from './views/HomeView.js?v=12';
import { ParkingView } from './views/ParkingView.js?v=12';
import { TrackerView } from './views/TrackerView.js?v=12';
import { ModalManager } from './views/ModalManager.js?v=12';

/**
 * App (Haupt-Controller)
 * -------------------------------------------------------------
 * Verbindet die Daten-Modelle, Services und Benutzeroberflächen (Views).
 * Hört auf Benutzerinteraktionen und sorgt dafür, dass Daten gespeichert
 * und der Bildschirm stets aktuell gehalten wird.
 */
class AppController {
  constructor() {
    this.currentView = 'home';
    this.activeFocusId = null;
    this.activeMicrohabitIds = [];
    this.ideas = [];
    this.weekTracker = null;
    this.calendarViewDate = new Date();
    this.currentEditingIdeaId = null;
    this.pendingFocusIdeaId = null;

    // View-Instanzen
    this.homeView = null;
    this.parkingView = null;
    this.trackerView = null;
    this.modalManager = null;
  }

  /**
   * Startet die Anwendung nach dem Laden des DOM.
   */
  init() {
    this.homeView = new HomeView();
    this.parkingView = new ParkingView();
    this.trackerView = new TrackerView();
    this.modalManager = new ModalManager();

    this.loadState();
    this.renderAll();
  }

  /**
   * Lädt die gespeicherten Daten aus dem StorageService.
   */
  loadState() {
    const saved = StorageService.load();

    this.activeFocusId = saved.activeFocusId;
    this.ideas = saved.ideas.map((raw) => Idea.fromJSON(raw));

    const savedMicroIds = Array.isArray(saved.activeMicrohabitIds) ? saved.activeMicrohabitIds : [];
    this.ideas.forEach((idea) => {
      if (savedMicroIds.includes(idea.id)) {
        idea.isMicrohabit = true;
      }
    });
    this.activeMicrohabitIds = this.ideas.filter((i) => i.isMicrohabit).map((i) => i.id);

    this.weekTracker = new WeekTracker({
      startDate: saved.weekStartDate,
      completedDates: saved.completedDates,
      careDates: saved.careDates,
      viewMode: saved.trackerViewMode,
      completedMicrohabitDates: saved.completedMicrohabitDates
    });
  }

  /**
   * Speichert den aktuellen Zustand im localStorage.
   */
  saveState() {
    StorageService.save({
      activeFocusId: this.activeFocusId,
      weekStartDate: this.weekTracker.startDate,
      completedDates: this.weekTracker.completedDates,
      careDates: this.weekTracker.careDates,
      ideas: this.ideas.map((idea) => idea.toJSON()),
      trackerViewMode: this.weekTracker.viewMode,
      activeMicrohabitIds: this.activeMicrohabitIds,
      completedMicrohabitDates: this.weekTracker.completedMicrohabitDates
    });
  }

  /**
   * Gibt die Idea-Instanz des aktuellen Fokus zurück (oder null).
   * @returns {Idea|null}
   */
  getActiveFocusIdea() {
    if (!this.activeFocusId) return null;
    return this.ideas.find((idea) => idea.id === this.activeFocusId) || null;
  }

  /**
   * Gibt alle aktiven Mikrohabits als Idea-Array zurück.
   * @returns {Idea[]}
   */
  getActiveMicrohabits() {
    return this.ideas.filter((idea) => this.activeMicrohabitIds.includes(idea.id));
  }

  /**
   * Aktualisiert alle Views der Anwendung.
   */
  renderAll() {
    const activeIdea = this.getActiveFocusIdea();
    const activeMicrohabits = this.getActiveMicrohabits();
    const today = DateHelper.getTodayISO();
    const todayStatus = this.weekTracker.getDayStatus(today);

    // 1. Startseite (Mikrohabits über Eule, Eule, Spruch, Fokus- & Care-Button)
    this.homeView.render({
      activeIdea,
      todayStatus,
      activeMicrohabits,
      isMicrohabitCompletedFn: (ideaId) => this.weekTracker.isMicrohabitCompleted(today, ideaId)
    });

    // 2. Gedanken-Parkplatz
    this.parkingView.render(this.ideas, this.activeFocusId, this.activeMicrohabitIds);

    // 3. Wochen-Tracker
    this.trackerView.render({
      activeIdea,
      weekDates: this.weekTracker.getWeekDates(),
      getMascotStatusFn: (dateStr) => this.weekTracker.getMascotStatus(dateStr, this.activeMicrohabitIds),
      completedCount: this.weekTracker.getCompletedCountForCurrentWeek(this.activeMicrohabitIds),
      viewMode: this.weekTracker.viewMode
    });
  }

  // =============================================================
  // NAVIGATION (STARTSEITE / PARKPLATZ / WOCHEN-TRACKER)
  // =============================================================

  navigate(targetView) {
    this.currentView = targetView;

    const views = {
      home: document.getElementById('section-home'),
      ideas: document.getElementById('section-ideas'),
      tracker: document.getElementById('section-tracker')
    };

    const navBtns = {
      home: document.getElementById('nav-btn-home'),
      ideas: document.getElementById('nav-btn-ideas'),
      tracker: document.getElementById('nav-btn-tracker')
    };

    Object.keys(views).forEach((key) => {
      const section = views[key];
      if (!section) return;
      if (key === targetView) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });

    Object.keys(navBtns).forEach((key) => {
      const btn = navBtns[key];
      if (!btn) return;
      if (key === targetView) {
        btn.className = 'nav-tab px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 bg-brand-500 text-white shadow-pill';
      } else {
        btn.className = 'nav-tab px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 text-slate-600 hover:text-brand-700 hover:bg-brand-50';
      }
    });

    this.renderAll();
  }

  // =============================================================
  // STARTSEITE & WOCHEN-TRACKER INTERAKTIONEN
  // =============================================================

  /**
   * Klick auf das Eulen-Maskottchen auf der Startseite:
   * Wählt direkt "Heute gemacht" aus.
   * Falls noch kein Fokus gewählt ist, wird zum Gedanken-Parkplatz gewechselt.
   */
  handleOwlClick() {
    if (!this.activeFocusId) {
      this.navigate('ideas');
      return;
    }
    const today = DateHelper.getTodayISO();
    this.weekTracker.toggleFocusDate(today);
    this.saveState();
    this.renderAll();
  }

  /**
   * Klick auf den großen "Heute gemacht!"-Button auf der Startseite (Wochenfokus).
   */
  toggleToday() {
    if (!this.activeFocusId) return;
    const today = DateHelper.getTodayISO();
    this.weekTracker.toggleFocusDate(today);
    this.saveState();
    this.renderAll();
  }

  /**
   * Klick auf den 2. Button: "Etwas anderes gemacht, was mir gut getan hat!".
   * Immer aktivierbar, auch ohne festen Wochenfokus.
   */
  toggleCareToday() {
    const today = DateHelper.getTodayISO();
    this.weekTracker.toggleCareDate(today);
    this.saveState();
    this.renderAll();
  }

  /**
   * Klick auf einen beliebigen Tag im Tracker.
   * Wenn an dem Tag bereits etwas eingetragen ist (Fokus, Gut getan oder Mikrohabit),
   * wird es mit einem einzigen Tipp komplett rückgängig gemacht ("Offen").
   * Ist der Tag noch offen, wird der Wochenfokus für diesen Tag eingetragen.
   * @param {string} dateStr - Datum als "YYYY-MM-DD"
   */
  toggleTrackerDay(dateStr) {
    const isAnyMarked = this.weekTracker.hasAnyCompleted(dateStr);

    if (isAnyMarked) {
      this.weekTracker.resetDate(dateStr);
    } else {
      this.weekTracker.toggleFocusDate(dateStr);
    }

    this.saveState();
    this.renderAll();
  }

  /**
   * Verschiebt die angezeigte Woche vorwärts oder rückwärts (z.B. +7 oder -7 Tage).
   * @param {number} days
   */
  shiftStartDate(days) {
    this.weekTracker.shiftDays(days);
    this.saveState();
    this.renderAll();
  }

  /**
   * Setzt das Startdatum wieder auf heute zurück.
   */
  setStartDateToToday() {
    this.weekTracker.setStartDateToToday();
    this.saveState();
    this.renderAll();
  }

  /**
   * Direktes Setzen des Startdatums (über den Mini-Kalender).
   * @param {string} isoDate
   */
  setStartDateDirect(isoDate) {
    this.weekTracker.setStartDate(isoDate);
    this.saveState();
    this.modalManager.closeCalendarModal();
    this.renderAll();
  }

  /**
   * Wechselt zwischen Kachelraster ('grid') und Listenansicht ('list').
   * @param {string} mode
   */
  setTrackerViewMode(mode) {
    this.weekTracker.setViewMode(mode);
    this.saveState();
    this.trackerView.render({
      activeIdea: this.getActiveFocusIdea(),
      weekDates: this.weekTracker.getWeekDates(),
      getMascotStatusFn: (dateStr) => this.weekTracker.getMascotStatus(dateStr, this.activeMicrohabitIds),
      completedCount: this.weekTracker.getCompletedCountForCurrentWeek(this.activeMicrohabitIds),
      viewMode: this.weekTracker.viewMode
    });
  }

  // =============================================================
  // MINI-KALENDER
  // =============================================================

  openCalendarModal() {
    const currentStart = this.weekTracker.startDate;
    const [y, m] = currentStart.split('-').map(Number);
    this.calendarViewDate = new Date(y, m - 1, 1);

    this.trackerView.renderCalendar(this.calendarViewDate, currentStart);
    this.modalManager.openCalendarModal();
  }

  closeCalendarModal() {
    this.modalManager.closeCalendarModal();
  }

  shiftCalendarMonth(direction) {
    this.calendarViewDate.setMonth(this.calendarViewDate.getMonth() + direction);
    this.trackerView.renderCalendar(this.calendarViewDate, this.weekTracker.startDate);
  }

  // =============================================================
  // GEDANKEN-PARKPLATZ & IDEEN-VERWALTUNG
  // =============================================================

  /**
   * Notiert eine neue Idee über das Schnelleingabefeld.
   * @param {Event} event
   */
  handleQuickAdd(event) {
    event.preventDefault();
    const input = document.getElementById('input-quick-title');
    const title = input ? input.value.trim() : '';
    if (!title) return;

    const newIdea = new Idea({ title });
    this.ideas.unshift(newIdea);

    this.parkingView.clearInput();
    this.saveState();
    this.renderAll();
  }

  /**
   * Direktes Umschalten des Fokus direkt aus der Parkplatz-Liste.
   * @param {string} ideaId
   */
  toggleIdeaFocusDirect(ideaId) {
    if (this.activeFocusId === ideaId) {
      this.activeFocusId = null;
    } else {
      this.activeFocusId = ideaId;
    }
    this.saveState();
    this.renderAll();
  }

  /**
   * Direktes Umschalten als Mikrohabit (beliebig viele wählbar).
   * @param {string} ideaId
   */
  toggleIdeaMicrohabitDirect(ideaId) {
    const idea = this.ideas.find((i) => i.id === ideaId);
    if (!idea) return;

    idea.isMicrohabit = !idea.isMicrohabit;
    if (idea.isMicrohabit) {
      if (!this.activeMicrohabitIds.includes(ideaId)) {
        this.activeMicrohabitIds.push(ideaId);
      }
    } else {
      this.activeMicrohabitIds = this.activeMicrohabitIds.filter((id) => id !== ideaId);
    }

    this.saveState();
    this.renderAll();
  }

  /**
   * Toggelt eine Mikrohabit für das heutige Datum (Startseiten-Interaktion).
   * Färbt den Container lila bzw. wieder weiß.
   * @param {string} ideaId
   */
  toggleMicrohabitToday(ideaId) {
    const today = DateHelper.getTodayISO();
    this.weekTracker.toggleMicrohabitDate(today, ideaId);
    this.saveState();
    this.renderAll();
  }

  // =============================================================
  // DETAIL-MODAL & LÖSCH-BESTÄTIGUNG
  // =============================================================

  openModal(ideaId) {
    const idea = this.ideas.find((i) => i.id === ideaId);
    if (!idea) return;

    this.currentEditingIdeaId = ideaId;
    const isActive = (this.activeFocusId === ideaId);
    const isMicrohabit = Boolean(idea.isMicrohabit || this.activeMicrohabitIds.includes(ideaId));

    this.modalManager.openIdeaModal(idea, isActive, isMicrohabit);
  }

  closeModal() {
    this.modalManager.closeIdeaModal();
    this.currentEditingIdeaId = null;
  }

  toggleModalFocus() {
    if (!this.currentEditingIdeaId) return;

    // 1. Wenn diese Idee bereits der Fokus ist -> Einfach beenden
    if (this.activeFocusId === this.currentEditingIdeaId) {
      this.activeFocusId = null;
      this.saveState();
      this.modalManager.updateModalFocusButton(false);
      this.renderAll();
      return;
    }

    // 2. Es soll ein neuer Fokus gesetzt werden -> Vorher fragen, damit kein versehentliches Überschreiben passiert
    const newIdea = this.ideas.find((i) => i.id === this.currentEditingIdeaId);
    if (!newIdea) return;

    const oldIdea = this.getActiveFocusIdea();
    this.pendingFocusIdeaId = this.currentEditingIdeaId;
    this.modalManager.openFocusConfirm(oldIdea ? oldIdea.title : null, newIdea.title);
  }

  confirmSetNewFocus() {
    if (!this.pendingFocusIdeaId) return;

    this.activeFocusId = this.pendingFocusIdeaId;
    this.pendingFocusIdeaId = null;

    this.saveState();
    this.modalManager.closeFocusConfirm();
    this.modalManager.updateModalFocusButton(this.activeFocusId === this.currentEditingIdeaId);
    this.renderAll();
  }

  cancelFocusConfirm() {
    this.pendingFocusIdeaId = null;
    this.modalManager.closeFocusConfirm();
  }

  toggleModalMicrohabit() {
    if (!this.currentEditingIdeaId) return;

    this.toggleIdeaMicrohabitDirect(this.currentEditingIdeaId);
    const idea = this.ideas.find((i) => i.id === this.currentEditingIdeaId);
    if (idea) {
      this.modalManager.updateModalMicrohabitButton(idea.isMicrohabit);
    }
  }

  saveModalIdea(event) {
    event.preventDefault();
    if (!this.currentEditingIdeaId) return;

    const values = this.modalManager.getIdeaModalValues();
    const idea = this.ideas.find((i) => i.id === this.currentEditingIdeaId);

    if (idea && values.what) {
      idea.update(values.what, values.why);
      this.saveState();
      this.renderAll();
    }

    this.closeModal();
  }

  deleteModalIdea() {
    if (!this.currentEditingIdeaId) return;
    this.modalManager.openDeleteConfirm();
  }

  cancelDeleteConfirm() {
    this.modalManager.closeDeleteConfirm();
  }

  confirmDeleteModalIdea() {
    if (!this.currentEditingIdeaId) return;

    if (this.activeFocusId === this.currentEditingIdeaId) {
      this.activeFocusId = null;
    }
    this.activeMicrohabitIds = this.activeMicrohabitIds.filter((id) => id !== this.currentEditingIdeaId);

    this.ideas = this.ideas.filter((i) => i.id !== this.currentEditingIdeaId);
    this.saveState();

    this.modalManager.closeDeleteConfirm();
    this.modalManager.closeIdeaModal();
    this.currentEditingIdeaId = null;

    this.renderAll();
  }
}

// Singleton-Instanz erzeugen und an window binden (für onclick im HTML & Console Debugging)
const app = new AppController();
window.App = app;

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

export default app;
