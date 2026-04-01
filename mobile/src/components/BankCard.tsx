import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface BankCardProps {
  balance: number;
  currency: string;
  accountName?: string;
  cardNumber?: string;
  gradient?: string[];
}

export const BankCard: React.FC<BankCardProps> = ({
  balance,
  currency,
  accountName = 'Compte Principal',
  cardNumber = '•••• 1234',
  gradient = ['#733fea', '#98e0f8'],
}) => {
  return (
    <LinearGradient
      colors={gradient}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.accountName}>{accountName}</Text>
        <MaterialCommunityIcons name="contactless-payment" size={28} color="#fff" />
      </View>

      {/* Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Solde disponible</Text>
        <Text style={styles.balance}>
          {balance.toFixed(2).replace('.', ',')} {currency}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.cardNumber}>{cardNumber}</Text>
        <MaterialCommunityIcons name="credit-card-chip-outline" size={32} color="rgba(255,255,255,0.8)" />
      </View>

      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 32,
    height: 200,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 16,
    justifyContent: 'space-between',
    shadowColor: '#733fea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
  balanceContainer: {
    marginTop: 8,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
    marginBottom: 4,
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 2,
  },
  circle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -30,
    left: -30,
  },
});
