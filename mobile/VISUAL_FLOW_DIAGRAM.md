# 🎨 Diagramme Visuel du Flux GrowUp

## 📱 Écran par Écran - Vue Détaillée

### 1️⃣ SPLASH SCREEN (3 secondes)

```
╔═══════════════════════════════════════╗
║                                       ║
║         🌈 DÉGRADÉ ANIMÉ             ║
║                                       ║
║              ┌─────┐                 ║
║              │     │                 ║
║              │ 📱  │  ← Logo 180x180 ║
║              │     │     (Scale 0→1) ║
║              └─────┘                 ║
║                                       ║
║                                       ║
║            GrowUp                    ║
║         (Fade-in 48px)               ║
║                                       ║
║   Take Control of Your Finances      ║
║        (Fade-in 16px)                ║
║                                       ║
║                                       ║
╚═══════════════════════════════════════╝

Couleurs du dégradé (vertical) :
  ▓ #1a1a1a (Noir)
  ▓ #733fea (Violet)
  ▓ #98e0f8 (Bleu ciel)
```

---

### 2️⃣ DASHBOARD (Utilisateur Connecté)

```
╔═══════════════════════════════════════╗
║ 👤 Bienvenue, Jean 👋      🔍 🔔(3) ║ ← Header
╠═══════════════════════════════════════╣
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │  💰 Solde Total                 │ ║
║  │                                 │ ║
║  │      2,450.00 €                │ ║ ← Carte Solde
║  │                                 │ ║ (Dégradé violet→bleu)
║  │  📈 +3,200€    📉 -750€        │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  ⚡ Actions Rapides                  ║
║  ┌──────────┐  ┌──────────┐         ║
║  │ [+] Add  │  │ [↔] Send │         ║ ← Boutons
║  └──────────┘  └──────────┘         ║
║                                       ║
║  📝 Transactions Récentes            ║
║  ┌─────────────────────────────────┐ ║
║  │ 🍔 Restaurant      -25.00 €    │ ║
║  │ 💼 Salaire       +2,000.00 €   │ ║
║  │ 🚗 Essence         -45.00 €    │ ║ ← Liste
║  │ ☕ Café            -3.50 €     │ ║
║  └─────────────────────────────────┘ ║
║  Voir tout →                          ║
║                                       ║
║  🎯 Mes Objectifs                    ║
║  ┌─────────────────────────────────┐ ║
║  │ 🏖️ Vacances d'été               │ ║
║  │ ████████░░ 80%                  │ ║
║  │ 1,600€ / 2,000€                 │ ║ ← Objectifs
║  ├─────────────────────────────────┤ ║
║  │ 💻 Nouveau MacBook              │ ║
║  │ ████░░░░░░ 40%                  │ ║
║  │ 800€ / 2,000€                   │ ║
║  └─────────────────────────────────┘ ║
║  Voir tout →                          ║
║                                       ║
╠═══════════════════════════════════════╣
║ [🏠] [💳] [🎯] [📊] [👤]            ║ ← Navigation
╚═══════════════════════════════════════╝
```

---

## 🔄 Flux de Navigation Complet

```
                    [Toucher l'icône]
                           ↓
                    ┌──────────────┐
                    │ SPLASH SCREEN│
                    │   (3 sec)    │
                    └──────┬───────┘
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
        [Token existe?]            [Pas de token]
              ↓                         ↓
         ┌────────┐              ┌──────────┐
         │  OUI   │              │   NON    │
         └────┬───┘              └────┬─────┘
              ↓                       ↓
      ┌───────────────┐      ┌────────────────┐
      │   DASHBOARD   │      │ Onboarding vu? │
      │               │      └────────┬───────┘
      │ • Solde       │               ↓
      │ • Transactions│      ┌────────┴────────┐
      │ • Objectifs   │      ↓                 ↓
      │ • Stats       │   [OUI]             [NON]
      └───────────────┘      ↓                 ↓
                      ┌──────────┐      ┌──────────┐
                      │  LOGIN   │      │ WELCOME  │
                      └──────────┘      └──────────┘
```

---

