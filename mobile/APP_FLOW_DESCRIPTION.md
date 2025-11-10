# 📱 Description du Flux de l'Application GrowUp

## 🚀 Écran de Démarrage (Splash Screen)

### Quand l'utilisateur touche l'icône de l'app

#### 1️⃣ **Splash Screen** (3 secondes)

**Apparence :**
```
┌─────────────────────────────────┐
│                                 │
│         Dégradé Animé          │
│    (Noir → Violet → Bleu)      │
│                                 │
│                                 │
│          [LOGO 180x180]        │
│         Animation Scale         │
│                                 │
│                                 │
│          GrowUp                │
│       (Texte en fade-in)       │
│                                 │
│  Take Control of Your Finances │
│       (Sous-titre fade-in)     │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Détails Visuels :**
- **Fond** : Dégradé linéaire vertical
  - Haut : #1a1a1a (noir)
  - Milieu : #733fea (violet)
  - Bas : #98e0f8 (bleu ciel)

- **Logo** : 180x180 pixels
  - Animation : Scale de 0 à 1 (effet de zoom)
  - Durée : ~1 seconde
  - Type : Spring animation (rebond léger)

- **Texte "GrowUp"** :
  - Taille : 48px
  - Couleur : #fdfdfd (blanc)
  - Police : Bold
  - Animation : Fade-in (apparition progressive)
  - Délai : 300ms après le logo

- **Tagline** :
  - Texte : "Take Control of Your Finances"
  - Taille : 16px
  - Couleur : rgba(253, 253, 253, 0.8) (blanc semi-transparent)
  - Animation : Fade-in synchronisé avec le titre

**Durée Totale** : 3 secondes

---

## 🔀 Redirection Automatique

Après 3 secondes, l'app vérifie l'état de l'utilisateur et redirige vers :

### Cas 1 : Utilisateur Connecté (a un token) ✅
```
Splash Screen (3s)
    ↓
Dashboard (Page principale)
```

### Cas 2 : Utilisateur Non Connecté (pas de token) ❌
```
Splash Screen (3s)
    ↓
Page de Connexion (Login)
```

### Cas 3 : Première Utilisation (jamais vu l'onboarding) 🆕
```
Splash Screen (3s)
    ↓
Page d'Accueil (Welcome/Onboarding)
```

---

## 📊 Pour un Utilisateur Connecté

### Écran après le Splash : **DASHBOARD**

```
┌─────────────────────────────────────┐
│  [Photo] Bienvenue, [Nom] 👋  🔍 🔔│  ← Header
├─────────────────────────────────────┤
│                                     │
│  💰 Solde Total                    │
│     [Montant en gros]              │  ← Carte de solde
│                                     │
│  📈 Revenus    📉 Dépenses         │
│                                     │
├─────────────────────────────────────┤
│  ⚡ Actions Rapides                │
│  [+] Ajouter  [↔] Transfert        │  ← Boutons d'action
├─────────────────────────────────────┤
│  📝 Transactions Récentes          │
│  ┌─────────────────────────────┐  │
│  │ 🍔 Nourriture    -25€      │  │
│  │ 💼 Salaire      +2000€     │  │  ← Liste des transactions
│  │ 🚗 Transport     -15€      │  │
│  └─────────────────────────────┘  │
│  [Voir tout →]                     │
├─────────────────────────────────────┤
│  🎯 Mes Objectifs                  │
│  ┌─────────────────────────────┐  │
│  │ 🏖️ Vacances                 │  │
│  │ ████████░░ 80%             │  │  ← Barres de progression
│  │ 1600€ / 2000€              │  │
│  └─────────────────────────────┘  │
│  [Voir tout →]                     │
└─────────────────────────────────────┘
│ [Dashboard] [Transactions] [Goals] │  ← Navigation
└─────────────────────────────────────┘
```

**Caractéristiques :**
- **Header** :
  - Photo de profil (ou initiale)
  - Message de bienvenue personnalisé
  - Icône de recherche
  - Icône de notifications (avec badge si non lues)

- **Carte de Solde** :
  - Fond dégradé violet → bleu
  - Montant en gros caractères
  - Revenus et dépenses du mois

- **Actions Rapides** :
  - Bouton "Ajouter" (transaction)
  - Bouton "Transfert"
  - Design moderne avec icônes

- **Transactions Récentes** :
  - 3-5 dernières transactions
  - Icône de catégorie
  - Montant coloré (vert pour revenus, rouge pour dépenses)
  - Lien "Voir tout"

- **Objectifs** :
  - 2-3 objectifs en cours
  - Barre de progression animée
  - Pourcentage et montants
  - Lien "Voir tout"

- **Navigation** :
  - 5 onglets : Dashboard, Transactions, Goals, Stats, Profile
  - Icônes colorées
  - Indicateur de page active

---

## 🎨 Animations et Transitions

### Au Chargement du Dashboard
1. **Header** : Fade-in (400ms)
2. **Carte de Solde** : Scale animation (500ms)
3. **Actions Rapides** : Slide-in from bottom (400ms)
4. **Sections** : Fade-in progressive (500ms, délai 100ms)

### Interactions
- **Pull-to-refresh** : Actualise les données
- **Tap sur transaction** : Ouvre les détails
- **Tap sur objectif** : Ouvre la page de l'objectif
- **Swipe** : Navigation entre les onglets

---

## 🔄 Flux Complet pour Utilisateur Connecté

```
1. Toucher l'icône GrowUp
   ↓
