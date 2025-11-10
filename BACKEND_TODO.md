# Backend Implementation TODO - GrowUp

Ce document liste toutes les fonctionnalités frontend qui nécessitent une implémentation backend.

## 📋 Endpoints à implémenter

### 1. Authentication (✅ Déjà implémenté)
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### 2. Transactions (🔴 À implémenter)

#### GET /api/transactions
**Description**: Récupérer la liste des transactions de l'utilisateur
**Query params**:
- `from` (date): Date de début (format: YYYY-MM-DD)
- `to` (date): Date de fin
- `type` (string): 'income' | 'expense' | 'all'
- `category` (string): Filtrer par catégorie
- `search` (string): Recherche dans note/catégorie
- `limit` (number): Nombre de résultats (défaut: 50)
- `cursor` (string): Pour pagination

**Response**:
```json
{
  "transactions": [
    {
      "id": "uuid",
      "userId": "uuid",
      "accountId": "uuid",
      "type": "expense",
      "category": "Nourriture",
      "amount": 45.50,
      "date": "2025-11-08T12:00:00.000Z",
      "note": "Courses au supermarché",
      "tags": ["courses", "alimentaire"],
      "createdAt": "2025-11-08T12:00:00.000Z",
      "updatedAt": "2025-11-08T12:00:00.000Z"
    }
  ],
  "total": 150,
  "nextCursor": "cursor_string"
}
```

#### POST /api/transactions
**Description**: Créer une nouvelle transaction
**Body**:
```json
{
  "type": "expense",
  "category": "Nourriture",
  "amount": 45.50,
  "date": "2025-11-08T12:00:00.000Z",
  "note": "Courses au supermarché",
  "accountId": "uuid",
  "tags": ["courses"]
}
```

**Response**:
```json
{
  "transaction": { /* transaction object */ },
  "account": {
    "id": "uuid",
    "balance": 1954.50
  }
}
```

**Logique métier**:
- Si type = 'expense': `account.balance -= amount`
- Si type = 'income': `account.balance += amount`
- Créer la transaction
- Mettre à jour le solde du compte
- Tout dans une transaction DB

#### GET /api/transactions/:id
**Description**: Récupérer les détails d'une transaction
**Response**: Transaction object

#### PUT /api/transactions/:id
**Description**: Modifier une transaction
**Body**: Mêmes champs que POST
**Logique métier**:
- Annuler l'ancienne transaction (restaurer le solde)
- Appliquer la nouvelle transaction
- Tout dans une transaction DB

#### DELETE /api/transactions/:id
**Description**: Supprimer une transaction
**Logique métier**:
- Restaurer le solde du compte
- Supprimer la transaction

### 3. Accounts (🔴 À implémenter)

#### GET /api/accounts
**Description**: Récupérer les comptes de l'utilisateur
**Response**:
```json
{
  "accounts": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Compte Principal",
      "balance": 2500.00,
      "currency": "EUR",
      "createdAt": "2025-11-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/accounts
**Description**: Créer un nouveau compte
**Body**:
```json
{
  "name": "Compte Épargne",
  "balance": 0,
  "currency": "EUR"
}
```

#### PUT /api/accounts/:id
**Description**: Modifier un compte (nom, devise)

#### DELETE /api/accounts/:id
**Description**: Supprimer un compte (seulement si balance = 0)

### 4. Goals (🔴 À implémenter)

#### GET /api/goals
**Description**: Récupérer les objectifs de l'utilisateur
**Response**:
```json
{
  "goals": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "Vacances d'été",
      "targetAmount": 2000.00,
      "currentAmount": 450.00,
      "deadline": "2025-07-01T00:00:00.000Z",
      "priority": 1,
      "isAchieved": false,
      "createdAt": "2025-11-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/goals
**Description**: Créer un objectif
**Body**:
```json
{
  "title": "Vacances d'été",
  "targetAmount": 2000.00,
  "deadline": "2025-07-01",
  "priority": 1
}
```

#### PUT /api/goals/:id
**Description**: Modifier un objectif
**Body**: Mêmes champs que POST + `currentAmount`

#### POST /api/goals/:id/allocate
**Description**: Allouer de l'argent à un objectif
**Body**:
```json
{
  "amount": 100.00,
  "accountId": "uuid"
}
```
**Logique métier**:
- Déduire du compte
- Ajouter à `currentAmount` du goal
- Créer une transaction de type "allocation"

#### DELETE /api/goals/:id
**Description**: Supprimer un objectif

### 5. Statistics (🔴 À implémenter)

#### GET /api/stats/monthly
**Description**: Statistiques mensuelles
**Query params**:
- `year` (number): Année
- `month` (number): Mois (1-12)

**Response**:
```json
{
  "year": 2025,
  "month": 11,
  "totalIncome": 2500.00,
  "totalExpense": 1234.56,
  "balance": 1265.44,
  "byCategory": [
    {
      "category": "Nourriture",
      "amount": 450.00,
      "percentage": 36.5,
      "count": 12
    }
  ],
  "byDay": [
    {
      "date": "2025-11-01",
      "income": 2500.00,
      "expense": 45.00
    }
  ]
}
```

#### GET /api/stats/trends
**Description**: Tendances sur plusieurs mois
**Query params**:
- `range` (string): '3m' | '6m' | '1y'

**Response**:
```json
{
  "months": [
    {
      "month": "2025-11",
      "income": 2500.00,
      "expense": 1234.56,
      "balance": 1265.44
    }
  ]
}
```

#### GET /api/stats/dashboard
**Description**: Stats pour le dashboard
**Response**:
```json
{
  "totalBalance": 2500.00,
  "totalIncome": 2500.00,
  "totalExpense": 1234.56,
  "recentTransactions": [ /* 5 dernières transactions */ ],
  "topCategories": [
    {
      "category": "Nourriture",
      "amount": 450.00,
      "percentage": 36.5
    }
  ],
  "goalsProgress": [
    {
      "id": "uuid",
      "title": "Vacances",
      "progress": 22.5
    }
  ]
}
```

### 6. Notifications (🔴 À implémenter)

#### GET /api/notifications
**Description**: Récupérer les notifications
**Response**:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "budget_exceeded",
      "title": "Budget dépassé",
      "message": "Vous avez dépassé votre budget mensuel de 150€",
      "isRead": false,
      "createdAt": "2025-11-08T12:00:00.000Z"
    }
  ]
}
```

#### PUT /api/notifications/:id/read
**Description**: Marquer comme lu

#### POST /api/notifications/mark-all-read
**Description**: Tout marquer comme lu

#### POST /api/notifications/register-token
**Description**: Enregistrer le token FCM
**Body**:
```json
{
  "token": "fcm_token_string"
}
```

### 7. User Profile (🔴 À implémenter)

#### PUT /api/users/me
**Description**: Mettre à jour le profil
**Body**:
```json
{
  "name": "John Doe",
  "currency": "EUR",
  "language": "fr",
  "country": "FR"
}
```

#### POST /api/users/me/photo
**Description**: Upload photo de profil
**Body**: FormData avec image
**Response**:
```json
{
  "photoUrl": "https://storage.url/photo.jpg"
}
```

## 🔐 Sécurité

### Middleware d'authentification
Tous les endpoints (sauf auth) doivent vérifier:
```javascript
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.userId = decoded.userId;
```

### Validation des données
Utiliser Zod ou Joi pour valider tous les inputs:
```javascript
const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1).max(50),
  amount: z.number().positive(),
  date: z.string().datetime(),
  note: z.string().max(500).optional(),
  accountId: z.string().uuid(),
  tags: z.array(z.string()).optional(),
});
```

### Rate limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requêtes par IP
});
app.use('/api/', limiter);
```