## 🎬 Timeline des Animations

```
Temps    Splash Screen                Dashboard
─────────────────────────────────────────────────────
0.0s     [Écran noir]                 
         
0.1s     [Dégradé apparaît]          
         
0.3s     [Logo scale 0→1]            
         ↓ Spring animation
         
0.6s     [Logo à 100%]               
         
0.9s     [Texte fade-in]             
         ↓ "GrowUp"
         
1.2s     [Tagline fade-in]           
         
3.0s     [Transition]                 [Chargement]
         ↓                            ↓
3.1s                                  [Header fade-in]
         
3.3s                                  [Solde scale-in]
         
3.5s                                  [Actions slide-in]
         
3.7s                                  [Sections fade-in]
         
4.0s                                  [Tout visible ✓]
```

---

## 🎨 Palette de Couleurs Utilisée

### Splash Screen
```
┌─────────────────┐
│   #1a1a1a      │ ← Noir (haut)
│   #733fea      │ ← Violet (milieu)
│   #98e0f8      │ ← Bleu (bas)
└─────────────────┘
```

### Dashboard
```
Background:     #1a1a1a (Noir)
Cartes:         #2a2a2a (Gris foncé)
Primary:        #733fea (Violet)
Secondary:      #98e0f8 (Bleu)
Success:        #10B981 (Vert)
Error:          #F44336 (Rouge)
Text:           #fdfdfd (Blanc)
Text Secondary: rgba(253,253,253,0.6)
```

---

## 📐 Dimensions et Espacements

### Splash Screen
```
Logo:           180x180 px
Titre:          48px (Bold)
Tagline:        16px (Regular)
Espacement:     30px entre logo et titre
```

### Dashboard
```
Header:         ~80px hauteur
Carte Solde:    ~150px hauteur
Boutons:        48px hauteur
Transactions:   60px par item
Objectifs:      80px par item
Padding:        20-24px horizontal
```

---

## 🎯 Points Clés de l'Expérience

### ✨ Splash Screen
- **Durée** : 3 secondes (ni trop court, ni trop long)
- **Animation** : Fluide et professionnelle
- **Branding** : Logo + Nom + Tagline
- **Feedback** : Pas de loader, juste des animations

### 📊 Dashboard
- **Hiérarchie** : Solde → Actions → Transactions → Objectifs
- **Couleurs** : Cohérentes avec le branding
- **Interactions** : Pull-to-refresh, tap, swipe
- **Performance** : Chargement optimisé

---

## 🔍 Détails Techniques

### Splash Screen (`splash.tsx`)
```typescript
// Animations
- Logo: Spring animation (tension: 50, friction: 7)
- Texte: Fade-in (duration: 1500ms, delay: 300ms)
- Durée totale: 3000ms

// Vérifications
1. Charger le token
2. Charger les préférences (devise, langue, thème)
3. Rediriger selon l'état
```

### Dashboard (`dashboard.tsx`)
```typescript
// Chargement des données
- Balance (solde)
- Transactions récentes (5 dernières)
- Objectifs en cours (3 premiers)
- Notifications non lues

// Animations
- Header: opacity 0→1 (400ms)
- Balance: scale 0→1 (500ms)
- Actions: slide-in bottom (400ms)
- Sections: fade-in (500ms, delay 100ms)
```

---

## 📱 Responsive Design

### iPhone (375x667 et plus)
```
✓ Logo: 180x180
✓ Texte: Tailles normales
✓ Espacement: Standard
```

### iPad (768x1024 et plus)
```
✓ Logo: 180x180 (même taille)
✓ Texte: Tailles normales
✓ Espacement: Augmenté
✓ Cartes: Plus larges
```

---

## 🎉 Résultat Final

L'utilisateur qui touche l'icône GrowUp voit :

1. **Splash élégant** (3s)
   - Dégradé animé
   - Logo qui apparaît
   - Nom de l'app
   - Tagline

2. **Dashboard fluide**
   - Bienvenue personnalisé
   - Solde en évidence
   - Actions rapides
   - Aperçu des données

**Expérience** : Professionnelle, fluide, moderne ! ✨
