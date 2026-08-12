// Remplace 'medagenda_rdv' par votre clé si elle est différente
const STORAGE_KEY = 'medagenda_rdv';

export function getAppointments() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAppointment(appointment) {
  const appointments = getAppointments();
  appointments.push(appointment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

export function deleteAppointment(id) {
  let appointments = getAppointments();
  appointments = appointments.filter(app => app.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}