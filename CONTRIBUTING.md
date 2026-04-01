# 🤝 Guide de Contribution - GrowUp

Merci de vouloir contribuer à GrowUp ! Ce guide vous aidera à configurer votre environnement de développement.

## 📋 Prérequis

- **Node.js** v18+ ([Download](https://nodejs.org))
- **npm** v9+ (inclus avec Node.js)
- **MongoDB Atlas** compte gratuit ([Créer un compte](https://cloud.mongodb.com))
- **Expo CLI** (`npm install -g expo-cli`)
- **Expo Go** app sur votre téléphone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## 🚀 Installation Rapide

### 1. Cloner le projet

```bash
git clone https://github.com/NICE-DEV226/GrowUp.git
cd GrowUp
```

### 2. Configurer le Backend

```bash
cd backend
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

Éditez `backend/.env` avec vos valeurs :

```env
MONGODB_URI=mongodb+srv://VOTRE_USER:VOTRE_PASSWORD@cluster.mongodb.net/growup
JWT_SECRET=votre-secret-minimum-32-caracteres
```

**Démarrer le serveur :**
```bash
npm run dev
```
✅ Le serveur tourne sur `http://localhost:4000`

### 3. Configurer le Mobile

```bash
cd ../mobile
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

Éditez `mobile/.env` :

```env
# Selon votre environnement:
# - Émulateur Android: http://10.0.2.2:4000/api
# - Simulateur iOS: http://localhost:4000/api  
# - Appareil physique: http://VOTRE_IP_LOCALE:4000/api
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

**Trouver votre IP locale :**
- Windows: `ipconfig` → cherchez "IPv4 Address"
- Mac/Linux: `ifconfig` ou `ip addr`

**Démarrer l'app :**
```bash
npx expo start
```

Scannez le QR code avec Expo Go.

## 📁 Structure du Projet

```
GrowUp/
├── backend/                 # API Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/         # Configuration (DB, Passport)
│   │   ├── controllers/    # Logique métier
│   │   ├── middleware/     # Auth, Validation, Upload
│   │   ├── models/         # Schémas MongoDB
│   │   ├── routes/         # Endpoints API
│   │   ├── services/       # Services externes (Push, Storage)
│   │   └── server.js       # Point d'entrée
│   └── package.json
│
├── mobile/                  # App React Native + Expo
│   ├── app/                # Écrans (Expo Router)
│   │   ├── (auth)/         # Login, Signup
│   │   ├── (tabs)/         # Dashboard, Transactions, Goals...
│   │   └── (onboarding)/   # Slides d'intro
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── i18n/           # Traductions (FR, EN)
│   │   ├── services/       # API, Notifications, Offline
│   │   ├── store/          # Zustand stores
│   │   └── theme/          # Couleurs, Spacing
│   └── package.json
│
├── ADVANCED_FEATURES.md     # Roadmap avancée
├── REALISTIC_ROADMAP.md     # Roadmap réaliste
└── README.md
```

## 🔧 Scripts Disponibles

### Backend
```bash
npm run dev      # Développement avec hot-reload
npm start        # Production
```

### Mobile
```bash
npx expo start              # Démarrer Expo
npx expo start --android    # Émulateur Android
npx expo start --ios        # Simulateur iOS
npx expo start --web        # Version web
```

## 🗃️ Base de Données

### Collections MongoDB

| Collection | Description |
|------------|-------------|
| `users` | Profils utilisateurs |
| `accounts` | Comptes virtuels (solde) |
| `transactions` | Revenus et dépenses |
| `goals` | Objectifs d'épargne |
| `notifications` | Alertes utilisateur |
| `recurringtransactions` | Transactions automatiques |

### Créer un compte MongoDB Atlas (gratuit)

1. Allez sur [cloud.mongodb.com](https://cloud.mongodb.com)
2. Créez un cluster gratuit (M0)
3. Database Access → Ajoutez un utilisateur
4. Network Access → Ajoutez `0.0.0.0/0` (développement)
5. Copiez la connection string dans `.env`

## 🔐 Variables d'Environnement

### Backend (`backend/.env`)

| Variable | Requis | Description |
|----------|--------|-------------|
| `PORT` | ✅ | Port du serveur (default: 4000) |
| `MONGODB_URI` | ✅ | Connection string MongoDB |
| `JWT_SECRET` | ✅ | Clé secrète JWT (min 32 chars) |
| `FRONTEND_URL` | ✅ | URL frontend pour CORS |
| `CLOUDINARY_*` | ❌ | Pour les photos de profil |
| `GOOGLE_*` | ❌ | Pour Google OAuth |
| `GROQ_API_KEY` | ❌ | Pour les fonctionnalités IA |

### Mobile (`mobile/.env`)

| Variable | Requis | Description |
|----------|--------|-------------|
| `EXPO_PUBLIC_API_URL` | ✅ | URL de l'API backend |

## 🎨 Conventions de Code

### Style
- **TypeScript** pour le mobile
- **JavaScript** pour le backend
- Indentation: 2 espaces
- Quotes: simples `'`

### Commits
Format: `type: description`

```
feat: add recurring transactions
fix: correct balance calculation
docs: update API documentation
style: format code
refactor: improve error handling
```

### Branches
- `main` - Production stable
- `develop` - Développement
- `feature/xxx` - Nouvelles fonctionnalités
- `fix/xxx` - Corrections de bugs

## 🐛 Debugging

### Erreurs courantes

**"Network Error" sur mobile**
- Vérifiez que le backend tourne (`http://localhost:4000/api/health`)
- Utilisez la bonne IP dans `EXPO_PUBLIC_API_URL`
- Appareil physique doit être sur le même réseau WiFi

**"Too Many Requests" (429)**
- Le rate limit est de 500 req/15min
- Attendez quelques secondes

**"Unauthorized" (401)**
- Token expiré, reconnectez-vous

### Logs utiles
- Backend: Console du terminal
- Mobile: Console Expo (shake device → "Show Developer Menu" → "Debug Remote JS")

## 📚 Documentation Technique

- **API Endpoints**: Voir `backend/src/routes/`
- **Modèles DB**: Voir `backend/src/models/`
- **Composants UI**: Voir `mobile/src/components/`
- **Roadmap**: Voir `REALISTIC_ROADMAP.md`

## ✅ Checklist avant Push

- [ ] Code testé localement
- [ ] Pas de `console.log` inutiles
- [ ] Pas de clés API/secrets dans le code
- [ ] `.env` pas committé
- [ ] README/CONTRIBUTING à jour si nécessaire

## 🆘 Besoin d'aide ?

Créez une issue sur GitHub avec :
1. Description du problème
2. Étapes pour reproduire
3. Environnement (OS, Node version, etc.)
4. Logs d'erreur

---

**Happy coding!** 🚀
