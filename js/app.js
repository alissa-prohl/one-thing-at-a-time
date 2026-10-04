import { Idea } from './models/Idea.js';
import { WeekTracker } from './models/WeekTracker.js';
import { DateHelper } from './services/DateHelper.js';
import { StorageService } from './services/StorageService.js';
import { HomeView } from './views/HomeView.js';
import { ParkingView } from './views/ParkingView.js';
import { TrackerView } from './views/TrackerView.js';
import { ModalManager } from './views/ModalManager.js';

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
    this.ideas = [];
    this.weekTracker = null;
    this.calendarViewDate = new Date();
    this.currentEditingIdeaId = null;

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

    this.weekTracker = new WeekTracker({
      startDate: saved.weekStartDate,
      completedDates: saved.completedDates,
      viewMode: saved.trackerViewMode
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
      ideas: this.ideas.map((idea) => idea.toJSON()),
      trackerViewMode: this.weekTracker.viewMode
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
   * Aktualisiert alle Views der Anwendung.
   */
  renderAll() {
    const activeIdea = this.getActiveFocusIdea();
    const today = DateHelper.getTodayISO();
    const isTodayDone = this.weekTracker.isDateCompleted(today);

    // 1. Startseite
    this.homeView.render({
      activeIdea,
      isTodayDone
    });

    // 2. Gedanken-Parkplatz
    this.parkingView.render(this.ideas, this.activeFocusId);

    // 3. Wochen-Tracker
    this.trackerView.render({
      activeIdea,
      weekDates: this.weekTracker.getWeekDates(),
      isDateCompletedFn: (dateStr) => this.weekTracker.isDateCompleted(dateStr),
      completedCount: this.weekTracker.getCompletedCountForCurrentWeek(),
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
   * Klick auf den großen "Heute gemacht!"-Button auf der Startseite.
   */
  toggleToday() {
    if (!this.activeFocusId) return;
    const today = DateHelper.getTodayISO();
    this.toggleTrackerDay(today);
  }

  /**
   * Klick auf einen beliebigen Tag im Tracker.
   * @param {string} dateStr - Datum als "YYYY-MM-DD"
   */
  toggleTrackerDay(dateStr) {
    this.weekTracker.toggleDate(dateStr);
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
      isDateCompletedFn: (dateStr) => this.weekTracker.isDateCompleted(dateStr),
      completedCount: this.weekTracker.getCompletedCountForCurrentWeek(),
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

  // =============================================================
  // DETAIL-MODAL & LÖSCH-BESTÄTIGUNG
  // =============================================================

  openModal(ideaId) {
    const idea = this.ideas.find((i) => i.id === ideaId);
    if (!idea) return;

    this.currentEditingIdeaId = ideaId;
    const isActive = (this.activeFocusId === ideaId);

    this.modalManager.openIdeaModal(idea, isActive);
  }

  closeModal() {
    this.modalManager.closeIdeaModal();
    this.currentEditingIdeaId = null;
  }

  toggleModalFocus() {
    if (!this.currentEditingIdeaId) return;

    if (this.activeFocusId === this.currentEditingIdeaId) {
      this.activeFocusId = null;
    } else {
      this.activeFocusId = this.currentEditingIdeaId;
    }

    this.saveState();
    this.modalManager.updateModalFocusButton(this.activeFocusId === this.currentEditingIdeaId);
    this.renderAll();
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
