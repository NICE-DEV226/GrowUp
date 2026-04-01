import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useI18n } from '../i18n';
import { useAuthStore } from '../store/authStore';

/**
 * Composant de débogage pour afficher l'état de la langue en temps réel
 * Affiche la langue du store i18n et du store auth
 */
export const LanguageDebugger = () => {
  const { language: i18nLanguage, t } = useI18n();
  const authLanguage = useAuthStore((state) => state.language);

  useEffect(() => {
    console.log('🐛 LanguageDebugger: i18n language:', i18nLanguage);
    console.log('🐛 LanguageDebugger: auth language:', authLanguage);
  }, [i18nLanguage, authLanguage]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌍 Language Debug</Text>
      <Text style={styles.text}>i18n Store: {i18nLanguage}</Text>
      <Text style={styles.text}>Auth Store: {authLanguage}</Text>
      <Text style={styles.text}>Translation Test: {t.profile.language}</Text>
      <Text style={styles.text}>Common Test: {t.common.save}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(115, 63, 234, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 24,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(115, 63, 234, 0.3)',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#733fea',
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    color: '#fdfdfd',
    marginBottom: 4,
  },
});
