import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Slide1() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="wallet" size={120} color="#4CAF50" />
        <Text variant="headlineMedium" style={styles.title}>
          Suivez vos dépenses
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          Enregistrez facilement toutes vos transactions et gardez un œil sur vos finances
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Button 
          mode="contained" 
          onPress={() => router.push('/(onboarding)/slide2')}
          style={styles.button}
        >
          Suivant
        </Button>
        <Button 
          mode="text" 
          onPress={() => router.replace('/(auth)/login')}
        >
          Passer
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
    width: 24,
  },
  button: {
    marginBottom: 10,
  },
});
