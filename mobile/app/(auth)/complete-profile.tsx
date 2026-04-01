import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../src/theme';
import api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../../src/i18n';

const currencies = ['EUR', 'USD', 'GBP', 'CAD', 'XAF', 'XOF'];
const languages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' }
];

export default function CompleteProfile() {
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [language, setLanguage] = useState('fr');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleComplete = async () => {
    if (!username.trim()) {
      setError(t.auth.nameRequired);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await api.post('/auth/complete-profile', {
        username,
        currency,
        language,
        country
      });

      await AsyncStorage.setItem('profileCompleted', 'true');
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="account-cog" size={50} color={colors.primary} />
          </View>
          <Text variant="displaySmall" style={styles.title}>{t.auth.completeProfile}</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {t.auth.completeProfileSubtitle}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label={t.auth.username}
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="account" />}
            autoCapitalize="none"
          />

          <Text style={styles.label}>{t.profile.currency}</Text>
          <View style={styles.chipContainer}>
            {currencies.map((curr) => (
              <Button
                key={curr}
                mode={currency === curr ? 'contained' : 'outlined'}
                onPress={() => setCurrency(curr)}
                style={styles.chip}
                compact
              >
                {curr}
              </Button>
            ))}
          </View>

          <Text style={styles.label}>{t.profile.language}</Text>
          <View style={styles.chipContainer}>
            {languages.map((lang) => (
              <Button
                key={lang.code}
                mode={language === lang.code ? 'contained' : 'outlined'}
                onPress={() => setLanguage(lang.code)}
                style={styles.chip}
                compact
              >
                {lang.name}
              </Button>
            ))}
          </View>

          <TextInput
            label={t.auth.countryOptional}
            value={country}
            onChangeText={setCountry}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="earth" />}
          />

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          <Button 
            mode="contained" 
            onPress={handleComplete}
            loading={loading}
            style={styles.button}
            buttonColor={colors.primary}
            contentStyle={styles.buttonContent}
          >
            {t.common.start}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderRadius: borderRadius.md,
  },
  button: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.error,
    marginLeft: spacing.xs,
    flex: 1,
  },
});
