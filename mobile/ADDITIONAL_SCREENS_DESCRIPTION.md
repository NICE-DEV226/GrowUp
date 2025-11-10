# 📱 Les Deux Écrans Supplémentaires Après le Splash

## 🔀 Flux de Navigation

```
[Splash Screen] (3s)
        ↓
   [Vérification]
        ↓
    ┌───┴───┐
    ↓       ↓
[Écran 1] [Écran 2]
```

---

## 🎯 ÉCRAN 1 : Welcome / Onboarding

### Quand il apparaît
- **Première utilisation** de l'application
- L'utilisateur n'a jamais vu l'onboarding
- Pas de compte créé

### Description Visuelle

```
╔═══════════════════════════════════════╗
║                                       ║
║         [Slide 1/3]                  ║
║                                       ║
║          ┌─────────┐                 ║
║          │         │                 ║
║          │   💰    │  ← Icône animée║
║          │         │                 ║
║          └─────────┘                 ║
║                                       ║
║      Track Your Spending             ║
║                                       ║
║   Monitor all your expenses and      ║
║   income in one place with           ║
║   beautiful visualizations           ║
║                                       ║
║                                       ║
║         ● ○ ○  ← Pagination          ║
║                                       ║
║    ┌─────────────────────┐           ║
║    │   Get Started       │           ║
║    └─────────────────────┘           ║
║                                       ║
║           Skip                        ║
║                                       ║
╚═══════════════════════════════════════╝
```

### Caractéristiques

#### 3 Slides avec Défilement Automatique

