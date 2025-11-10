import { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../src/store/authStore';
import { getCountryByCode } from '../src/constants/countries';

const { width, height } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);
  const { setCurrency, setLanguage, setTheme } = useAuthStore();

  useEffect(() => {
    // Animation plus fluide et professionnelle
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

        // Charger les préférences utilisateur depuis AsyncStorage
        const savedCurrency = await AsyncStorage.getItem('currency');
        const savedLanguage = await AsyncStorage.getItem('language');
        const savedTheme = await AsyncStorage.getItem('theme');
        
        if (savedCurrency) {
          setCurrency(savedCurrency);
        } else {
          // Fallback: charger depuis le pays de l'utilisateur
          const userStr = await AsyncStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            if (userData.country) {
              const country = getCountryByCode(userData.country);
              if (country) {
                setCurrency(country.currency);
                setLanguage(country.language);
              }
            }
          }
        }
        
        if (savedLanguage) {
          setLanguage(savedLanguage);
        }
        
        if (savedTheme) {
          setTheme(savedTheme as 'Sombre' | 'Clair' | 'Automatique');
        }

        // Attendre 3 secondes pour une expérience fluide
        setTimeout(() => {
          if (token) {
            router.replace('/(tabs)/dashboard');
          } else if (hasSeenOnboarding) {
            router.replace('/(auth)/login');
          } else {
            router.replace('/(onboarding)/welcome');
          }
        }, 3000);
      } catch (error) {
        console.error('Error checking auth:', error);
        setTimeout(() => {
          router.replace('/(onboarding)/welcome');
        }, 3000);
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#733fea', '#98e0f8']}
        style={styles.gradient}
      >
        {/* Nom de l'app avec logo intégré comme U */}
        <View style={styles.brandContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.appNamePart}>Grow</Text>
            <View style={styles.logoInline}>
              <Image 
                source={require('../assets/logo.png')} 
                style={styles.logoLarge}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appNamePart}>p</Text>
          </View>
        </View>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>
            Take Control of Your Finances
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appNamePart: {
    fontSize: 72,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  logoInline: {
    marginHorizontal: -8,
    marginTop: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLarge: {
    width: 110,
    height: 110,
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 40,
  },
  tagline: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontWeight: '400',
  },
});
