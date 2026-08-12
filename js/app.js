const STORAGE_KEY = 'medagenda_rdv';

export function getAppointments() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAppointment(appointment) {
  const appointments = getAppointments();
  const index = appointments.findIndex(app => app.id === appointment.id);
  
  if (index !== -1) {
    appointments[index] = appointment;
  } else {
    appointments.push(appointment);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

export function deleteAppointment(id) {
  let appointments = getAppointments();
  appointments = appointments.filter(app => app.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

export function getAppointmentById(id) {
  const appointments = getAppointments();
  return appointments.find(app => app.id === id) || null;
}