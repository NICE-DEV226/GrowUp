<div align="center">
  <img src="./mobile/assets/icon.png" alt="GrowUp Logo" width="120" height="120">
  
  # 💰 GrowUp
  
  ### Application de Gestion Budgétaire Intelligente
  
  *Gérez votre budget, atteignez vos objectifs financiers*
  
  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/votre-username/growup)
  [![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB.svg?logo=react)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-54.0.0-000020.svg?logo=expo)](https://expo.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg?logo=node.js)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  
  [Démo](#-utilisation) • [Installation](#-installation) • [Documentation](#-api-documentation) • [Contribuer](#-contribution)
  
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%">
</div>

## s matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [API Documentation](#-api-documentation)
- [Structure du Projet](#-structure-du-projet)
- [Tests](#-tests)
- [Déploiement](#-déploiement)

<br>

## ✨ Fonctionnalités

<div align="center">
  <table>
    <tr>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/lock.png" width="60"><br>
        <b>Authentification</b><br>
        <sub>Sécurisée & Biométrique</sub>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/money-bag.png" width="60"><br>
        <b>Comptes Multiples</b><br>
        <sub>Gestion Flexible</sub>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/goal.png" width="60"><br>
        <b>Objectifs</b><br>
        <sub>Suivi en Temps Réel</sub>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/bar-chart.png" width="60"><br>
        <b>Statistiques</b><br>
        <sub>Analyses Détaillées</sub>
      </td>
    </tr>
  </table>
</div>

### Authentification & Profil
- ✅ Inscription/Connexion par email + mot de passe
- ✅ Connexion Google OAuth 2.0
- ✅ Gestion du profil utilisateur (photo, nom, pays, devise, langue)
- ✅ Authentification biométrique (Touch ID / Face ID)
- ✅ Sécurité renforcée avec JWT

### Gestion Financière
- ✅ Comptes virtuels multiples
- ✅ Transactions (revenus/dépenses) avec catégories
- ✅ Filtres et recherche avancée
- ✅ Tags personnalisés
- ✅ Transferts entre comptes

### Objectifs & Épargne
- ✅ Création d'objectifs financiers
- ✅ Suivi de progression en temps réel
- ✅ Allocation d'argent aux objectifs
- ✅ Notifications d'atteinte d'objectifs

### Dashboard & Statistiques
- ✅ Vue d'ensemble du solde total
- ✅ Graphiques de dépenses par catégorie
- ✅ Statistiques mensuelles et tendances
- ✅ Historique des transactions

### Expérience Utilisateur
- ✅ Interface moderne et fluide
- ✅ Animations et transitions
- ✅ Mode sombre/clair
- ✅ Support multilingue (Français, English, Español)
- ✅ Support multi-devises (EUR, USD, XAF, etc.)
- ✅ Notifications push

<br>

## 🛠 Stack Technique

<div align="center">
  
  ### Frontend Mobile
  
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native">
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=react&logoColor=white" alt="Zustand">
  
  ### Backend API
  
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT">
  
  ### Services & Tools
  
  <img src="https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google OAuth">
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary">
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios">
  
</div>

### Frontend Mobile
- **Framework** : React Native 0.81.5
- **Runtime** : Expo SDK 54
- **Language** : TypeScript
- **Navigation** : Expo Router 6.0
- **UI Library** : React Native Paper 5.11
- **State Management** : Zustand 4.4
- **HTTP Client** : Axios 1.6
- **Internationalisation** : i18next 25.6
- **Storage** : AsyncStorage 2.2
- **Animations** : Expo Linear Gradient

### Backend API
- **Runtime** : Node.js
- **Framework** : Express 4.21
- **Database** : MongoDB 8.19 (Mongoose ODM)
- **Authentication** : Passport.js (JWT + Google OAuth)
- **Security** : Helmet, CORS, bcryptjs, Rate Limiting
- **Validation** : Zod 3.25
- **File Upload** : Multer, Cloudinary, Sharp
- **Dev Tools** : Nodemon

### Services Externes
- **Database** : MongoDB Atlas
- **Storage** : Cloudinary
- **Auth** : Google OAuth 2.0
- **Notifications** : Expo Notifications

<br>

## 🏗 Architecture

<div align="center">
  <img src="https://img.icons8.com/fluency/96/000000/smartphone-tablet.png" width="80">
  <br>
  <b>Mobile App</b><br>
  <sub>React Native + Expo</sub>
  <br><br>
  ⬇️ REST API ⬇️
  <br><br>
  <img src="https://img.icons8.com/fluency/96/000000/server.png" width="80">
  <br>
  <b>Backend API</b><br>
  <sub>Node.js + Express</sub>
  <br><br>
  ⬇️ Mongoose ODM ⬇️
  <br><br>
  <img src="https://img.icons8.com/fluency/96/000000/database.png" width="80">
  <br>
  <b>Database</b><br>
  <sub>MongoDB Atlas</sub>
</div>

<br>

### Structure des dossiers

```
GrowUp/
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuration (DB, Passport, Firebase)
│   │   ├── controllers/    # Logique métier
│   │   ├── middleware/     # Auth, validation, upload
│   │   ├── models/         # Modèles Mongoose
│   │   ├── routes/         # Routes API
│   │   ├── services/       # Services externes
│   │   └── server.js       # Point d'entrée
│   ├── .env                # Variables d'environnement
│   └── package.json
│
└── mobile/                  # Application React Native
    ├── app/                # Écrans (Expo Router)
    │   ├── (auth)/        # Authentification
    │   ├── (onboarding)/  # Onboarding
    │   ├── (tabs)/        # Navigation principale
    │   └── (settings)/    # Paramètres
    ├── src/
    │   ├── components/    # Composants réutilisables
    │   ├── services/      # API, notifications
    │   ├── i18n/          # Traductions
    │   └── utils/         # Utilitaires
    ├── assets/            # Images, fonts
    ├── .env               # Variables d'environnement
    └── package.json
```

<br>

## 🚀 Installation

<div align="center">
  <img src="https://img.icons8.com/fluency/96/000000/rocket.png" width="80">
</div>

### Prérequis

<table>
  <tr>
    <td><img src="https://img.icons8.com/fluency/48/000000/node-js.png" width="30"></td>
    <td><b>Node.js 18+</b> et npm/yarn</td>
  </tr>
  <tr>
    <td><img src="https://img.icons8.com/fluency/48/000000/mongodb.png" width="30"></td>
    <td><b>MongoDB Atlas</b> account (ou MongoDB local)</td>
  </tr>
  <tr>
    <td><img src="https://img.icons8.com/fluency/48/000000/expo.png" width="30"></td>
    <td><b>Expo CLI</b> : <code>npm install -g expo-cli</code></td>
  </tr>
  <tr>
    <td><img src="https://img.icons8.com/fluency/48/000000/smartphone-tablet.png" width="30"></td>
    <td>Un smartphone avec <b>Expo Go</b> (iOS/Android) ou un émulateur</td>
  </tr>
</table>

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/growup.git
cd growup
```

### 2. Installation Backend

```bash
cd backend
npm install
```

Créer le fichier `.env` :

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/growup?retryWrites=true&w=majority
JWT_SECRET=votre-secret-jwt-super-securise-changez-en-production
FRONTEND_URL=http://localhost:8081
BACKEND_URL=http://localhost:4000

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret

# Cloudinary (optionnel - pour upload photos)
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
```

Démarrer le serveur :

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:4000`

### 3. Installation Mobile

```bash
cd mobile
npm install
```

Créer le fichier `.env` :

```env
# Remplacez par de votre machine (pour tester sur smartphone)
# Trouvez votre IP : ipconfig (Windows) ou ifconfig (Mac/Linux)
EXPO_PUBLIC_API_URL=http://192.168.X.X:4000/api
```

Démarrer l'application :

```bash
npm start
# ou
npx expo start
```

Scanner le QR code avec Expo Go (Android) ou Camera (iOS)

## ⚙️ Configuration

### MongoDB Atlas

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
un cluster gratuit
3. Créer un utilisateur de base de données
4. Whitelist votre IP (ou 0.0.0.0/0 pour dev)
5. Copier la connection string dans `backend/.env`

### Google OAuth (Optionnel)

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un nouveau projet
3. Activer Google+ API
4. Credentials → Create OAuth 2.0 Client ID
5. Type: Web application
6. Authorized redirect URIs: `http://localhost:4000/api/auth/google/callback`
7. Copier Client ID et Secret dans `backend/.env`

### Cloudinary (Optionnel)

1. Créer un compte sur [Cloudinary](https://cloudinary.com)
2. Copier Cloud Name, API Key et Secret dans `backend/.env`

<br>

## 📱 Utilisation

<div align="center">
  <img src="https://img.icons8.com/fluency/96/000000/iphone-14-pro.png" width="80">
</div>

### Première utilisation

1. Lancer le backend : `cd backend && npm run dev`
2. Lancer le mobile : `cd mobile && npm start`
3. Scanner le QR code avec Expo Go
4. Créer un compte ou se connecter
5. Compléter le profil (pays, devise, langue)
6. Commencer à gérer votre budget !

### Fonctionnalités principales

**Dashboard**
- Vue d'ensemble de vos- Solde total de tous vos comptes
- Graphiques de dépenses
- Objectifs en cours

**Transactions**
- Ajouter une transaction (revenu/dépense)
- Catégoriser et taguer
- Filtrer par date, type, catégorie
- Rechercher dans l'historique

**Objectifs**
- Créer un objectif d'épargne
- Allouer de l'argent depuis vos comptes
- Suivre la progression
- Recevoir des notifications

**Profil & Paramètres**
- Modifier vos informations personnelles
- Changer la devise et la langue
- Activer/désactiver les notifications
- Changer le thème (clair/sombre)
- Sécurité (biométrie, mot de passe)

<br>

## 📚 API Documentation

<div align="center">
  <img src="https://img.icons8.com/fluency/96/000000/api.png" width="80">
</div>

### Base URL

```
http://localhost:4000/api
```

### Endpoints

#### Authentification

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "country": "France",
  "currency": "EUR",
  "language": "Français"
}

Response: { token, user }
```

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { token, user }
```

```http
GET /auth/me
Authorization: Bearer {token}

Response: { user }
```

#### Comptes

```http
GET /accounts
Authorization: Bearer {token}

Response: { accounts: [...] }
```

```http
POST /accounts
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Compte Épargne",
  "balance": 1000,
  "currency": "EUR"
}

Response: { account }
```

#### Transactions

```http
GET /transactions?from=2025-01-01&to=2025-12-31&type=expense&category=Nourriture
Authorization: Bearer {token}

Response: { transactions: [...], total, nextCursor }
```

```http
POST /transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "expense",
  "amount": 45.50,
  "category": "Nourriture",
  "date": "2025-11-10T12:00:00Z",
  "note": "Déjeuner restaurant",
  "accountId": "account-id",
  "tags": ["restaurant", "midi"]
}

Response: { transaction, account }
```

#### Objectifs

```http
GET /goals
Authorization: Bearer {token}

Response: { goals: [...] }
```

```http
POST /goals
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Vacances 2025",
  "targetAmount": 2000,
  "deadline": "2025-07-01T00:00:00Z",
  "icon": "airplane",
  "color": "#733fea"
}

Response: { goal }
```

```http
POST /goals/:id/allocate
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100,
  "accountId": "account-id"
}

Response: { goal, account }
```

#### Statistiques

```http
GET /stats/monthly?year=2025&month=11
Authorization: Bearer {token}

Response: { income, expenses, byCategory, balance }
```

### Codes de statut

- `200` - Succès
- `201` - Créé
- `400` - Requête invalide
- `401` - Non authentifié
- `404` - Non trouvé
- `500` - Erreur serveur

## 📂 Structure du Projet

### Backend

```
backend/src/
├── config/
│   ├── database.js          # Connexion MongoDB
│   ├── passport.js          # Stratégies d'authentification
│   └── firebase.js          # Configuration Firebase (optionnel)
├── controllers/
│   ├── authController.js    # Authentification
│   ├── accountController.js # Gestion des comptes
│   ├── transactionController.js
│   ├── goalController.js
│   ├── statsController.js
│   ├── userController.js
│   └── notificationController.js
├── middleware/
│   ├── auth.js              # Vérification JWT
│   ├── validation.js        # Validation Zod
│   └── upload.js            # Upload fichiers
├── models/
│   ├── User.js              # Schéma utilisateur
│   ├── Account.js           # Schéma compte
│   ├── Transaction.js       # Schéma transaction
│   ├── Goal.js              # Schéma objectif
│   └── Notification.js      # Schéma notification
├── routes/
│   ├── auth.js              # Routes authentification
│   ├── accounts.js
│   ├── transactions.js
│   ├── goals.js
│   ├── stats.js
│   ├── users.js
│   └── notifications.js
├── services/
│   ├── cloudinaryService.js # Upload images
│   ├── emailService.js      # Envoi emails
│   └── notificationService.js
└── server.js                # Point d'entrée
```

### Mobile

```
mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx        # Écran connexion
│   │   ├── signup.tsx       # Écran inscription
│   │   └── complete-profile.tsx
│   ├── (onboarding)/
│   │   ├── welcome.tsx
│   │   ├── slide1.tsx
│   │   ├── slide2.tsx
│   │   └── slide3.tsx
│   ├── (tabs)/
│   │   ├── dashboard.tsx    # Tableau de bord
│   │   ├── transactions.tsx # Liste transactions
│   │   ├── goals.tsx        # Objectifs
│   │   ├── stats.tsx        # Statistiques
│   │   └── profile.tsx      # Profil
│   ├── (settings)/
│   │   ├── personal-info.tsx
│   │   ├── security.tsx
│   │   └── notifications.tsx
│   ├── _layout.tsx          # Layout racine
│   ├── index.tsx            # Point d'entrée
│   └── splash.tsx           # Écran de chargement
├── src/
│   ├── components/
│   │   └── CustomTabBar.tsx
│   ├── services/
│   │   ├── api.ts           # Client API Axios
│   │   └── notifications.ts
│   ├── i18n/
│   │   ├── i18n.ts          # Configuration i18next
│   │   └── locales/         # Traductions FR/EN/ES
│   └── utils/
│       └── currency.ts      # Formatage devises
└── assets/                  # Images, icônes, fonts
```

<br>

## 🧪 Tests

<div align="center">
  <img src="https://img.icons8.com/fluency/96/000000/test-tube.png" width="80">
</div>

### Backend

```bash
cd backend
npm test
```

### Mobile

```bash
cd mobile
npm test
```

<br>

## 🚢 Déploiement

<div align="center">
  <img src="https://img.icons8.com/fluency/96/000000/rocket-take-off.png" width="80">
</div>

### Backend

<table>
  <tr>
    <td width="33%" align="center">
      <img src="https://img.icons8.com/fluency/96/000000/railway.png" width="60"><br>
      <b>Railway</b><br>
      <sub>Recommandé</sub>
    </td>
    <td width="33%" align="center">
      <img src="https://img.icons8.com/fluency/96/000000/server.png" width="60"><br>
      <b>Render</b><br>
      <sub>Gratuit</sub>
    </td>
    <td width="33%" align="center">
      <img src="https://img.icons8.com/fluency/96/000000/heroku.png" width="60"><br>
      <b>Heroku</b><br>
      <sub>Classique</sub>
    </td>
  </tr>
</table>

**Option 1: Railway**

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Déployer
railway up
```

**Option 2: Render**

1. Créer un compte sur [Render](https://render.com)
2. New → Web Service
3. Connecter le repo GitHub
4. Build Command: `cd backend && npm install`
5. Start Command: `cd backend && npm start`
6. Ajouter les variables d'environnement

**Option 3: Heroku**

```bash
heroku create growup-api
heroku config:set MONGODB_URI=...
heroku config:set JWT_SECRET=...
git push heroku main
```

### Mobile

<div align="center">
  <img src="https://img.icons8.com/fluency/96/000000/android-os.png" width="60">
  <img src="https://img.icons8.com/fluency/96/000000/apple-app-store.png" width="60">
</div>

**Build avec EAS**

```bash
# Installer EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurer
eas build:configure

# Build Android
eas build --platform android

# Build iOS
eas build --platform ios

# Submit aux stores
eas submit --platform android
eas submit --platform ios
```

<br>

## 🤝 Contribution

<div align="center">
  <img src="https://img.icons8.com/fluency/96/000000/collaboration.png" width="80">
  <br><br>
  Les contributions sont les bienvenues ! 🎉
</div>

1. 🍴 Fork le projet
2. 🌿 Créer une branche (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. 📤 Push vers la branche (`git push origin feature/AmazingFeature`)
5. 🔃 Ouvrir une Pull Request

<br>

## 📄 Licence

<div align="center">
  <img src="https://img.icons8.com/fluency/96/000000/certificate.png" width="60">
  <br>
  Ce projet est sous licence <b>MIT</b>.
</div>

<br>

## 👥 Auteurs

<div align="center">
  <img src="https://img.icons8.com/fluency/96/000000/user-male-circle.png" width="60">
  <br>
  <b>Votre Nom</b> - <i>Développeur Principal</i>
  <br><br>
  <a href="https://github.com/votre-username">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white">
  </a>
  <a href="https://linkedin.com/in/votre-profile">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white">
  </a>
  <a href="mailto:votre@email.com">
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white">
  </a>
</div>

<br>

## 🙏 Remerciements

<div align="center">
  <img src="https://img.icons8.com/fluency/96/000000/thank-you.png" width="60">
  <br><br>
  
  Merci à toutes les équipes et projets open-source :
  
  - 🎨 [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) team
  - 🗄️ [MongoDB](https://www.mongodb.com/) team
  - 🔧 Toutes les librairies open-source utilisées
  - 🎨 [Icons8](https://icons8.com/) pour les icônes
</div>

<br>

## 📞 Support

<div align="center">
  <img src="https://img.icons8.com/fluency/96/000000/help.png" width="60">
  <br><br>
  
  Pour toute question ou problème :
  
  <a href="https://github.com/votre-username/growup/issues">
    <img src="https://img.shields.io/badge/GitHub-Issues-red?style=for-the-badge&logo=github">
  </a>
  <a href="mailto:support@growup.com">
    <img src="https://img.shields.io/badge/Email-Support-blue?style=for-the-badge&logo=gmail">
  </a>
</div>

<br>

---

<div align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%">
  <br>
  <img src="./mobile/assets/icon.png" alt="GrowUp Logo" width="60" height="60">
  <br>
  <b>Made with ❤️ by NICE-DEV GrowUp Team</b>
  <br><br>
  <sub>© 2025 GrowUp. All rights reserved.</sub>
  <br><br>
  <a href="#-growup">⬆️ Retour en haut</a>
</div>
