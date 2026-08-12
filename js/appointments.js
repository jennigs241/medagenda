const STATUS_LABELS = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé'
};

class AppointmentManager {
  constructor() {
    this.appointments = Storage.getAppointments();
  }

  getAll() {
    return this.appointments;
  }

  hasConflict(doctor, date, time, excludeId = null) {
    return this.appointments.some(app => 
      app.id !== excludeId &&
      app.doctor === doctor &&
      app.date === date &&
      app.time === time &&
      app.status !== 'CANCELLED'
    );
  }

  add(data) {
    if (this.hasConflict(data.doctor, data.date, data.time)) {
      throw new Error("Ce médecin possède déjà un rendez-vous à cette date et cette heure.");
    }
    const newApp = { id: Date.now().toString(), ...data };
    this.appointments.push(newApp);
    Storage.saveAppointments(this.appointments);
    return newApp;
  }

  update(id, data) {
    if (this.hasConflict(data.doctor, data.date, data.time, id)) {
      throw new Error("Ce médecin possède déjà un rendez-vous à cette date et cette heure.");
    }
    const idx = this.appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.appointments[idx] = { id, ...data };
      Storage.saveAppointments(this.appointments);
    }
  }

  updateStatus(id, newStatus) {
    const app = this.appointments.find(a => a.id === id);
    if (app) {
      app.status = newStatus;
      Storage.saveAppointments(this.appointments);
    }
  }

  delete(id) {
    this.appointments = this.appointments.filter(a => a.id !== id);
    Storage.saveAppointments(this.appointments);
  }

  getStats() {
    const total = this.appointments.length;
    const uniquePatients = new Set(this.appointments.map(a => a.patient.trim().toLowerCase())).size;
    const pending = this.appointments.filter(a => a.status === 'PENDING').length;
    const completed = this.appointments.filter(a => a.status === 'COMPLETED').length;
    const cancelled = this.appointments.filter(a => a.status === 'CANCELLED').length;

    return { total, patients: uniquePatients, pending, completed, cancelled };
  }
}