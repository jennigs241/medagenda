import { getAppointments } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('appointment-modal');
  const btnOpenModal = document.getElementById('btn-open-modal');
  const btnCloseModal = document.querySelector('.close-modal');
  const btnCancelForm = document.getElementById('btn-cancel-form');

  // Ouvrir la modale (+ Nouveau rendez-vous)
  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
  }

  // Fermer la modale
  const closeModal = () => modal.classList.add('hidden');
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCancelForm) btnCancelForm.addEventListener('click', closeModal);

  // Charger et afficher les RDV
  refreshUI();
});

function refreshUI() {
  const appointments = getAppointments();
  renderAppointments(appointments);
  updateStats(appointments);
}
  