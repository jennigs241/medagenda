document.addEventListener('DOMContentLoaded', () => {
  const manager = new AppointmentManager();

  const container = document.getElementById('appointments-container');
  const form = document.getElementById('appointment-form');
  const modal = document.getElementById('modal-form');
  const errorBox = document.getElementById('form-error');

  const searchInput = document.getElementById('search-input');
  const filterStatus = document.getElementById('filter-status');
  const filterDate = document.getElementById('filter-date');

  function updateStats() {
    const stats = manager.getStats();
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-patients').textContent = stats.patients;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-completed').textContent = stats.completed;
    document.getElementById('stat-cancelled').textContent = stats.cancelled;
  }

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
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 20px;">Aucun rendez-vous trouvé.</p>';
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

  function refreshUI() {
    renderAppointments();
    updateStats();
  }

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

  function showModal() {
    errorBox.classList.add('hidden');
    modal.classList.remove('hidden');
  }

  function hideModal() {
    modal.classList.add('hidden');
    form.reset();
    document.getElementById('appointment-id').value = '';
  }

  document.getElementById('btn-open-modal').addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Nouveau rendez-vous';
    showModal();
  });

  document.getElementById('btn-close-modal').addEventListener('click', hideModal);
  document.getElementById('btn-cancel-form').addEventListener('click', hideModal);

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

  searchInput.addEventListener('input', renderAppointments);
  filterStatus.addEventListener('change', renderAppointments);
  filterDate.addEventListener('change', renderAppointments);

  document.getElementById('btn-reset-filters').addEventListener('click', () => {
    searchInput.value = '';
    filterStatus.value = 'ALL';
    filterDate.value = '';
    renderAppointments();
  });

  document.getElementById('btn-today').addEventListener('click', () => {
    filterDate.value = new Date().toISOString().split('T')[0];
    renderAppointments();
  });

  document.getElementById('btn-export-csv').addEventListener('click', () => {
    const list = manager.getAll();
    if (list.length === 0) return alert("Aucune donnée à exporter.");
    let csv = "data:text/csv;charset=utf-8,ID,Patient,Tel,Medecin,Date,Heure,Motif,Statut\n";
    list.forEach(a => {
      csv += `"${a.id}","${a.patient}","${a.phone}","${a.doctor}","${a.date}","${a.time}","${a.reason}","${a.status}"\n`;
    });
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "medagenda_export.csv";
    link.click();
  });

  refreshUI();
});