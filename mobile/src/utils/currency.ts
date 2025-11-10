// Fonction helper pour obtenir le symbole de devise (code court pour affichage)
export const getCurrencySymbol = (currency: string): string => {
  const currencySymbols: { [key: string]: string } = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'CHF': 'CHF',
    'XOF': 'XOF',  // Code de la devise
    'XAF': 'XAF',  // Code de la devise
    'MAD': 'DH',
    'TND': 'DT',
    'ZAR': 'R',
    'NGN': '₦',
    'GHS': '₵',
    'KES': 'KSh',
  };
  
  return currencySymbols[currency] || currency;
};

// Fonction pour formater un montant avec la devise
export const formatAmount = (amount: number, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  const formattedAmount = amount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  // Pour certaines devises, le symbole va avant sans espace
  if (['USD', 'GBP'].includes(currency)) {
    return `${symbol}${formattedAmount}`;
  }
  
  // Pour toutes les autres devises, le symbole va après avec un espace
  return `${formattedAmount} ${symbol}`;
};

// Fonction pour obtenir le symbole avec espacement approprié
export const getCurrencySymbolWithSpace = (currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  // Pour les devises qui vont avant, pas d'espace après
  if (['USD', 'GBP'].includes(currency)) {
    return symbol;
  }
  // Pour les autres, on retourne juste le symbole (l'espace sera ajouté dans le template)
  return symbol;
};

// Fonction pour obtenir la taille de police recommandée pour le symbole
// Retourne un ratio par rapport à la taille du montant
export const getCurrencySymbolSizeRatio = (currency: string): number => {
  // Pour les codes longs (XOF, XAF), utiliser une taille plus petite
  if (['XOF', 'XAF', 'CHF', 'KES'].includes(currency)) {
    return 0.6; // 60% de la taille du montant
  }
  // Pour les symboles courts (€, $, £), garder la même taille
  return 0.75; // 75% de la taille du montant
};

// Fonction pour formater un montant de manière compacte (pour les gros chiffres)
export const formatCompactAmount = (amount: number, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  let formattedAmount: string;
  
  // Pour les montants > 1 million
  if (Math.abs(amount) >= 1000000) {
    formattedAmount = (amount / 1000000).toFixed(1).replace('.', ',') + 'M';
  }
  // Pour les montants > 10 000
  else if (Math.abs(amount) >= 10000) {
    formattedAmount = (amount / 1000).toFixed(1).replace('.', ',') + 'K';
  }
  // Pour les montants normaux
  else {
    formattedAmount = amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  
  // Pour certaines devises, le symbole va avant
  if (['USD', 'GBP'].includes(currency)) {
    return `${symbol}${formattedAmount}`;
  }
  
  return `${formattedAmount} ${symbol}`;
};

// Fonction pour formater un montant avec gestion intelligente de la taille
export const formatSmartAmount = (amount: number, currency: string, maxLength: number = 15): string => {
  const symbol = getCurrencySymbol(currency);
  
  // Essayer d'abord le format normal
  const normalFormat = formatAmount(amount, currency);
  
  // Si trop long, utiliser le format compact
  if (normalFormat.length > maxLength) {
    return formatCompactAmount(amount, currency);
  }
  
  return normalFormat;
};
