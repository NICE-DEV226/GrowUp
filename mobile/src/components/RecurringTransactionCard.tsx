import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface RecurringTransactionCardProps {
  transaction: any;
  onPress: () => void;
  onToggle: () => void;
  currencySymbol: string;
}

export const RecurringTransactionCard: React.FC<RecurringTransactionCardProps> = ({
  transaction,
  onPress,
  onToggle,
  currencySymbol,
}) => {
  const getFrequencyText = (frequency: string) => {
    const map: any = {
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      yearly: 'Annuel',
    };
    return map[frequency] || frequency;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Icon */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: transaction.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 67, 54, 0.15)' }
        ]}>
          <MaterialCommunityIcons 
            name={transaction.icon || (transaction.type === 'income' ? 'arrow-up' : 'arrow-down')} 
            size={24} 
            color={transaction.color || (transaction.type === 'income' ? '#10B981' : '#F44336')} 
          />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.category}>{transaction.category}</Text>
          <View style={styles.details}>
            <MaterialCommunityIcons name="calendar-clock" size={14} color="rgba(253, 253, 253, 0.5)" />
            <Text style={styles.frequency}>{getFrequencyText(transaction.frequency)}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.nextDate}>Prochain: {formatDate(transaction.nextDate)}</Text>
          </View>
        </View>

        {/* Amount & Toggle */}
        <View style={styles.right}>
          <Text style={[
            styles.amount,
            { color: transaction.type === 'income' ? '#10B981' : '#F44336' }
          ]}>
            {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(0)} {currencySymbol}
          </Text>
          <TouchableOpacity 
            style={[styles.toggle, transaction.isActive && styles.toggleActive]}
            onPress={onToggle}
          >
            <View style={[styles.toggleCircle, transaction.isActive && styles.toggleCircleActive]} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  frequency: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.6)',
    marginLeft: 4,
  },
  separator: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.3)',
    marginHorizontal: 6,
  },
  nextDate: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.6)',
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#733fea',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
});
