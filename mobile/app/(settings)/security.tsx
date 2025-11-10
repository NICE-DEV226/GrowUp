import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  TextInput,
  Alert,
  Switch,
  Platform
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import api from '../../src/services/api';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function Security() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricSetting();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const available = compatible && enrolled;
      
      setBiometricAvailable(available);

      if (available) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType(t('faceID'));
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType(t('fingerprint'));
        } else {
          setBiometricType(t('biometry'));
        }
      }
    } catch (error) {
      console.error('Erreur vérification biométrie:', error);
      setBiometricAvailable(false);
    }
  };

  const loadBiometricSetting = async () => {
    try {
      const setting = await AsyncStorage.getItem('biometricEnabled');
      if (setting !== null) {
        setBiometricEnabled(JSON.parse(setting));
      }
    } catch (error) {
      console.error('Erreur chargement paramètre biométrique:', error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!biometricAvailable) {
      Alert.alert(
        t('biometricNotAvailable'),
        t('biometricNotAvailableAlert')
      );
      return;
    }

    if (value) {
      // Demander l'authentification avant d'activer
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: t('authenticateToEnable'),
          fallbackLabel: t('useCode'),
          cancelLabel: t('cancel'),
        });

        if (result.success) {
          // Envoyer au backend
          try {
            await api.put('/users/me/biometric', { enabled: true });
            await AsyncStorage.setItem('biometricEnabled', JSON.stringify(true));
            setBiometricEnabled(true);
            Alert.alert(
              t('biometricEnabled'),
              t('biometricEnabledMessage').replace('{type}', biometricType)
            );
          } catch (error) {
            console.error('Erreur sauvegarde biométrie:', error);
            Alert.alert(t('error'), t('cannotSaveSetting'));
          }
        } else {
          Alert.alert(t('authenticationFailed'), t('authenticationCancelled'));
        }
      } catch (error) {
        console.error('Erreur authentification biométrique:', error);
        Alert.alert(t('error'), t('cannotEnableBiometric'));
      }
    } else {
      // Désactiver directement
      try {
        await api.put('/users/me/biometric', { enabled: false });
        await AsyncStorage.setItem('biometricEnabled', JSON.stringify(false));
        setBiometricEnabled(false);
        Alert.alert(t('disabled'), t('biometricDisabled'));
      } catch (error) {
        console.error('Erreur désactivation biométrie:', error);
        Alert.alert(t('error'), t('cannotDisableBiometric'));
      }
    }
  };

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: t('passwordMustBe8Chars') };
    }
    
    // Vérifier qu'il contient au moins une lettre majuscule
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: t('passwordMustHaveUppercase') };
    }
    
    // Vérifier qu'il contient au moins un chiffre
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: t('passwordMustHaveNumber') };
    }
    
    return { valid: true };
  };

  const handleChangePassword = async () => {
    // Validation des champs
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('error'), t('fillAllPasswordFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDoNotMatch'));
      return;
    }

    // Validation du nouveau mot de passe
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      Alert.alert(t('error'), validation.message || t('invalidPassword'));
      return;
    }

    try {
      // Appeler l'API backend
      await api.put('/users/me/password', {
        currentPassword,
        newPassword
      });

      // Mettre à jour localement aussi
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        userData.password = newPassword;
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }

      Alert.alert(
        t('success'),
        t('passwordChangedSuccess'),
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }
          }
        ]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('cannotChangePassword');
      if (error.response?.status === 401) {
        Alert.alert(t('error'), t('currentPasswordIncorrect'));
      } else {
        Alert.alert(t('error'), errorMessage);
      }
      console.error('Erreur changement mot de passe:', error);
      Alert.alert(t('error'), t('cannotChangePassword'));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#733fea', '#9b6ff7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('securityTitle')}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Changer le mot de passe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('changePasswordTitle')}</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('currentPasswordLabel')}</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                placeholder={t('enterCurrentPassword')}
                placeholderTextColor="rgba(253, 253, 253, 0.4)"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons 
                  name={showCurrentPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="rgba(253, 253, 253, 0.6)" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('newPasswordLabel')}</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                placeholder={t('enterNewPassword')}
                placeholderTextColor="rgba(253, 253, 253, 0.4)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons 
                  name={showNewPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="rgba(253, 253, 253, 0.6)" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('confirmPasswordLabel')}</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                placeholder={t('confirmNewPassword')}
                placeholderTextColor="rgba(253, 253, 253, 0.4)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="rgba(253, 253, 253, 0.6)" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.primaryButtonText}>{t('changePasswordButton')}</Text>
          </TouchableOpacity>
        </View>

        {/* Authentification biométrique */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('biometricAuthentication')}</Text>
          
          {!biometricAvailable && (
            <View style={[styles.infoCard, { backgroundColor: 'rgba(244, 67, 54, 0.1)', borderColor: 'rgba(244, 67, 54, 0.2)', marginBottom: 15 }]}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#F44336" />
              <Text style={styles.infoText}>
                {t('biometricNotAvailableMessage')}
              </Text>
            </View>
          )}
          
          <View style={[styles.settingItem, !biometricAvailable && { opacity: 0.5 }]}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name={biometricType === t('faceID') ? 'face-recognition' : 'fingerprint'} 
                  size={28} 
                  color="#733fea" 
                />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>
                  {biometricType || t('fingerprintFaceID')}
                </Text>
                <Text style={styles.settingSubtitle}>
                  {biometricAvailable 
                    ? t('quickSecureLogin')
                    : t('notAvailableOnDevice')}
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={!biometricAvailable}
              trackColor={{ false: '#2a2a2a', true: '#733fea' }}
              thumbColor={biometricEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          {biometricEnabled && biometricAvailable && (
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
              <Text style={styles.infoText}>
                {t('biometricActiveMessage').replace('{type}', biometricType)}
              </Text>
            </View>
          )}
        </View>

        {/* Exigences du mot de passe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('securityRequirements')}</Text>
          
          <View style={styles.requirementCard}>
            <View style={styles.requirementItem}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
              <Text style={styles.requirementText}>{t('minimum8Characters')}</Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
              <Text style={styles.requirementText}>{t('atLeastOneUppercase')}</Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
              <Text style={styles.requirementText}>{t('atLeastOneNumber')}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fdfdfd',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.7)',
    marginBottom: 8,
  },
  passwordInput: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#fdfdfd',
    borderWidth: 1,
    borderColor: 'rgba(115, 63, 234, 0.3)',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  primaryButton: {
    backgroundColor: '#733fea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: 'rgba(253, 253, 253, 0.5)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(115, 63, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(152, 224, 248, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(152, 224, 248, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.7)',
    marginLeft: 10,
    lineHeight: 20,
  },
  requirementCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  requirementText: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.7)',
    marginLeft: 10,
  },
});
