import { saveToStorage } from './storage.js';

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

  // --- Chargement des médecins via fetch (async/await) ---
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
      // Mode dégradé si le fichier ne charge pas
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
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-patients').textContent = stats.patients;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-completed').textContent = stats.completed;
    document.getElementById('stat-cancelled').textContent = stats.cancelled;
  }

  function renderAppointments() {
    let filtered = manager.getAll();

    // Filtre texte (recherche)
    const query = searchInput.value.toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(a =>
        a.patient.toLowerCase().includes(query) ||
        a.phone.toLowerCase().includes(query) ||
        a.doctor.toLowerCase().includes(query) ||
        a.reason.toLowerCase().includes(query)
      );
    }

    // Filtre statut
    const status = statusFilter.value;
    if (status !== 'ALL') {
      filtered = filtered.filter(a => a.status === status);
    }

    // Filtre date
    const dateVal = dateFilter.value;
    if (dateVal) {
      filtered = filtered.filter(a => a.date === dateVal);
    }

    // Affichage
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
          <span class="badge badge-${app.status}">${statusLabels[app.status]}</span>
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

  // --- Gestion de la Modal & Formulaire ---
  document.getElementById('btn-open-modal').addEventListener('click', () => {
    openModal();
  });

  document.querySelector('.close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-form').addEventListener('click', closeModal);

  function openModal(appointment = null) {
    formError.classList.add('hidden');
    form.reset();

    if (appointment) {
      modalTitle.textContent = 'Modifier le rendez-vous';
      document.getElementById('appointment-id').value = appointment.id;
      document.getElementById('patient').value = appointment.patient;
      document.getElementById('phone').value = appointment.phone;
      document.getElementById('doctor').value = appointment.doctor;
      document.getElementById('date').value = appointment.date;
      document.getElementById('time').value = appointment.time;
      document.getElementById('reason').value = appointment.reason;
      document.getElementById('status').value = appointment.status;
    } else {
      modalTitle.textContent = 'Nouveau rendez-vous';
      document.getElementById('appointment-id').value = '';
    }

    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  // Soumission du formulaire
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

    // Validation des champs requis
    if (!patient || !phone || !doctor || !date || !time || !reason) {
      showError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Règle métier : Vérification du doublon de créneau pour le médecin
    if (manager.isDoctorBusy(doctor, date, time, id)) {
      showError('Ce médecin possède déjà un rendez-vous à cette date et cette heure.');
      return;
    }

    // Enregistrement
    manager.save({ id, patient, phone, doctor, date, time, reason, status });
    closeModal();
    render();
  });

  function showError(msg) {
    formError.textContent = msg;
    formError.classList.remove('hidden');
  }

  // --- Gestion des actions sur la liste ---
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

  // --- Événements Filtres ---
  searchInput.addEventListener('input', renderAppointments);
  statusFilter.addEventListener('change', renderAppointments);
  dateFilter.addEventListener('change', renderAppointments);

  document.getElementById('btn-reset-filters').addEventListener('click', () => {
    searchInput.value = '';
    statusFilter.value = 'ALL';
    dateFilter.value = '';
    renderAppointments();
  });

  // --- Bouton RDV du Jour ---
  document.getElementById('btn-filter-today').addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    dateFilter.value = today;
    renderAppointments();
  });

  // Sécurité XSS basique
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, match => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[match]));
  }
});