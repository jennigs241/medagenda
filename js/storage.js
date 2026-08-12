const STORAGE_KEY = 'medagenda_appointments';

const STORAGE_KEY = 'medagenda_appointments';

const Storage = {
  getAppointments() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveAppointments(appointments) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  }
};