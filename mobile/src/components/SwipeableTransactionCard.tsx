import React, { useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

interface SwipeableTransactionCardProps {
  transaction: any;
  currencySymbol: string;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SwipeableTransactionCard: React.FC<SwipeableTransactionCardProps> = ({
  transaction,
  currencySymbol,
  onPress,
  onEdit,
  onDelete,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -160));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: -160,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleEdit = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    onEdit?.();
  };

  const handleDelete = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    onDelete?.();
  };

  return (
    <View style={styles.container}>
      {/* Actions cachées */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <MaterialCommunityIcons name="pencil" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <MaterialCommunityIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Carte principale */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateX }, { scale: scaleAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  transaction.type === 'income'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(244, 67, 54, 0.15)',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={transaction.icon || (transaction.type === 'income' ? 'arrow-up' : 'arrow-down')}
              size={24}
              color={transaction.type === 'income' ? '#10B981' : '#F44336'}
            />
          </View>

          <View style={styles.details}>
            <Text style={styles.category}>{transaction.category}</Text>
            <Text style={styles.note} numberOfLines={1}>
              {transaction.note || 'Aucune note'}
            </Text>
            <Text style={styles.date}>
              {new Date(transaction.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>

          <View style={styles.amountContainer}>
            <Text
              style={[
                styles.amount,
                { color: transaction.type === 'income' ? '#10B981' : '#F44336' },
              ]}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {transaction.amount.toFixed(2)} {currencySymbol}
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="rgba(253, 253, 253, 0.3)"
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    position: 'relative',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
  },
  actionButton: {
    width: 60,
    height: '80%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#733fea',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 4,
  },
  note: {
    fontSize: 13,
    color: 'rgba(253, 253, 253, 0.6)',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.4)',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
