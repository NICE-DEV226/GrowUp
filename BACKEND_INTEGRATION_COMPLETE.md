# 🔗 Intégration Backend Complète

## Modifications Effectuées

### 1. ✅ Page Sécurité - Intégration Backend

#### Changement de Mot de Passe
**Endpoint** : `PUT /users/me/password`

**Requête** :
```typescript
await api.put('/users/me/password', {
  currentPassword: string,
  newPassword: string
});
```

**Fonctionnement** :
1. Validation côté frontend (format, correspondance)
2. Envoi au backend pour vérification du mot de passe actuel
3. Backend hash le nouveau mot de passe et le sauvegarde
4. Mise à jour locale dans AsyncStorage
5. Affichage du succès

**Gestion d'erreurs** :
- Status 401 : Mot de passe actuel incorrect
- Autres erreurs : Message d'erreur du backend

#### Authentification Biométrique
**Endpoint** : `PUT /users/me/biometric`

**Requête** :
```typescript
await api.put('/users/me/biometric', {
  enabled: boolean
});
```

**Fonctionnement** :
1. Vérification de la disponibilité biométrique
2. Authentification biométrique native (Face ID / Empreinte)
3. Envoi de l'état au backend
4. Sauvegarde locale dans AsyncStorage
5. Confirmation à l'utilisateur

### 2. ✅ Langues - Intégration Backend

**Endpoint** : `PUT /users/me`

**Requête** :
```typescript
await api.put('/users/me', {
  language: string // "Français" | "English" | "Español"
});
```

**Langues supportées** :
- 🇫🇷 Français
- 🇬🇧 English
- 🇪🇸 Español

**Fonctionnement** :
1. Sélection de la langue dans le modal
2. Mise à jour du store global Zustand
3. Envoi au backend
4. Sauvegarde dans AsyncStorage
5. Confirmation à l'utilisateur

**Gestion d'erreurs** :
- Affichage d'une alerte en cas d'échec
- La langue reste inchangée si l'appel échoue

### 3. ✅ Thèmes - Intégration Backend

**Endpoint** : `PUT /users/me`

**Requête** :
```typescript
await api.put('/users/me', {
  theme: string // "Sombre" | "Clair" | "Automatique"
});
```

**Thèmes supportés** :
- 🌙 Sombre (par défaut)
- ☀️ Clair
- 🔄 Automatique (suit le système)

**Fonctionnement** :
1. Sélection du thème dans le modal
2. Mise à jour du store global Zustand
3. Envoi au backend
4. Sauvegarde dans AsyncStorage
5. Confirmation à l'utilisateur

**Gestion d'erreurs** :
- Affichage d'une alerte en cas d'échec
- Le thème reste inchangé si l'appel échoue

## Structure des Appels API

### Service API
**Fichier** : `mobile/src/services/api.ts`

Tous les appels utilisent l'instance axios configurée avec :
- Base URL depuis `.env`
- Token JWT automatique dans les headers
- Gestion des erreurs 401 (redirection login)

### Endpoints Backend Requis

#### 1. Changement de Mot de Passe
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
Errors:
  - 401: Current password incorrect
  - 400: Invalid password format
```

#### 2. Authentification Biométrique
```typescript
PUT /api/v1/users/me/biometric
Headers: { Authorization: "Bearer <token>" }
Body: {
  enabled: boolean;
}
Response: {
  message: "Biometric setting updated",
  biometricEnabled: boolean
}
```

#### 3. Mise à Jour Profil (Langue/Thème)
```typescript
PUT /api/v1/users/me
Headers: { Authorization: "Bearer <token>" }
Body: {
  language?: string;
  theme?: string;
  // Autres champs optionnels
}
Response: {
  user: {
    id: string;
    name: string;
    email: string;
    language: string;
    theme: string;
    // ...
  }
}
```

## Flux de Données

### Changement de Mot de Passe
```
┌─────────────┐
│   Frontend  │
│  (Security) │
└──────┬──────┘
       │ 1. Validation
       │ 2. PUT /users/me/password
       ▼
