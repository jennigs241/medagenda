# MedAgenda — Gestion des rendez-vous d’un centre médical

MedAgenda est une application web conçue en JavaScript Vanilla permettant la gestion centralisée des rendez-vous médicaux au sein d'un centre de santé.

## 🚀 Fonctionnalités
- **Tableau de bord dynamique** : Calcul automatique des statistiques (Total RDV, Patients uniques, En attente, Terminés, Annulés).
- **Gestion des RDV (CRUD)** : Création, modification, annulation et suppression de rendez-vous.
- **Règles métier** : Empêche la prise de rendez-vous en double pour un même médecin à la même date et heure.
- **Recherche & Filtres** : Recherche textuelle instantanée, filtrage par statut et filtrage par date.
- **Bonus** :
  - Filtre rapide **RDV du jour**.
  - Chargement dynamique de la liste des médecins via **API/fetch** (`async/await`).
  - **Exportation des données au format CSV** pour archivage externe.
- **Persistance des données** : Utilisation exclusive du `localStorage`.

## 🛠️ Installation & Utilisation
1. Clonez ce dépôt sur votre machine locale.
2. Pour des raisons de sécurité liées à la politique CORS lors de l'utilisation de `fetch()` sur des fichiers local JSON, lancez le projet via un serveur local (ex: extension **Live Server** sur VS Code).
3. Ouvrez `index.html` dans le navigateur.