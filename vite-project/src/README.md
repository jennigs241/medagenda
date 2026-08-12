# MedAgenda — Gestion des rendez-vous d'un centre médical

MedAgenda est une application web Vanilla JavaScript conçue pour permettre aux secrétaires médicales d'enregistrer, de suivre et de gérer efficacement les rendez-vous des patients au sein d'un centre médical.

## 🚀 Fonctionnalités principales

- **Tableau de bord dynamique** : Calcul automatique du nombre total de RDV, de patients uniques, et répartition par statut (En attente, Confirmés, Terminés, Annulés).
- **Gestion des rendez-vous (CRUD)** : Création, modification, annulation et suppression.
- **Règle métier stricte** : Empêche la création de deux RDV pour le même médecin au même créneau (date et heure).
- **Filtres et Recherche en temps réel** : Recherche par patient, téléphone, médecin ou motif + filtre par statut et par date.
- **Persistance des données** : Sauvegarde intégrale dans le `localStorage`.

## ⭐️ Fonctionnalités Avancées (Bonus)

1. **Rendez-vous du jour** : Bouton rapide permettant de filtrer instantanément les consultations prévues à la date actuelle.
2. **API / Fetch & async/await** : Chargement dynamique de la liste des médecins depuis le fichier local `data/doctors.json` avec gestion d'erreur.
3. **Fonctionnalité personnelle** :
   - **Calcul dynamique des patients uniques** dans les statistiques du tableau de bord (évite de compter plusieurs fois la même personne).
   - **Protection XSS** : Échappement des entrées utilisateurs lors de l'affichage DOM.

## 📁 Installation et Lancement

1. Clonez ou téléchargez le projet dans un dossier local.
2. Ouvrez le projet avec un serveur local (ex. l'extension **Live Server** sur VS Code) afin de permettre la requête `fetch()` vers `data/doctors.json`.
3. Ouvrez `index.html` dans votre navigateur.

## 🧪 Scénario de Test

1. Cliquez sur **"+ Nouveau rendez-vous"**.
2. Créez un RDV pour le **Dr. Martin** le **10/08/2026 à 14:30**.
3. Tentez de créer un deuxième RDV pour le même docteur exactement à la même date et heure. *Un message d'erreur rouge apparaît.*
4. Fermez l'onglet du navigateur, puis rouvrez `index.html` : vos données restent conservées.