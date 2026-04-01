import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../../src/i18n';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const slides = [
    {
      icon: 'wallet-outline',
      title: t.onboarding.slide1Title,
      description: t.onboarding.slide1Description,
      color: ['#733fea', '#98e0f8'] as const,
    },
    {
      icon: 'target',
      title: t.onboarding.slide2Title,
      description: t.onboarding.slide2Description,
      color: ['#98e0f8', '#733fea'] as const,
    },
    {
      icon: 'chart-line',
      title: t.onboarding.slide3Title,
      description: t.onboarding.slide3Description,
      color: ['#733fea', '#1a1a1a'] as const,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    }, 5000); // Plus de temps pour lire

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      >
        {slides.map((slide, index) => (
          <LinearGradient
            key={index}
            colors={slide.color}
            style={styles.slide}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={slide.icon as any} size={100} color="#fff" />
              </View>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                  },
                ]}
              />
            );
          })}
        </View>

        <Button
          mode="contained"
          onPress={handleGetStarted}
          style={styles.button}
          buttonColor="#fdfdfd"
          textColor="#733fea"
          contentStyle={styles.buttonContent}
        >
          {t.onboarding.getStarted}
        </Button>

        <TouchableOpacity onPress={handleGetStarted}>
          <Text style={styles.skipText}>{t.onboarding.skip}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  button: {
    width: width - 80,
    borderRadius: 30,
    marginBottom: 15,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  skipText: {
    color: '#fdfdfd',
    fontSize: 16,
  },
});
