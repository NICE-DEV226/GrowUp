// Fonction utilitaire pour formater les dates selon la langue
export const getLocaleFromLanguage = (language: string): string => {
  switch (language) {
    case 'Français':
      return 'fr-FR';
    case 'English':
      return 'en-US';
    case 'Español':
      return 'es-ES';
    default:
      return 'fr-FR';
  }
};

export const formatDate = (
  date: Date | string,
  language: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const locale = getLocaleFromLanguage(language);
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(locale, options);
};
