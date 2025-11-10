// Fonction helper pour obtenir le symbole de devise
export const getCurrencySymbol = (currency: string): string => {
  const currencySymbols: { [key: string]: string } = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'CHF': 'CHF',
    'XOF': 'F CFA',  // Franc CFA de l'Ouest (BCEAO)
    'XAF': 'FCFA',   // Franc CFA du Centre (BEAC)
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
