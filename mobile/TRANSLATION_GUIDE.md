# Guide de Traduction Systématique

## Stratégie

Pour chaque fichier:
1. Ajouter `import { useI18n } from '../../src/i18n';`
2. Ajouter `const { t } = useI18n();` dans le composant
3. Remplacer TOUS les textes hardcodés par `{t.section.key}`

## Fichiers Prioritaires (par ordre)

### 1. Goals ✅ EN COURS
- Import ajouté ✅
- Hook ajouté ✅
- Header traduit ✅
- Reste: Stats cards, modals, messages

### 2. Transactions
- Priorité: HAUTE
- Textes: ~50 occurrences

### 3. Stats  
- Priorité: HAUTE
- Textes: ~40 occurrences

### 4. Dashboard
- Priorité: HAUTE
- Import ajouté ✅
- Textes: ~60 occurrences

### 5. Recurring Transactions
- Priorité: MOYENNE
- Textes: ~45 occurrences

### 6. Auth (Login, Signup, Complete Profile)
- Priorité: HAUTE
- Textes: ~30 occurrences par fichier

### 7. Onboarding (Welcome, Slides)
- Priorité: BASSE
- Textes: ~20 occurrences

## Approche Optimisée

Au lieu de faire des remplacements un par un (trop long), je vais:
1. Identifier les patterns de texte dans chaque fichier
2. Créer des remplacements groupés
3. Appliquer les changements par sections

## Note Importante

Les fichiers de traduction (fr.ts et en.ts) sont COMPLETS avec 400+ clés.
Il suffit de remplacer les textes hardcodés par les clés correspondantes.
