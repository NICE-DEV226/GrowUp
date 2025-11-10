import { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

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
    <LinearGradient
      colors={['#1a1a1a', '#733fea', '#98e0f8']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text
        style={[
          styles.appName,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        GrowUp
      </Animated.Text>

      <Animated.Text
        style={[
          styles.tagline,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        Take Control of Your Finances
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 180,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(253, 253, 253, 0.8)',
  },
});
