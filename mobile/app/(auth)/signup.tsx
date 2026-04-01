import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Animated, Modal } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COUNTRIES, Country, REGIONS } from '../../src/constants/countries';
import { useI18n } from '../../src/i18n';

export default function Signup() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Vérifier la correspondance des mots de passe en temps réel
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordStrength = password.length >= 8 ? t.auth.passwordStrong : password.length >= 6 ? t.auth.passwordMedium : password.length > 0 ? t.auth.passwordWeak : '';
  const strengthColor = password.length >= 8 ? '#10B981' : password.length >= 6 ? '#FFC107' : '#ff6b6b';
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setCountryModalVisible(false);
  };

  const handleSignup = async () => {
    // Nettoyer les espaces
    const cleanEmail = email.trim();
    const cleanName = name.trim();
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    // Validations
    if (!cleanName) {
      setError(t.auth.nameRequired);
      return;
    }

    if (!cleanEmail) {
      setError(t.auth.emailRequired);
      return;
    }

    if (!selectedCountry) {
      setError(t.auth.countryRequired);
      return;
    }

    if (cleanPassword.length < 6) {
      setError(t.auth.passwordMinLength);
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/auth/register', { 
        email: cleanEmail, 
        password: cleanPassword, 
        name: cleanName,
        country: selectedCountry.code,
        currency: selectedCountry.currency,
        language: selectedCountry.language
      });
      
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a', '#1a1a1a']} style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="account-plus" size={50} color="#fdfdfd" />
            </View>
            <Text style={styles.title}>{t.auth.createAccount}</Text>
            <Text style={styles.subtitle}>{t.auth.startJourney}</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.form,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#fdfdfd" style={styles.inputIcon} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t.auth.fullName}
                placeholderTextColor="rgba(253, 253, 253, 0.5)"
                style={styles.input}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor="#fdfdfd"
                cursorColor="#733fea"
                selectionColor="rgba(115, 63, 234, 0.3)"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#fdfdfd" style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder={t.auth.email}
                placeholderTextColor="rgba(253, 253, 253, 0.5)"
                style={styles.input}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor="#fdfdfd"
                cursorColor="#733fea"
                selectionColor="rgba(115, 63, 234, 0.3)"
              />
            </View>

            <TouchableOpacity 
              style={styles.countrySelector}
              onPress={() => setCountryModalVisible(true)}
            >
              <MaterialCommunityIcons name="earth" size={20} color="#fdfdfd" style={styles.inputIcon} />
              <View style={styles.countrySelectorContent}>
                {selectedCountry ? (
                  <>
                    <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                    <Text style={styles.countryText}>{selectedCountry.name}</Text>
                  </>
                ) : (
                  <Text style={styles.countryPlaceholder}>{t.auth.selectCountry}</Text>
                )}
              </View>
              <MaterialCommunityIcons name="chevron-down" size={24} color="rgba(253, 253, 253, 0.5)" />
            </TouchableOpacity>
            
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#fdfdfd" style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder={t.auth.password}
                placeholderTextColor="rgba(253, 253, 253, 0.5)"
                style={styles.input}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor="#fdfdfd"
                cursorColor="#733fea"
                selectionColor="rgba(115, 63, 234, 0.3)"
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye" : "eye-off"} 
                    onPress={() => setShowPassword(!showPassword)}
                    color="#fdfdfd"
                  />
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-check-outline" size={20} color="#fdfdfd" style={styles.inputIcon} />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder={t.auth.confirmPassword}
                placeholderTextColor="rgba(253, 253, 253, 0.5)"
                style={styles.input}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor="#fdfdfd"
                cursorColor="#733fea"
                selectionColor="rgba(115, 63, 234, 0.3)"
                right={
                  <TextInput.Icon 
                    icon={showConfirmPassword ? "eye" : "eye-off"} 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    color="#fdfdfd"
                  />
                }
              />
            </View>

            {/* Indicateurs de validation */}
            {password.length > 0 && (
              <View style={{ marginTop: 8, marginBottom: 8, paddingHorizontal: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <MaterialCommunityIcons 
                    name={password.length >= 6 ? "check-circle" : "alert-circle"} 
                    size={16} 
                    color={password.length >= 6 ? "#10B981" : "#ff6b6b"} 
                  />
                  <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '500', color: password.length >= 6 ? "#10B981" : "#ff6b6b" }}>
                    {t.auth.minCharacters}
                  </Text>
                </View>
                {passwordStrength && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <MaterialCommunityIcons name="shield-check" size={16} color={strengthColor} />
                    <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '500', color: strengthColor }}>
                      {t.auth.strength}: {passwordStrength}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {confirmPassword.length > 0 && (
              <View style={{ marginTop: 8, marginBottom: 8, paddingHorizontal: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <MaterialCommunityIcons 
                    name={passwordsMatch ? "check-circle" : "close-circle"} 
                    size={16} 
                    color={passwordsMatch ? "#10B981" : "#ff6b6b"} 
                  />
                  <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '500', color: passwordsMatch ? "#10B981" : "#ff6b6b" }}>
                    {passwordsMatch ? t.auth.passwordsMatch : t.auth.passwordsDontMatch}
                  </Text>
                </View>
              </View>
            )}
            
            {error ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#ff6b6b" />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}
            
            <Button 
              mode="contained" 
              onPress={handleSignup}
              loading={loading}
              style={styles.button}
              buttonColor="#733fea"
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {t.auth.createAccount}
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t.common.or}</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>{t.auth.haveAccount} </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>{t.auth.signIn}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Sélection Pays */}
      <Modal
        visible={countryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.auth.chooseCountry}</Text>
              <TouchableOpacity 
                onPress={() => setCountryModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#fdfdfd" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {REGIONS.map((region) => (
                <View key={region}>
                  <Text style={styles.regionTitle}>{region}</Text>
                  {COUNTRIES.filter(c => c.region === region).map((country) => (
                    <TouchableOpacity
                      key={country.code}
                      style={[
                        styles.countryOption,
                        selectedCountry?.code === country.code && styles.countryOptionActive
                      ]}
                      onPress={() => handleCountrySelect(country)}
                    >
                      <Text style={styles.countryOptionFlag}>{country.flag}</Text>
                      <View style={styles.countryOptionContent}>
                        <Text style={styles.countryOptionName}>{country.name}</Text>
                        <Text style={styles.countryOptionInfo}>
                          {country.currency} • {country.language}
                        </Text>
                      </View>
                      {selectedCountry?.code === country.code && (
                        <MaterialCommunityIcons name="check-circle" size={24} color="#733fea" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(253, 253, 253, 0.7)',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 16,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    height: 56,
  },
  button: {
    marginTop: 24,
    borderRadius: 16,
    elevation: 0,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  error: {
    color: '#ff6b6b',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    color: 'rgba(253, 253, 253, 0.7)',
    fontSize: 14,
  },
  loginLink: {
    color: '#733fea',
    fontWeight: 'bold',
    fontSize: 14,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  countrySelectorContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryText: {
    fontSize: 16,
    color: '#fdfdfd',
  },
  countryPlaceholder: {
    fontSize: 16,
    color: 'rgba(253, 253, 253, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fdfdfd',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    paddingHorizontal: 24,
  },
  regionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#733fea',
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  countryOptionActive: {
    borderColor: '#733fea',
    backgroundColor: 'rgba(115, 63, 234, 0.1)',
  },
  countryOptionFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  countryOptionContent: {
    flex: 1,
  },
  countryOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 4,
  },
  countryOptionInfo: {
    fontSize: 13,
    color: 'rgba(253, 253, 253, 0.6)',
  },
});