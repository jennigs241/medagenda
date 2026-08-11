import { Storage } from './storage.js';

/**
 * Module métier de gestion des rendez-vous
 */
export class AppointmentManager {
  constructor() {
    this.appointments = Storage.getAppointments();
  }

  getAll() {
    return this.appointments;
  }

  /**
   * Vérifie si un médecin a déjà un RDV au même moment
   * (Règle métier)
   */
  isDoctorBusy(doctor, date, time, excludeId = null) {
    return this.appointments.some(app => 
      app.doctor === doctor &&
      app.date === date &&
      app.time === time &&
      app.id !== excludeId &&
      app.status !== 'CANCELLED' // Les RDV annulés libèrent le créneau
    );
  }

  /**
   * Ajoute ou met à jour un rendez-vous
   */
  save(appointmentData) {
    if (appointmentData.id) {
      // Modification
      const index = this.appointments.findIndex(a => a.id === appointmentData.id);
      if (index !== -1) {
        this.appointments[index] = { ...appointmentData };
      }
    } else {
      // Création
      const newAppointment = {
        ...appointmentData,
        id: Date.now().toString()
      };
      this.appointments.push(newAppointment);
    }
    Storage.saveAppointments(this.appointments);
  }

  /**
   * Supprime définitivement un rendez-vous
   */
  delete(id) {
    this.appointments = this.appointments.filter(a => a.id !== id);
    Storage.saveAppointments(this.appointments);
  }

  /**
   * Mettre à jour le statut
   */
  updateStatus(id, newStatus) {
    const app = this.appointments.find(a => a.id === id);
    if (app) {
      app.status = newStatus;
      Storage.saveAppointments(this.appointments);
    }
  }

  /**
   * Calcul des statistiques
   */
  getStats() {
    const uniquePatients = new Set(this.appointments.map(a => a.patient.trim().toLowerCase())).size;

    return {
      total: this.appointments.length,
      patients: uniquePatients,
      pending: this.appointments.filter(a => a.status === 'PENDING').length,
      completed: this.appointments.filter(a => a.status === 'COMPLETED').length,
      cancelled: this.appointments.filter(a => a.status === 'CANCELLED').length
    };
  }
}