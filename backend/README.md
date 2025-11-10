# 🚀 GrowUp Backend API

Backend Node.js + Express + MongoDB pour l'application GrowUp.

## 📋 Prérequis

- Node.js 18+ 
- MongoDB (local ou Atlas)
- npm ou yarn

## 🔧 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables dans .env
```

## ⚙️ Configuration

### Variables d'environnement requises

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/growup
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:8081
```

### Variables optionnelles

```env
# Cloudinary (pour upload de photos)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🚀 Démarrage

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:4000`

## 📡 Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Transactions
- `GET /api/transactions` - Liste des transactions
- `POST /api/transactions` - Créer une transaction
- `GET /api/transactions/:id` - Détails d'une transaction
- `PUT /api/transactions/:id` - Modifier une transaction
- `DELETE /api/transactions/:id` - Supprimer une transaction

### Objectifs (Goals)
- `GET /api/goals` - Liste des objectifs
- `POST /api/goals` - Créer un objectif
- `GET /api/goals/:id` - Détails d'un objectif
- `PUT /api/goals/:id` - Modifier un objectif
- `POST /api/goals/:id/allocate` - Allouer de l'argent
- `DELETE /api/goals/:id` - Supprimer un objectif

### Comptes (Accounts)
- `GET /api/accounts` - Liste des comptes
- `POST /api/accounts` - Créer un compte
- `GET /api/accounts/:id` - Détails d'un compte
- `PUT /api/accounts/:id` - Modifier un compte
- `DELETE /api/accounts/:id` - Supprimer un compte
- `POST /api/accounts/transfer` - Transférer entre comptes

### Statistiques
- `GET /api/stats/summary` - Statistiques globales
- `GET /api/stats/monthly` - Statistiques mensuelles
- `GET /api/stats/trends` - Tendances (3m/6m/1y)
- `GET /api/stats/dashboard` - Stats pour dashboard
- `GET /api/stats/period` - Stats par période (semaine/mois/année)
- `GET /api/stats/categories` - Dépenses par catégorie
- `GET /api/stats/weekly` - Tendance hebdomadaire
- `GET /api/stats/insights` - Insights intelligents

### Notifications
- `GET /api/notifications` - Liste des notifications
- `GET /api/notifications/unread-count` - Compteur non lues
- `PUT /api/notifications/:id/read` - Marquer comme lu
- `PUT /api/notifications/read-all` - Tout marquer comme lu
- `DELETE /api/notifications/:id` - Supprimer une notification
- `DELETE /api/notifications/all` - Tout supprimer
- `POST /api/notifications/register-token` - Enregistrer token FCM

### Profil Utilisateur
- `GET /api/users/me` - Profil complet
- `PUT /api/users/me` - Mettre à jour le profil
- `POST /api/users/me/photo` - Upload photo de profil
- `DELETE /api/users/me/photo` - Supprimer photo
- `PUT /api/users/me/password` - Changer mot de passe
- `GET /api/users/me/preferences` - Préférences
- `PUT /api/users/me/preferences` - Mettre à jour préférences

## 🔒 Authentification

Toutes les routes (sauf `/api/auth/*`) nécessitent un token JWT dans le header :

```
Authorization: Bearer <token>
```

## ✅ Fonctionnalités

### Implémenté
- ✅ Authentification JWT
- ✅ CRUD Transactions avec mise à jour automatique des soldes
- ✅ CRUD Goals avec allocation d'argent
- ✅ CRUD Accounts avec transferts
- ✅ Statistiques complètes (base + avancées)
- ✅ Notifications CRUD + push notifications (Expo)
- ✅ Profil utilisateur + upload photos (Cloudinary)
- ✅ Validation Zod sur tous les endpoints
- ✅ Transactions MongoDB pour atomicité
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ CORS configuré

### À implémenter (optionnel)
- ⏳ Synchronisation offline
- ⏳ Tests automatisés
- ⏳ Documentation Swagger
- ⏳ Cache Redis
- ⏳ Logs structurés

## 🧪 Tests

```bash
# Tester le health check
curl http://localhost:4000/api/health

# Tester l'inscription
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User",
    "country": "FR",
    "currency": "EUR",
    "language": "Français"
  }'

# Tester la connexion
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

## 📊 Structure du Projet

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Connexion MongoDB
│   │   └── passport.js       # Configuration JWT
│   ├── controllers/
│   │   ├── accountController.js
│   │   ├── goalController.js
│   │   ├── notificationController.js
│   │   ├── statsController.js
│   │   ├── statsAdvancedController.js
│   │   ├── transactionController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js           # Middleware JWT
│   │   ├── upload.js         # Configuration multer
│   │   └── validation.js     # Validation Zod
│   ├── models/
│   │   ├── Account.js
│   │   ├── Goal.js
│   │   ├── Notification.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes/
│   │   ├── accounts.js
│   │   ├── auth.js
│   │   ├── goals.js
│   │   ├── notifications.js
│   │   ├── stats.js
│   │   ├── transactions.js
│   │   └── users.js
│   ├── services/
│   │   ├── pushNotifications.js  # Expo Push
│   │   └── storage.js            # Cloudinary
│   └── server.js
├── .env
├── .env.example
├── package.json
└── README.md
```

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- JWT pour authentification
- Helmet pour headers sécurisés
- Rate limiting (100 req/15min)
- CORS configuré
- Validation Zod sur tous les inputs
- Transactions MongoDB pour atomicité

## 📝 Notes

### Upload de photos
- Nécessite configuration Cloudinary
- Redimensionnement automatique à 500x500px
- Formats acceptés : JPG, PNG, WEBP
- Taille max : 5MB

### Push Notifications
- Utilise Expo Push Notifications Service
- Pas besoin de Firebase
- Fonctionne iOS + Android
- Badge automatique avec compteur non lues

### Devises supportées
EUR, USD, GBP, CHF, XOF, XAF, MAD, TND, ZAR, NGN, GHS, KES

### Langues supportées
Français, English, Español

## 🐛 Debugging

```bash
# Vérifier la connexion MongoDB
node -e "require('./src/config/database')()"

# Tester un endpoint avec curl
curl -v http://localhost:4000/api/health

# Voir les logs en temps réel
npm run dev
```

## 📞 Support

Pour toute question ou problème, consulter :
- BACKEND_INTEGRATION.md - Spécifications complètes
- BACKEND_STATUS.md - État d'avancement
- BACKEND_COMPARISON.md - Comparaison spec vs implémentation

## 📄 Licence

MIT
