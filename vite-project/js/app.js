import { saveToStorage } from './storage.js';

async function loadDoctors() {
  try {
    // import.meta.env.BASE_URL s'adapte automatiquement à GitHub Pages
    const response = await fetch(`${import.meta.env.BASE_URL}data/doctors.json`); 
    if (!response.ok) throw new Error('Erreur de chargement des médecins');
    const doctors = await response.json();

    doctorSelect.innerHTML = '<option value="">-- Sélectionner un médecin --</option>';
    doctors.forEach(doc => {
      const option = document.createElement('option');
      option.value = doc.name;
      option.textContent = `${doc.name} (${doc.specialty})`;
      doctorSelect.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    doctorSelect.innerHTML = `
      <option value="">-- Sélectionner un médecin --</option>
      <option value="Dr. Martin">Dr. Martin</option>
      <option value="Dr. Bernard">Dr. Bernard</option>
    `;
  }
}