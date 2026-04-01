import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  StatusBar, 
  Animated, 
  RefreshControl
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import api from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { getCurrencySymbol } from '../../src/utils/currency';
import { useI18n } from '../../src/i18n';

const { width } = Dimensions.get('window');

// Carte statistique moderne
const StatCard = ({ icon, title, value, color, trend }: any) => {
  return (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#10B98120' : '#F4433620' }]}>
            <MaterialCommunityIcons 
              name={trend > 0 ? 'trending-up' : 'trending-down'} 
              size={14} 
              color={trend > 0 ? '#10B981' : '#F44336'} 
            />
            <Text style={[styles.trendText, { color: trend > 0 ? '#10B981' : '#F44336' }]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statCardTitle}>{title}</Text>
      <Text style={styles.statCardValue}>{value}</Text>
    </View>
  );
};

// Graphique en barres moderne
const ModernBarChart = ({ data, color, currencySymbol }: any) => {
  const maxValue = Math.max(...data.map((item: any) => item.value), 1);
  
  return (
    <View style={styles.modernChart}>
      {data.map((item: any, index: number) => {
        const heightPercent = (item.value / maxValue) * 100;
        return (
          <View key={index} style={styles.modernBarWrapper}>
            <View style={styles.modernBarContainer}>
              <LinearGradient
                colors={[color, `${color}60`]}
                style={[styles.modernBar, { height: `${heightPercent}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </View>
            <Text style={styles.modernBarLabel}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

// Carte catégorie avec barre de progression
const CategoryCard = ({ category, amount, percentage, color, currencySymbol }: any) => {
  return (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name="tag" size={20} color={color} />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{category}</Text>
          <Text style={styles.categoryAmount}>{amount} {currencySymbol}</Text>
        </View>
        <Text style={styles.categoryPercent}>{percentage}%</Text>
      </View>
      <View style={styles.categoryProgressBar}>
        <LinearGradient
          colors={[color, `${color}80`]}
          style={[styles.categoryProgressFill, { width: `${percentage}%` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
    </View>
  );
};

export default function Stats() {
  const { currency } = useAuthStore();
  const { t } = useI18n();
  const currencySymbol = getCurrencySymbol(currency);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  
  // Données
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [savings, setSavings] = useState(0);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadStats = async () => {
    try {
      setLoading(true);
      const transactionsResponse = await api.get('/transactions?limit=1000');
      const transactions = transactionsResponse.data.transactions || [];
      
      if (transactions.length === 0) {
        setMonthlyData([]);
        setCategoryData([]);
        setTotalIncome(0);
        setTotalExpense(0);
        setSavings(0);
        return;
      }
      
      // Filtrer selon période
      const now = new Date();
      let filteredTransactions = transactions;
      
      if (selectedPeriod === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredTransactions = transactions.filter((t: any) => new Date(t.date) >= weekAgo);
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredTransactions = transactions.filter((t: any) => new Date(t.date) >= monthAgo);
      } else if (selectedPeriod === 'year') {
        const yearAgo = new Date(now.getFullYear(), 0, 1);
        filteredTransactions = transactions.filter((t: any) => new Date(t.date) >= yearAgo);
      }
      
      // Calculer totaux
      let income = 0;
      let expense = 0;
      
      filteredTransactions.forEach((t: any) => {
        if (t.type === 'income') income += t.amount;
        else if (t.type === 'expense') expense += t.amount;
      });
      
      setTotalIncome(income);
      setTotalExpense(expense);
      setSavings(income - expense);
      
      // Données mensuelles
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const monthlyStats: any = {};
      
      filteredTransactions.forEach((t: any) => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthLabel = monthNames[date.getMonth()];
        
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = { label: monthLabel, value: 0, date: date };
        }
        
        if (t.type === 'expense') {
          monthlyStats[monthKey].value += t.amount;
        }
      });
      
      const sortedMonthly = Object.values(monthlyStats)
        .sort((a: any, b: any) => a.date - b.date)
        .slice(-6)
        .map((m: any) => ({ label: m.label, value: Math.round(m.value) }));
      
      setMonthlyData(sortedMonthly);
      
      // Catégories
      const categoryStats: any = {};
      const categoryColors: any = {
        'Nourriture': '#F44336',
        'Transport': '#2196F3',
        'Loisirs': '#9C27B0',
        'Shopping': '#E91E63',
        'Santé': '#4CAF50',
        'Logement': '#FF9800',
        'Éducation': '#00BCD4',
        'Autre': '#607D8B',
      };
      
      filteredTransactions.forEach((t: any) => {
        if (t.type === 'expense') {
          if (!categoryStats[t.category]) {
            categoryStats[t.category] = 0;
          }
          categoryStats[t.category] += t.amount;
        }
      });
      
      const totalCategoryExpense = Object.values(categoryStats).reduce((sum: number, val: any) => sum + val, 0);
      
      const sortedCategories = Object.entries(categoryStats)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, value]: any) => ({
          category: label,
          amount: Math.round(value),
          percentage: Math.round((value / totalCategoryExpense) * 100),
          color: categoryColors[label] || '#607D8B'
        }));
      
      setCategoryData(sortedCategories);
      
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    loadStats();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadStats();
    }
  }, [selectedPeriod]);

  const periods = [
    { key: 'week', label: t.stats.periods.week },
    { key: 'month', label: t.stats.periods.month },
    { key: 'year', label: t.stats.periods.year }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.stats.title}</Text>
        <Text style={styles.headerSubtitle}>{t.stats.subtitle}</Text>
        
        {/* Sélecteur période */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period.key && styles.periodTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#733fea"
            colors={['#733fea']}
          />
        }
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Cartes statistiques */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="cash-multiple"
              title={t.stats.income}
              value={`+${totalIncome.toFixed(0)} ${currencySymbol}`}
              color="#10B981"
              trend={12}
            />
            <StatCard
              icon="credit-card-outline"
              title={t.stats.expenses}
              value={`-${totalExpense.toFixed(0)} ${currencySymbol}`}
              color="#F44336"
              trend={-8}
            />
            <StatCard
              icon="piggy-bank"
              title={t.stats.savings}
              value={`${savings >= 0 ? '+' : ''}${savings.toFixed(0)} ${currencySymbol}`}
              color={savings >= 0 ? '#733fea' : '#F44336'}
            />
          </View>

          {/* Graphique évolution */}
          {monthlyData.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>{t.stats.expensesEvolution}</Text>
              <ModernBarChart 
                data={monthlyData} 
                color="#733fea"
                currencySymbol={currencySymbol}
              />
            </View>
          )}

          {/* Dépenses par catégorie */}
          {categoryData.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.stats.byCategory}</Text>
              {categoryData.map((cat, index) => (
                <CategoryCard
                  key={index}
                  category={cat.category}
                  amount={cat.amount}
                  percentage={cat.percentage}
                  color={cat.color}
                  currencySymbol={currencySymbol}
                />
              ))}
            </View>
          )}

          {/* Empty state */}
          {!loading && monthlyData.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="chart-line" size={64} color="rgba(253, 253, 253, 0.3)" />
              <Text style={styles.emptyText}>{t.emptyStates.noStats.title}</Text>
              <Text style={styles.emptySubtext}>
                {t.emptyStates.noStats.subtitle}
              </Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </Animated.View>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(253, 253, 253, 0.6)',
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 14,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#733fea',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.5)',
  },
  periodTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 20,
  },
  statsGrid: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statCardTitle: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.6)',
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fdfdfd',
  },
  chartCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  chartCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 20,
  },
  modernChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
  },
  modernBarWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  modernBarContainer: {
    height: 110,
    width: 32,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  modernBar: {
    width: '100%',
    borderRadius: 8,
    minHeight: 8,
  },
  modernBarLabel: {
    fontSize: 11,
    color: 'rgba(253, 253, 253, 0.6)',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 2,
  },
  categoryAmount: {
    fontSize: 13,
    color: 'rgba(253, 253, 253, 0.6)',
  },
  categoryPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fdfdfd',
  },
  categoryProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: 'rgba(253, 253, 253, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
});
