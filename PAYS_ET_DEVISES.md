# 🌍 Configuration des Pays et Devises - GrowUp

## ✅ Ce qui est déjà implémenté

### Frontend (Mobile)
- ✅ **40+ pays disponibles** dans le sélecteur lors de l'inscription
- ✅ **Burkina Faso** inclus avec devise XOF (Franc CFA) et langue Français
- ✅ Modal de sélection de pays avec recherche par région
- ✅ Envoi automatique de `country`, `currency` et `language` lors de l'inscription
- ✅ Affichage du drapeau, nom du pays, devise et langue

### Pays Africains Disponibles

#### Zone Franc CFA BCEAO (XOF)
- 🇧🇫 **Burkina Faso** - XOF - Français
- 🇸🇳 Sénégal - XOF - Français
- 🇨🇮 Côte d'Ivoire - XOF - Français
- 🇧🇯 Bénin - XOF - Français
- 🇲🇱 Mali - XOF - Français
- 🇳🇪 Niger - XOF - Français
- 🇹🇬 Togo - XOF - Français
- 🇬🇼 Guinée-Bissau - XOF - Français

#### Zone Franc CFA BEAC (XAF)
- 🇨🇲 Cameroun - XAF - Français
- 🇬🇦 Gabon - XAF - Français
- 🇨🇬 Congo - XAF - Français
- 🇨🇫 Centrafrique - XAF - Français
- 🇹🇩 Tchad - XAF - Français
- 🇬🇶 Guinée Équatoriale - XAF - Español

#### Afrique du Nord
- 🇲🇦 Maroc - MAD (Dirham) - Français
- 🇹🇳 Tunisie - TND (Dinar) - Français
- 🇩🇿 Algérie - EUR - Français

#### Afrique Australe et de l'Est
- 🇿🇦 Afrique du Sud - ZAR (Rand) - English
- 🇳🇬 Nigeria - NGN (Naira) - English
- 🇬🇭 Ghana - GHS (Cedi) - English
- 🇰🇪 Kenya - KES (Shilling) - English
- 🇺🇬 Ouganda - USD - English
- 🇹🇿 Tanzanie - USD - English
- 🇷🇼 Rwanda - USD - English

### Autres Régions
- 🇫🇷 France, 🇧🇪 Belgique, 🇨🇭 Suisse, 🇱🇺 Luxembourg (EUR/CHF)
- 🇬🇧 Royaume-Uni (GBP)
- 🇩🇪 Allemagne, 🇪🇸 Espagne, 🇮🇹 Italie, 🇵🇹 Portugal (EUR)
- 🇺🇸 États-Unis, 🇨🇦 Canada (USD)

## 🔧 Ce que le Backend doit faire

### 1. À l'inscription (POST /api/v1/auth/register)

**Recevoir** :
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

**Traiter** :
1. ✅ Valider que le code pays existe ("BF" pour Burkina Faso)
2. ✅ Valider que la devise correspond au pays (XOF pour Burkina Faso)
3. ✅ Hasher le mot de passe
4. ✅ Créer l'utilisateur avec ces informations
5. ✅ Créer un compte par défaut avec `currency: "XOF"` et `balance: 0`
6. ✅ Générer un token JWT

**Répondre** :
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

### 2. Structure de la Base de Données

#### Table `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- hashé avec bcrypt
  name VARCHAR(255) NOT NULL,
  country VARCHAR(2) NOT NULL, -- Code ISO (BF, FR, US, etc.)
  currency VARCHAR(3) NOT NULL, -- XOF, EUR, USD, etc.
  language VARCHAR(50) NOT NULL, -- Français, English, Español
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table `accounts` (créé automatiquement)
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) DEFAULT 'Compte principal',
  balance DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(3) NOT NULL, -- Même devise que l'utilisateur
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Validation Backend (Exemple avec Zod)

