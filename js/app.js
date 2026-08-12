import { getAppointments, saveAppointment, deleteAppointment, getAppointmentById } from './storage.js';
import { renderAppointments, updateStats } from './appointments.js';

document.addEventListener('DOMContentLoaded', () => {
  // Récupération des éléments DOM du Modal
  const modal = document.getElementById('appointment-modal');
  const btnOpenModal = document.getElementById('btn-open-modal');
  const btnCloseModal = document.querySelector('.close-modal');
  const btnCancelForm = document.getElementById('btn-cancel-form');
  const form = document.getElementById('appointment-form');

  // Ouverture du modal
  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', openModal);
  }

  // Fermeture du modal
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCancelForm) btnCancelForm.addEventListener('click', closeModal);

  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Soumission du formulaire (Ajout / Modification)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const idField = document.getElementById('appointment-id').value;

      const appointment = {
        id: idField ? idField : Date.now().toString(),
        patient: document.getElementById('patient').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        doctor: document.getElementById('doctor').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        reason: document.getElementById('reason').value.trim(),
        status: document.getElementById('status').value
      };

      saveAppointment(appointment);
      closeModal();
      refreshView();
    });
  }

  // Filtres et Recherche
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  const dateFilter = document.getElementById('date-filter');
  const btnReset = document.getElementById('btn-reset-filters');

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
  if (dateFilter) dateFilter.addEventListener('change', applyFilters);

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (statusFilter) statusFilter.value = 'ALL';
      if (dateFilter) dateFilter.value = '';
      refreshView();
    });
  }

  // Actions d'édition et suppression sur la liste des RDV
  const container = document.getElementById('appointments-list');
  if (container) {
    container.addEventListener('click', (e) => {
      const btnDelete = e.target.closest('.btn-delete');
      const btnEdit = e.target.closest('.btn-edit');

      if (btnDelete) {
        deleteAppointment(btnDelete.dataset.id);
        refreshView();
      }

      if (btnEdit) {
        const app = getAppointmentById(btnEdit.dataset.id);
        if (app) {
          document.getElementById('appointment-id').value = app.id;
          document.getElementById('patient').value = app.patient;
          document.getElementById('phone').value = app.phone;
          document.getElementById('doctor').value = app.doctor;
          document.getElementById('date').value = app.date;
          document.getElementById('time').value = app.time;
          document.getElementById('reason').value = app.reason;
          document.getElementById('status').value = app.status;
          openModal();
        }
      }
    });
  }

  // Affichage initial
  refreshView();
});

function openModal() {
  const modal = document.getElementById('appointment-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeModal() {
  const modal = document.getElementById('appointment-modal');
  const form = document.getElementById('appointment-form');
  if (modal) modal.classList.add('hidden');
  if (form) {
    form.reset();
    document.getElementById('appointment-id').value = '';
  }
}

function applyFilters() {
  let appointments = getAppointments();
  const searchValue = document.getElementById('search-input')?.value.toLowerCase() || '';
  const statusValue = document.getElementById('status-filter')?.value || 'ALL';
  const dateValue = document.getElementById('date-filter')?.value || '';

  if (searchValue) {
    appointments = appointments.filter(a =>
      a.patient.toLowerCase().includes(searchValue) ||
      a.phone.includes(searchValue) ||
      a.doctor.toLowerCase().includes(searchValue) ||
      a.reason.toLowerCase().includes(searchValue)
    );
  }

  if (statusValue !== 'ALL') {
    appointments = appointments.filter(a => a.status === statusValue);
  }

  if (dateValue) {
    appointments = appointments.filter(a => a.date === dateValue);
  }

  renderAppointments(appointments);
}

function refreshView() {
  const appointments = getAppointments();
  renderAppointments(appointments);
  updateStats();
}