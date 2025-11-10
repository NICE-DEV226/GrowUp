# 🌍 Guide Complet de Traduction - GrowUp

## ✅ Pages Traduites

### 1. Profile (Complète)
- ✅ Titres des sections
- ✅ Menu items
- ✅ Boutons

### 2. Dashboard (Complète)
- ✅ Solde total
- ✅ Revenus / Dépenses
- ✅ Transactions récentes
- ✅ Mes objectifs
- ✅ Messages vides

## 📝 Comment Traduire une Page

### Étape 1 : Ajouter le Hook
```typescript
import { useTranslation } from '../../src/hooks/useTranslation';

export default function MyPage() {
  const { t } = useTranslation();
  // ...
}
```

### Étape 2 : Remplacer les Textes
```typescript
// Avant
<Text>Transactions</Text>

// Après
<Text>{t('transactions')}</Text>
```

### Étape 3 : Ajouter les Clés Manquantes
Si une clé n'existe pas dans `translations.ts`, ajoutez-la :
```typescript
export const translations = {
  fr: {
    myNewKey: 'Mon nouveau texte',
  },
  en: {
    myNewKey: 'My new text',
  },
  es: {
    myNewKey: 'Mi nuevo texto',
  }
};
```

## 🔄 Pages Restantes à Traduire

### Transactions Page
**Fichier** : `mobile/app/(tabs)/transactions.tsx`

**Textes à traduire** :
- "Toutes les transactions"
- "Filtrer"
- "Rechercher"
- "Ajouter une transaction"
- "Revenus totaux"
- "Dépenses totales"
- Catégories (Nourriture, Transport, etc.)

**Code** :
```typescript
import { useTranslation } from '../../src/hooks/useTranslation';

const { t } = useTranslation();

<Text>{t('allTransactions')}</Text>
<Text>{t('filter')}</Text>
<Text>{t('search')}</Text>
<Text>{t('addNewTransaction')}</Text>
```

### Goals Page
**Fichier** : `mobile/app/(tabs)/goals.tsx`

**Textes à traduire** :
- "Mes objectifs"
- "Créer un objectif"
- "Progression"
- "Allouer de l'argent"
- "Objectif atteint"

**Code** :
```typescript
<Text>{t('myGoals')}</Text>
<Text>{t('createGoal')}</Text>
<Text>{t('progress')}</Text>
<Text>{t('allocateMoney')}</Text>
<Text>{t('achieved')}</Text>
```

### Stats Page
**Fichier** : `mobile/app/(tabs)/stats.tsx`

**Textes à traduire** :
- "Statistiques"
- "Vue d'ensemble"
- "Revenus"
- "Dépenses"
- "Économies"

**Code** :
```typescript
<Text>{t('stats')}</Text>
<Text>{t('income')}</Text>
<Text>{t('expense')}</Text>
```

### Settings Pages

#### Security
**Fichier** : `mobile/app/(settings)/security.tsx`

**Textes à traduire** :
- "Sécurité"
- "Changer le mot de passe"
- "Mot de passe actuel"
- "Nouveau mot de passe"
- "Confirmer le mot de passe"
- "Authentification biométrique"

**Code** :
```typescript
<Text>{t('security')}</Text>
<Text>{t('changePassword')}</Text>
<Text>{t('currentPassword')}</Text>
<Text>{t('newPassword')}</Text>
<Text>{t('confirmPassword')}</Text>
<Text>{t('biometricAuth')}</Text>
```

#### Personal Info
**Fichier** : `mobile/app/(settings)/personal-info.tsx`

**Textes à traduire** :
- "Informations personnelles"
- "Membre depuis"
- "Transactions"
- "Objectifs"
- "Objectifs atteints"

**Code** :
```typescript
<Text>{t('personalInfo')}</Text>
<Text>{t('memberSince')}</Text>
<Text>{t('totalTransactions')}</Text>
<Text>{t('totalGoals')}</Text>
<Text>{t('achievedGoals')}</Text>
```

### Auth Pages

#### Login
**Fichier** : `mobile/app/(auth)/login.tsx`

**Textes à traduire** :
- "Connexion"
- "Email"
- "Mot de passe"
- "Mot de passe oublié ?"
- "Pas de compte ?"
- "Inscrivez-vous"

**Code** :
```typescript
<Text>{t('login')}</Text>
<Text>{t('email')}</Text>
<Text>{t('password')}</Text>
<Text>{t('forgotPassword')}</Text>
<Text>{t('dontHaveAccount')}</Text>
<Text>{t('signupNow')}</Text>
```

#### Signup
**Fichier** : `mobile/app/(auth)/signup.tsx`

**Textes à traduire** :
- "Inscription"
- "Nom"
- "Email"
- "Mot de passe"
- "Déjà un compte ?"
- "Connectez-vous"

