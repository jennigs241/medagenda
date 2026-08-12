const STORAGE_KEY = 'medagenda_rdv';

// Récupérer tous les rendez-vous
export function getAppointments() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Ajouter ou mettre à jour un rendez-vous
export function saveAppointment(appointment) {
  const appointments = getAppointments();
  
  // Si le RDV existe déjà, on le met à jour, sinon on l'ajoute
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
  const appointments = getAppointments();
  const updatedAppointments = appointments.filter(app => app.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAppointments));
}

// Récupérer un rendez-vous spécifique par son ID
export function getAppointmentById(id) {
  const appointments = getAppointments();
  return appointments.find(app => app.id === id) || null;
}