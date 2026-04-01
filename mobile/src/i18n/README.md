# Système de Traduction i18n

## Utilisation

### 1. Importer le hook useI18n

```typescript
import { useI18n } from '../../src/i18n';

export default function MyComponent() {
  const { t, language, setLanguage } = useI18n();
  
  return (
    <View>
      <Text>{t.dashboard.welcome}</Text>
      <Text>{t.common.save}</Text>
    </View>
  );
}
```

### 2. Accéder aux traductions

Les traductions sont organisées par catégories:

```typescript
// Common
t.common.save          // "Enregistrer" / "Save"
t.common.cancel        // "Annuler" / "Cancel"
t.common.delete        // "Supprimer" / "Delete"

// Dashboard
t.dashboard.welcome           // "Bienvenue" / "Welcome"
t.dashboard.totalBalance      // "Solde Total" / "Total Balance"
t.dashboard.recentTransactions // "Transactions récentes" / "Recent Transactions"

// Transactions
t.transactions.title    // "Transactions" / "Transactions"
t.transactions.add      // "Ajouter" / "Add"
t.transactions.income   // "Revenu" / "Income"

// Categories
t.categories.food       // "Alimentation" / "Food"
t.categories.transport  // "Transport" / "Transport"

// Empty States
t.emptyStates.noTransactions.title    // "Aucune transaction" / "No transactions"
t.emptyStates.noTransactions.subtitle // "Commencez à suivre vos dépenses" / "Start tracking your expenses"

// Toast Messages
t.toast.transactionAdded  // "Transaction ajoutée avec succès" / "Transaction added successfully"
t.toast.error            // "Une erreur est survenue" / "An error occurred"
```

### 3. Changer la langue

Le changement de langue est instantané et synchronisé avec le store d'authentification:

```typescript
import { useAuthStore } from '../../src/store/authStore';

const { setLanguage } = useAuthStore();

// Changer la langue (met à jour automatiquement useI18n)
setLanguage('English');  // ou 'Français'
```

### 4. Langues disponibles

- `Français` (par défaut)
- `English`

### 5. Ajouter une nouvelle traduction

1. Ajouter la clé dans `fr.ts`:
```typescript
export default {
  mySection: {
    myKey: 'Ma traduction en français',
  },
};
```

2. Ajouter la même clé dans `en.ts`:
```typescript
export default {
  mySection: {
    myKey: 'My English translation',
  },
};
```

3. Utiliser dans le composant:
```typescript
const { t } = useI18n();
<Text>{t.mySection.myKey}</Text>
```

## Architecture

- `index.ts` - Store Zustand pour la gestion de l'état i18n
- `fr.ts` - Traductions françaises
- `en.ts` - Traductions anglaises

Le système utilise Zustand pour un changement de langue instantané sans rechargement de l'application.
