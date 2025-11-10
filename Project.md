MVP GrowUp : GrowUp est une application mobile (React Native + TypeScript) de gestion budgétaire virtuelle, avec authentification, ajout de transactions, gestion d’objectifs, dashboard animé, profil/paramètres. Backend en Node.js/TypeScript (Express) + PostgreSQL (Prisma) — option serverless possible via Firebase Functions. Auth + stockage / notifications via Firebase (Auth, Storage, FCM). Design animé, fluide, professionnel.

Table des contenus rapides

Fonctionnalités MVP (brief)

Architecture technique globale

Spécification Frontend (pages, composants, interactions)

Spécification Backend (endpoints, logique métier, sécurité)

Schéma base de données (Prisma)

Intégration Firebase (Auth, Storage, FCM, rules)

Déploiement & CI/CD

Tests & qualité

Checklist « démarrage / starter (cursor) » — commandes et structure de projet

Roadmap et tâches par sprint

1) Fonctionnalités MVP (liste complète)

Inscription / connexion (email/password + Google Sign-In)

Onboarding (choix langue, pays, devise)

Dashboard : solde total + graphique dépenses par catégorie + objectifs

CRUD Transactions : ajouter / modifier / supprimer (type: income|expense, catégorie, tag, date, note)

Comptes virtuels : au moins 1 compte par défaut (possibilité d’ajouter comptes)

Objectifs (goals) : créer, allouer, suivre progression, marquer comme atteint

Profil / Paramètres : photo, nom, pays, devise, langue, thème (clair/sombre)

Notifications locales/push : rappels et alertes (budget dépassé, objectif proche)

Sauvegarde cloud & sync multi-appareil

UI professionnelle + animations (Reanimated, Moti, Lottie)

2) Architecture technique globale (recommended)

Frontend : React Native (Expo) + TypeScript

UI : NativeWind (Tailwind RN) + React Native Paper

Animations : Reanimated v3, Moti, Lottie

State : Zustand

Navigation : React Navigation

Backend : Node.js + Express (TypeScript) OR Firebase Functions (serverless)

DB (main) : PostgreSQL (hosté sur Supabase / Railway) + Prisma ORM

Auth : Firebase Auth (gestion sécurité/simple integration mobile)

Storage : Firebase Storage (profile pics)

Notifications : Firebase Cloud Messaging (push)

DevOps : GitHub Actions, déploiement backend sur Railway / Render / Heroku, frontend Expo Publish / EAS build, assets sur Cloud Storage.

Remarque : Firebase peut remplacer partiellement le backend (Firestore et Cloud Functions). Ici je donne la version Node.js + PostgreSQL par flexibilité (transactions, logique métier).

3) Spécification Frontend — écrans & composants
Écrans (MVP)

Splash animé (Lottie)

Onboarding (3 slides)

Auth : Login / Signup / Forgot password (Google Sign-In)

Dashboard (Home)

Solde total (card)

Graphique dépenses (dernier mois)

Objectifs list + progress bars

CTA : + Ajouter transaction

AddTransaction (modal/screen)

champs : amount, type (income/expense), category, date, note, account, tag

TransactionsList (filtrable / recherche)

Goals (list + create)

Profile (photo, name, currency, country, language)

Settings (notifications, theme, logout)

Composants réutilisables

AnimatedButton, Card, TransactionItem, GoalCard, Chart (wrap Recharts/Victory), ProfileAvatar, Input, DatePickerModal, CategorySelector, LottieWrapper.

Flows UX importants

Ajout rapide : FloatingActionButton sur Dashboard → BottomSheet modal pour saisie rapide.

Confirmation animée à la sauvegarde (Lottie confetti).

Transitions cohérentes (Stack + shared element transitions pour entrée/sortie des cartes).

4) Spécification Backend — endpoints & logique métier
Auth

Auth user via Firebase Auth (email+password, Google). Backend valide token Firebase JWT pour sécuriser endpoints.

Endpoints REST (Express)

Base URL: /api/v1

Auth / User

POST /api/v1/auth/refresh — refresh token (si gestion tokens côté serveur)

GET /api/v1/users/me — récupère profil de l’utilisateur (auth required)

PUT /api/v1/users/me — update profil (name, currency, country, language, photoUrl)

Transactions

