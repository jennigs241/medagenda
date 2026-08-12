const STORAGE_KEY = 'medagenda_appointments';

const STATUS_LABELS = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé'
};

function getAppointments() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAppointments(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let appointments = getAppointments();

function updateStats() {
  const total = appointments.length;
  const patients = new Set(appointments.map(a => a.patient.trim().toLowerCase())).size;
  const pending = appointments.filter(a => a.status === 'PENDING').length;
  const completed = appointments.filter(a => a.status === 'COMPLETED').length;
  const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-patients').textContent = patients;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('stat-cancelled').textContent = cancelled;
}

function render() {
  const container = document.getElementById('appointments-container');
  const searchInput = document.getElementById('search-input');
  const filterStatus = document.getElementById('filter-status');
  const filterDate = document.getElementById('filter-date');

  if (!container) return;

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const statusVal = filterStatus ? filterStatus.value : 'ALL';
  const dateVal = filterDate ? filterDate.value : '';

  const filtered = appointments.filter(app => {
    const matchSearch = 
      app.patient.toLowerCase().includes(query) ||
      app.phone.toLowerCase().includes(query) ||
      app.doctor.toLowerCase().includes(query) ||
      app.reason.toLowerCase().includes(query);

    const matchStatus = statusVal === 'ALL' || app.status === statusVal;
    const matchDate = !dateVal || app.date === dateVal;

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
        <button class="btn btn-light btn-sm btn-edit" data-id="${app.id}">✏️ Modifier</button>
        ${app.status !== 'COMPLETED' ? `<button class="btn btn-light btn-sm btn-complete" data-id="${app.id}">✅ Terminer</button>` : ''}
        ${app.status !== 'CANCELLED' ? `<button class="btn btn-light btn-sm btn-cancel" data-id="${app.id}">🚫 Annuler</button>` : ''}
        <button class="btn btn-light btn-sm btn-delete" style="color:red;" data-id="${app.id}">🗑️ Supprimer</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Événements dynamiques sur les cartes
  container.querySelectorAll('.btn-edit').forEach(b => b.onclick = () => window.editApp(b.dataset.id));
  container.querySelectorAll('.btn-complete').forEach(b => b.onclick = () => window.setStatus(b.dataset.id, 'COMPLETED'));
  container.querySelectorAll('.btn-cancel').forEach(b => b.onclick = () => window.cancelApp(b.dataset.id));
  container.querySelectorAll('.btn-delete').forEach(b => b.onclick = () => window.deleteApp(b.dataset.id));
}

function refreshUI() {
  render();
  updateStats();
}

function hasConflict(doctor, date, time, excludeId = null) {
  return appointments.some(app => 
    app.id !== excludeId &&
    app.doctor === doctor &&
    app.date === date &&
    app.time === time &&
    app.status !== 'CANCELLED'
  );
}

// Fonctions globales
window.editApp = (id) => {
  const app = appointments.find(a => a.id === id);
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
  const app = appointments.find(a => a.id === id);
  if (app) {
    app.status = status;
    saveAppointments(appointments);
    refreshUI();
  }
};

window.cancelApp = (id) => {
  if (confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
    window.setStatus(id, 'CANCELLED');
  }
};

window.deleteApp = (id) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) {
    appointments = appointments.filter(a => a.id !== id);
    saveAppointments(appointments);
    refreshUI();
  }
};

function showModal() {
  const modal = document.getElementById('modal-form');
  const errorBox = document.getElementById('form-error');
  if (errorBox) errorBox.classList.add('hidden');
  if (modal) modal.classList.remove('hidden');
}

function hideModal() {
  const modal = document.getElementById('modal-form');
  const form = document.getElementById('appointment-form');
  if (modal) modal.classList.add('hidden');
  if (form) form.reset();
  document.getElementById('appointment-id').value = '';
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  const btnOpenModal = document.getElementById('btn-open-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelForm = document.getElementById('btn-cancel-form');
  const btnToday = document.getElementById('btn-today');
  const btnReset = document.getElementById('btn-reset-filters');
  const btnExport = document.getElementById('btn-export-csv');
  const form = document.getElementById('appointment-form');

  const searchInput = document.getElementById('search-input');
  const filterStatus = document.getElementById('filter-status');
  const filterDate = document.getElementById('filter-date');

  if (btnOpenModal) {
    btnOpenModal.onclick = () => {
      document.getElementById('modal-title').textContent = 'Nouveau rendez-vous';
      showModal();
    };
  }

  if (btnCloseModal) btnCloseModal.onclick = hideModal;
  if (btnCancelForm) btnCancelForm.onclick = hideModal;

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const errorBox = document.getElementById('form-error');
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

      if (hasConflict(data.doctor, data.date, data.time, id)) {
        errorBox.textContent = "Ce médecin possède déjà un rendez-vous à cette date et cette heure.";
        errorBox.classList.remove('hidden');
        return;
      }

      if (id) {
        const idx = appointments.findIndex(a => a.id === id);
        if (idx !== -1) appointments[idx] = { id, ...data };
      } else {
        appointments.push({ id: Date.now().toString(), ...data });
      }

      saveAppointments(appointments);
      hideModal();
      refreshUI();
    };
  }

  if (searchInput) searchInput.oninput = render;
  if (filterStatus) filterStatus.onchange = render;
  if (filterDate) filterDate.onchange = render;

  if (btnReset) {
    btnReset.onclick = () => {
      searchInput.value = '';
      filterStatus.value = 'ALL';
      filterDate.value = '';
      render();
    };
  }

  if (btnToday) {
    btnToday.onclick = () => {
      filterDate.value = new Date().toISOString().split('T')[0];
      render();
    };
  }

  if (btnExport) {
    btnExport.onclick = () => {
      if (appointments.length === 0) return alert("Aucun rendez-vous à exporter.");
      let csv = "data:text/csv;charset=utf-8,ID,Patient,Tel,Medecin,Date,Heure,Motif,Statut\n";
      appointments.forEach(a => {
        csv += `"${a.id}","${a.patient}","${a.phone}","${a.doctor}","${a.date}","${a.time}","${a.reason}","${a.status}"\n`;
      });
      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = "medagenda_export.csv";
      link.click();
    };
  }

  refreshUI();
});