/**
 * Module de gestion du stockage dans LocalStorage
 */
const STORAGE_KEY = 'medagenda_appointments';

export const Storage = {
  /**
   * Récupère tous les rendez-vous du localStorage
   * @returns {Array} Liste des rendez-vous
   */
  getAppointments() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Sauvegarde la liste complète des rendez-vous
   * @param {Array} appointments 
   */
  saveAppointments(appointments) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  }
};