2. Splash Screen (3s)
   • Logo apparaît avec animation
   • Texte fade-in
   • Vérification du token
   ↓
3. Dashboard
   • Chargement des données
   • Animations d'entrée
   • Affichage du contenu
   ↓
4. Utilisateur peut :
   • Voir son solde
   • Ajouter une transaction
   • Consulter ses objectifs
   • Naviguer dans l'app
```

---

## 📱 Expérience Utilisateur

### Temps de Chargement
- **Splash Screen** : 3 secondes (fixe)
- **Chargement Dashboard** : ~500ms (dépend du réseau)
- **Total** : ~3.5 secondes

### Feedback Visuel
- ✅ Animations fluides
- ✅ Transitions douces
- ✅ Indicateurs de chargement
- ✅ Messages de succès/erreur

### Optimisations
- Chargement des données en arrière-plan pendant le splash
- Cache des données pour affichage instantané
- Animations natives pour performance optimale

---

## 🎯 Résumé Visuel

### Séquence Complète
```
[Icône GrowUp]
      ↓ (Tap)
[Splash Screen]
  • Fond dégradé noir→violet→bleu
  • Logo 180x180 avec animation
  • "GrowUp" en gros
  • "Take Control of Your Finances"
  • Durée : 3 secondes
      ↓
[Dashboard]
  • Header avec photo et bienvenue
  • Carte de solde animée
  • Actions rapides
  • Transactions récentes
  • Objectifs en cours
  • Navigation en bas
```

---

## 💡 Personnalisation Possible

### Splash Screen
- Changer la durée (actuellement 3s)
- Modifier les couleurs du dégradé
- Changer le texte du tagline
- Ajouter un indicateur de chargement

### Dashboard
- Réorganiser les sections
- Changer les couleurs
- Modifier le nombre de transactions affichées
- Personnaliser les actions rapides

---

## 🔧 Fichiers Concernés

- **Splash** : `mobile/app/splash.tsx`
- **Dashboard** : `mobile/app/(tabs)/dashboard.tsx`
- **Navigation** : `mobile/app/(tabs)/_layout.tsx`
- **Assets** : `mobile/assets/logo.png`

---

**Conclusion** : L'écran qui apparaît après avoir touché l'icône est un **Splash Screen élégant** avec un dégradé animé, suivi du **Dashboard** si l'utilisateur est connecté. L'expérience est fluide, moderne et professionnelle ! ✨