**Slide 1 : Track Your Spending**
- **Icône** : 💰 Wallet (100px)
- **Couleur** : Dégradé Violet → Bleu (#733fea → #98e0f8)
- **Titre** : "Track Your Spending"
- **Description** : "Monitor all your expenses and income in one place with beautiful visualizations"

**Slide 2 : Set Financial Goals**
- **Icône** : 🎯 Target (100px)
- **Couleur** : Dégradé Bleu → Violet (#98e0f8 → #733fea)
- **Titre** : "Set Financial Goals"
- **Description** : "Create savings goals and track your progress towards achieving them"

**Slide 3 : Smart Analytics**
- **Icône** : 📊 Chart (100px)
- **Couleur** : Dégradé Violet → Noir (#733fea → #1a1a1a)
- **Titre** : "Smart Analytics"
- **Description** : "Get insights into your spending habits with detailed reports and charts"

#### Interactions
- **Swipe** : Défilement manuel entre les slides
- **Auto-scroll** : Change automatiquement toutes les 5 secondes
- **Pagination** : Points animés en bas (le point actif s'agrandit)
- **Bouton "Get Started"** : Passe à l'écran de connexion
- **Lien "Skip"** : Passe directement à la connexion

#### Animations
- **Icônes** : Apparaissent avec un effet de scale
- **Texte** : Fade-in progressif
- **Pagination** : Les points s'animent lors du changement de slide
- **Transitions** : Fluides entre les slides

---

## 🔐 ÉCRAN 2 : Login (Connexion)

### Quand il apparaît
- **Après l'onboarding** (première fois)
- **Utilisateur sans compte** (pas de token)
- **Après déconnexion**

### Description Visuelle

```
╔═══════════════════════════════════════╗
║                                       ║
║         Dégradé Noir                 ║
║                                       ║
║          ┌─────────┐                 ║
║          │         │                 ║
║          │   📈    │  ← Icône        ║
║          │         │                 ║
║          └─────────┘                 ║
║                                       ║
║       Welcome Back!                  ║
║     Sign in to continue              ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │ 📧 Email                        │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │ 🔒 Password              👁     │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║    ┌─────────────────────┐           ║
║    │     Sign In         │           ║
║    └─────────────────────┘           ║
║                                       ║
║         ─── or ───                   ║
║                                       ║
║   Don't have an account? Sign Up     ║
║                                       ║
╚═══════════════════════════════════════╝
```

### Caractéristiques

#### Header
- **Icône** : 📈 Chart-line (50px)
  - Cercle avec bordure
  - Fond semi-transparent
- **Titre** : "Welcome Back!" (32px, Bold)
- **Sous-titre** : "Sign in to continue" (16px)

#### Formulaire
- **Champ Email** :
  - Icône : 📧 Email
  - Placeholder : "Email"
  - Type : email-address
  - Fond : Semi-transparent blanc
  - Bordure arrondie

- **Champ Password** :
  - Icône : 🔒 Lock
  - Placeholder : "Password"
  - Type : Sécurisé (masqué)
  - Bouton œil : Afficher/Masquer
  - Fond : Semi-transparent blanc
  - Bordure arrondie

#### Bouton Sign In
- **Couleur** : Violet (#733fea)
- **Texte** : "Sign In" (18px, Bold)
- **État loading** : Spinner pendant la connexion
- **Bordure** : Arrondie (16px)

#### Message d'Erreur
- **Apparaît** : Si email/mot de passe incorrect
- **Icône** : ⚠️ Alert
- **Couleur** : Rouge (#ff6b6b)
- **Fond** : Rouge semi-transparent
- **Message** : "Email ou mot de passe incorrect"

#### Footer
- **Divider** : Ligne avec "or" au milieu
- **Lien Sign Up** : "Don't have an account? Sign Up"
  - Texte normal + Lien violet

#### Animations
- **Entrée** : Fade-in + Slide-up
- **Durée** : 600ms
- **Type** : Spring animation (rebond léger)

---

## 🎨 Comparaison Visuelle

### Onboarding (Écran 1)
```
Style:      Coloré, Dynamique
Dégradés:   Violet ↔ Bleu
Contenu:    3 slides explicatifs
Durée:      ~15 secondes (auto-scroll)
Objectif:   Présenter l'app
Action:     "Get Started" ou "Skip"
```

### Login (Écran 2)
```
Style:      Sobre, Professionnel
Dégradé:    Noir → Gris → Noir
Contenu:    Formulaire de connexion
Durée:      Jusqu'à connexion
Objectif:   Authentifier l'utilisateur
Action:     "Sign In" ou "Sign Up"
```

---

## 🔄 Flux Complet pour Nouvel Utilisateur

```
1. [Toucher l'icône]
   ↓
2. [Splash Screen] (3s)
   • Logo + "GrowUp"
   • Vérification du statut
   ↓
3. [Onboarding] (15s ou Skip)
   • Slide 1: Track Spending
   • Slide 2: Set Goals
   • Slide 3: Analytics
   • Bouton "Get Started"
   ↓
4. [Login]
   • Formulaire Email/Password
   • Bouton "Sign In"
   • Lien "Sign Up"
   ↓
5. [Dashboard]
   • Page principale de l'app
```

---

## 🔄 Flux pour Utilisateur Existant

```
1. [Toucher l'icône]
   ↓
2. [Splash Screen] (3s)
   • Logo + "GrowUp"
   • Vérification du token
   ↓
3. [Dashboard] (Direct)
   • Pas d'onboarding
   • Pas de login
   • Accès direct
```

---

## 📊 Temps de Navigation

### Première Utilisation
```
Splash (3s) → Onboarding (15s) → Login (variable) → Dashboard
Total: ~20-30 secondes
```

### Utilisateur Connecté
```
Splash (3s) → Dashboard
Total: ~3 secondes
```

### Utilisateur Déconnecté
```
Splash (3s) → Login (variable) → Dashboard
Total: ~5-10 secondes
```

---

## 🎯 Résumé

### Écran 1 : Onboarding
- **Objectif** : Présenter les fonctionnalités
- **Design** : Coloré avec dégradés
- **Contenu** : 3 slides explicatifs
- **Durée** : ~15 secondes (skippable)

### Écran 2 : Login
- **Objectif** : Authentifier l'utilisateur
- **Design** : Sobre et professionnel
- **Contenu** : Formulaire de connexion
- **Durée** : Variable (jusqu'à connexion)

Les deux écrans sont **optionnels** selon le statut de l'utilisateur :
- ✅ Nouvel utilisateur : Voit les deux
- ✅ Utilisateur déconnecté : Voit seulement Login
- ✅ Utilisateur connecté : Voit aucun des deux (direct au Dashboard)

---

## 💡 Personnalisation Possible

### Onboarding
- Changer le nombre de slides (actuellement 3)
- Modifier les icônes et textes
- Ajuster la durée de l'auto-scroll (actuellement 5s)
- Changer les couleurs des dégradés

### Login
- Ajouter "Mot de passe oublié"
- Ajouter connexion sociale (Google, Facebook)
- Modifier les couleurs
- Ajouter biométrie (Face ID, Empreinte)

---

**Fichiers concernés** :
- Onboarding : `mobile/app/(onboarding)/welcome.tsx`
- Login : `mobile/app/(auth)/login.tsx`
- Signup : `mobile/app/(auth)/signup.tsx`
