import { AppointmentManager } from './appointments.js';

/**
 * Contrôleur principal de l'application
 */
document.addEventListener('DOMContentLoaded', () => {
  const manager = new AppointmentManager();

  // Éléments du DOM
  const modal = document.getElementById('appointment-modal');
  const form = document.getElementById('appointment-form');
  const formError = document.getElementById('form-error');
  const modalTitle = document.getElementById('modal-title');
  const listContainer = document.getElementById('appointments-list');
  const doctorSelect = document.getElementById('doctor');

  // Filtres
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  const dateFilter = document.getElementById('date-filter');

  // Initialisation
  loadDoctors();
  render();

  // --- Chargement des médecins via fetch ---
  async function loadDoctors() {
    try {
      const response = await fetch('data/doctors.json');
      if (!response.ok) throw new Error('Erreur de chargement des médecins');
      const doctors = await response.json();

      doctorSelect.innerHTML = '<option value="">-- Sélectionner un médecin --</option>';
      doctors.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.name;
        option.textContent = `${doc.name} (${doc.specialty})`;
        doctorSelect.appendChild(option);
      });
    } catch (error) {
      console.error(error);
      doctorSelect.innerHTML = `
        <option value="">-- Sélectionner un médecin --</option>
        <option value="Dr. Martin">Dr. Martin</option>
        <option value="Dr. Bernard">Dr. Bernard</option>
      `;
    }
  }

  // --- Rendu complet de l'interface ---
  function render() {
    renderStats();
    renderAppointments();
  }

  function renderStats() {
    const stats = manager.getStats();
    if (document.getElementById('stat-total')) document.getElementById('stat-total').textContent = stats.total;
    if (document.getElementById('stat-patients')) document.getElementById('stat-patients').textContent = stats.patients;
    if (document.getElementById('stat-pending')) document.getElementById('stat-pending').textContent = stats.pending;
    if (document.getElementById('stat-completed')) document.getElementById('stat-completed').textContent = stats.completed;
    if (document.getElementById('stat-cancelled')) document.getElementById('stat-cancelled').textContent = stats.cancelled;
  }

  function renderAppointments() {
    let filtered = manager.getAll();

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (query) {
      filtered = filtered.filter(a =>
        a.patient.toLowerCase().includes(query) ||
        a.phone.toLowerCase().includes(query) ||
        a.doctor.toLowerCase().includes(query) ||
        a.reason.toLowerCase().includes(query)
      );
    }

    const status = statusFilter ? statusFilter.value : 'ALL';
    if (status !== 'ALL') {
      filtered = filtered.filter(a => a.status === status);
    }

    const dateVal = dateFilter ? dateFilter.value : '';
    if (dateVal) {
      filtered = filtered.filter(a => a.date === dateVal);
    }

    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (filtered.length === 0) {
      listContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #718096;">Aucun rendez-vous trouvé.</p>';
      return;
    }

    const statusLabels = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmé',
      COMPLETED: 'Terminé',
      CANCELLED: 'Annulé'
    };

    filtered.forEach(app => {
      const card = document.createElement('div');
      card.className = `card status-${app.status}`;
      card.innerHTML = `
        <div class="card-header">
          <strong>${escapeHtml(app.patient)}</strong>
          <span class="badge badge-${app.status}">${statusLabels[app.status] || app.status}</span>
        </div>
        <div class="card-body">
          <p>📞 ${escapeHtml(app.phone)}</p>
          <p>👨‍⚕️ ${escapeHtml(app.doctor)}</p>
          <p>📅 ${app.date} à ${app.time}</p>
          <p>📝 <em>${escapeHtml(app.reason)}</em></p>
        </div>
        <div class="card-actions">
          <button class="btn btn-small btn-secondary btn-edit" data-id="${app.id}">Modifier</button>
          ${app.status !== 'COMPLETED' ? `<button class="btn btn-small btn-success btn-complete" data-id="${app.id}">Terminer</button>` : ''}
          ${app.status !== 'CANCELLED' ? `<button class="btn btn-small btn-secondary btn-cancel" data-id="${app.id}">Annuler</button>` : ''}
          <button class="btn btn-small btn-danger btn-delete" data-id="${app.id}">Supprimer</button>
        </div>
      `;
      listContainer.appendChild(card);
    });
  }

  // --- Modal & Formulaire ---
  const btnOpenModal = document.getElementById('btn-open-modal');
  if (btnOpenModal) btnOpenModal.addEventListener('click', () => openModal());

  const closeModalBtn = document.querySelector('.close-modal');
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  
  const btnCancelForm = document.getElementById('btn-cancel-form');
  if (btnCancelForm) btnCancelForm.addEventListener('click', closeModal);

  function openModal(appointment = null) {
    if (formError) formError.classList.add('hidden');
    if (form) form.reset();

    if (appointment) {
      if (modalTitle) modalTitle.textContent = 'Modifier le rendez-vous';
      document.getElementById('appointment-id').value = appointment.id;
      document.getElementById('patient').value = appointment.patient;
      document.getElementById('phone').value = appointment.phone;
      document.getElementById('doctor').value = appointment.doctor;
      document.getElementById('date').value = appointment.date;
      document.getElementById('time').value = appointment.time;
      document.getElementById('reason').value = appointment.reason;
      document.getElementById('status').value = appointment.status;
    } else {
      if (modalTitle) modalTitle.textContent = 'Nouveau rendez-vous';
      document.getElementById('appointment-id').value = '';
    }

    if (modal) modal.classList.remove('hidden');
  }

  function closeModal() {
    if (modal) modal.classList.add('hidden');
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = document.getElementById('appointment-id').value;
      const patient = document.getElementById('patient').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const doctor = document.getElementById('doctor').value;
      const date = document.getElementById('date').value;
      const time = document.getElementById('time').value;
      const reason = document.getElementById('reason').value.trim();
      const status = document.getElementById('status').value;

      if (!patient || !phone || !doctor || !date || !time || !reason) {
        showError('Veuillez remplir tous les champs obligatoires.');
        return;
      }

      if (manager.isDoctorBusy(doctor, date, time, id)) {
        showError('Ce médecin possède déjà un rendez-vous à cette date et cette heure.');
        return;
      }

      manager.save({ id, patient, phone, doctor, date, time, reason, status });
      closeModal();
      render();
    });
  }

  function showError(msg) {
    if (formError) {
      formError.textContent = msg;
      formError.classList.remove('hidden');
    }
  }

  if (listContainer) {
    listContainer.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      if (!id) return;

      if (e.target.classList.contains('btn-edit')) {
        const app = manager.getAll().find(a => a.id === id);
        if (app) openModal(app);
      } 
      else if (e.target.classList.contains('btn-complete')) {
        manager.updateStatus(id, 'COMPLETED');
        render();
      } 
      else if (e.target.classList.contains('btn-cancel')) {
        if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
          manager.updateStatus(id, 'CANCELLED');
          render();
        }
      } 
      else if (e.target.classList.contains('btn-delete')) {
        if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce rendez-vous ?')) {
          manager.delete(id);
          render();
        }
      }
    });
  }

  // Filtres
  if (searchInput) searchInput.addEventListener('input', renderAppointments);
  if (statusFilter) statusFilter.addEventListener('change', renderAppointments);
  if (dateFilter) dateFilter.addEventListener('change', renderAppointments);

  const btnReset = document.getElementById('btn-reset-filters');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (statusFilter) statusFilter.value = 'ALL';
      if (dateFilter) dateFilter.value = '';
      renderAppointments();
    });
  }

  const btnFilterToday = document.getElementById('btn-filter-today');
  if (btnFilterToday) {
    btnFilterToday.addEventListener('click', () => {
      const today = new Date().toISOString().split('T')[0];
      if (dateFilter) dateFilter.value = today;
      renderAppointments();
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, match => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[match]));
  }
});