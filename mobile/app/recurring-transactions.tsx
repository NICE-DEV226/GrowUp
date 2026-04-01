import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { recurringService } from '../src/services/recurringService';
import { RecurringTransactionCard } from '../src/components/RecurringTransactionCard';
import { useAuthStore } from '../src/store/authStore';
import { getCurrencySymbol } from '../src/utils/currency';
import { useI18n } from '../src/i18n';

export default function RecurringTransactions() {
  const router = useRouter();
  const { currency } = useAuthStore();
  const { t } = useI18n();
  const currencySymbol = getCurrencySymbol(currency);
  const [recurring, setRecurring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecurring = async () => {
    try {
      setLoading(true);
      const response = await recurringService.getAll();
      setRecurring(response.recurring || []);
    } catch (error) {
      console.error('Erreur chargement récurrences:', error);
      Alert.alert(t.errors.error, t.errors.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecurring();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRecurring();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await recurringService.toggle(id);
      await loadRecurring();
    } catch (error) {
      console.error('Erreur toggle:', error);
      Alert.alert(t.errors.error, t.recurring.toggleError);
    }
  };

  const handlePress = (transaction: any) => {
    Alert.alert(
      transaction.category,
      `${t.recurring.amount}: ${transaction.amount}${currencySymbol}\n${t.recurring.frequency}: ${transaction.frequency}\n${t.recurring.next}: ${new Date(transaction.nextDate).toLocaleDateString()}`,
      [
        { text: t.common.cancel, style: 'cancel' },
        { 
          text: t.recurring.executeNow, 
          onPress: () => handleExecute(transaction._id) 
        },
        { 
          text: t.common.delete, 
          style: 'destructive',
          onPress: () => handleDelete(transaction._id) 
        },
      ]
    );
  };

  const handleExecute = async (id: string) => {
    try {
      await recurringService.execute(id);
      Alert.alert(t.common.success, t.recurring.executed);
      await loadRecurring();
    } catch (error: any) {
      console.error('Erreur exécution:', error);
      Alert.alert(t.errors.error, error.response?.data?.error || t.recurring.executeError);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      t.common.confirmation,
      t.recurring.confirmDelete,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await recurringService.delete(id);
              Alert.alert(t.common.success, t.recurring.deleted);
              await loadRecurring();
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert(t.errors.error, t.recurring.deleteError);
            }
          },
        },
      ]
    );
  };

  const activeRecurring = recurring.filter(r => r.isActive);
  const inactiveRecurring = recurring.filter(r => !r.isActive);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fdfdfd" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.recurring.title}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            Alert.alert(t.common.info, t.recurring.addComingSoon);
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fdfdfd" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
            <Text style={styles.statValue}>{activeRecurring.length}</Text>
            <Text style={styles.statLabel}>{t.recurring.active}</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="pause-circle" size={24} color="rgba(253, 253, 253, 0.5)" />
            <Text style={styles.statValue}>{inactiveRecurring.length}</Text>
            <Text style={styles.statLabel}>{t.recurring.inactive}</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="calendar-month" size={24} color="#733fea" />
            <Text style={styles.statValue}>{recurring.length}</Text>
            <Text style={styles.statLabel}>{t.common.total}</Text>
          </View>
        </View>

        {/* Active Recurring */}
        {activeRecurring.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.recurring.active}</Text>
            {activeRecurring.map((transaction) => (
              <RecurringTransactionCard
                key={transaction._id}
                transaction={transaction}
                onPress={() => handlePress(transaction)}
                onToggle={() => handleToggle(transaction._id)}
                currencySymbol={currencySymbol}
              />
            ))}
          </View>
        )}

        {/* Inactive Recurring */}
        {inactiveRecurring.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.recurring.inactive}</Text>
            {inactiveRecurring.map((transaction) => (
              <RecurringTransactionCard
                key={transaction._id}
                transaction={transaction}
                onPress={() => handlePress(transaction)}
                onToggle={() => handleToggle(transaction._id)}
                currencySymbol={currencySymbol}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {recurring.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-sync" size={64} color="rgba(253, 253, 253, 0.3)" />
            <Text style={styles.emptyText}>{t.emptyStates.noRecurring.title}</Text>
            <Text style={styles.emptySubtext}>
              {t.emptyStates.noRecurring.subtitle}
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => Alert.alert(t.common.info, t.recurring.addComingSoon)}
            >
              <Text style={styles.emptyButtonText}>{t.recurring.add}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fdfdfd',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#733fea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.6)',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fdfdfd',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.6)',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#733fea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
