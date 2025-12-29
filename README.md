# GrowUp - Application Mobile de Gestion Budgétaire

<p align="center">
  <img src="https://files.catbox.moe/owf7zi.png" alt="GrowUp Logo" width="220">
</p>

<h1 align="center">GrowUp</h1>

<p align="center">
  Application mobile de gestion budgétaire virtuelle<br>
  React Native + MongoDB
</p>



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
## NO FORK PLEASE NICE-DEV
