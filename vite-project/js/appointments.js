import { getAppointments, deleteAppointment } from './storage.js';

// Mettre à jour les compteurs du tableau de bord
export function updateStats() {
  const appointments = getAppointments();
  
  const total = appointments.length;
  const uniquePatients = new Set(appointments.map(a => a.patient.trim().toLowerCase())).size;
  const pending = appointments.filter(a => a.status === 'PENDING').length;
  const completed = appointments.filter(a => a.status === 'COMPLETED').length;
  const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-patients').textContent = uniquePatients;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('stat-cancelled').textContent = cancelled;
}

// Afficher la liste des rendez-vous
export function renderAppointments(appointmentsList) {
  const container = document.getElementById('appointments-list');
  if (!container) return;

  container.innerHTML = '';

  if (!appointmentsList || appointmentsList.length === 0) {
    container.innerHTML = '<p class="no-data">Aucun rendez-vous trouvé.</p>';
    return;
  }

  appointmentsList.forEach(app => {
    const card = document.createElement('div');
    card.className = `appointment-card status-${app.status.toLowerCase()}`;
    
    card.innerHTML = `
      <div class="card-header">
        <h3>${escapeHtml(app.patient)}</h3>
        <span class="badge badge-${app.status.toLowerCase()}">${app.status}</span>
      </div>
      <div class="card-body">
        <p><strong>📞 Tél :</strong> ${escapeHtml(app.phone)}</p>
        <p><strong>👨‍⚕️ Médecin :</strong> ${escapeHtml(app.doctor)}</p>
        <p><strong>📅 Date :</strong> ${app.date} à ${app.time}</p>
        <p><strong>📝 Motif :</strong> ${escapeHtml(app.reason)}</p>
      </div>
      <div class="card-actions">
        <button class="btn btn-small btn-edit" data-id="${app.id}">Éditer</button>
        <button class="btn btn-small btn-delete" data-id="${app.id}">Supprimer</button>
      </div>
    `;

    container.appendChild(card);
  });

  updateStats();
}

// Sécuriser l'affichage des textes utilisateurs
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}