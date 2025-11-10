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
import { getCurrencySymbol, formatSmartAmount } from '../../src/utils/currency';
import { useTranslation } from '../../src/hooks/useTranslation';

const { width } = Dimensions.get('window');

// Composant Graphique en Barres
const BarChart = ({ data, title, color, currency }: any) => {
  const maxValue = Math.max(...data.map((item: any) => item.value));
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.barsContainer}>
        {data.map((item: any, index: number) => {
          const barHeight = (item.value / maxValue) * 120;
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <LinearGradient
                  colors={[color, `${color}80`]}
                  style={[styles.bar, { height: barHeight }]}
                />
              </View>
              <Text style={styles.barLabel}>{item.label}</Text>
              <Text style={styles.barValue}>{formatSmartAmount(item.value, currency, 6)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Composant Graphique Circulaire (Donut)
const DonutChart = ({ data, title, currency }: any) => {
  const total = data.reduce((sum: number, item: any) => sum + item.value, 0);
  
  return (
    <View style={styles.donutContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.donutWrapper}>
        <View style={styles.donutChart}>
          <View style={styles.donutCenter}>
            <Text style={styles.donutTotal}>{formatSmartAmount(total, currency, 8)}</Text>
            <Text style={styles.donutLabel}>Total</Text>
          </View>
        </View>
        <View style={styles.donutLegend}>
          {data.map((item: any, index: number) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
              <Text style={styles.legendValue}>{formatSmartAmount(item.value, currency, 8)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Composant Graphique Linéaire
const LineChart = ({ data, title, color }: any) => {
  const maxValue = Math.max(...data.map((item: any) => item.value));
  const minValue = Math.min(...data.map((item: any) => item.value));
  
  return (
    <View style={styles.lineContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.lineChart}>
        <View style={styles.lineGrid}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.gridLine} />
          ))}
        </View>
        <View style={styles.lineLabels}>
          {data.map((item: any, index: number) => (
            <Text key={index} style={styles.lineLabel}>{item.label}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

export default function Stats() {
  const { currency } = useAuthStore();
  const currencySymbol = getCurrencySymbol(currency);
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Données du backend
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [savings, setSavings] = useState(0);
  
  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Charger les statistiques depuis le backend
  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Charger les transactions pour calculer les stats
      const transactionsResponse = await api.get('/transactions?limit=1000');
      const transactions = transactionsResponse.data.transactions || [];
      
      if (transactions.length === 0) {
        setMonthlyData([]);
        setCategoryData([]);
        setTrendData([]);
        setTotalIncome(0);
        setTotalExpense(0);
        setSavings(0);
        return;
      }
      
      // Filtrer les transactions selon la période sélectionnée
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
      
      // Calculer le résumé
      let income = 0;
      let expense = 0;
      
      filteredTransactions.forEach((t: any) => {
        if (t.type === 'income') {
          income += t.amount;
        } else if (t.type === 'expense') {
          expense += t.amount;
        }
      });
      
      setTotalIncome(income);
      setTotalExpense(expense);
      setSavings(income - expense);
      
      // Calculer les données mensuelles (6 derniers mois)
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
      
      // Calculer les dépenses par catégorie
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
      
      const sortedCategories = Object.entries(categoryStats)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, value]: any) => ({
          label,
          value: Math.round(value),
          color: categoryColors[label] || '#607D8B'
        }));
      
      setCategoryData(sortedCategories);
      
      // Calculer la tendance hebdomadaire (6 dernières semaines)
      const weeklyStats: any = {};
      
      filteredTransactions.forEach((t: any) => {
        const date = new Date(t.date);
        const weekNumber = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        const weekKey = `${date.getFullYear()}-W${weekNumber}`;
        
        if (!weeklyStats[weekKey]) {
          weeklyStats[weekKey] = { value: 0, date: date };
        }
        
        if (t.type === 'expense') {
          weeklyStats[weekKey].value += t.amount;
        }
      });
      
      const sortedWeekly = Object.values(weeklyStats)
        .sort((a: any, b: any) => a.date - b.date)
        .slice(-6)
        .map((w: any, index: number) => ({
          label: `S${index + 1}`,
          value: Math.round(w.value)
        }));
      
      setTrendData(sortedWeekly);
      
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
    
    // Charger les stats au montage
    loadStats();
  }, []);

  // Recharger quand la période change
  useEffect(() => {
    if (!loading) {
      loadStats();
    }
  }, [selectedPeriod]);

  const periods = [
    { key: 'week', label: t('week') },
    { key: 'month', label: t('month') },
    { key: 'year', label: t('year') }
  ];
  const tabs = [
    { key: 'overview', label: t('overview') },
    { key: 'income', label: t('income') },
    { key: 'expense', label: t('expense') }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>{t('stats')}</Text>
            <Text style={styles.headerSubtitle}>{t('financialAnalysis')}</Text>
          </View>
          <TouchableOpacity style={styles.exportButton}>
            <MaterialCommunityIcons name="download" size={24} color="#fdfdfd" />
          </TouchableOpacity>
        </View>
        
        {/* Sélecteur de période */}
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
          {/* Résumé financier */}
          <View style={styles.summaryContainer}>
            <LinearGradient
              colors={['#733fea', '#98e0f8']}
              style={styles.summaryCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.summaryHeader}>
                <MaterialCommunityIcons name="chart-line" size={32} color="#fff" />
                <Text style={styles.summaryTitle}>
                  {t('summary')} {selectedPeriod === 'week' ? t('weekSummary') : selectedPeriod === 'month' ? t('monthSummary') : t('yearSummary')}
                </Text>
              </View>
              
              <View style={styles.summaryStats}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>{t('income')}</Text>
                  <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>
                    {loading ? '...' : formatSmartAmount(totalIncome, currency, 10)}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>{t('expense')}</Text>
                  <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>
                    {loading ? '...' : formatSmartAmount(totalExpense, currency, 10)}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>{t('savings')}</Text>
                  <Text style={[styles.summaryValue, { color: savings >= 0 ? '#10B981' : '#F44336' }]} numberOfLines={1} adjustsFontSizeToFit>
                    {loading ? '...' : formatSmartAmount(Math.abs(savings), currency, 10)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Onglets */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  selectedTab === tab.key && styles.tabActive
                ]}
                onPress={() => setSelectedTab(tab.key)}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.tabTextActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Graphiques */}
          <View style={styles.chartsContainer}>
            {selectedTab === 'overview' && (
              <>
                {loading ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>{t('loading')}</Text>
                  </View>
                ) : monthlyData.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="chart-line" size={64} color="rgba(253, 253, 253, 0.3)" />
                    <Text style={styles.emptyText}>{t('noData')}</Text>
                    <Text style={styles.emptySubtext}>
                      {t('noDataDesc')}
                    </Text>
                  </View>
                ) : (
                  <>
                    <BarChart 
                      data={monthlyData} 
                      title={t('monthlyEvolution')} 
                      color="#733fea"
                      currency={currency}
                    />
                    
                    <DonutChart 
                      data={categoryData} 
                      title={t('expensesByCategory')}
                      currency={currency}
                    />
                    
                    <LineChart 
                      data={trendData} 
                      title={t('weeklyTrend')} 
                      color="#98e0f8" 
                    />
                  </>
                )}
              </>
            )}
            
            {selectedTab === 'income' && (
              <>
                {loading ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>{t('loading')}</Text>
                  </View>
                ) : monthlyData.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="cash-multiple" size={64} color="rgba(16, 185, 129, 0.3)" />
                    <Text style={styles.emptyText}>{t('noIncome')}</Text>
                    <Text style={styles.emptySubtext}>
                      {t('addIncomeTransactions')}
                    </Text>
                  </View>
                ) : (
                  <>
                    <BarChart 
                      data={monthlyData} 
                      title={t('incomeEvolution')} 
                      color="#10B981"
                      currency={currency}
                    />
                    
                    <View style={styles.statCard}>
                      <Text style={styles.statCardTitle}>{t('totalIncome')}</Text>
                      <Text style={[styles.statCardValue, { color: '#10B981' }]}>
                        +{formatSmartAmount(totalIncome, currency)}
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}
            
            {selectedTab === 'expense' && (
              <>
                {loading ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>{t('loading')}</Text>
                  </View>
                ) : categoryData.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="credit-card-outline" size={64} color="rgba(244, 67, 54, 0.3)" />
                    <Text style={styles.emptyText}>{t('noExpense')}</Text>
                    <Text style={styles.emptySubtext}>
                      {t('addExpenseTransactions')}
                    </Text>
                  </View>
                ) : (
                  <>
                    <DonutChart 
                      data={categoryData} 
                      title={t('expenseDistribution')}
                      currency={currency}
                    />
                    
                    <BarChart 
                      data={monthlyData} 
                      title={t('expenseEvolution')} 
                      color="#F44336"
                      currency={currency}
                    />
                    
                    <View style={styles.statCard}>
                      <Text style={styles.statCardTitle}>{t('totalExpense')}</Text>
                      <Text style={[styles.statCardValue, { color: '#F44336' }]}>
                        -{formatSmartAmount(totalExpense, currency)}
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}
          </View>

          <View style={{ height: 100 }} />
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
    backgroundColor: '#1a1a1a',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.6)',
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#733fea',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.6)',
  },
  periodTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 24,
  },
  summaryContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#733fea',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.6)',
  },
  tabTextActive: {
    color: '#fff',
  },
  chartsContainer: {
    paddingHorizontal: 24,
  },
  chartContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 20,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 24,
    borderRadius: 12,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.6)',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fdfdfd',
  },
  donutContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  donutWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  donutChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#733fea',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  donutCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fdfdfd',
  },
  donutLabel: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.6)',
  },
  donutLegend: {
    flex: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#fdfdfd',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fdfdfd',
  },
  lineContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  lineChart: {
    height: 120,
    position: 'relative',
  },
  lineGrid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  lineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  lineLabel: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.6)',
  },
  insightsContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    gap: 16,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(115, 63, 234, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.7)',
    lineHeight: 20,
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
  statCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  statCardTitle: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.6)',
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