## 📊 Base de données

### Schéma Prisma (déjà défini dans Project.md)
- User
- Account
- Transaction
- Goal
- FcmToken

### Indexes à créer
```prisma
@@index([userId, date])  // Transaction
@@index([userId, type])  // Transaction
@@index([userId])        // Account, Goal
```

## 🔄 Logique métier importante

### 1. Gestion des transactions
- Toujours utiliser des transactions DB
- Mettre à jour le solde du compte
- Vérifier que le compte appartient à l'utilisateur
- Vérifier que le solde est suffisant pour les dépenses

### 2. Gestion des objectifs
- Calculer automatiquement le pourcentage de progression
- Marquer comme atteint si `currentAmount >= targetAmount`
- Envoyer une notification quand objectif atteint

### 3. Notifications automatiques
- Budget dépassé (vérifier chaque transaction)
- Objectif atteint
- Rappels mensuels
- Transactions inhabituelles (montant élevé)

### 4. Statistiques
- Calculer en temps réel ou utiliser un cache
- Grouper par catégorie, date, type
- Calculer les pourcentages

## 🚀 Prochaines étapes

1. ✅ Auth endpoints (déjà fait)
2. 🔴 Créer les endpoints Transactions
3. 🔴 Créer les endpoints Accounts
4. 🔴 Créer les endpoints Goals
5. 🔴 Créer les endpoints Statistics
6. 🔴 Créer les endpoints Notifications
7. 🔴 Implémenter FCM pour push notifications
8. 🔴 Ajouter les tests unitaires
9. 🔴 Ajouter les tests d'intégration
10. 🔴 Déployer sur Railway/Render

## 📱 Intégration Frontend

### Fichiers à modifier
- `mobile/src/services/api.ts` - Ajouter les fonctions API
- `mobile/app/(tabs)/dashboard.tsx` - Connecter au backend
- `mobile/app/(tabs)/transactions.tsx` - Connecter au backend
- `mobile/app/(tabs)/goals.tsx` - Connecter au backend
- `mobile/app/(tabs)/profile.tsx` - Connecter au backend

### Exemple d'intégration
```typescript
// mobile/src/services/api.ts
export const transactionService = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

// Dans le composant
const onRefresh = async () => {
  setRefreshing(true);
  try {
    const response = await transactionService.getAll({ 
      type: filter,
      search: searchQuery 
    });
    setTransactions(response.data.transactions);
  } catch (error) {
    Alert.alert('Erreur', 'Impossible de charger les transactions');
  } finally {
    setRefreshing(false);
  }
};
```

## 🎯 Priorités

### Phase 1 (MVP)
1. Transactions CRUD
2. Accounts CRUD
3. Stats dashboard
4. Goals CRUD

### Phase 2
1. Notifications
2. Stats avancées
3. Export de données
4. Récurrence des transactions

### Phase 3
1. Budgets
2. Catégories personnalisées
3. Multi-devises
4. Partage de comptes