┌─────────────┐
│   Backend   │
│  (Node.js)  │
└──────┬──────┘
       │ 3. Vérifier mot de passe actuel
       │ 4. Hash nouveau mot de passe
       │ 5. Sauvegarder en DB
       ▼
┌─────────────┐
│   MongoDB   │
└─────────────┘
       │ 6. Confirmation
       ▼
┌─────────────┐
│   Frontend  │
│ AsyncStorage│
└─────────────┘
```

### Changement de Langue/Thème
```
┌─────────────┐
│   Frontend  │
│  (Profile)  │
└──────┬──────┘
       │ 1. Sélection
       │ 2. Zustand Store
       │ 3. PUT /users/me
       ▼
┌─────────────┐
│   Backend   │
│  (Node.js)  │
└──────┬──────┘
       │ 4. Validation
       │ 5. Sauvegarder en DB
       ▼
┌─────────────┐
│   MongoDB   │
└─────────────┘
       │ 6. Confirmation
       ▼
┌─────────────┐
│   Frontend  │
│ AsyncStorage│
└─────────────┘
```

## Stockage Local (AsyncStorage)

### Clés utilisées :
```typescript
{
  "user": {
    "id": "123",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "password": "HashedPassword123", // En production: hashé
    "language": "Français",
    "theme": "Sombre"
  },
  "biometricEnabled": true
}
```

## Gestion d'Erreurs

### Erreurs Réseau
```typescript
try {
  await api.put('/users/me/password', data);
} catch (error: any) {
  if (error.response?.status === 401) {
    Alert.alert('Erreur', 'Mot de passe actuel incorrect');
  } else if (error.response?.status === 400) {
    Alert.alert('Erreur', error.response.data.message);
  } else {
    Alert.alert('Erreur', 'Impossible de se connecter au serveur');
  }
}
```

### Fallback Local
Si le backend n'est pas disponible :
- Les données restent dans AsyncStorage
- L'utilisateur peut continuer à utiliser l'app
- Synchronisation automatique quand le backend revient

## Tests à Effectuer

### Changement de Mot de Passe
- [ ] Mot de passe actuel incorrect → Erreur 401
- [ ] Nouveau mot de passe trop court → Erreur validation
- [ ] Mots de passe ne correspondent pas → Erreur frontend
- [ ] Changement réussi → Confirmation + champs vidés

### Authentification Biométrique
- [ ] Appareil sans biométrie → Switch désactivé
- [ ] Activation avec authentification → Succès
- [ ] Annulation authentification → Pas de changement
- [ ] Désactivation → Confirmation

### Langues
- [ ] Changement de langue → Succès + confirmation
- [ ] Erreur backend → Alerte + langue inchangée
- [ ] Langue sauvegardée dans AsyncStorage

### Thèmes
- [ ] Changement de thème → Succès + confirmation
- [ ] Erreur backend → Alerte + thème inchangé
- [ ] Thème sauvegardé dans AsyncStorage

## Sécurité

### Production
- ⚠️ Hasher les mots de passe avec bcrypt (backend)
- ⚠️ Utiliser HTTPS uniquement
- ⚠️ Rate limiting sur les endpoints sensibles
- ⚠️ Validation stricte côté backend
- ⚠️ Logs d'audit pour changements de sécurité

### Actuellement
- ✅ Validation frontend complète
- ✅ Token JWT dans les headers
- ✅ Gestion d'erreurs appropriée
- ✅ Stockage sécurisé AsyncStorage

## Prochaines Étapes

1. **Backend** : Implémenter les endpoints
   - `/users/me/password`
   - `/users/me/biometric`
   - `/users/me` (PATCH pour langue/thème)

2. **Sécurité** : Hasher les mots de passe

3. **Notifications** : Email de confirmation après changement de mot de passe

4. **Thèmes** : Implémenter réellement les thèmes clair/sombre dans toute l'app

5. **i18n** : Implémenter la traduction complète de l'interface

---
**Date** : 10 novembre 2025  
**Status** : ✅ Intégration Frontend Complète  
**Backend** : En attente d'implémentation  
**Fichiers modifiés** :
- `mobile/app/(settings)/security.tsx`
- `mobile/app/(tabs)/profile.tsx`
