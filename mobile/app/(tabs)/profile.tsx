import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Animated, 
  TextInput, 
  Modal, 
  Alert,
  RefreshControl,
  Image
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../src/store/authStore';
import { COUNTRIES, Country, getCountryByCode } from '../../src/constants/countries';
import api from '../../src/services/api';
import * as ImagePicker from 'expo-image-picker';
import { getCurrencySymbol, formatSmartAmount } from '../../src/utils/currency';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function Profile() {
  const router = useRouter();
  const { user, logout, currency, language, theme, setCurrency, setTheme } = useAuthStore();
  const currencySymbol = getCurrencySymbol(currency);
  const { t, changeLanguage } = useTranslation();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [currencyVisible, setCurrencyVisible] = useState(false);
  const [languageVisible, setLanguageVisible] = useState(false);
  const [themeVisible, setThemeVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  
  // Stats du profil
  const [balance, setBalance] = useState(0);
  const [goalsCount, setGoalsCount] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);
  
  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Fonction pour obtenir l'icône de devise
  const getCurrencyIcon = (curr: string) => {
    const icons: { [key: string]: string } = {
      'EUR': 'currency-eur',
      'USD': 'currency-usd',
      'GBP': 'currency-gbp',
      'CHF': 'currency-chf',
      'XOF': 'cash',
      'XAF': 'cash',
      'MAD': 'cash',
      'TND': 'cash',
      'ZAR': 'currency-zar',
      'NGN': 'currency-ngn',
      'GHS': 'cash',
      'KES': 'cash',
    };
    return icons[curr] || 'cash-multiple';
  };

  // Synchroniser avec le store à chaque fois qu'on revient sur la page
  useFocusEffect(
    useCallback(() => {
      // Mettre à jour les valeurs affichées depuis le store
      setSelectedCurrency(currency);
      setSelectedLanguage(language);
      setSelectedTheme(theme);
      
      // Recharger les stats
      loadStats();
    }, [currency, language, theme])
  );

  useEffect(() => {
    loadUserData();
    
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUserName(userData.name || userData.email?.split('@')[0] || t('user'));
        setUserEmail(userData.email || '');
        setProfilePhoto(userData.profilePhoto || null);
        setEditName(userData.name || userData.email?.split('@')[0] || '');
        
        // Charger le pays
        if (userData.country) {
          const country = getCountryByCode(userData.country);
          if (country) {
            setSelectedCountry(country);
          }
        }
      }
      
      // Charger les préférences depuis le store (pas depuis AsyncStorage)
      setSelectedCurrency(currency);
      setSelectedLanguage(language);
      setSelectedTheme(theme);
      
      // Charger les stats
      await loadStats();
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const loadStats = async () => {
    try {
      
      // Charger les stats depuis le backend
      const statsResponse = await api.get('/stats/summary');
      setBalance(statsResponse.data.totalBalance || 0);
      
      const goalsResponse = await api.get('/goals');
      setGoalsCount(goalsResponse.data.goals?.length || 0);
      
      const transactionsResponse = await api.get('/transactions?limit=1000');
      setTransactionsCount(transactionsResponse.data.transactions?.length || 0);
      
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const handleCountrySelect = async (country: Country) => {
    setSelectedCountry(country);
    setSelectedCurrency(country.currency);
    setSelectedLanguage(country.language);
    setCountryModalVisible(false);
    
    // Sauvegarder dans AsyncStorage
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      userData.country = country.code;
      userData.currency = country.currency;
      userData.language = country.language;
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // TODO: Envoyer au backend
      // await api.put('/users/me', { 
      //   country: country.code,
      //   currency: country.currency,
      //   language: country.language
      // });
      
      Alert.alert(t('success'), `${t('countryChanged')} ${country.name}`);
    }
  };

  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  const handleChangePhoto = () => {
    setPhotoModalVisible(true);
  };

  const handleTakePhoto = async () => {
    setPhotoModalVisible(false);
    
    try {
      // Demander la permission d'accès à la caméra
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          t('permissionDenied'),
          t('cameraPermissionMessage')
        );
        return;
      }

      // Ouvrir la caméra
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Sauvegarder localement
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          userData.profilePhoto = imageUri;
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          setProfilePhoto(imageUri);
          
          // TODO: Upload vers le backend
          // const formData = new FormData();
          // formData.append('photo', {
          //   uri: imageUri,
          //   type: 'image/jpeg',
          //   name: 'profile.jpg',
          // });
          // await api.post('/users/me/photo', formData);
          
          Alert.alert(t('success'), t('profilePhotoUpdated'));
        }
      }
    } catch (error) {
      console.error('Erreur photo:', error);
      Alert.alert(t('error'), t('cannotTakePhoto'));
    }
  };

  const handleChooseFromGallery = async () => {
    setPhotoModalVisible(false);
    
    try {
      // Demander la permission d'accès à la galerie
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          t('permissionDenied'),
          t('galleryPermissionMessage')
        );
        return;
      }

      // Ouvrir la galerie
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Sauvegarder localement
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          userData.profilePhoto = imageUri;
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          setProfilePhoto(imageUri);
          
          // TODO: Upload vers le backend
          // const formData = new FormData();
          // formData.append('photo', {
          //   uri: imageUri,
          //   type: 'image/jpeg',
          //   name: 'profile.jpg',
          // });
          // await api.post('/users/me/photo', formData);
          
          Alert.alert(t('success'), t('profilePhotoUpdated'));
        }
      }
    } catch (error) {
      console.error('Erreur galerie:', error);
      Alert.alert(t('error'), t('cannotChoosePhoto'));
    }
  };

  const handleDeletePhoto = async () => {
    setPhotoModalVisible(false);
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      userData.profilePhoto = null;
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setProfilePhoto(null);
      Alert.alert(t('success'), t('photoDeleted'));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Appeler le backend pour invalider le token
              await api.post('/auth/logout');
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              // Continuer même si l'appel échoue
            } finally {
              // Nettoyer le stockage local
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              logout();
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert(t('error'), t('enterName'));
      return;
    }

    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      userData.name = editName.trim();
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUserName(editName.trim());
      setEditProfileVisible(false);
      
      // TODO: Envoyer au backend
      // await api.put('/users/me', { name: editName.trim() });
      
      Alert.alert(t('success'), t('profileUpdated'));
    }
  };

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    color = '#733fea',
    showChevron = true 
  }: any) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showChevron && (
        <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(253, 253, 253, 0.3)" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header avec profil moderne */}
      <Animated.View style={{ opacity: headerOpacity }}>
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={['#733fea', '#98e0f8']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Cercles décoratifs */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            
            <View style={styles.headerContent}>
              <View style={styles.avatarSection}>
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarRing}>
                    <View style={styles.avatar}>
                      {profilePhoto ? (
                        <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
                      ) : (
                        <Text style={styles.avatarText}>
                          {userName.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.editAvatarButton}
                    onPress={handleChangePhoto}
                  >
                    <MaterialCommunityIcons name="camera" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userName}</Text>
                  <View style={styles.emailContainer}>
                    <MaterialCommunityIcons name="email-outline" size={12} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.userEmail}>{userEmail}</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.editProfileButton}
                onPress={() => setEditProfileVisible(true)}
              >
                <MaterialCommunityIcons name="pencil-outline" size={16} color="#fff" />
                <Text style={styles.editProfileText}>{t('edit')}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
          
          {/* Carte flottante avec stats */}
          <View style={styles.floatingCard}>
            <View style={styles.statMini}>
              <MaterialCommunityIcons name="wallet-outline" size={20} color="#733fea" />
              <Text style={styles.statMiniValue}>{formatSmartAmount(balance, currency)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statMini}>
              <MaterialCommunityIcons name="target" size={20} color="#98e0f8" />
              <Text style={styles.statMiniValue}>{goalsCount}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statMini}>
              <MaterialCommunityIcons name="chart-line" size={20} color="#10B981" />
              <Text style={styles.statMiniValue}>{transactionsCount}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#733fea"
            colors={['#733fea']}
            progressBackgroundColor="#2a2a2a"
          />
        }
      >
        <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
          {/* Paramètres du compte */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('accountSettings')}</Text>
            
            <MenuItem
              icon="account-edit"
              title={t('editProfile')}
              subtitle={t('namePhoto')}
              color="#733fea"
              onPress={() => setEditProfileVisible(true)}
            />
            
            <MenuItem
              icon="account-details"
              title={t('personalInfo')}
              subtitle={t('contactAddress')}
              color="#10B981"
              onPress={() => router.push('/(settings)/personal-info')}
            />
            
            <MenuItem
              icon="lock"
              title={t('security')}
              subtitle={t('passwordAuth')}
              color="#F44336"
              onPress={() => router.push('/(settings)/security')}
            />

            <MenuItem
              icon="earth"
              title={t('country')}
              subtitle={selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : t('notDefined')}
              color="#98e0f8"
              onPress={() => setCountryModalVisible(true)}
            />
            
            <MenuItem
              icon={getCurrencyIcon(selectedCurrency)}
              title={t('currency')}
              subtitle={selectedCurrency}
              color="#FFC107"
              onPress={() => setCurrencyVisible(true)}
            />
            
            <MenuItem
              icon="translate"
              title={t('language')}
              subtitle={selectedLanguage}
              color="#10B981"
              onPress={() => setLanguageVisible(true)}
            />
          </View>

          {/* Préférences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('preferences')}</Text>
            
            <MenuItem
              icon="theme-light-dark"
              title={t('theme')}
              subtitle={
                selectedTheme === 'Sombre' ? t('dark') : 
                selectedTheme === 'Clair' ? t('light') : 
                selectedTheme === 'Automatique' ? t('automatic') : 
                selectedTheme
              }
              color="#98e0f8"
              onPress={() => setThemeVisible(true)}
            />
            
            <MenuItem
              icon="bell"
              title={t('notifications')}
              subtitle={t('manageNotifications')}
              color="#FF6B6B"
              onPress={() => router.push('/(settings)/notifications')}
            />
            
            <MenuItem
              icon="backup-restore"
              title={t('backup')}
              subtitle={t('backupData')}
              color="#4ECDC4"
              onPress={() => Alert.alert(
                t('backup'),
                t('backupOptions')
              )}
            />
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('support')}</Text>
            
            <MenuItem
              icon="help-circle"
              title={t('helpSupport')}
              color="#733fea"
              onPress={() => Alert.alert(t('helpSupport'), t('contactUs'))}
            />
            
            <MenuItem
              icon="shield-check"
              title={t('privacyPolicy')}
              color="#10B981"
              onPress={() => Alert.alert(
                t('privacyPolicy'),
                t('privacyMessage')
              )}
            />
            
            <MenuItem
              icon="file-document"
              title={t('termsOfService')}
              color="#98e0f8"
              onPress={() => Alert.alert(
                t('termsOfService'),
                t('termsMessage')
              )}
            />
            
            <MenuItem
              icon="information"
              title={t('about')}
              subtitle="Version 1.0.0"
              color="#FFC107"
              onPress={() => Alert.alert(
                t('about'),
                t('aboutMessage')
              )}
            />
          </View>

          {/* Déconnexion */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#F44336" />
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Modal Édition Profil */}
      <Modal
        visible={editProfileVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditProfileVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('editProfile')}</Text>
            
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>{t('name')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('yourName')}
                placeholderTextColor="rgba(253, 253, 253, 0.4)"
                value={editName}
                onChangeText={setEditName}
              />
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>{t('email')}</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={userEmail}
                editable={false}
              />
              <Text style={styles.inputHint}>{t('emailCannotBeModified')}</Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setEditProfileVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Devise */}
      <Modal
        visible={currencyVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCurrencyVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('chooseCurrency')}</Text>
            
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {['EUR', 'USD', 'GBP', 'CHF', 'XOF', 'XAF', 'MAD', 'TND', 'ZAR', 'NGN', 'GHS', 'KES'].map((currency) => {
                const currencySymbols: { [key: string]: string } = {
                  'EUR': '€', 'USD': '$', 'GBP': '£', 'CHF': 'CHF',
                  'XOF': 'CFA', 'XAF': 'FCFA', 'MAD': 'DH', 'TND': 'DT',
                  'ZAR': 'R', 'NGN': '₦', 'GHS': '₵', 'KES': 'KSh'
                };
                const getCurrencyName = (curr: string) => {
                  const names: { [key: string]: string } = {
                    'EUR': t('euro'), 'USD': t('usDollar'), 'GBP': t('poundSterling'), 'CHF': t('swissFranc'),
                    'XOF': t('westAfricanCFA'), 'XAF': t('centralAfricanCFA'), 'MAD': t('moroccanDirham'), 
                    'TND': t('tunisianDinar'), 'ZAR': t('southAfricanRand'), 'NGN': t('nigerianNaira'),
                    'GHS': t('ghanaianCedi'), 'KES': t('kenyanShilling')
                  };
                  return names[curr] || curr;
                };
                return (
                  <TouchableOpacity
                    key={currency}
                    style={[
                      styles.optionItem,
                      selectedCurrency === currency && styles.optionItemActive
                    ]}
                    onPress={async () => {
                      try {
                        setSelectedCurrency(currency);
                        setCurrency(currency); // Sauvegarder dans le store global
                        
                        // Envoyer au backend
                        await api.put('/users/me', { currency });
                        
                        // Sauvegarder dans AsyncStorage
                        const userStr = await AsyncStorage.getItem('user');
                        if (userStr) {
                          const userData = JSON.parse(userStr);
                          userData.currency = currency;
                          await AsyncStorage.setItem('user', JSON.stringify(userData));
                        }
                        
                        setCurrencyVisible(false);
                        Alert.alert(t('success'), `${t('currencyChanged')} ${getCurrencyName(currency)}`);
                      } catch (error) {
                        console.error('Erreur changement devise:', error);
                        Alert.alert(t('error'), t('cannotChangeCurrency'));
                      }
                    }}
                  >
                    <View style={styles.currencyOption}>
                      <Text style={styles.optionText}>{getCurrencyName(currency)}</Text>
                      <Text style={styles.currencySymbol}>{currencySymbols[currency]}</Text>
                    </View>
                    {selectedCurrency === currency && (
                      <MaterialCommunityIcons name="check" size={24} color="#733fea" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setCurrencyVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Langue */}
      <Modal
        visible={languageVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('chooseLanguage')}</Text>
            
            {['Français', 'English', 'Español'].map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.optionItem,
                  selectedLanguage === language && styles.optionItemActive
                ]}
                onPress={async () => {
                  try {
                    setSelectedLanguage(language);
                    
                    // Changer la langue avec i18next (async)
                    await changeLanguage(language);
                    
                    // Envoyer au backend
                    await api.put('/users/me', { language });
                    
                    // Sauvegarder dans AsyncStorage user
                    const userStr = await AsyncStorage.getItem('user');
                    if (userStr) {
                      const userData = JSON.parse(userStr);
                      userData.language = language;
                      await AsyncStorage.setItem('user', JSON.stringify(userData));
                    }
                    
                    setLanguageVisible(false);
                    Alert.alert(t('success'), `${t('languageChanged')} ${language}`);
                  } catch (error) {
                    console.error('Erreur changement langue:', error);
                    Alert.alert(t('error'), t('cannotChangeLanguage'));
                  }
                }}
              >
                <Text style={styles.optionText}>{language}</Text>
                {selectedLanguage === language && (
                  <MaterialCommunityIcons name="check" size={24} color="#733fea" />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setLanguageVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Thème */}
      <Modal
        visible={themeVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setThemeVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('chooseTheme')}</Text>
            
            {(['Sombre', 'Clair', 'Automatique'] as const).map((theme) => {
              const getThemeName = (th: string) => {
                if (th === 'Sombre') return t('dark');
                if (th === 'Clair') return t('light');
                if (th === 'Automatique') return t('automatic');
                return th;
              };
              return (
              <TouchableOpacity
                key={theme}
                style={[
                  styles.optionItem,
                  selectedTheme === theme && styles.optionItemActive
                ]}
                onPress={async () => {
                  try {
                    setSelectedTheme(theme);
                    setTheme(theme); // Sauvegarder dans le store global
                    
                    // Envoyer au backend
                    await api.put('/users/me', { theme });
                    
                    // Sauvegarder dans AsyncStorage
                    const userStr = await AsyncStorage.getItem('user');
                    if (userStr) {
                      const userData = JSON.parse(userStr);
                      userData.theme = theme;
                      await AsyncStorage.setItem('user', JSON.stringify(userData));
                    }
                    
                    setThemeVisible(false);
                    Alert.alert(t('success'), `${t('themeApplied')} "${theme}"`);
                  } catch (error) {
                    console.error('Erreur changement thème:', error);
                    Alert.alert(t('error'), t('cannotChangeTheme'));
                  }
                }}
              >
                <View style={styles.optionContent}>
                  <MaterialCommunityIcons 
                    name={theme === 'Sombre' ? 'weather-night' : theme === 'Clair' ? 'weather-sunny' : 'theme-light-dark'} 
                    size={24} 
                    color={selectedTheme === theme ? '#733fea' : 'rgba(253, 253, 253, 0.6)'} 
                  />
                  <Text style={styles.optionText}>{getThemeName(theme)}</Text>
                </View>
                {selectedTheme === theme && (
                  <MaterialCommunityIcons name="check" size={24} color="#733fea" />
                )}
              </TouchableOpacity>
            );
            })}
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setThemeVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Photo de profil */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.photoModalContainer}>
            <View style={styles.photoModalHeader}>
              <Text style={styles.modalTitle}>{t('profilePhoto')}</Text>
              <TouchableOpacity 
                onPress={() => setPhotoModalVisible(false)}
                style={styles.closeIconButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#fdfdfd" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.photoOption}
              onPress={handleTakePhoto}
            >
              <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(115, 63, 234, 0.15)' }]}>
                <MaterialCommunityIcons name="camera" size={28} color="#733fea" />
              </View>
              <View style={styles.photoOptionContent}>
                <Text style={styles.photoOptionTitle}>{t('takePhoto')}</Text>
                <Text style={styles.photoOptionSubtitle}>{t('useCamera')}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(253, 253, 253, 0.3)" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.photoOption}
              onPress={handleChooseFromGallery}
            >
              <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(152, 224, 248, 0.15)' }]}>
                <MaterialCommunityIcons name="image" size={28} color="#98e0f8" />
              </View>
              <View style={styles.photoOptionContent}>
                <Text style={styles.photoOptionTitle}>{t('chooseFromGallery')}</Text>
                <Text style={styles.photoOptionSubtitle}>{t('selectExistingPhoto')}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(253, 253, 253, 0.3)" />
            </TouchableOpacity>

            {profilePhoto && (
              <TouchableOpacity 
                style={[styles.photoOption, styles.photoOptionDanger]}
                onPress={handleDeletePhoto}
              >
                <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(244, 67, 54, 0.15)' }]}>
                  <MaterialCommunityIcons name="delete" size={28} color="#F44336" />
                </View>
                <View style={styles.photoOptionContent}>
                  <Text style={[styles.photoOptionTitle, { color: '#F44336' }]}>{ t('deletePhoto')}</Text>
                  <Text style={styles.photoOptionSubtitle}>{t('removeCurrentPhoto')}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(244, 67, 54, 0.5)" />
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.cancelPhotoButton}
              onPress={() => setPhotoModalVisible(false)}
            >
              <Text style={styles.cancelPhotoButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Sélection Pays */}
      <Modal
        visible={countryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.photoModalHeader}>
              <Text style={styles.modalTitle}>{t('chooseYourCountry')}</Text>
              <TouchableOpacity 
                onPress={() => setCountryModalVisible(false)}
                style={styles.closeIconButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#fdfdfd" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {['Europe', 'Amérique', 'Afrique'].map((region) => {
                const getRegionName = (reg: string) => {
                  if (reg === 'Europe') return t('europe');
                  if (reg === 'Amérique') return t('america');
                  if (reg === 'Afrique') return t('africa');
                  return reg;
                };
                return (
                <View key={region}>
                  <Text style={styles.regionTitle}>{getRegionName(region)}</Text>
                  {COUNTRIES.filter(c => c.region === region).map((country) => (
                    <TouchableOpacity
                      key={country.code}
                      style={[
                        styles.optionItem,
                        selectedCountry?.code === country.code && styles.optionItemActive
                      ]}
                      onPress={() => handleCountrySelect(country)}
                    >
                      <Text style={styles.countryOptionFlag}>{country.flag}</Text>
                      <View style={styles.countryOptionContent}>
                        <Text style={styles.optionText}>{country.name}</Text>
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
              );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  headerWrapper: {
    position: 'relative',
    paddingBottom: 50,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    top: -30,
    right: -20,
    zIndex: 0,
  },
  decorCircle2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -10,
    left: -15,
    zIndex: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 10,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    zIndex: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#733fea',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#733fea',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    flexShrink: 1,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  floatingCard: {
    position: 'absolute',
    bottom: 10,
    left: 24,
    right: 24,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 5,
  },
  statMini: {
    alignItems: 'center',
    gap: 6,
  },
  statMiniValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fdfdfd',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginLeft: 24,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.5)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalScrollView: {
    maxHeight: 400,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 24,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fdfdfd',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  inputHint: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.5)',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'rgba(253, 253, 253, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#733fea',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionItemActive: {
    borderColor: '#733fea',
    backgroundColor: 'rgba(115, 63, 234, 0.1)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#fdfdfd',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: 'rgba(253, 253, 253, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  currencyOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 12,
  },
  currencySymbol: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.6)',
    fontWeight: '600',
  },
  photoModalContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  photoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  photoOptionDanger: {
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  photoOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  photoOptionContent: {
    flex: 1,
  },
  photoOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 4,
  },
  photoOptionSubtitle: {
    fontSize: 13,
    color: 'rgba(253, 253, 253, 0.6)',
  },
  cancelPhotoButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelPhotoButtonText: {
    color: '#fdfdfd',
    fontSize: 16,
    fontWeight: '600',
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
  countryOptionFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  countryOptionContent: {
    flex: 1,
  },
  countryOptionInfo: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.6)',
    marginTop: 2,
  },
});
