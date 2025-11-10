import 'i18next';

// Définir les clés de traduction disponibles
declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
  }
}
