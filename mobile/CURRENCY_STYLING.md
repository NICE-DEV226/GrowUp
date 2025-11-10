# Guide de stylisation des devises

## Symboles de devise

Les symboles sont définis dans `mobile/src/utils/currency.ts` :

- **EUR** : `€`
- **USD** : `$`
- **GBP** : `£`
- **CHF** : `CHF`
- **XOF** : `XOF` (Franc CFA de l'Ouest - BCEAO)
- **XAF** : `XAF` (Franc CFA du Centre - BEAC)
- **MAD** : `DH`
- **TND** : `DT`
- **ZAR** : `R`
- **NGN** : `₦`
- **GHS** : `₵`
- **KES** : `KSh`

## Affichage des montants

### Format standard
```
1000 XOF
1000 XAF
1000 €
$1000 (USD et GBP ont le symbole avant)
```

## Taille de police recommandée

La fonction `getCurrencySymbolSizeRatio()` retourne le ratio de taille recommandé :

- **Codes longs** (XOF, XAF, CHF, KES) : 60% de la taille du montant
- **Symboles courts** (€, $, £, etc.) : 75% de la taille du montant

### Exemple d'utilisation

```typescript
import { getCurrencySymbol, getCurrencySymbolSizeRatio } from '../src/utils/currency';

const currency = 'XOF';
const amount = 1000;
const baseFontSize = 24;

const symbol = getCurrencySymbol(currency);
const symbolSize = baseFontSize * getCurrencySymbolSizeRatio(currency);

// Affichage :
// Montant : fontSize = 24
// Symbole : fontSize = 14.4 (60% de 24)
```

## Composant CurrencyText

Un composant `CurrencyText` est disponible dans `mobile/src/components/CurrencyText.tsx` pour faciliter l'affichage stylisé des montants avec devise.

### Utilisation

```typescript
import { CurrencyText } from '../src/components/CurrencyText';

<CurrencyText
  amount={1000}
  currencySymbol={currencySymbol}
  style={{ fontSize: 24, color: '#fff' }}
  symbolStyle={{ fontSize: 14 }} // Optionnel : override la taille du symbole
/>
```

## Notes

- Les symboles XOF et XAF sont affichés en codes courts pour économiser l'espace
- Les noms complets apparaissent uniquement dans le menu de sélection de devise
- L'espacement est automatiquement géré (espace avant le symbole pour la plupart des devises)
