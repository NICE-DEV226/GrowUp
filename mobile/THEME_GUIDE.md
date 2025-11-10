# 🎨 Guide du Système de Thème GrowUp

## ✅ Ce qui a été implémenté

### 1. Configuration des thèmes (`mobile/src/theme/theme.ts`)
- **Thème Sombre** : Couleurs actuelles de l'app
- **Thème Clair** : Nouveau thème avec fond blanc
- **Mode Automatique** : Suit le thème système de l'appareil

### 2. Hook personnalisé (`mobile/src/hooks/useTheme.ts`)
Permet d'accéder facilement aux couleurs du thème actif dans n'importe quel composant.

### 3. Intégration dans `_layout.tsx`
- Charge le thème sauvegardé au démarrage
- Met à jour l'app quand le thème change
- Écoute les changements du thème système (mode automatique)

## 🚀 Comment utiliser le thème dans vos composants

### Méthode 1 : Utiliser le hook `useTheme`

```typescript
import { useTheme } from '../../src/hooks/useTheme';

export default function MyComponent() {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

### Méthode 2 : Utiliser le thème de React Native Paper

```typescript
import { useTheme as usePaperTheme } from 'react-native-paper';

export default function MyComponent() {
  const theme = usePaperTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>Hello</Text>
    </View>
  );
}
```

## 🎨 Couleurs disponibles

### Couleurs principales
- `colors.primary` - #733fea (violet)
- `colors.secondary` - #98e0f8 (bleu clair)
- `colors.background` - Fond principal
- `colors.surface` - Fond des cartes
- `colors.text` - Texte principal
- `colors.textSecondary` - Texte secondaire

### Couleurs d'état
- `colors.error` - #F44336 (rouge)
- `colors.success` - #10B981 (vert)
- `colors.warning` - #FFC107 (jaune)
- `colors.info` - Bleu info

## 📝 Exemple de migration d'un composant

### Avant (couleurs codées en dur)
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
  },
  card: {
    backgroundColor: '#2a2a2a',
  },
  text: {
    color: '#fdfdfd',
  },
});
```

### Après (avec thème dynamique)
```typescript
import { useTheme } from '../../src/hooks/useTheme';

export default function MyComponent() {
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.surface,
    },
    text: {
      color: colors.text,
    },
  });
  
  return <View style={styles.container}>...</View>;
}
```

## ⚠️ État actuel

### ✅ Fonctionnel
- Système de thème configuré
- Sauvegarde de la préférence utilisateur
- Changement de thème dans les paramètres
- Mode automatique qui suit le système

### ⚠️ À faire
Les pages suivantes ont encore des couleurs codées en dur et doivent être migrées :
- `dashboard.tsx`
- `transactions.tsx`
- `goals.tsx`
- `stats.tsx`
- `profile.tsx`
- Toutes les pages dans `(settings)/`
- Toutes les pages dans `(auth)/`
- Toutes les pages dans `(onboarding)/`

## 🔧 Comment tester

1. Aller dans Profil > Thème
2. Changer entre Sombre / Clair / Automatique
3. Les composants qui utilisent le hook `useTheme` changeront automatiquement
4. Les composants avec couleurs codées en dur resteront sombres

## 📋 Prochaines étapes recommandées

1. **Migrer page par page** : Commencer par les pages principales (dashboard, transactions, goals)
2. **Créer des composants réutilisables** : Boutons, cartes, inputs qui utilisent automatiquement le thème
3. **Tester sur iOS et Android** : Vérifier que le mode automatique fonctionne bien
4. **Ajouter des animations** : Transition douce lors du changement de thème

## 💡 Conseils

- Utilisez `colors.surface` pour les cartes et modals
- Utilisez `colors.background` pour les fonds de page
- Utilisez `colors.text` et `colors.textSecondary` pour le texte
- Évitez les couleurs codées en dur comme `#1a1a1a` ou `#fdfdfd`
- Testez toujours les deux thèmes pour vérifier la lisibilité