```typescript
import { z } from 'zod';

const VALID_COUNTRIES = [
  'BF', 'SN', 'CI', 'BJ', 'ML', 'NE', 'TG', 'GW', // Zone XOF
  'CM', 'GA', 'CG', 'CF', 'TD', 'GQ', // Zone XAF
  'MA', 'TN', 'DZ', // Afrique du Nord
  'ZA', 'NG', 'GH', 'KE', 'UG', 'TZ', 'RW', // Afrique Australe/Est
  'FR', 'BE', 'CH', 'LU', 'GB', 'DE', 'ES', 'IT', 'PT', // Europe
  'US', 'CA' // Amérique
];

const VALID_CURRENCIES = [
  'XOF', 'XAF', 'MAD', 'TND', 'ZAR', 'NGN', 'GHS', 'KES',
  'EUR', 'GBP', 'CHF', 'USD'
];

const registerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(6),
  country: z.enum(VALID_COUNTRIES),
  currency: z.enum(VALID_CURRENCIES),
  language: z.enum(['Français', 'English', 'Español']),
});
```

### 4. Logique de Création de Compte

```typescript
// Après création de l'utilisateur
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    country,
    currency,
    language,
  },
});

// Créer automatiquement un compte par défaut
await prisma.account.create({
  data: {
    userId: user.id,
    name: 'Compte principal',
    balance: 0,
    currency: user.currency, // Utiliser la devise de l'utilisateur
    isDefault: true,
  },
});
```

## 📊 Devises Supportées

| Code | Nom | Symbole | Pays |
|------|-----|---------|------|
| XOF | Franc CFA (BCEAO) | CFA | Burkina Faso, Sénégal, Côte d'Ivoire, etc. |
| XAF | Franc CFA (BEAC) | FCFA | Cameroun, Gabon, Congo, etc. |
| MAD | Dirham Marocain | DH | Maroc |
| TND | Dinar Tunisien | DT | Tunisie |
| ZAR | Rand Sud-Africain | R | Afrique du Sud |
| NGN | Naira Nigérian | ₦ | Nigeria |
| GHS | Cedi Ghanéen | ₵ | Ghana |
| KES | Shilling Kenyan | KSh | Kenya |
| EUR | Euro | € | France, Belgique, Allemagne, etc. |
| GBP | Livre Sterling | £ | Royaume-Uni |
| CHF | Franc Suisse | CHF | Suisse |
| USD | Dollar US | $ | États-Unis, Canada |

## 🔄 Changement de Devise

L'utilisateur peut changer sa devise dans les paramètres du profil :

**Frontend** : `mobile/app/(tabs)/profile.tsx`
- Modal avec 12 devises disponibles
- Envoi de la nouvelle devise au backend

**Backend** : `PUT /api/v1/users/me`
```json
{
  "currency": "EUR"
}
```

**Note** : Le pays reste fixe après l'inscription, seule la devise peut être changée.

## ✅ Checklist Backend

- [ ] Créer la table `users` avec les champs `country`, `currency`, `language`
- [ ] Créer la table `accounts` avec le champ `currency`
- [ ] Implémenter l'endpoint `POST /api/v1/auth/register` avec validation
- [ ] Créer automatiquement un compte par défaut à l'inscription
- [ ] Valider que le code pays existe
- [ ] Valider que la devise correspond au pays
- [ ] Implémenter `PUT /api/v1/users/me` pour changer la devise
- [ ] Tester l'inscription avec un utilisateur du Burkina Faso (BF, XOF, Français)

## 📝 Exemple de Test

```bash
# Inscription d'un utilisateur du Burkina Faso
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean Ouédraogo",
    "email": "jean@example.com",
    "password": "password123",
    "country": "BF",
    "currency": "XOF",
    "language": "Français"
  }'

# Réponse attendue
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

---

**Date** : 9 novembre 2025  
**Status** : Frontend ✅ Complet | Backend ⏳ À implémenter
