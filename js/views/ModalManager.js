/**
 * ModalManager
 * -------------------------------------------------------------
 * Verwaltet das Öffnen und Schließen aller Dialog-Fenster (Modale):
 * 1. Ideen-Detail- & Bearbeiten-Modal
 * 2. Lösch-Bestätigungs-Modal ("Wirklich löschen?")
 * 3. Mini-Kalender-Modal zur Auswahl des Starttags
 *
 * Behebt zudem den lästigen Browser-Bug, bei dem das Markieren von Text
 * im Eingabefeld versehentlich das Modal schließt, wenn der Mauszeiger
 * außerhalb losgelassen wird.
 */
export class ModalManager {
  constructor() {
    // 1. Ideen-Modal
    this.ideaModal = document.getElementById('modal-idea');
    this.ideaDialog = document.getElementById('modal-idea-dialog');
    this.ideaIdInput = document.getElementById('modal-idea-id');
    this.whatInput = document.getElementById('modal-input-what');
    this.whyInput = document.getElementById('modal-input-why');
    this.focusBtn = document.getElementById('btn-modal-toggle-focus');
    this.focusBtnText = document.getElementById('modal-focus-btn-text');

    // 2. Lösch-Bestätigung
    this.deleteModal = document.getElementById('modal-confirm-delete');
    this.deleteDialog = document.getElementById('modal-confirm-dialog');

    // 3. Mini-Kalender
    this.calendarModal = document.getElementById('modal-calendar');
    this.calendarDialog = document.getElementById('modal-calendar-dialog');

    this.setupBackdropProtection();
    this.setupKeyboardEvents();
  }

  /**
   * Richtet einen Klick- und Markier-Schutz für alle drei Modale ein.
   * Ein Modal schließt sich nur dann beim Klick auf den Hintergrund, wenn
   * SOWOHL das Drücken (mousedown) ALS AUCH das Loslassen (mouseup) direkt
   * auf der abgedunkelten Fläche stattfanden.
   */
  setupBackdropProtection() {
    this.bindBackdropGuard(this.ideaModal, this.ideaDialog, () => this.closeIdeaModal());
    this.bindBackdropGuard(this.deleteModal, this.deleteDialog, () => this.closeDeleteConfirm());
    this.bindBackdropGuard(this.calendarModal, this.calendarDialog, () => this.closeCalendarModal());
  }

  bindBackdropGuard(modalEl, dialogEl, onClose) {
    if (!modalEl || !dialogEl) return;

    // Klicks und Mausaktionen innerhalb der weißen Dialogbox niemals an den Hintergrund weiterreichen
    ['click', 'mousedown', 'mouseup'].forEach((evtType) => {
      dialogEl.addEventListener(evtType, (e) => e.stopPropagation());
    });

    let isBackdropMouseDown = false;

    modalEl.addEventListener('mousedown', (e) => {
      isBackdropMouseDown = (e.target === modalEl);
    });

    modalEl.addEventListener('mouseup', (e) => {
      if (isBackdropMouseDown && e.target === modalEl) {
        onClose();
      }
      isBackdropMouseDown = false;
    });
  }

  /**
   * Escape-Taste schließt geöffnete Dialoge.
   */
  setupKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAll();
      }
    });
  }

  // --- Ideen-Bearbeiten-Modal ---

  openIdeaModal(idea, isActiveFocus) {
    if (!this.ideaModal || !idea) return;

    if (this.ideaIdInput) this.ideaIdInput.value = idea.id;
    if (this.whatInput) this.whatInput.value = idea.what || idea.title;
    if (this.whyInput) this.whyInput.value = idea.why || '';

    this.updateModalFocusButton(isActiveFocus);
    this.ideaModal.classList.remove('hidden');
  }

  closeIdeaModal() {
    if (this.ideaModal) {
      this.ideaModal.classList.add('hidden');
    }
  }

  updateModalFocusButton(isActiveFocus) {
    if (!this.focusBtn || !this.focusBtnText) return;

    if (isActiveFocus) {
      this.focusBtnText.textContent = 'Wochenfokus beenden';
      this.focusBtn.className = 'w-full py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700';
    } else {
      this.focusBtnText.textContent = 'Als Wochenfokus wählen';
      this.focusBtn.className = 'w-full py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white shadow-pill';
    }
  }

  getIdeaModalValues() {
    return {
      id: this.ideaIdInput ? this.ideaIdInput.value : '',
      what: this.whatInput ? this.whatInput.value.trim() : '',
      why: this.whyInput ? this.whyInput.value.trim() : ''
    };
  }

  // --- Lösch-Bestätigung ---

  openDeleteConfirm() {
    if (this.deleteModal) {
      this.deleteModal.classList.remove('hidden');
    }
  }

  closeDeleteConfirm() {
    if (this.deleteModal) {
      this.deleteModal.classList.add('hidden');
    }
  }

  // --- Mini-Kalender ---

  openCalendarModal() {
    if (this.calendarModal) {
      this.calendarModal.classList.remove('hidden');
    }
  }

  closeCalendarModal() {
    if (this.calendarModal) {
      this.calendarModal.classList.add('hidden');
    }
  }

  closeAll() {
    this.closeDeleteConfirm();
    this.closeIdeaModal();
    this.closeCalendarModal();
  }
}