**Code** :
```typescript
<Text>{t('signup')}</Text>
<Text>{t('name')}</Text>
<Text>{t('email')}</Text>
<Text>{t('password')}</Text>
<Text>{t('alreadyHaveAccount')}</Text>
<Text>{t('loginNow')}</Text>
```

## 🎯 Clés de Traduction Disponibles

Toutes les clés sont dans `mobile/src/i18n/translations.ts` :

### Navigation
- `dashboard`, `transactions`, `goals`, `stats`, `profile`

### Dashboard
- `totalBalance`, `monthlyIncome`, `monthlyExpense`
- `recentTransactions`, `myGoals`, `addTransaction`
- `viewAll`, `noTransactions`, `noTransactionsDesc`

### Transactions
- `allTransactions`, `income`, `expense`
- `filter`, `search`, `addNewTransaction`
- `amount`, `category`, `date`, `note`

### Goals
- `myGoals`, `createGoal`, `goalTitle`
- `targetAmount`, `currentAmount`, `deadline`
- `progress`, `allocateMoney`, `achieved`

### Profile
- `accountSettings`, `editProfile`, `personalInfo`
- `security`, `country`, `currency`, `language`, `theme`
- `preferences`, `notifications`, `backup`
- `support`, `helpSupport`, `privacy`, `terms`, `about`
- `logout`

### Auth
- `login`, `signup`, `email`, `password`, `name`
- `forgotPassword`, `dontHaveAccount`, `alreadyHaveAccount`
- `signupNow`, `loginNow`

### Settings
- `changePassword`, `currentPassword`, `newPassword`, `confirmPassword`
- `biometricAuth`, `memberSince`
- `totalTransactions`, `totalGoals`, `achievedGoals`

### Common
- `success`, `error`, `loading`
- `confirm`, `delete`, `edit`, `close`
- `save`, `cancel`, `yes`, `no`
- `welcome`, `getStarted`, `next`, `skip`, `back`, `done`

## 🚀 Script de Traduction Rapide

Pour traduire rapidement une page :

1. **Ouvrir le fichier**
2. **Ajouter l'import** :
   ```typescript
   import { useTranslation } from '../../src/hooks/useTranslation';
   ```

3. **Ajouter le hook** :
   ```typescript
   const { t } = useTranslation();
   ```

4. **Rechercher et remplacer** :
   - Chercher : `<Text>Texte en français</Text>`
   - Remplacer : `<Text>{t('key')}</Text>`

5. **Vérifier les diagnostics** :
   ```bash
   # Aucune erreur TypeScript
   ```

## 📊 Progression

- [x] Profile (100%)
- [x] Dashboard (100%)
- [ ] Transactions (0%)
- [ ] Goals (0%)
- [ ] Stats (0%)
- [ ] Security (0%)
- [ ] Personal Info (0%)
- [ ] Notifications (0%)
- [ ] Login (0%)
- [ ] Signup (0%)
- [ ] Onboarding (0%)

## 🎨 Test de Traduction

1. Lancer l'app
2. Aller dans Profile
3. Changer la langue en "English"
4. Naviguer dans l'app
5. Vérifier que les textes changent

**Résultat attendu** :
- Dashboard : "Dashboard", "Total Balance", "Income", "Expenses"
- Profile : "Account Settings", "Preferences", "Logout"

## 💡 Conseils

1. **Toujours utiliser `t()`** : Ne jamais mettre de texte en dur
2. **Clés descriptives** : Utiliser des clés claires (`totalBalance` au lieu de `tb`)
3. **Cohérence** : Utiliser les mêmes clés pour les mêmes textes
4. **Fallback** : Le système retourne le français si la clé n'existe pas
5. **TypeScript** : Les clés sont typées, l'autocomplétion fonctionne

## 🔧 Maintenance

### Ajouter une Nouvelle Langue

1. Ouvrir `mobile/src/i18n/translations.ts`
2. Ajouter la langue :
   ```typescript
   export const translations = {
     fr: { /* ... */ },
     en: { /* ... */ },
     es: { /* ... */ },
     de: { /* Allemand */ },
   };
   ```

3. Mettre à jour le type :
   ```typescript
   export type LanguageCode = 'fr' | 'en' | 'es' | 'de';
   ```

4. Ajouter dans le mapping :
   ```typescript
   const languageCode = 
     lang === 'Français' ? 'fr' :
     lang === 'English' ? 'en' :
     lang === 'Español' ? 'es' :
     lang === 'Deutsch' ? 'de' : 'fr';
   ```

---
**Date** : 10 novembre 2025  
**Status** : ✅ Système Complet - Dashboard et Profile Traduits  
**Langues** : Français, English, Español  
**Prochaine étape** : Traduire les pages restantes
