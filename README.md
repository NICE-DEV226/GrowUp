# GrowUp - Application Mobile de Gestion Budgétaire

Application mobile de gestion budgétaire virtuelle avec React Native + MongoDB.

## Stack Technique

- **Mobile** : React Native (Expo SDK 54) + TypeScript
- **Backend** : Node.js + Express + MongoDB
- **Auth** : Passport.js (JWT + Google OAuth)
- **UI** : React Native Paper + Gradients

## Installation

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure MONGODB_URI et Google OAuth
npm run dev
```

### 2. Mobile
```bash
cd mobile
npm install
npx expo start
```

## Configuration Google OAuth

### Backend (Google Cloud Console)
1. Va sur https://console.cloud.google.com
2. Crée un projet
3. Active Google+ API
4. Credentials → Create OAuth 2.0 Client ID
5. Type: Web application
6. Authorized redirect URIs: `http://localhost:4000/api/auth/google/callback`
7. Copie Client ID et Client Secret dans `backend/.env`

### Mobile
Le mobile ouvre un WebView vers le backend pour l'auth Google.

## Structure MongoDB

```javascript
User {
  email, password, googleId, name, username,
  currency, language, country, profilePhoto
}

Account {
  userId, name, balance, currency
}

Transaction {
  userId, accountId, type, amount, category, date, note, tags
}

Goal {
  userId, title, targetAmount, currentAmount, deadline, isAchieved
}
```

## Fonctionnalités

- ✅ Inscription/Connexion Email
- ✅ Connexion Google OAuth
- ✅ Configuration profil (username, devise, langue)
- ✅ Gestion comptes virtuels
- ✅ Transactions
- ✅ Objectifs
- ✅ Dashboard
- ✅ Profil

## API Endpoints

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/google
GET  /api/auth/google/callback
POST /api/auth/complete-profile
```
