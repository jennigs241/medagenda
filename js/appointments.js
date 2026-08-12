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

  // Règle métier obligatoire : Vérifier le conflit médecin/date/heure
  hasConflict(doctor, date, time, excludeId = null) {
    return this.appointments.some(app => 
      app.id !== excludeId &&
      app.doctor === doctor &&
      app.date === date &&
      app.time === time &&
      app.status !== 'CANCELLED'
    );
  }

  add(appointmentData) {
    if (this.hasConflict(appointmentData.doctor, appointmentData.date, appointmentData.time)) {
      throw new Error("Ce médecin possède déjà un rendez-vous à cette date et cette heure.");
    }

    const newAppointment = {
      id: Date.now().toString(),
      ...appointmentData
    };

    this.appointments.push(newAppointment);
    Storage.saveAppointments(this.appointments);
    return newAppointment;
  }

  update(id, updatedData) {
    if (this.hasConflict(updatedData.doctor, updatedData.date, updatedData.time, id)) {
      throw new Error("Ce médecin possède déjà un rendez-vous à cette date et cette heure.");
    }

    const index = this.appointments.findIndex(app => app.id === id);
    if (index !== -1) {
      this.appointments[index] = { id, ...updatedData };
      Storage.saveAppointments(this.appointments);
    }
  }

  updateStatus(id, newStatus) {
    const appointment = this.appointments.find(app => app.id === id);
    if (appointment) {
      appointment.status = newStatus;
      Storage.saveAppointments(this.appointments);
    }
  }

  delete(id) {
    this.appointments = this.appointments.filter(app => app.id !== id);
    Storage.saveAppointments(this.appointments);
  }

  getStats() {
    const total = this.appointments.length;
    // Compter les patients uniques par nom
    const uniquePatients = new Set(this.appointments.map(a => a.patient.trim().toLowerCase())).size;
    const pending = this.appointments.filter(a => a.status === 'PENDING').length;
    const completed = this.appointments.filter(a => a.status === 'COMPLETED').length;
    const cancelled = this.appointments.filter(a => a.status === 'CANCELLED').length;

    return { total, patients: uniquePatients, pending, completed, cancelled };
  }
}