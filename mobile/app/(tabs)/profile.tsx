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
import { getCurrencySymbol } from '../../src/utils/currency';

export default function Profile() {
  const router = useRouter();
  const { user, logout, currency, language, theme, setCurrency, setLanguage, setTheme } = useAuthStore();
  const currencySymbol = getCurrencySymbol(currency);
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

  // Recharger les données quand on revient sur la page
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
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
        setUserName(userData.name || userData.email?.split('@')[0] || 'Utilisateur');
        setUserEmail(userData.email || '');
        setProfilePhoto(userData.profilePhoto || null);
        setEditName(userData.name || userData.email?.split('@')[0] || '');
        
        // Charger le pays
        if (userData.country) {
          const country = getCountryByCode(userData.country);
          if (country) {
            setSelectedCountry(country);
            setSelectedCurrency(country.currency);
            setCurrency(country.currency); // Mettre à jour le store global
            setSelectedLanguage(country.language);
            setLanguage(country.language); // Mettre à jour le store global
          }
        }
      }
      
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
      
      Alert.alert('Succès', `Pays changé en ${country.name}`);
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
          'Permission refusée',
          'Nous avons besoin de votre permission pour accéder à la caméra.'
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
          
          Alert.alert('Succès', 'Photo de profil mise à jour');
        }
      }
    } catch (error) {
      console.error('Erreur photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
    }
  };

  const handleChooseFromGallery = async () => {
    setPhotoModalVisible(false);
    
    try {
      // Demander la permission d'accès à la galerie
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Nous avons besoin de votre permission pour accéder à la galerie.'
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
          
          Alert.alert('Succès', 'Photo de profil mise à jour');
        }
      }
    } catch (error) {
      console.error('Erreur galerie:', error);
      Alert.alert('Erreur', 'Impossible de choisir la photo');
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
      Alert.alert('Succès', 'Photo supprimée');
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
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
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
      Alert.alert('Erreur', 'Veuillez entrer un nom');
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
      
      Alert.alert('Succès', 'Profil mis à jour avec succès');
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
                <Text style={styles.editProfileText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
          
          {/* Carte flottante avec stats */}
          <View style={styles.floatingCard}>
            <View style={styles.statMini}>
              <MaterialCommunityIcons name="wallet-outline" size={20} color="#733fea" />
              <Text style={styles.statMiniValue}>{balance.toFixed(0)} {currencySymbol}</Text>
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
            <Text style={styles.sectionTitle}>Paramètres du compte</Text>
            
            <MenuItem
              icon="account-edit"
              title="Informations personnelles"
              subtitle="Nom, email, photo"
              color="#733fea"
              onPress={() => setEditProfileVisible(true)}
            />
            
            <MenuItem
              icon="lock"
              title="Sécurité"
              subtitle="Mot de passe, authentification"
              color="#F44336"
              onPress={() => Alert.alert(
                'Sécurité',
                'Fonctionnalités de sécurité :\n\n' +
                '• Changement de mot de passe\n' +
                '• Authentification à deux facteurs\n' +
                '• Historique des connexions\n\n' +
                'Ces fonctionnalités seront disponibles prochainement.'
              )}
            />

            <MenuItem
              icon="earth"
              title="Pays"
              subtitle={selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : 'Non défini'}
              color="#98e0f8"
              onPress={() => setCountryModalVisible(true)}
            />
            
            <MenuItem
              icon={getCurrencyIcon(selectedCurrency)}
              title="Devise"
              subtitle={selectedCurrency}
              color="#FFC107"
              onPress={() => setCurrencyVisible(true)}
            />
            
            <MenuItem
              icon="translate"
              title="Langue"
              subtitle={selectedLanguage}
              color="#10B981"
              onPress={() => setLanguageVisible(true)}
            />
          </View>

          {/* Préférences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Préférences</Text>
            
            <MenuItem
              icon="theme-light-dark"
              title="Thème"
              subtitle={selectedTheme}
              color="#98e0f8"
              onPress={() => setThemeVisible(true)}
            />
            
            <MenuItem
              icon="bell"
              title="Notifications"
              subtitle="Gérer les notifications"
              color="#FF6B6B"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
            
            <MenuItem
              icon="backup-restore"
              title="Sauvegarde"
              subtitle="Sauvegarder vos données"
              color="#4ECDC4"
              onPress={() => Alert.alert(
                'Sauvegarde',
                'Options de sauvegarde :\n\n' +
                '• Sauvegarde automatique dans le cloud\n' +
                '• Export des données en CSV\n' +
                '• Restauration depuis une sauvegarde\n\n' +
                'Vos données sont actuellement sauvegardées automatiquement.'
              )}
            />
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support & Informations</Text>
            
            <MenuItem
              icon="help-circle"
              title="Aide & Support"
              color="#733fea"
              onPress={() => Alert.alert('Aide & Support', 'Contactez-nous à :\n\nEmail: nicedev226@gmail.com\n\nNous vous répondrons dans les plus brefs délais.')}
            />
            
            <MenuItem
              icon="shield-check"
              title="Confidentialité"
              color="#10B981"
              onPress={() => Alert.alert(
                'Politique de confidentialité',
                'GrowUp respecte votre vie privée.\n\n' +
                '• Vos données sont stockées de manière sécurisée\n' +
                '• Nous ne partageons pas vos informations\n' +
                '• Vous pouvez supprimer vos données à tout moment\n\n' +
                'Pour plus d\'informations, contactez-nous à nicedev226@gmail.com'
              )}
            />
            
            <MenuItem
              icon="file-document"
              title="Conditions d'utilisation"
              color="#98e0f8"
              onPress={() => Alert.alert(
                'Conditions d\'utilisation',
                'En utilisant GrowUp, vous acceptez :\n\n' +
                '• D\'utiliser l\'application de manière responsable\n' +
                '• De fournir des informations exactes\n' +
                '• De respecter les autres utilisateurs\n\n' +
                'Version 1.0.0 - © 2025 GrowUp\n\n' +
                'Contact: nicedev226@gmail.com'
              )}
            />
            
            <MenuItem
              icon="information"
              title="À propos"
              subtitle="Version 1.0.0"
              color="#FFC107"
              onPress={() => Alert.alert(
                'GrowUp - Gestion Financière',
                'Version 1.0.0\n\n' +
                '📱 Application mobile de gestion financière personnelle\n\n' +
                '✨ Fonctionnalités :\n' +
                '• Suivi des transactions\n' +
                '• Gestion des objectifs d\'épargne\n' +
                '• Statistiques détaillées\n' +
                '• Notifications intelligentes\n\n' +
                '© 2025 GrowUp. Tous droits réservés.\n\n' +
                'Développé avec ❤️ pour vous aider à mieux gérer vos finances.'
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
            <Text style={styles.logoutText}>Se déconnecter</Text>
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
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre nom"
                placeholderTextColor="rgba(253, 253, 253, 0.4)"
                value={editName}
                onChangeText={setEditName}
              />
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={userEmail}
                editable={false}
              />
              <Text style={styles.inputHint}>L'email ne peut pas être modifié</Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setEditProfileVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Enregistrer</Text>
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
            <Text style={styles.modalTitle}>Choisir la devise</Text>
            
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
                const currencyNames: { [key: string]: string } = {
                  'EUR': 'Euro', 'USD': 'Dollar US', 'GBP': 'Livre Sterling', 'CHF': 'Franc Suisse',
                  'XOF': 'Franc CFA de l\'Ouest (BCEAO)', 'XAF': 'Franc CFA du Centre (BEAC)', 'MAD': 'Dirham Marocain', 
                  'TND': 'Dinar Tunisien', 'ZAR': 'Rand Sud-Africain', 'NGN': 'Naira Nigérian',
                  'GHS': 'Cedi Ghanéen', 'KES': 'Shilling Kenyan'
                };
                return (
                  <TouchableOpacity
                    key={currency}
                    style={[
                      styles.optionItem,
                      selectedCurrency === currency && styles.optionItemActive
                    ]}
                    onPress={() => {
                      setSelectedCurrency(currency);
                      setCurrency(currency); // Sauvegarder dans le store global
                      setCurrencyVisible(false);
                      Alert.alert('Succès', `Devise changée en ${currencyNames[currency]}`);
                    }}
                  >
                    <View style={styles.currencyOption}>
                      <Text style={styles.optionText}>{currencyNames[currency]}</Text>
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
              <Text style={styles.closeButtonText}>Fermer</Text>
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
            <Text style={styles.modalTitle}>Choisir la langue</Text>
            
            {['Français', 'English', 'Español'].map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.optionItem,
                  selectedLanguage === language && styles.optionItemActive
                ]}
                onPress={() => {
                  setSelectedLanguage(language);
                  setLanguage(language); // Sauvegarder dans le store global
                  setLanguageVisible(false);
                  Alert.alert('Succès', `Langue changée en ${language}`);
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
              <Text style={styles.closeButtonText}>Fermer</Text>
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
            <Text style={styles.modalTitle}>Choisir le thème</Text>
            
            {(['Sombre', 'Clair', 'Automatique'] as const).map((theme) => (
              <TouchableOpacity
                key={theme}
                style={[
                  styles.optionItem,
                  selectedTheme === theme && styles.optionItemActive
                ]}
                onPress={() => {
                  setSelectedTheme(theme);
                  setTheme(theme); // Sauvegarder dans le store global
                  setThemeVisible(false);
                  Alert.alert('Succès', `Thème "${theme}" sélectionné.\n\nNote: L'implémentation complète des thèmes sera disponible prochainement.`);
                }}
              >
                <View style={styles.optionContent}>
                  <MaterialCommunityIcons 
                    name={theme === 'Sombre' ? 'weather-night' : theme === 'Clair' ? 'weather-sunny' : 'theme-light-dark'} 
                    size={24} 
                    color={selectedTheme === theme ? '#733fea' : 'rgba(253, 253, 253, 0.6)'} 
                  />
                  <Text style={styles.optionText}>{theme}</Text>
                </View>
                {selectedTheme === theme && (
                  <MaterialCommunityIcons name="check" size={24} color="#733fea" />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setThemeVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
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
              <Text style={styles.modalTitle}>Photo de profil</Text>
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
                <Text style={styles.photoOptionTitle}>Prendre une photo</Text>
                <Text style={styles.photoOptionSubtitle}>Utiliser l'appareil photo</Text>
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
                <Text style={styles.photoOptionTitle}>Choisir depuis la galerie</Text>
                <Text style={styles.photoOptionSubtitle}>Sélectionner une photo existante</Text>
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
                  <Text style={[styles.photoOptionTitle, { color: '#F44336' }]}>Supprimer la photo</Text>
                  <Text style={styles.photoOptionSubtitle}>Retirer la photo actuelle</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(244, 67, 54, 0.5)" />
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.cancelPhotoButton}
              onPress={() => setPhotoModalVisible(false)}
            >
              <Text style={styles.cancelPhotoButtonText}>Annuler</Text>
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
              <Text style={styles.modalTitle}>Choisir votre pays</Text>
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
              {['Europe', 'Amérique', 'Afrique'].map((region) => (
                <View key={region}>
                  <Text style={styles.regionTitle}>{region}</Text>
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
              ))}
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
