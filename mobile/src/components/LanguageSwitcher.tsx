import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useI18n, Language } from '../i18n';
import { useAuthStore } from '../store/authStore';

export const LanguageSwitcher = () => {
  const { t, language } = useI18n();
  const { setLanguage } = useAuthStore();

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'Français' ? 'English' : 'Français';
    setLanguage(newLanguage);
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={toggleLanguage}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons 
        name="translate" 
        size={20} 
        color="#733fea" 
      />
      <Text style={styles.text}>{language}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {language === 'Français' ? 'FR' : 'EN'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(115, 63, 234, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(115, 63, 234, 0.2)',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#733fea',
  },
  badge: {
    backgroundColor: '#733fea',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
});
