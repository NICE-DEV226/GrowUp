# 📋 Backend Integration Checklist - GrowUp App

Ce document liste toutes les fonctionnalités frontend implémentées qui nécessitent une intégration backend.

## 🔐 Authentification

### ✅ Frontend Implémenté
- **Fichiers**: `mobile/app/(auth)/login.tsx`, `mobile/app/(auth)/signup.tsx`
- **Store**: `mobile/src/store/authStore.ts`

### 🔌 Endpoints Backend Requis

#### 1. Inscription (MISE À JOUR)
```typescript
POST /api/v1/auth/register
Body: {
  name: string;
  email: string;
  password: string;
  country: string; // Code pays (ex: "FR", "SN", "US") - NOUVEAU
  currency?: string; // Devise (ex: "EUR", "XOF") - Auto-défini selon pays
  language?: string; // Langue (ex: "Français", "English") - Auto-défini selon pays
}
Response: {
  user: { 
    id: string;
    name: string;
    email: string;
    country: string;
    currency: string;
    language: string;
  };
  token: string;
}
```

**Logique métier**:
- Le pays est **obligatoire** à l'inscription
- Si `currency` et `language` ne sont pas fournis, utiliser les valeurs par défaut du pays
- Valider que le code pays existe dans la liste des pays supportés (voir section Pays)
- Créer un compte par défaut avec `balance: 0` et `currency` du pays

#### 2. Connexion
```typescript
POST /api/v1/auth/login
Body: {
  email: string;
  password: string;
}
Response: {
  user: { id, name, email };
  token: string;
}
```

#### 3. Récupérer profil utilisateur (MISE À JOUR)
```typescript
GET /api/v1/users/me
Headers: { Authorization: "Bearer <token>" }
Response: {
  id: string;
  name: string;
  email: string;
  country: string; // Code pays (ex: "FR", "SN") - OBLIGATOIRE
  currency: string; // Devise (ex: "EUR", "XOF")
  language: string; // Langue (ex: "Français", "English")
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎯 Objectifs (Goals)

### ✅ Frontend Implémenté
- **Fichier**: `mobile/app/(tabs)/goals.tsx`
- **Fonctionnalités**: Créer, Modifier, Supprimer, Allouer de l'argent, Voir détails

### 🔌 Endpoints Backend Requis

#### 1. Lister les objectifs
```typescript
GET /api/v1/goals
Headers: { Authorization: "Bearer <token>" }
Response: {
  goals: [
    {
      id: string;
      title: string;
      targetAmount: number;
      currentAmount: number;
      deadline?: string;
      createdAt: string;
      priority: number;
      isAchieved: boolean;
      icon: string;
      color: string;
      category: string;
    }
  ]
}
```

#### 2. Créer un objectif
```typescript
POST /api/v1/goals
Headers: { Authorization: "Bearer <token>" }
Body: {
  title: string;
  targetAmount: number;
  deadline?: string;
  icon: string;
  color: string;
  category: string;
}
Response: {
  goal: { id, title, targetAmount, currentAmount, ... }
}
```

#### 3. Modifier un objectif
```typescript
PUT /api/v1/goals/:id
Headers: { Authorization: "Bearer <token>" }
Body: {
  title?: string;
  targetAmount?: number;
  deadline?: string;
  icon?: string;
  color?: string;
  category?: string;
}
Response: {
  goal: { id, title, targetAmount, ... }
}
```

#### 4. Supprimer un objectif
```typescript
DELETE /api/v1/goals/:id
Headers: { Authorization: "Bearer <token>" }
Response: {
  message: "Goal deleted successfully"
}
```

#### 5. Allouer de l'argent à un objectif
```typescript
POST /api/v1/goals/:id/allocate
Headers: { Authorization: "Bearer <token>" }
Body: {
  amount: number;
}
Response: {
  goal: { id, currentAmount, isAchieved, ... }
}
```

**Logique métier**:
- Vérifier que `amount > 0`
- `currentAmount = min(currentAmount + amount, targetAmount)`
- `isAchieved = currentAmount >= targetAmount`
- Déduire le montant du compte principal de l'utilisateur

---

## 💰 Transactions

### ✅ Frontend Implémenté
- **Fichiers**: `mobile/app/(tabs)/transactions.tsx`, `mobile/app/(tabs)/dashboard.tsx`
- **Fonctionnalités**: Ajouter, Modifier, Supprimer, Filtrer, Rechercher

### 🔌 Endpoints Backend Requis

#### 1. Lister les transactions
```typescript
GET /api/v1/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD&type=income|expense&category=&limit=50&cursor=
Headers: { Authorization: "Bearer <token>" }
Response: {
  transactions: [
    {
      id: string;
      type: "income" | "expense";
      category: string;
      amount: number;
      date: string;
      note?: string;
      icon: string;
      color: string;
      accountId?: string;
    }
  ],
  nextCursor?: string;
}
```

#### 2. Créer une transaction
```typescript
POST /api/v1/transactions
Headers: { Authorization: "Bearer <token>" }
Body: {
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  note?: string;
  accountId?: string;
}
Response: {
  transaction: { id, type, category, amount, ... }
}
```

**Logique métier**:
- Si `type === "expense"`: `account.balance -= amount`
- Si `type === "income"`: `account.balance += amount`
- Mettre à jour les statistiques

#### 3. Modifier une transaction
```typescript
PUT /api/v1/transactions/:id
Headers: { Authorization: "Bearer <token>" }
Body: {
  type?: "income" | "expense";
  category?: string;
  amount?: number;
  date?: string;
  note?: string;
}
Response: {
  transaction: { id, type, category, amount, ... }
}
```

**Logique métier**:
- Annuler l'ancienne transaction sur le solde
- Appliquer la nouvelle transaction

#### 4. Supprimer une transaction
```typescript
DELETE /api/v1/transactions/:id
Headers: { Authorization: "Bearer <token>" }
Response: {
  message: "Transaction deleted successfully"
}
```

**Logique métier**:
- Inverser l'impact sur le solde du compte

---

## 📊 Dashboard / Statistiques

### ✅ Frontend Implémenté
- **Fichiers**: 
  - `mobile/app/(tabs)/dashboard.tsx` - Vue d'ensemble
  - `mobile/app/(tabs)/stats.tsx` - Page statistiques détaillées (NOUVEAU)
- **Affichage Dashboard**: Solde total, Revenus, Dépenses, Transactions récentes, Objectifs
- **Affichage Stats** (NOUVEAU):
  - ✅ Résumé financier avec gradient (Revenus, Dépenses, Économies)
  - ✅ Sélecteur de période (Semaine, Mois, Année)
  - ✅ Onglets (Vue d'ensemble, Revenus, Dépenses)
  - ✅ Graphique en barres (évolution mensuelle)
  - ✅ Graphique donut (dépenses par catégorie)
  - ✅ Graphique linéaire (tendance hebdomadaire)
  - ✅ Section Insights avec conseils intelligents
  - ✅ Pull-to-refresh
  - ✅ Animations d'entrée

### 🔌 Endpoints Backend Requis

#### 1. Statistiques globales
```typescript
GET /api/v1/stats/summary
Headers: { Authorization: "Bearer <token>" }
Response: {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  currency: string;
}
```

#### 2. Statistiques mensuelles
```typescript
GET /api/v1/stats/monthly?year=2025&month=11
Headers: { Authorization: "Bearer <token>" }
Response: {
  income: number;
  expense: number;
  byCategory: {
    [category: string]: number;
  };
  transactions: number;
}
```

#### 3. Tendances
```typescript
GET /api/v1/stats/trends?range=6m
Headers: { Authorization: "Bearer <token>" }
Response: {
  months: [
    {
      month: string;
      income: number;
      expense: number;
      balance: number;
    }
  ]
}
```

---

## 📊 Calculs et Opérations Statistiques (DÉTAILLÉ)

### Vue d'ensemble des calculs

Le backend doit effectuer des calculs complexes pour générer des statistiques réalistes et utiles basées sur les données réelles de l'utilisateur.

### 1. Statistiques Globales (Summary)

#### Endpoint: `GET /api/v1/stats/summary`

**Calculs à effectuer** :

```typescript
// 1. Solde total de tous les comptes
const totalBalance = await prisma.account.aggregate({
  where: { userId },
  _sum: { balance: true }
});

