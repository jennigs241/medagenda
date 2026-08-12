document.addEventListener('DOMContentLoaded', () => {
  const manager = new AppointmentManager();

  // Éléments DOM
  const container = document.getElementById('appointments-container');
  const form = document.getElementById('appointment-form');
  const modal = document.getElementById('modal-form');
  const doctorSelect = document.getElementById('doctor');
  const errorBox = document.getElementById('form-error');

  // Filtres
  const searchInput = document.getElementById('search-input');
  const filterStatus = document.getElementById('filter-status');
  const filterDate = document.getElementById('filter-date');

  // 1. Bonus : Chargement dynamique des médecins async/await
  async function loadDoctors() {
    try {
      const response = await fetch('data/doctors.json');
      if (!response.ok) throw new Error('Erreur de chargement');
      const doctors = await response.json();

      doctorSelect.innerHTML = '<option value="">-- Sélectionner un médecin --</option>';
      doctors.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc;
        option.textContent = doc;
        doctorSelect.appendChild(option);
      });
    } catch (error) {
      doctorSelect.innerHTML = '<option value="">Erreur de chargement des médecins</option>';
      console.error(error);
    }
  }

  // 2. Mise à jour des statistiques
  function updateStats() {
    const stats = manager.getStats();
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-patients').textContent = stats.patients;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-completed').textContent = stats.completed;
    document.getElementById('stat-cancelled').textContent = stats.cancelled;
  }

  // 3. Rendu dynamique de la liste des RDV
  function renderAppointments() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedStatus = filterStatus.value;
    const selectedDate = filterDate.value;

    const filtered = manager.getAll().filter(app => {
      const matchSearch = 
        app.patient.toLowerCase().includes(query) ||
        app.phone.toLowerCase().includes(query) ||
        app.doctor.toLowerCase().includes(query) ||
        app.reason.toLowerCase().includes(query);

      const matchStatus = selectedStatus === 'ALL' || app.status === selectedStatus;
      const matchDate = !selectedDate || app.date === selectedDate;

      return matchSearch && matchStatus && matchDate;
    });

    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280;">Aucun rendez-vous trouvé.</p>';
      return;
    }

    filtered.forEach(app => {
      const card = document.createElement('div');
      card.className = `appointment-card ${app.status}`;
      card.innerHTML = `
        <div class="card-header">
          <strong>${app.patient}</strong>
          <span class="badge ${app.status}">${STATUS_LABELS[app.status]}</span>
        </div>
        <div class="card-body">
          <p>📞 <strong>Tél :</strong> ${app.phone}</p>
          <p>👨‍⚕️ <strong>Médecin :</strong> ${app.doctor}</p>
          <p>📅 <strong>Le :</strong> ${app.date} à ${app.time}</p>
          <p>📋 <strong>Motif :</strong> ${app.reason}</p>
        </div>
        <div class="card-actions">
          <button class="btn btn-light btn-sm" onclick="editApp('${app.id}')">✏️ Modifier</button>
          ${app.status !== 'COMPLETED' ? `<button class="btn btn-light btn-sm" onclick="setStatus('${app.id}', 'COMPLETED')">✅ Terminer</button>` : ''}
          ${app.status !== 'CANCELLED' ? `<button class="btn btn-light btn-sm" onclick="cancelApp('${app.id}')">🚫 Annuler</button>` : ''}
          <button class="btn btn-light btn-sm" style="color:red;" onclick="deleteApp('${app.id}')">🗑️ Supprimer</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Actions globales rendues accessibles sur la fenêtre
  window.editApp = (id) => {
    const app = manager.getAll().find(a => a.id === id);
    if (!app) return;

    document.getElementById('appointment-id').value = app.id;
    document.getElementById('patient').value = app.patient;
    document.getElementById('phone').value = app.phone;
    document.getElementById('doctor').value = app.doctor;
    document.getElementById('date').value = app.date;
    document.getElementById('time').value = app.time;
    document.getElementById('reason').value = app.reason;
    document.getElementById('status').value = app.status;

    document.getElementById('modal-title').textContent = 'Modifier le rendez-vous';
    showModal();
  };

  window.setStatus = (id, status) => {
    manager.updateStatus(id, status);
    refreshUI();
  };

  window.cancelApp = (id) => {
    if (confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      manager.updateStatus(id, 'CANCELLED');
      refreshUI();
    }
  };

  window.deleteApp = (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement ce rendez-vous ?")) {
      manager.delete(id);
      refreshUI();
    }
  };

  function refreshUI() {
    renderAppointments();
    updateStats();
  }

  // Modal Control
  function showModal() {
    errorBox.classList.add('hidden');
    modal.classList.remove('hidden');
  }

  function hideModal() {
    modal.classList.add('hidden');
    form.reset();
    document.getElementById('appointment-id').value = '';
  }

  // Événements
  document.getElementById('btn-open-modal').addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Nouveau rendez-vous';
    showModal();
  });

  document.getElementById('btn-close-modal').addEventListener('click', hideModal);
  document.getElementById('btn-cancel-form').addEventListener('click', hideModal);

  // Soumission du formulaire (Ajout / Modification)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('appointment-id').value;
    const data = {
      patient: document.getElementById('patient').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      doctor: document.getElementById('doctor').value,
      date: document.getElementById('date').value,
      time: document.getElementById('time').value,
      reason: document.getElementById('reason').value.trim(),
      status: document.getElementById('status').value
    };

    try {
      if (id) {
        manager.update(id, data);
      } else {
        manager.add(data);
      }
      hideModal();
      refreshUI();
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove('hidden');
    }
  });

  // Événements Filtres
  searchInput.addEventListener('input', renderAppointments);
  filterStatus.addEventListener('change', renderAppointments);
  filterDate.addEventListener('change', renderAppointments);

  document.getElementById('btn-reset-filters').addEventListener('click', () => {
    searchInput.value = '';
    filterStatus.value = 'ALL';
    filterDate.value = '';
    renderAppointments();
  });

  // Bonus : Bouton RDV du jour
  document.getElementById('btn-today').addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    filterDate.value = today;
    renderAppointments();
  });

  // Bonus Fonctionnalité Personnelle : Export CSV
  document.getElementById('btn-export-csv').addEventListener('click', () => {
    const appointments = manager.getAll();
    if (appointments.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,ID,Patient,Telephone,Medecin,Date,Heure,Motif,Statut\n";
    appointments.forEach(app => {
      csvContent += `"${app.id}","${app.patient}","${app.phone}","${app.doctor}","${app.date}","${app.time}","${app.reason}","${app.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `medagenda_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Initialisation
  loadDoctors();
  refreshUI();
});