GET /api/v1/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD&account=&category=&limit=&cursor= — liste paginée

POST /api/v1/transactions — crée transaction { type, amount, category, date, note, accountId, tags[] }

GET /api/v1/transactions/:id — détail

PUT /api/v1/transactions/:id — modif

DELETE /api/v1/transactions/:id — suppr

Accounts

GET /api/v1/accounts — comptes virtuels

POST /api/v1/accounts — créer compte

PUT /api/v1/accounts/:id

DELETE /api/v1/accounts/:id

Goals

GET /api/v1/goals

POST /api/v1/goals

PUT /api/v1/goals/:id — update progress, title, target, deadline

DELETE /api/v1/goals/:id

Stats

GET /api/v1/stats/monthly?year=2025&month=11 — revenus/dépenses par catégorie, solde

GET /api/v1/stats/trends?range=6m — tendances sur X mois

Notifications

POST /api/v1/notifications/register — enregistrement du token FCM

POST /api/v1/notifications/test — envoyer notification test

Sécurité & validation

Tous endpoints auth-required valident le JWT Firebase envoyé en Authorization: Bearer <token> via middleware verifyFirebaseToken.

Input validation : Zod ou Joi pour tous payloads.

Rate limit (express-rate-limit) + Helmet.

CORS config : front origin only.

Logique métier clefs

Lors d’une transaction expense → on décrémente le account.balance; income → incrémente. Chaque change écrit dans transaction log et bilan historique pour calculs de stats.

Objectif : progress = sum des montants alloués. On autorise affectation manuelle (user move money to goal) — simulation: déduit du compte virtuel.

Recurrent transactions : stocker en recurrence et exécuter via cron job / Cloud Function.

5) Schéma Base de données (Prisma) — source of truth

Fichier schema.prisma (extrait):

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String        @id @default(uuid())
  firebaseUid    String        @unique
  email          String        @unique
  name           String?
  country        String?
  language       String?
  currency       String?
  profilePhoto   String?
  accounts       Account[]
  transactions   Transaction[]
  goals          Goal[]
  fcmTokens      FcmToken[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model Account {
  id        String        @id @default(uuid())
  user      User          @relation(fields: [userId], references: [id])
  userId    String
  name      String
  balance   Float         @default(0)
  currency  String
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  transactions Transaction[]
}

model Transaction {
  id          String   @id @default(uuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  account     Account? @relation(fields: [accountId], references: [id])
  accountId   String?
  type        String   // "income" | "expense"
  category    String
  amount      Float
  date        DateTime
  note        String?
  tags        String[] // PostgreSQL array
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Goal {
  id           String   @id @default(uuid())
  user         User     @relation(fields: [userId], references: [id])
  userId       String
  title        String
  targetAmount Float
  currentAmount Float @default(0)
  deadline     DateTime?
  priority     Int     @default(0)
  isAchieved   Boolean @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model FcmToken {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  token     String
  createdAt DateTime @default(now())
}


Pagination : utiliser cursor pagination (Prisma cursor param) pour transactions (performant).

6) Intégration Firebase (auth, storage, FCM) — points pratiques
Auth

Frontend: use Firebase SDK to signup/signin, get ID token (user.getIdToken()).

Backend: middleware verifyFirebaseToken qui appelle Firebase Admin SDK auth().verifyIdToken(token) pour récupérer firebaseUid et vérifier user.

Storage

Photos upload via frontend -> Firebase Storage (rules : only authenticated users can upload to /profiles/{uid}).

Backend peut aussi stocker images via signed URLs.

FCM

Mobile register token to backend POST /notifications/register.

Backend triggers push via Firebase Admin messaging for reminders.

Firestore vs PostgreSQL

Si tu veux tout serverless : tu peux remplacer PostgreSQL + Node par Firestore (noSQL) + Cloud Functions (simplifie initial dev).

Avantage PostgreSQL : requêtes analytiques & relations complexes plus simples. Choix dépend de la roadmap. (Je propose PostgreSQL + Prisma car tu as Node.js stack.)

7) Déploiement & CI/CD
Environnements

.env.development, .env.production (DATABASE_URL, FIREBASE_ADMIN_CREDENTIAL, JWT_SECRET, FCM_SERVER_KEY, S3/CLOUDINARY creds)

Backend

Hébergement : Railway / Render / Heroku (simple)

CI : GitHub Actions → tests, prisma migrate deploy, build and deploy

Procfile / Dockerfile optionnel

Frontend (Expo)

EAS Build / Vercel (web) / Expo Publish

CI : GH Actions pour lint & tests

8) Tests & qualité

Backend: Jest + Supertest (unit + integration for endpoints)

Frontend: Vitest + React Native Testing Library (UI)

CI runs: lint (ESLint), typecheck (tsc), tests, prisma migrate check

9) Checklist “démarrage / starter (cursor)” — commandes & skeleton