// 2. Total des revenus (toutes les transactions income)
const totalIncome = await prisma.transaction.aggregate({
  where: { 
    userId,
    type: 'income'
  },
  _sum: { amount: true }
});

// 3. Total des dépenses (toutes les transactions expense)
const totalExpense = await prisma.transaction.aggregate({
  where: { 
    userId,
    type: 'expense'
  },
  _sum: { amount: true }
});

// 4. Taux d'épargne (savings rate)
const savingsRate = totalIncome > 0 
  ? ((totalIncome - totalExpense) / totalIncome) * 100 
  : 0;

// 5. Nombre total de transactions
const transactionCount = await prisma.transaction.count({
  where: { userId }
});

// 6. Moyenne des dépenses par transaction
const avgExpense = totalExpense / transactionCount;

// 7. Plus grosse dépense
const biggestExpense = await prisma.transaction.findFirst({
  where: { userId, type: 'expense' },
  orderBy: { amount: 'desc' }
});

// 8. Catégorie la plus dépensière
const topCategory = await prisma.transaction.groupBy({
  by: ['category'],
  where: { userId, type: 'expense' },
  _sum: { amount: true },
  orderBy: { _sum: { amount: 'desc' } },
  take: 1
});
```

**Response** :
```json
{
  "totalBalance": 5420.50,
  "totalIncome": 12500.00,
  "totalExpense": 7079.50,
  "savingsRate": 43.36,
  "transactionCount": 156,
  "avgExpense": 45.38,
  "biggestExpense": {
    "amount": 850.00,
    "category": "Loyer",
    "date": "2025-11-01"
  },
  "topCategory": {
    "category": "Nourriture",
    "total": 1250.00
  },
  "currency": "XOF"
}
```

### 2. Statistiques Mensuelles

#### Endpoint: `GET /api/v1/stats/monthly?year=2025&month=11`

**Calculs à effectuer** :

```typescript
// Dates de début et fin du mois
const startDate = new Date(year, month - 1, 1);
const endDate = new Date(year, month, 0, 23, 59, 59);

// 1. Revenus du mois
const monthlyIncome = await prisma.transaction.aggregate({
  where: {
    userId,
    type: 'income',
    date: { gte: startDate, lte: endDate }
  },
  _sum: { amount: true }
});

// 2. Dépenses du mois
const monthlyExpense = await prisma.transaction.aggregate({
  where: {
    userId,
    type: 'expense',
    date: { gte: startDate, lte: endDate }
  },
  _sum: { amount: true }
});

// 3. Dépenses par catégorie
const byCategory = await prisma.transaction.groupBy({
  by: ['category'],
  where: {
    userId,
    type: 'expense',
    date: { gte: startDate, lte: endDate }
  },
  _sum: { amount: true },
  orderBy: { _sum: { amount: 'desc' } }
});

// 4. Nombre de transactions
const transactionCount = await prisma.transaction.count({
  where: {
    userId,
    date: { gte: startDate, lte: endDate }
  }
});

// 5. Comparaison avec le mois précédent
const prevStartDate = new Date(year, month - 2, 1);
const prevEndDate = new Date(year, month - 1, 0, 23, 59, 59);

const prevMonthExpense = await prisma.transaction.aggregate({
  where: {
    userId,
    type: 'expense',
    date: { gte: prevStartDate, lte: prevEndDate }
  },
  _sum: { amount: true }
});

const expenseChange = prevMonthExpense._sum.amount > 0
  ? ((monthlyExpense._sum.amount - prevMonthExpense._sum.amount) / prevMonthExpense._sum.amount) * 100
  : 0;

// 6. Jour le plus dépensier
const dailyExpenses = await prisma.transaction.groupBy({
  by: ['date'],
  where: {
    userId,
    type: 'expense',
    date: { gte: startDate, lte: endDate }
  },
  _sum: { amount: true },
  orderBy: { _sum: { amount: 'desc' } },
  take: 1
});
```

**Response** :
```json
{
  "income": 2850.00,
  "expense": 1350.00,
  "savings": 1500.00,
  "savingsRate": 52.63,
  "byCategory": {
    "Nourriture": 450.00,
    "Transport": 280.00,
    "Loisirs": 320.00,
    "Shopping": 180.00,
    "Santé": 120.00
  },
  "transactions": 45,
  "comparison": {
    "expenseChange": -12.5,
    "trend": "down"
  },
  "biggestDay": {
    "date": "2025-11-15",
    "amount": 250.00
  }
}
```

### 3. Évolution Mensuelle (6 derniers mois)

#### Endpoint: `GET /api/v1/stats/evolution?months=6`

**Calculs à effectuer** :

```typescript
const months = [];
const currentDate = new Date();

for (let i = 5; i >= 0; i--) {
  const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
  const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

  // Revenus du mois
  const income = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'income',
      date: { gte: startDate, lte: endDate }
    },
    _sum: { amount: true }
  });

  // Dépenses du mois
  const expense = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'expense',
      date: { gte: startDate, lte: endDate }
    },
    _sum: { amount: true }
  });

  months.push({
    label: monthDate.toLocaleDateString('fr-FR', { month: 'short' }),
    month: monthDate.toISOString(),
    income: income._sum.amount || 0,
    expense: expense._sum.amount || 0,
    balance: (income._sum.amount || 0) - (expense._sum.amount || 0)
  });
}
```

**Response** :
```json
{
  "months": [
    { "label": "Jun", "income": 2400, "expense": 1200, "balance": 1200 },
    { "label": "Jul", "income": 2600, "expense": 1400, "balance": 1200 },
    { "label": "Aug", "income": 2500, "expense": 1300, "balance": 1200 },
    { "label": "Sep", "income": 2850, "expense": 1450, "balance": 1400 },
    { "label": "Oct", "income": 2700, "expense": 1350, "balance": 1350 },
    { "label": "Nov", "income": 2850, "expense": 1350, "balance": 1500 }
  ]
}
```

### 4. Dépenses par Catégorie (Donut Chart)

#### Endpoint: `GET /api/v1/stats/categories?period=month`

**Calculs à effectuer** :

```typescript
// Période (mois en cours par défaut)
const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const endDate = new Date();

// Grouper par catégorie
const categories = await prisma.transaction.groupBy({
  by: ['category'],
  where: {
    userId,
    type: 'expense',
    date: { gte: startDate, lte: endDate }
  },
  _sum: { amount: true },
  _count: { id: true },
  orderBy: { _sum: { amount: 'desc' } }
});

// Total des dépenses
const total = categories.reduce((sum, cat) => sum + (cat._sum.amount || 0), 0);

// Calculer les pourcentages
const categoriesWithPercentage = categories.map(cat => ({
  label: cat.category,
  value: cat._sum.amount || 0,
  percentage: total > 0 ? ((cat._sum.amount || 0) / total) * 100 : 0,
  count: cat._count.id,
  color: getCategoryColor(cat.category) // Fonction helper
}));

