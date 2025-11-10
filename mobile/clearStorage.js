// Script pour vider AsyncStorage
// Exécuter avec: node clearStorage.js

console.log(`
⚠️  Pour vider le cache AsyncStorage de l'application :

OPTION 1 - Dans l'app Expo Go :
1. Secoue ton téléphone pour ouvrir le menu développeur
2. Choisis "Clear AsyncStorage" ou "Delete app data"
3. Recharge l'app (appuie sur "r" dans le terminal Expo)

OPTION 2 - Supprimer et réinstaller l'app :
1. Supprime l'app de ton téléphone
2. Rescanne le QR code

OPTION 3 - Ajouter un bouton de déconnexion :
Je peux ajouter un bouton "Se déconnecter" dans le profil qui vide tout.

Les données en cache sont :
- token (JWT)
- user (informations utilisateur)
- transactions (données locales)
- goals (objectifs)
- pendingSync (données offline)
`);
