// Configuration des pays avec devise et langue par défaut
export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
  language: string;
  region: string;
}

export const COUNTRIES: Country[] = [
  // Europe
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', language: 'Français', region: 'Europe' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪', currency: 'EUR', language: 'Français', region: 'Europe' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭', currency: 'CHF', language: 'Français', region: 'Europe' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', currency: 'EUR', language: 'Français', region: 'Europe' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧', currency: 'GBP', language: 'English', region: 'Europe' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪', currency: 'EUR', language: 'English', region: 'Europe' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸', currency: 'EUR', language: 'Español', region: 'Europe' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹', currency: 'EUR', language: 'English', region: 'Europe' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR', language: 'English', region: 'Europe' },
  
  // Amérique du Nord
  { code: 'US', name: 'États-Unis', flag: '🇺🇸', currency: 'USD', language: 'English', region: 'Amérique' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'USD', language: 'English', region: 'Amérique' },
  
  // Afrique de l\'Ouest (Franc CFA BCEAO - XOF)
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', currency: 'XOF', language: 'Français', region: 'Afrique' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', currency: 'XOF', language: 'Français', region: 'Afrique' },
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯', currency: 'XOF', language: 'Français', region: 'Afrique' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', currency: 'XOF', language: 'Français', region: 'Afrique' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', currency: 'XOF', language: 'Français', region: 'Afrique' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', currency: 'XOF', language: 'Français', region: 'Afrique' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', currency: 'XOF', language: 'Français', region: 'Afrique' },
  { code: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼', currency: 'XOF', language: 'Français', region: 'Afrique' },
  
  // Afrique Centrale (Franc CFA BEAC - XAF)
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲', currency: 'XAF', language: 'Français', region: 'Afrique' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', currency: 'XAF', language: 'Français', region: 'Afrique' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', currency: 'XAF', language: 'Français', region: 'Afrique' },
  { code: 'CF', name: 'Centrafrique', flag: '🇨🇫', currency: 'XAF', language: 'Français', region: 'Afrique' },
  { code: 'TD', name: 'Tchad', flag: '🇹🇩', currency: 'XAF', language: 'Français', region: 'Afrique' },
  { code: 'GQ', name: 'Guinée Équatoriale', flag: '🇬🇶', currency: 'XAF', language: 'Español', region: 'Afrique' },
  
  // Afrique du Nord
  { code: 'MA', name: 'Maroc', flag: '🇲🇦', currency: 'MAD', language: 'Français', region: 'Afrique' },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳', currency: 'TND', language: 'Français', region: 'Afrique' },
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿', currency: 'EUR', language: 'Français', region: 'Afrique' },
  
  // Afrique Australe et de l\'Est
  { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦', currency: 'ZAR', language: 'English', region: 'Afrique' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', language: 'English', region: 'Afrique' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS', language: 'English', region: 'Afrique' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES', language: 'English', region: 'Afrique' },
  { code: 'UG', name: 'Ouganda', flag: '🇺🇬', currency: 'USD', language: 'English', region: 'Afrique' },
  { code: 'TZ', name: 'Tanzanie', flag: '🇹🇿', currency: 'USD', language: 'English', region: 'Afrique' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', currency: 'USD', language: 'English', region: 'Afrique' },
];

// Fonction pour obtenir un pays par code
export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(c => c.code === code);
};

// Fonction pour obtenir les pays par région
export const getCountriesByRegion = (region: string): Country[] => {
  return COUNTRIES.filter(c => c.region === region);
};

// Régions disponibles
export const REGIONS = ['Europe', 'Amérique', 'Afrique'];