// Fonction helper pour les couleurs
function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    'Nourriture': '#F44336',
    'Transport': '#2196F3',
    'Loisirs': '#9C27B0',
    'Shopping': '#E91E63',
    'Santé': '#4CAF50',
    'Logement': '#FF9800',
    'Éducation': '#00BCD4',
    'Autre': '#607D8B'
  };
  return colors[category] || '#607D8B';
}
```

**Response** :
```json
{
  "total": 1350.00,
  "categories": [
    {
      "label": "Nourriture",
      "value": 450.00,
      "percentage": 33.33,
      "count": 15,
      "color": "#F44336"
    },
    {
      "label": "Loisirs",
      "value": 320.00,
      "percentage": 23.70,
      "count": 8,
      "color": "#9C27B0"
    },
    {
      "label": "Transport",
      "value": 280.00,
      "percentage": 20.74,
      "count": 12,
      "color": "#2196F3"
    },
    {
      "label": "Shopping",
      "value": 180.00,
      "percentage": 13.33,
      "count": 6,
      "color": "#E91E63"
    },
    {
      "label": "Santé",
      "value": 120.00,
      "percentage": 8.89,
      "count": 4,
      "color": "#4CAF50"
    }
  ]
}
```

### 5. Tendance Hebdomadaire

#### Endpoint: `GET /api/v1/stats/weekly?weeks=6`

**Calculs à effectuer** :

```typescript
const weeks = [];
const currentDate = new Date();

for (let i = 5; i >= 0; i--) {
  // Calculer le début et la fin de la semaine
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - (i * 7) - currentDate.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Transactions de la semaine
  const weekExpense = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'expense',
      date: { gte: weekStart, lte: weekEnd }
    },
    _sum: { amount: true }
  });

  weeks.push({
    label: `S${6 - i}`,
    week: weekStart.toISOString(),
    value: weekExpense._sum.amount || 0
  });
}
```

**Response** :
```json
{
  "weeks": [
    { "label": "S1", "value": 320 },
    { "label": "S2", "value": 280 },
    { "label": "S3", "value": 380 },
    { "label": "S4", "value": 370 },
    { "label": "S5", "value": 290 },
    { "label": "S6", "value": 310 }
  ],
  "average": 325,
  "trend": "stable"
}
```

### 6. Insights Intelligents

#### Endpoint: `GET /api/v1/stats/insights`

**Logique de génération d'insights** :

```typescript
const insights = [];

// 1. Progression des économies
const currentMonth = await getMonthlyStats(userId, new Date());
const previousMonth = await getMonthlyStats(userId, getPreviousMonth());

if (currentMonth.savings > previousMonth.savings) {
  const increase = ((currentMonth.savings - previousMonth.savings) / previousMonth.savings) * 100;
  insights.push({
    type: 'success',
    icon: 'trending-up',
    title: 'Excellente progression !',
    message: `Vos économies ont augmenté de ${increase.toFixed(0)}% ce mois-ci.`,
    priority: 1
  });
}

// 2. Budget dépassé
const budgets = await prisma.budget.findMany({ where: { userId } });
for (const budget of budgets) {
  const spent = await getCategoryExpense(userId, budget.category, 'month');
  if (spent > budget.limit) {
    const overspend = spent - budget.limit;
    insights.push({
      type: 'warning',
      icon: 'alert-circle',
      title: `Attention au budget ${budget.category}`,
      message: `Vous avez dépassé de ${overspend.toFixed(0)}€ ce mois-ci.`,
      priority: 2
    });
  }
}

// 3. Objectif proche
const goals = await prisma.goal.findMany({
  where: { userId, isAchieved: false }
});

for (const goal of goals) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  if (progress >= 80 && progress < 100) {
    const remaining = goal.targetAmount - goal.currentAmount;
    const monthsToGoal = Math.ceil(remaining / currentMonth.savings);
    insights.push({
      type: 'info',
      icon: 'target',
      title: 'Objectif en vue !',
      message: `À ce rythme, vous atteindrez "${goal.title}" dans ${monthsToGoal} mois.`,
      priority: 3
    });
  }
}

// 4. Dépense inhabituelle
const avgDailyExpense = currentMonth.expense / 30;
const yesterday = await getDailyExpense(userId, getYesterday());

if (yesterday > avgDailyExpense * 1.5) {
  insights.push({
    type: 'warning',
    icon: 'alert',
    title: 'Dépense inhabituelle',
    message: `Vous avez dépensé ${yesterday.toFixed(0)}€ hier, soit ${((yesterday / avgDailyExpense - 1) * 100).toFixed(0)}% de plus que d'habitude.`,
    priority: 2
  });
}

// 5. Économies régulières
const last3Months = await getLast3MonthsSavings(userId);
if (last3Months.every(m => m.savings > 0)) {
  insights.push({
    type: 'success',
    icon: 'trophy',
    title: 'Bravo !',
    message: 'Vous économisez régulièrement depuis 3 mois consécutifs.',
    priority: 1
  });
}

