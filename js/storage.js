const STORAGE_KEY = 'medagenda_appointments';

/**
 * Récupère tous les rendez-vous du localStorage
 */
export function getFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Sauvegarde la liste complète des rendez-vous
 */
export function saveToStorage(appointments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

// Vous pouvez conserver l'objet Storage en export pour compatibilité
export const Storage = {
  getAppointments: getFromStorage,
  saveAppointments: saveToStorage
};