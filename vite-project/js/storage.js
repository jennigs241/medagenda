const STORAGE_KEY = 'medagenda_rdv';

// Récupérer tous les rendez-vous
export function getAppointments() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Ajouter ou mettre à jour un rendez-vous
export function saveAppointment(appointment) {
  const appointments = getAppointments();
  
  // Vérifier si le RDV existe déjà (mode modification) ou s'il s'agit d'un nouveau RDV
  const index = appointments.findIndex(app => app.id === appointment.id);
  
  if (index !== -1) {
    appointments[index] = appointment;
  } else {
    appointments.push(appointment);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

// Supprimer un rendez-vous par son ID
export function deleteAppointment(id) {
  let appointments = getAppointments();
  appointments = appointments.filter(app => app.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

// Récupérer un rendez-vous spécifique par son ID
export function getAppointmentById(id) {
  const appointments = getAppointments();
  return appointments.find(app => app.id === id) || null;
}