// Trier par priorité
return insights.sort((a, b) => a.priority - b.priority);
```

**Response** :
```json
{
  "insights": [
    {
      "type": "success",
      "icon": "trending-up",
      "title": "Excellente progression !",
      "message": "Vos économies ont augmenté de 23% ce mois-ci.",
      "priority": 1
    },
    {
      "type": "warning",
      "icon": "alert-circle",
      "title": "Attention au budget Loisirs",
      "message": "Vous avez dépassé de 50€ ce mois-ci.",
      "priority": 2
    },
    {
      "type": "info",
      "icon": "target",
      "title": "Objectif en vue !",
      "message": "À ce rythme, vous atteindrez \"Vacances d'été\" dans 3 mois.",
      "priority": 3
    }
  ]
}
```

### 7. Formules de Calcul Importantes

#### Taux d'épargne
```
Taux d'épargne = ((Revenus - Dépenses) / Revenus) × 100
```

#### Moyenne mobile (7 jours)
```
Moyenne mobile = Σ(dépenses des 7 derniers jours) / 7
```

#### Prédiction d'objectif
```
Mois restants = (Montant cible - Montant actuel) / Épargne mensuelle moyenne
```

#### Pourcentage de changement
```
Changement % = ((Valeur actuelle - Valeur précédente) / Valeur précédente) × 100
```

#### Écart-type des dépenses
```
σ = √(Σ(xi - μ)² / n)
où μ = moyenne des dépenses
```

### 8. Optimisations Backend

**Caching** :
- Mettre en cache les statistiques mensuelles (TTL: 1 heure)
- Invalider le cache lors d'une nouvelle transaction

**Indexation** :
```sql
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category);
```

**Agrégation efficace** :
- Utiliser des vues matérialisées pour les statistiques fréquentes
- Calculer les totaux mensuels en arrière-plan (cron job)

---

#### 4. Statistiques par période (NOUVEAU - pour page stats.tsx)
```typescript
GET /api/v1/stats/period?type=week|month|year
Headers: { Authorization: "Bearer <token>" }
Response: {
  period: string; // "Semaine 45", "Novembre 2025", "2025"
  summary: {
    income: number;
    expense: number;
    savings: number;
  };
  monthlyData: [
    { label: string; value: number; }
  ];
  categoryData: [
    { label: string; value: number; color: string; }
  ];
  trendData: [
    { label: string; value: number; }
  ];
}
```

**Logique métier**:
- `type=week`: Retourner données des 7 derniers jours
- `type=month`: Retourner données du mois en cours
- `type=year`: Retourner données de l'année en cours
- `monthlyData`: Évolution sur 6 derniers mois
- `categoryData`: Top 5 catégories de dépenses avec couleurs
- `trendData`: Tendance hebdomadaire (6 dernières semaines)

#### 5. Insights intelligents (NOUVEAU)
```typescript
GET /api/v1/stats/insights
Headers: { Authorization: "Bearer <token>" }
Response: {
  insights: [
    {
      id: string;
      type: "success" | "warning" | "info";
      icon: string;
      title: string;
      message: string;
      createdAt: string;
    }
  ]
}
```

**Logique métier - Générer insights automatiques**:
- **Progression économies** : Si économies > mois précédent
  - Type: success, Icon: trending-up
  - "Excellente progression ! Vos économies ont augmenté de X% ce mois-ci"
  
- **Budget dépassé** : Si dépenses catégorie > budget défini
  - Type: warning, Icon: alert-circle
  - "Attention aux [catégorie]. Vos dépenses ont augmenté de X%"
  
- **Objectif proche** : Si objectif à 80%+ de completion
  - Type: info, Icon: target
  - "Objectif en vue ! À ce rythme, vous atteindrez [objectif] dans X mois"
  
- **Dépense inhabituelle** : Si dépense > moyenne + 50%
  - Type: warning, Icon: alert
  - "Dépense inhabituelle détectée dans [catégorie]"
  
- **Économies régulières** : Si économies > 0 pendant 3 mois consécutifs
  - Type: success, Icon: trophy
  - "Bravo ! Vous économisez régulièrement depuis X mois"

---

## 🔔 Notifications

### ✅ Frontend Implémenté
- **Fichiers**: 
  - `mobile/app/(tabs)/dashboard.tsx` - Modal avec liste de notifications
  - `mobile/app/(tabs)/notifications.tsx` - Page dédiée (EN COURS - fichier créé mais tronqué)
- **Affichage**: 
  - ✅ Modal avec liste de notifications dans dashboard
  - ⚠️ Page notifications complète à finaliser
- **Fonctionnalités prévues**:
  - Cartes de notifications avec animations
  - Filtres (Toutes, Non lues, par catégorie)
  - Marquer comme lu individuellement
  - Supprimer individuellement
  - Marquer tout comme lu
  - Supprimer toutes les notifications
  - Pull-to-refresh
  - Compteur de non lues

### 🔌 Endpoints Backend Requis

#### 1. Lister les notifications
```typescript
GET /api/v1/notifications?limit=20&unreadOnly=false&category=
Headers: { Authorization: "Bearer <token>" }
Response: {
  notifications: [
    {
      id: string;
      title: string;
      message: string;
      type: "success" | "warning" | "info" | "error";
      isRead: boolean;
      category: string; // "Objectifs" | "Budget" | "Transactions" | "Rappels" | "Système"
      createdAt: string;
    }
  ],
  unreadCount: number; // IMPORTANT: Nombre de notifications non lues pour le badge
}
```

**Logique métier** :
- Retourner toutes les notifications de l'utilisateur
- Inclure le compteur de notifications non lues (`unreadCount`)
- Trier par date décroissante (plus récentes en premier)
- Paginer les résultats (limit par défaut: 20)

#### 2. Marquer comme lu
```typescript
PUT /api/v1/notifications/:id/read
Headers: { Authorization: "Bearer <token>" }
Response: {
  notification: { id, isRead: true }
}
```

#### 3. Marquer tout comme lu
```typescript
PUT /api/v1/notifications/read-all
Headers: { Authorization: "Bearer <token>" }
Response: {
  message: "All notifications marked as read",
  count: number; // Nombre de notifications marquées
}
```

#### 4. Supprimer une notification
```typescript
DELETE /api/v1/notifications/:id
Headers: { Authorization: "Bearer <token>" }
Response: {
  message: "Notification deleted successfully"
}
```

#### 5. Supprimer toutes les notifications
```typescript
DELETE /api/v1/notifications/all
Headers: { Authorization: "Bearer <token>" }
Response: {
  message: "All notifications deleted successfully",
  count: number; // Nombre de notifications supprimées
}
```

#### 6. Compter les notifications non lues (NOUVEAU - pour le badge)
```typescript
GET /api/v1/notifications/unread-count
Headers: { Authorization: "Bearer <token>" }
Response: {
  count: number; // Nombre de notifications non lues
}
```

**Logique métier** :
- Compter uniquement les notifications avec `isRead: false`
- Utiliser pour afficher le badge sur l'icône de notification
- Mettre en cache (TTL: 5 minutes) pour optimiser les performances
- Invalider le cache lors de la création d'une nouvelle notification ou marquage comme lu

**Implémentation backend** :
```typescript
// Exemple avec Prisma
const unreadCount = await prisma.notification.count({
  where: {
    userId,
    isRead: false
  }
});

// Avec cache Redis
const cacheKey = `notifications:unread:${userId}`;
let count = await redis.get(cacheKey);

if (count === null) {
  count = await prisma.notification.count({
    where: { userId, isRead: false }
  });
  await redis.setex(cacheKey, 300, count); // Cache 5 minutes
}

return { count: parseInt(count) };
```

**Frontend implémentation** :
```typescript
// Dans dashboard.tsx
useEffect(() => {
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadNotifications(response.data.count);
    } catch (error) {
      console.error('Erreur lors du chargement du compteur');
    }
  };

  fetchUnreadCount();
  
  // Rafraîchir toutes les 30 secondes
  const interval = setInterval(fetchUnreadCount, 30000);
  return () => clearInterval(interval);
}, []);
```

#### 7. Enregistrer token FCM (Push Notifications)
```typescript
POST /api/v1/notifications/register-token
Headers: { Authorization: "Bearer <token>" }
Body: {
  token: string;
  platform: "ios" | "android";
}
Response: {
  message: "Token registered successfully"
}
```

**Logique métier - Notifications automatiques**:
- **Objectif atteint** : Quand `goal.currentAmount >= goal.targetAmount`
  - Type: success, Catégorie: Objectifs
  - "Félicitations ! Vous avez atteint votre objectif [nom]"
  - **Incrémenter le compteur de badge**
  
- **Budget dépassé** : Quand dépenses catégorie > budget défini
  - Type: warning, Catégorie: Budget
  - "Attention ! Vous avez dépassé votre budget [catégorie] de X€"
  - **Incrémenter le compteur de badge**
  
- **Nouvelle transaction** : Après création d'une transaction
  - Type: info, Catégorie: Transactions
  - "Transaction de X€ ajoutée dans [catégorie]"
  - **Incrémenter le compteur de badge**
  
- **Rappel épargne** : Tous les lundis si pas d'allocation cette semaine
  - Type: info, Catégorie: Rappels
  - "N'oubliez pas d'allouer de l'argent à vos objectifs cette semaine"
  - **Incrémenter le compteur de badge**
  
- **Erreur système** : En cas d'erreur de synchronisation
  - Type: error, Catégorie: Système
  - "Impossible de synchroniser vos données"
  - **Incrémenter le compteur de badge**

**Gestion du badge** :
```typescript
// Lors de la création d'une notification
async function createNotification(userId: string, notification: NotificationData) {
  // 1. Créer la notification
  const newNotif = await prisma.notification.create({
    data: {
      userId,
      ...notification,
      isRead: false
    }
  });

  // 2. Invalider le cache du compteur
  await redis.del(`notifications:unread:${userId}`);

  // 3. Envoyer une push notification si l'utilisateur a un token FCM
  const userToken = await getUserFCMToken(userId);
  if (userToken) {
    await sendPushNotification(userToken, {
      title: notification.title,
      body: notification.message,
      badge: await getUnreadCount(userId) // Mettre à jour le badge iOS
    });
  }

  return newNotif;
}