Je fournis ici les commandes exactes pour créer le starter frontend et backend (prêt à coder).

A) Initialiser monorepo (optionnel) — Yarn Workspaces
mkdir nyiri && cd nyiri
git init
# utiliser pnpm ou yarn
pnpm init -y
pnpm install -w typescript -D

B) Frontend (Expo + TypeScript)
# installer expo CLI si pas
npm install -g expo-cli

# créer app expo
expo init nyiri-app
# choisir: blank (TypeScript)

cd nyiri-app
# installer deps recommandées
pnpm add react-native-paper nativewind @react-navigation/native @react-navigation/native-stack react-native-reanimated react-native-gesture-handler lottie-react-native firebase zustand axios expo-google-sign-in
# follow nativewind & reanimated install instructions (babel config, plugin)


src/services/firebase.ts — config Firebase (exemple):

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

C) Backend (Express + Prisma)
mkdir nyiri-backend && cd nyiri-backend
pnpm init -y
pnpm add express cors helmet dotenv zod prisma @prisma/client firebase-admin pg bcrypt jsonwebtoken
pnpm add -D typescript ts-node-dev @types/express @types/node
npx prisma init
# config DATABASE_URL in .env


prisma/schema.prisma → coller le schema fourni ci-dessus.

Prisma migrate:

npx prisma migrate dev --name init
npx prisma generate


Server start script src/server.ts:

import express from "express";
import helmet from "helmet";
import cors from "cors";
import { verifyFirebaseToken } from "./middleware/auth";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// routes...
app.get("/api/v1/health", (req, res) => res.json({ok: true}));

app.listen(process.env.PORT || 4000, ()=> console.log("Server up"));

D) Firebase Admin (backend)

Place serviceAccountKey.json secure (env variable or secret).

Init admin in backend:

import admin from "firebase-admin";
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
});


Middleware verify token:

export const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("No token");
  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    res.status(401).send("Invalid token");
  }
};

10) Roadmap & tâches par sprint (suggestion 2-week sprints)
Sprint 0 (Prépa / 2-3 jours)

Init repo monorepo, setups Expo & backend skeleton, config Firebase dev project, Prisma schema, migrations.

Sprint 1 (Auth + Profil / 5 jours)

Frontend auth screens + Firebase Auth integration.

Backend verify token + users/me endpoints.

Upload profile photo flow.

Sprint 2 (Transactions core / 7 jours)

Transactions CRUD (backend + frontend), account balance update, list & filters, transaction modal.

Sprint 3 (Dashboard & Stats / 5 jours)

Charts, monthly stats endpoints, animation of charts.

Sprint 4 (Goals & Notifications / 5 jours)

Goals CRUD, allocation money to goal, progress anim, FCM registration & test notification.

Sprint 5 (Polish & QA / 5 jours)

UI polish, animations, performance, e2e tests, deploy backend & publish app.

Annexes utiles (exemples courts)
Exemple payload création transaction (POST /api/v1/transactions)
{
  "type": "expense",
  "amount": 4500,
  "category": "Nourriture",
  "date": "2025-11-08T12:00:00.000Z",
  "note": "Déjeuner",
  "accountId": "uuid-account",
  "tags": ["repas","cantine"]
}

Règles de sécurité Firebase Storage (exemple)
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

✅ Ce que je te propose de faire maintenant (pratique)

Je peux te générer les fichiers de démarrage suivants directement ici dans la conversation (précis, prêts à copier) :

prisma/schema.prisma complet (déjà fourni)

src/server.ts minimal + src/routes/transactions.ts (squelette)

src/middleware/auth.ts (verifyFirebaseToken)

src/services/firebase.ts (frontend snippet)

Un README.md pour le monorepo avec toutes les commandes d’installation et .env.example.