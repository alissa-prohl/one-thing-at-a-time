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
    this.microhabitBtn = document.getElementById('btn-modal-toggle-microhabit');
    this.microhabitBtnText = document.getElementById('modal-microhabit-btn-text');

    // 2. Lösch-Bestätigung
    this.deleteModal = document.getElementById('modal-confirm-delete');
    this.deleteDialog = document.getElementById('modal-confirm-dialog');

    // 3. Wochenfokus-Bestätigung
    this.focusConfirmModal = document.getElementById('modal-confirm-focus');
    this.focusConfirmDialog = document.getElementById('modal-confirm-focus-dialog');
    this.focusConfirmText = document.getElementById('modal-confirm-focus-text');

    // 4. Mini-Kalender
    this.calendarModal = document.getElementById('modal-calendar');
    this.calendarDialog = document.getElementById('modal-calendar-dialog');

    this.setupBackdropProtection();
    this.setupKeyboardEvents();
  }

  /**
   * Richtet einen Klick- und Markier-Schutz für alle Modale ein.
   * Ein Modal schließt sich nur dann beim Klick auf den Hintergrund, wenn
   * SOWOHL das Drücken (mousedown) ALS AUCH das Loslassen (mouseup) direkt
   * auf der abgedunkelten Fläche stattfanden.
   */
  setupBackdropProtection() {
    this.bindBackdropGuard(this.ideaModal, this.ideaDialog, () => this.closeIdeaModal());
    this.bindBackdropGuard(this.deleteModal, this.deleteDialog, () => this.closeDeleteConfirm());
    this.bindBackdropGuard(this.focusConfirmModal, this.focusConfirmDialog, () => this.closeFocusConfirm());
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

  openIdeaModal(idea, isActiveFocus, isMicrohabit) {
    if (!this.ideaModal || !idea) return;

    if (this.ideaIdInput) this.ideaIdInput.value = idea.id;
    if (this.whatInput) this.whatInput.value = idea.what || idea.title;
    if (this.whyInput) this.whyInput.value = idea.why || '';

    this.updateModalFocusButton(isActiveFocus);
    this.updateModalMicrohabitButton(isMicrohabit);
    this.ideaModal.classList.remove('hidden');
  }

  closeIdeaModal() {
    if (this.ideaModal) {
      this.ideaModal.classList.add('hidden');
    }
  }

  updateModalFocusButton(isActiveFocus) {
    if (!this.focusBtn) return;

    if (isActiveFocus) {
      this.focusBtn.className = 'w-full py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white shadow-pill active:scale-95 cursor-pointer';
      this.focusBtn.innerHTML = `
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        <span id="modal-focus-btn-text">Aktiver Wochenfokus (Tippen zum Beenden)</span>
      `;
    } else {
      this.focusBtn.className = 'w-full py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-surface-subtle hover:bg-brand-100 text-brand-700 border border-surface-border shadow-sm active:scale-95 cursor-pointer';
      this.focusBtn.innerHTML = `
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        <span id="modal-focus-btn-text">Als Wochenfokus wählen</span>
      `;
    }
  }

  updateModalMicrohabitButton(isMicrohabit) {
    if (!this.microhabitBtn) return;

    if (isMicrohabit) {
      this.microhabitBtn.className = 'w-full py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white shadow-pill active:scale-95 cursor-pointer';
      this.microhabitBtn.innerHTML = `
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        <span id="modal-microhabit-btn-text">Als Mikrohabit aktiv (Tippen zum Entfernen)</span>
      `;
    } else {
      this.microhabitBtn.className = 'w-full py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-surface-subtle hover:bg-brand-100 text-brand-700 border border-surface-border shadow-sm active:scale-95 cursor-pointer';
      this.microhabitBtn.innerHTML = `
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        <span id="modal-microhabit-btn-text">Als Mikrohabit hinzufügen</span>
      `;
    }
  }

  getIdeaModalValues() {
    return {
      id: this.ideaIdInput ? this.ideaIdInput.value : '',
      what: this.whatInput ? this.whatInput.value.trim() : '',
      why: this.whyInput ? this.whyInput.value.trim() : ''
    };
  }

  // --- Wochenfokus-Bestätigung ---

  openFocusConfirm(oldFocusTitle, newFocusTitle) {
    if (!this.focusConfirmModal) return;

    if (this.focusConfirmText) {
      if (oldFocusTitle) {
        this.focusConfirmText.textContent = `Du hast bereits „${oldFocusTitle}“ als Wochenfokus. Möchtest du ihn wirklich durch „${newFocusTitle}“ ersetzen?`;
      } else {
        this.focusConfirmText.textContent = `Möchtest du „${newFocusTitle}“ als deinen neuen Wochenfokus festlegen?`;
      }
    }

    this.focusConfirmModal.classList.remove('hidden');
  }

  closeFocusConfirm() {
    if (this.focusConfirmModal) {
      this.focusConfirmModal.classList.add('hidden');
    }
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
    this.closeFocusConfirm();
    this.closeDeleteConfirm();
    this.closeIdeaModal();
    this.closeCalendarModal();
  }
}