// Lors du marquage comme lu
async function markAsRead(userId: string, notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true }
  });

  // Invalider le cache
  await redis.del(`notifications:unread:${userId}`);
}
```

---

## 👤 Profil Utilisateur

### ✅ Frontend Implémenté
- **Fichier**: `mobile/app/(tabs)/profile.tsx`
- **Fonctionnalités**: 
  - ✅ Modifier nom (fonctionnel avec AsyncStorage)
  - ✅ Changer photo de profil (UI moderne avec modal, backend requis)
  - ✅ Changer devise (12 devises : EUR, USD, GBP, CHF, XOF, XAF, MAD, TND, ZAR, NGN, GHS, KES)
  - ✅ Changer langue (Français, English, Español)
  - ✅ Changer thème (Sombre, Clair, Automatique)
  - ✅ Déconnexion avec confirmation
  - ✅ Synchronisation nom/photo avec dashboard
  - ✅ Modal photo avec 3 options : Caméra, Galerie, Supprimer
  - ✅ ScrollView dans modal devises pour voir toutes les options

### 🔌 Endpoints Backend Requis

#### 1. Mettre à jour le profil
```typescript
PUT /api/v1/users/me
Headers: { Authorization: "Bearer <token>" }
Body: {
  name?: string;
  country?: string;
  currency?: string; // "EUR" | "USD" | "GBP" | "CHF" | "XOF" | "XAF" | "MAD" | "TND" | "ZAR" | "NGN" | "GHS" | "KES"
  language?: string; // "Français" | "English" | "Español"
}
Response: {
  user: { 
    id: string;
    name: string;
    email: string;
    country?: string;
    currency: string;
    language: string;
    profilePhoto?: string;
  }
}
```

**Logique métier**:
- Valider que la devise est dans la liste autorisée (12 devises supportées)
- Valider que la langue est supportée
- Mettre à jour le timestamp `updatedAt`

#### 2. Upload photo de profil
```typescript
POST /api/v1/users/me/photo
Headers: { 
  Authorization: "Bearer <token>",
  Content-Type: "multipart/form-data"
}
Body: FormData { photo: File }
Response: {
  photoUrl: string;
  user: {
    id: string;
    profilePhoto: string;
  }
}
```

**Logique métier**:
- Accepter uniquement JPG, PNG, WEBP
- Taille max : 5MB
- Redimensionner automatiquement à 500x500px
- Utiliser Firebase Storage ou AWS S3
- Générer URL publique
- Supprimer l'ancienne photo du storage
- Mettre à jour `user.profilePhoto` en base

**Frontend implémentation** (À intégrer dans `profile.tsx`):
```typescript
// 1. Installer expo-image-picker
// npm install expo-image-picker

// 2. Importer dans profile.tsx
import * as ImagePicker from 'expo-image-picker';
import api from '../../src/services/api';

// 3. Fonction pour prendre une photo avec la caméra
const handleTakePhoto = async () => {
  setPhotoModalVisible(false);
  
  // Demander permission caméra
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission refusée', 'Nous avons besoin d\'accéder à votre caméra');
    return;
  }
  
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  
  if (!result.canceled) {
    await uploadPhoto(result.assets[0].uri);
  }
};

// 4. Fonction pour choisir depuis la galerie
const handleChooseFromGallery = async () => {
  setPhotoModalVisible(false);
  
  // Demander permission galerie
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission refusée', 'Nous avons besoin d\'accéder à votre galerie');
    return;
  }
  
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  
  if (!result.canceled) {
    await uploadPhoto(result.assets[0].uri);
  }
};

// 5. Fonction pour uploader la photo
const uploadPhoto = async (uri: string) => {
  try {
    const formData = new FormData();
    formData.append('photo', {
      uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);
    
    const response = await api.post('/users/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // Mettre à jour AsyncStorage
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      userData.profilePhoto = response.data.photoUrl;
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setProfilePhoto(response.data.photoUrl);
      Alert.alert('Succès', 'Photo de profil mise à jour');
    }
  } catch (error) {
    Alert.alert('Erreur', 'Impossible de télécharger la photo');
  }
};

// 6. Remplacer les fonctions actuelles dans profile.tsx
// handleTakePhoto() et handleChooseFromGallery() sont déjà appelées dans le modal
```

#### 3. Supprimer photo de profil
```typescript
DELETE /api/v1/users/me/photo
Headers: { Authorization: "Bearer <token>" }
Response: {
  message: "Photo deleted successfully",
  user: {
    id: string;
    profilePhoto: null;
  }
}
```

**Logique métier**:
- Supprimer la photo du storage (S3/Firebase)
- Mettre `user.profilePhoto = null` en base
- Retourner succès

#### 4. Changer le mot de passe
```typescript
PUT /api/v1/users/me/password
Headers: { Authorization: "Bearer <token>" }
Body: {
  currentPassword: string;
  newPassword: string;
}
Response: {
  message: "Password updated successfully"
}
```

**Logique métier**:
- Vérifier que `currentPassword` est correct (bcrypt.compare)
- Valider `newPassword` (min 8 caractères, 1 majuscule, 1 chiffre)
- Hasher le nouveau mot de passe (bcrypt.hash)
- Mettre à jour en base
- Optionnel : invalider tous les tokens existants (forcer reconnexion)

#### 5. Obtenir les préférences utilisateur
```typescript
GET /api/v1/users/me/preferences
Headers: { Authorization: "Bearer <token>" }
Response: {
  currency: string; // "EUR" | "USD" | "GBP"
  language: string; // "Français" | "English" | "Español"
  theme: string; // "Sombre" | "Clair" | "Automatique"
  notifications: {
    push: boolean;
    email: boolean;
    budgetAlerts: boolean;
    goalReminders: boolean;
  }
}
```

#### 6. Mettre à jour les préférences
```typescript
PUT /api/v1/users/me/preferences
Headers: { Authorization: "Bearer <token>" }
Body: {
  currency?: string;
  language?: string;
  theme?: string;
  notifications?: {
    push?: boolean;
    email?: boolean;
    budgetAlerts?: boolean;
    goalReminders?: boolean;
  }
}
Response: {
  preferences: { currency, language, theme, notifications }
}
```

---

## 💳 Comptes (Accounts)

### ⚠️ Frontend À Implémenter
- **Fonctionnalités**: Gérer plusieurs comptes (Compte courant, Épargne, etc.)

### 🔌 Endpoints Backend Requis

#### 1. Lister les comptes
```typescript
GET /api/v1/accounts
Headers: { Authorization: "Bearer <token>" }
Response: {
  accounts: [
    {
      id: string;
      name: string;
      balance: number;
      currency: string;
      isDefault: boolean;
    }
  ]
}
```

#### 2. Créer un compte
```typescript
POST /api/v1/accounts
Headers: { Authorization: "Bearer <token>" }
Body: {
  name: string;
  initialBalance?: number;
}
Response: {
  account: { id, name, balance, currency }
}
```

#### 3. Transférer entre comptes
```typescript
POST /api/v1/accounts/transfer
Headers: { Authorization: "Bearer <token>" }
Body: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}
Response: {
  message: "Transfer successful",
  fromAccount: { id, balance },
  toAccount: { id, balance }
}
```

---

## 🔄 Synchronisation & Refresh

### ✅ Frontend Implémenté
- **Pull-to-refresh** sur toutes les pages
- **RefreshControl** configuré

### 🔌 Actions Backend

Toutes les pages utilisent `pull-to-refresh` qui doit :
1. Recharger les données depuis l'API
2. Mettre à jour le state local
3. Afficher un indicateur de chargement

**Implémentation recommandée** :
```typescript
// Dans chaque page
const onRefresh = async () => {
  setRefreshing(true);
  try {
    // Appeler l'API correspondante
    const data = await api.get('/endpoint');
    // Mettre à jour le state
    setData(data);
  } catch (error) {
    Alert.alert('Erreur', 'Impossible de charger les données');
  } finally {
    setRefreshing(false);
  }
};
```

---

## 📱 Service API Frontend

### ✅ Configuration Actuelle
- **Fichier**: `mobile/src/services/api.ts`
- **Base URL**: Configurée via `.env` (`EXPO_PUBLIC_API_URL`)

### 🔧 À Configurer

```typescript
// mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
# ou en production
EXPO_PUBLIC_API_URL=https://api.growup.com/api/v1
```

### 📦 Structure Recommandée

```typescript
// mobile/src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré, rediriger vers login
      AsyncStorage.removeItem('token');
      // Navigation vers login
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔒 Sécurité Backend

### Middleware Requis

#### 1. Authentification JWT
```typescript
// backend/src/middleware/auth.ts
export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### 2. Validation des données
```typescript
// Utiliser Zod ou Joi
import { z } from 'zod';

const createGoalSchema = z.object({
  title: z.string().min(1).max(100),
  targetAmount: z.number().positive(),
  deadline: z.string().datetime().optional(),
  category: z.string(),
  icon: z.string(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
});
```

#### 3. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max
});

app.use('/api/', limiter);
```

---

## 📊 Modèles de Données Backend

### User
```typescript
{
  id: string;
  email: string;
  password: string; // hashé avec bcrypt
  name: string;
  country?: string;
  currency: string; // default: "EUR" | Devises supportées: EUR, USD, GBP, CHF, XOF, XAF, MAD, TND, ZAR, NGN, GHS, KES
  language: string; // default: "Français" | "English" | "Español"
  theme: string; // default: "Sombre" | "Clair" | "Automatique"
  profilePhoto?: string; // URL complète (S3/Firebase Storage)
  notifications: {
    push: boolean; // default: true
    email: boolean; // default: true
    budgetAlerts: boolean; // default: true
    goalReminders: boolean; // default: true
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Goal
```typescript
{
  id: string;
  userId: string; // FK -> User
  title: string;
  targetAmount: number;
  currentAmount: number; // default: 0
  deadline?: Date;
  priority: number;
  isAchieved: boolean; // default: false
  icon: string;
  color: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Transaction
```typescript
{
  id: string;
  userId: string; // FK -> User
  accountId?: string; // FK -> Account
  type: "income" | "expense";
  category: string;
  amount: number;
  date: Date;
  note?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Account
```typescript
{
  id: string;
  userId: string; // FK -> User
  name: string;
  balance: number; // default: 0
  currency: string;
  isDefault: boolean; // default: false
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification
```typescript
{
  id: string;
  userId: string; // FK -> User
  title: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
  isRead: boolean; // default: false
  createdAt: Date;
}
```

---

## 🚀 Ordre de Développement Backend Recommandé

### Phase 1 : Authentification (Priorité Haute)
1. ✅ Setup Express + TypeScript
2. ✅ Configuration base de données (PostgreSQL + Prisma)
3. ✅ Modèle User
4. ✅ Endpoints auth (register, login)
5. ✅ Middleware JWT
6. ✅ Endpoint GET /users/me

### Phase 2 : Transactions (Priorité Haute)
1. ✅ Modèle Transaction
2. ✅ Modèle Account (créer compte par défaut à l'inscription)
3. ✅ CRUD Transactions
4. ✅ Logique de mise à jour du solde
5. ✅ Filtres et recherche

### Phase 3 : Objectifs (Priorité Moyenne)
1. ✅ Modèle Goal
2. ✅ CRUD Goals
3. ✅ Endpoint allocation d'argent
4. ✅ Logique isAchieved

### Phase 4 : Statistiques (Priorité Moyenne)
1. ✅ Endpoint stats/summary
2. ✅ Endpoint stats/monthly
3. ✅ Endpoint stats/trends
4. ✅ Calculs agrégés

### Phase 5 : Notifications (Priorité Basse)
1. ✅ Modèle Notification
2. ✅ CRUD Notifications
3. ✅ Firebase Cloud Messaging
4. ✅ Notifications automatiques (budget dépassé, objectif atteint)

### Phase 6 : Profil & Comptes (Priorité Basse)
1. ✅ Mettre à jour profil (nom, devise, langue)
2. ✅ Upload photo profil (avec redimensionnement)
3. ✅ Supprimer photo profil
4. ✅ Changer mot de passe
5. ✅ Préférences utilisateur (thème, notifications)
6. ✅ Gestion multi-comptes
7. ✅ Transferts entre comptes

---

## 📝 Notes Importantes

### Catégories Prédéfinies

**Dépenses** :
- Nourriture (icon: food, color: #F44336)
- Logement (icon: home, color: #FF9800)
- Transport (icon: car, color: #2196F3)
- Shopping (icon: shopping, color: #E91E63)
- Santé (icon: heart, color: #4CAF50)
- Loisirs (icon: gamepad-variant, color: #9C27B0)

**Revenus** :
- Salaire (icon: cash, color: #10B981)
- Freelance (icon: briefcase, color: #733fea)
- Investissement (icon: chart-line, color: #98e0f8)
- Cadeau (icon: gift, color: #FFC107)
- Autre (icon: dots-horizontal, color: #607D8B)

### Catégories d'Objectifs
- Épargne (icon: piggy-bank)
- Voyage (icon: beach)
- Technologie (icon: laptop)
- Véhicule (icon: car)
- Immobilier (icon: home)
- Sécurité (icon: shield-check)
- Cadeau (icon: gift)
- Éducation (icon: school)

### Devises Supportées (12 devises)
```typescript
const currencies = {
  // Devises Européennes
  'EUR': { name: 'Euro', symbol: '€', region: 'Europe' },
  'GBP': { name: 'Livre Sterling', symbol: '£', region: 'Royaume-Uni' },
  'CHF': { name: 'Franc Suisse', symbol: 'CHF', region: 'Suisse' },
  
  // Devise Américaine
  'USD': { name: 'Dollar US', symbol: '$', region: 'États-Unis' },
  
  // Devises Africaines
  'XOF': { name: 'Franc CFA (BCEAO)', symbol: 'CFA', region: 'Afrique de l\'Ouest' },
  'XAF': { name: 'Franc CFA (BEAC)', symbol: 'FCFA', region: 'Afrique Centrale' },
  'MAD': { name: 'Dirham Marocain', symbol: 'DH', region: 'Maroc' },
  'TND': { name: 'Dinar Tunisien', symbol: 'DT', region: 'Tunisie' },
  'ZAR': { name: 'Rand Sud-Africain', symbol: 'R', region: 'Afrique du Sud' },
  'NGN': { name: 'Naira Nigérian', symbol: '₦', region: 'Nigeria' },
  'GHS': { name: 'Cedi Ghanéen', symbol: '₵', region: 'Ghana' },
  'KES': { name: 'Shilling Kenyan', symbol: 'KSh', region: 'Kenya' },
};
```

**Note Backend**: 
- Stocker uniquement le code devise (ex: "EUR", "XOF")
- Le frontend gère l'affichage du nom et symbole
- Valider que la devise existe dans la liste lors de la mise à jour du profil

### Couleurs Disponibles
```typescript
const colors = [
  '#733fea', // Violet principal
  '#98e0f8', // Bleu clair
  '#10B981', // Vert
  '#F44336', // Rouge
  '#FFC107', // Jaune
  '#FF6B6B', // Rouge clair
  '#4ECDC4', // Turquoise
  '#95E1D3'  // Vert menthe
];
```

---

## ✅ Checklist Finale

Avant de considérer le backend comme complet :

- [ ] Tous les endpoints listés sont implémentés
- [ ] Validation des données avec Zod/Joi
- [ ] Middleware d'authentification JWT
- [ ] Rate limiting configuré
- [ ] Gestion des erreurs cohérente
- [ ] Logs pour debugging
- [ ] Tests unitaires (Jest)
- [ ] Tests d'intégration (Supertest)
- [ ] Documentation API (Swagger/OpenAPI)
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée (Prisma)
- [ ] CORS configuré correctement
- [ ] Helmet pour la sécurité
- [ ] Compression des réponses
- [ ] Pagination sur les listes
- [ ] Soft delete pour les données importantes

---

---

## 🌍 Pays Supportés et Configuration Automatique

### Liste Complète des Pays

Le frontend envoie automatiquement le code pays, la devise et la langue lors de l'inscription. Le backend doit valider et stocker ces informations.

#### Afrique de l'Ouest (Zone Franc CFA BCEAO - XOF)
```typescript
{ code: 'BF', name: 'Burkina Faso', currency: 'XOF', language: 'Français' }
{ code: 'SN', name: 'Sénégal', currency: 'XOF', language: 'Français' }
{ code: 'CI', name: 'Côte d\'Ivoire', currency: 'XOF', language: 'Français' }
{ code: 'BJ', name: 'Bénin', currency: 'XOF', language: 'Français' }
{ code: 'ML', name: 'Mali', currency: 'XOF', language: 'Français' }
{ code: 'NE', name: 'Niger', currency: 'XOF', language: 'Français' }
{ code: 'TG', name: 'Togo', currency: 'XOF', language: 'Français' }
{ code: 'GW', name: 'Guinée-Bissau', currency: 'XOF', language: 'Français' }
```

#### Afrique Centrale (Zone Franc CFA BEAC - XAF)
```typescript
{ code: 'CM', name: 'Cameroun', currency: 'XAF', language: 'Français' }
{ code: 'GA', name: 'Gabon', currency: 'XAF', language: 'Français' }
{ code: 'CG', name: 'Congo', currency: 'XAF', language: 'Français' }
{ code: 'CF', name: 'Centrafrique', currency: 'XAF', language: 'Français' }
{ code: 'TD', name: 'Tchad', currency: 'XAF', language: 'Français' }
{ code: 'GQ', name: 'Guinée Équatoriale', currency: 'XAF', language: 'Español' }
```

#### Afrique du Nord
```typescript
{ code: 'MA', name: 'Maroc', currency: 'MAD', language: 'Français' }
{ code: 'TN', name: 'Tunisie', currency: 'TND', language: 'Français' }
{ code: 'DZ', name: 'Algérie', currency: 'EUR', language: 'Français' }
```

#### Afrique Australe et de l'Est
```typescript
{ code: 'ZA', name: 'Afrique du Sud', currency: 'ZAR', language: 'English' }
{ code: 'NG', name: 'Nigeria', currency: 'NGN', language: 'English' }
{ code: 'GH', name: 'Ghana', currency: 'GHS', language: 'English' }
{ code: 'KE', name: 'Kenya', currency: 'KES', language: 'English' }
{ code: 'UG', name: 'Ouganda', currency: 'USD', language: 'English' }
{ code: 'TZ', name: 'Tanzanie', currency: 'USD', language: 'English' }
{ code: 'RW', name: 'Rwanda', currency: 'USD', language: 'English' }
```

#### Europe
```typescript
{ code: 'FR', name: 'France', currency: 'EUR', language: 'Français' }
{ code: 'BE', name: 'Belgique', currency: 'EUR', language: 'Français' }
{ code: 'CH', name: 'Suisse', currency: 'CHF', language: 'Français' }
{ code: 'LU', name: 'Luxembourg', currency: 'EUR', language: 'Français' }
{ code: 'GB', name: 'Royaume-Uni', currency: 'GBP', language: 'English' }
{ code: 'DE', name: 'Allemagne', currency: 'EUR', language: 'English' }
{ code: 'ES', name: 'Espagne', currency: 'EUR', language: 'Español' }
{ code: 'IT', name: 'Italie', currency: 'EUR', language: 'English' }
{ code: 'PT', name: 'Portugal', currency: 'EUR', language: 'English' }
```

#### Amérique
```typescript
{ code: 'US', name: 'États-Unis', currency: 'USD', language: 'English' }
{ code: 'CA', name: 'Canada', currency: 'USD', language: 'English' }
```

### Validation Backend

Le backend doit valider que :
1. Le code pays existe dans la liste ci-dessus
2. La devise correspond au pays (ou utiliser la devise par défaut du pays)
3. La langue correspond au pays (ou utiliser la langue par défaut du pays)

### Modèle de Données Backend

```typescript
// Table: users
{
  id: string;
  email: string;
  password: string; // hashé
  name: string;
  country: string; // Code ISO (ex: "BF", "FR", "US")
  currency: string; // Devise (ex: "XOF", "EUR", "USD")
  language: string; // Langue (ex: "Français", "English", "Español")
  createdAt: Date;
  updatedAt: Date;
}

// Table: accounts (créé automatiquement à l'inscription)
{
  id: string;
  userId: string; // FK -> users.id
  name: string; // "Compte principal"
  balance: number; // 0 par défaut
  currency: string; // Même devise que l'utilisateur
  isDefault: boolean; // true
  createdAt: Date;
  updatedAt: Date;
}
```

### Exemple de Flux d'Inscription

**1. Frontend envoie** :
```json
{
  "name": "Jean Ouédraogo",
  "email": "jean@example.com",
  "password": "password123",
  "country": "BF",
  "currency": "XOF",
  "language": "Français"
}
```

**2. Backend traite** :
- Valide que "BF" (Burkina Faso) existe
- Valide que "XOF" est la devise correcte pour le Burkina Faso
- Hash le mot de passe
- Crée l'utilisateur avec `country: "BF"`, `currency: "XOF"`, `language: "Français"`
- Crée un compte par défaut avec `currency: "XOF"`, `balance: 0`
- Génère un token JWT

**3. Backend répond** :
```json
{
  "user": {
    "id": "uuid",
    "name": "Jean Ouédraogo",
    "email": "jean@example.com",
    "country": "BF",
    "currency": "XOF",
    "language": "Français"
  },
  "token": "jwt_token"
}
```

### Notes Importantes

- **Franc CFA** : Il existe 2 francs CFA différents (XOF et XAF) avec la même valeur mais utilisés dans des zones différentes
- **Conversion de devises** : Le backend peut implémenter une API de conversion (ex: exchangerate-api.com) pour afficher les montants dans différentes devises
- **Symboles de devises** : Le frontend gère l'affichage des symboles (€, $, CFA, etc.)
- **Changement de pays** : L'utilisateur peut changer de devise dans les paramètres, mais le pays reste fixe après l'inscription

---

---

## 📱 Mode Offline et Synchronisation

### Vue d'ensemble

L'application **GrowUp fonctionne en mode offline**. Les données sont stockées localement et synchronisées avec le backend MongoDB lorsque la connexion est rétablie.

### Architecture Offline-First

```
┌─────────────────┐
│   Mobile App    │
│  (React Native) │
└────────┬────────┘
         │
         ├─── AsyncStorage (Cache local)
         │    └─── Transactions, Goals, User data
         │
         ├─── SQLite (Base locale - optionnel)
         │    └─── Données structurées
         │
         └─── API Service
              └─── Synchronisation avec MongoDB
```

### 1. Stockage Local (AsyncStorage)

**Données stockées localement** :
```typescript
// Structure des données offline
interface OfflineData {
  user: User;
  transactions: Transaction[];
  goals: Goal[];
  accounts: Account[];
  lastSync: string; // ISO timestamp
  pendingSync: {
    transactions: Transaction[];
    goals: Goal[];
    updates: any[];
  };
}
```

**Implémentation frontend** :
```typescript
// mobile/src/services/offline.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveOfflineTransaction(transaction: Transaction) {
  const pending = await AsyncStorage.getItem('pendingSync');
  const data = pending ? JSON.parse(pending) : { transactions: [], goals: [], updates: [] };
  
  data.transactions.push({
    ...transaction,
    _tempId: `temp_${Date.now()}`, // ID temporaire
    _offline: true,
    _createdAt: new Date().toISOString()
  });
  
  await AsyncStorage.setItem('pendingSync', JSON.stringify(data));
}

export async function syncWithBackend() {
  const pending = await AsyncStorage.getItem('pendingSync');
  if (!pending) return;
  
  const data = JSON.parse(pending);
  
  // Synchroniser les transactions
  for (const transaction of data.transactions) {
    try {
      const response = await api.post('/transactions', transaction);
      // Remplacer l'ID temporaire par l'ID réel
      await updateLocalTransaction(transaction._tempId, response.data.id);
    } catch (error) {
      console.error('Erreur de sync:', error);
    }
  }
  
  // Vider les données en attente
  await AsyncStorage.setItem('pendingSync', JSON.stringify({ 
    transactions: [], 
    goals: [], 
    updates: [] 
  }));
  
  // Mettre à jour le timestamp
  await AsyncStorage.setItem('lastSync', new Date().toISOString());
}
```

### 2. Détection de la Connexion

```typescript
// mobile/src/services/network.ts
import NetInfo from '@react-native-community/netinfo';

export function setupNetworkListener() {
  return NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      // Connexion rétablie, synchroniser
      syncWithBackend();
    }
  });
}

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected && state.isInternetReachable;
}
```

### 3. Backend MongoDB - Gestion de la Synchronisation

#### Endpoint de synchronisation
```typescript
POST /api/v1/sync
Headers: { Authorization: "Bearer <token>" }
Body: {
  lastSync: string; // ISO timestamp de la dernière sync
  pendingData: {
    transactions: Transaction[];
    goals: Goal[];
    updates: any[];
  }
}
Response: {
  success: boolean;
  synced: {
    transactions: number;
    goals: number;
    updates: number;
  };
  serverData: {
    transactions: Transaction[]; // Nouvelles transactions depuis lastSync
    goals: Goal[];
    notifications: Notification[];
  };
  conflicts: Conflict[]; // Conflits à résoudre
}
```

**Implémentation MongoDB** :
```javascript
// backend/src/controllers/syncController.js
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');

exports.syncData = async (req, res) => {
  try {
    const { lastSync, pendingData } = req.body;
    const userId = req.user.id;
    
    const synced = {
      transactions: 0,
      goals: 0,
      updates: 0
    };
    
    // 1. Sauvegarder les données en attente
    for (const transaction of pendingData.transactions) {
      const newTransaction = new Transaction({
        ...transaction,
        userId,
        _tempId: transaction._tempId, // Garder l'ID temporaire pour mapping
        syncedAt: new Date()
      });
      await newTransaction.save();
      synced.transactions++;
    }
    
    for (const goal of pendingData.goals) {
      const newGoal = new Goal({
        ...goal,
        userId,
        _tempId: goal._tempId,
        syncedAt: new Date()
      });
      await newGoal.save();
      synced.goals++;
    }
    
    // 2. Récupérer les données du serveur depuis lastSync
    const lastSyncDate = new Date(lastSync);
    
    const serverTransactions = await Transaction.find({
      userId,
      updatedAt: { $gt: lastSyncDate }
    }).sort({ createdAt: -1 });
    
    const serverGoals = await Goal.find({
      userId,
      updatedAt: { $gt: lastSyncDate }
    });
    
    const serverNotifications = await Notification.find({
      userId,
      createdAt: { $gt: lastSyncDate }
    }).sort({ createdAt: -1 });
    
    // 3. Détecter les conflits
    const conflicts = await detectConflicts(userId, pendingData, lastSyncDate);
    
    res.json({
      success: true,
      synced,
      serverData: {
        transactions: serverTransactions,
        goals: serverGoals,
        notifications: serverNotifications
      },
      conflicts
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Détection de conflits
async function detectConflicts(userId, pendingData, lastSync) {
  const conflicts = [];
  
  // Vérifier si des données ont été modifiées sur le serveur
  // pendant que l'utilisateur était offline
  for (const transaction of pendingData.updates) {
    const serverVersion = await Transaction.findOne({
      _id: transaction.id,
      userId,
      updatedAt: { $gt: lastSync }
    });
    
    if (serverVersion) {
      conflicts.push({
        type: 'transaction',
        id: transaction.id,
        clientVersion: transaction,
        serverVersion,
        resolution: 'manual' // ou 'server-wins', 'client-wins'
      });
    }
  }
  
  return conflicts;
}
```

### 4. Modèles MongoDB

#### Transaction Model
```javascript
// backend/src/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  note: String,
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  _tempId: String, // ID temporaire pour mapping offline
  _offline: {
    type: Boolean,
    default: false
  },
  syncedAt: Date
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index composé pour les requêtes fréquentes
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
```

#### Goal Model
```javascript
// backend/src/models/Goal.js
const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  deadline: Date,
  priority: {
    type: Number,
    default: 0
  },
  isAchieved: {
    type: Boolean,
    default: false
  },
  icon: String,
  color: String,
  category: String,
  _tempId: String,
  _offline: {
    type: Boolean,
    default: false
  },
  syncedAt: Date
}, {
  timestamps: true
});

goalSchema.index({ userId: 1, isAchieved: 1 });

module.exports = mongoose.model('Goal', goalSchema);
```

#### User Model
```javascript
// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'EUR'
  },
  language: {
    type: String,
    default: 'Français'
  },
  profilePhoto: String,
  pushToken: String, // Token pour les notifications push
  pushPlatform: {
    type: String,
    enum: ['ios', 'android']
  },
  lastSync: Date,
  preferences: {
    notifications: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      goalReminders: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['Sombre', 'Clair', 'Automatique'],
      default: 'Sombre'
    }
  }
}, {
  timestamps: true
});

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### 5. Stratégie de Résolution de Conflits

**Règles de résolution** :
1. **Server-wins** : Pour les données critiques (solde, objectifs atteints)
2. **Client-wins** : Pour les nouvelles créations offline
3. **Merge** : Pour les modifications non conflictuelles
4. **Manual** : Demander à l'utilisateur en cas de conflit majeur

```javascript
// backend/src/utils/conflictResolver.js
exports.resolveConflict = (clientData, serverData, strategy = 'server-wins') => {
  switch (strategy) {
    case 'server-wins':
      return serverData;
    
    case 'client-wins':
      return clientData;
    
    case 'merge':
      return {
        ...serverData,
        ...clientData,
        updatedAt: new Date()
      };
    
    default:
      return serverData;
  }
};
```

### 6. Notifications Push avec MongoDB

```javascript
// backend/src/services/pushNotifications.js
const admin = require('firebase-admin');
const User = require('../models/User');

// Envoyer une notification push
exports.sendPushNotification = async (userId, notification) => {
  const user = await User.findById(userId);
  
  if (!user || !user.pushToken) {
    return { success: false, reason: 'No push token' };
  }
  
  const message = {
    token: user.pushToken,
    notification: {
      title: `💰 ${notification.title}`,
      body: notification.body,
    },
    data: {
      screen: 'notifications',
      app: 'growup',
      notificationId: notification.id
    },
    android: {
      priority: 'high',
      notification: {
        channelId: notification.type === 'important' ? 'growup-important' : 'growup-default',
        color: '#733fea',
        icon: 'notification_icon',
        sound: 'default'
      }
    },
    apns: {
      payload: {
        aps: {
          badge: await getUnreadCount(userId),
          sound: 'default'
        }
      }
    }
  };
  
  try {
    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Erreur push notification:', error);
    return { success: false, error: error.message };
  }
};
```

### 7. Configuration MongoDB

**Connection String** :
```javascript
// backend/src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**Variables d'environnement** :
```env
# backend/.env
MONGODB_URI=mongodb://localhost:27017/growup
# ou MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/growup?retryWrites=true&w=majority

JWT_SECRET=your_jwt_secret_key_here
PORT=4000
NODE_ENV=development

# Firebase Admin SDK (pour push notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

### 8. Checklist Offline-First

- [ ] AsyncStorage configuré pour le cache local
- [ ] Détection de connexion avec NetInfo
- [ ] Endpoint `/sync` implémenté
- [ ] Gestion des IDs temporaires
- [ ] Résolution de conflits
- [ ] Notifications push configurées
- [ ] Modèles MongoDB avec timestamps
- [ ] Index MongoDB optimisés
- [ ] Tests de synchronisation
- [ ] Gestion des erreurs réseau

---

**Dernière mise à jour** : 9 novembre 2025  
**Version Frontend** : 1.0.0  
**Backend** : MongoDB + Mongoose  
**Status** : Frontend complet, Backend MongoDB à implémenter
