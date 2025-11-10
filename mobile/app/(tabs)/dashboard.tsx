import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, StatusBar, Animated, TextInput, Modal, Alert, RefreshControl, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuthStore } from '../../src/store/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '../../src/services/api';
import { getCurrencySymbol } from '../../src/utils/currency';

const { width, height } = Dimensions.get('window');

export default function Dashboard() {
  const { user, currency } = useAuthStore();
  const router = useRouter();
  const currencySymbol = getCurrencySymbol(currency);
  const [userName, setUserName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [addTransactionVisible, setAddTransactionVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showInitialBalanceModal, setShowInitialBalanceModal] = useState(false);
  const [initialBalance, setInitialBalance] = useState('');
  
  // Données du backend
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [recentGoals, setRecentGoals] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchWidth = useRef(new Animated.Value(0)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const modalSlide = useRef(new Animated.Value(height)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const transactionModalSlide = useRef(new Animated.Value(height)).current;
  const balanceScale = useRef(new Animated.Value(1)).current;
  const quickActionsOpacity = useRef(new Animated.Value(0)).current;
  const sectionsOpacity = useRef(new Animated.Value(0)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;

  // Charger les données du dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les stats du dashboard
      const statsResponse = await api.get('/stats/dashboard');
      const currentBalance = statsResponse.data.totalBalance || 0;
      const transactionsCount = statsResponse.data.recentTransactions?.length || 0;
      
      setBalance(currentBalance);
      setIncome(statsResponse.data.totalIncome || 0);
      setExpense(statsResponse.data.totalExpense || 0);
      setRecentTransactions(statsResponse.data.recentTransactions || []);
      
      // Si le solde est 0 et qu'il n'y a aucune transaction, proposer d'ajouter le solde initial
      if (currentBalance === 0 && transactionsCount === 0) {
        const hasSeenBalancePrompt = await AsyncStorage.getItem('hasSeenBalancePrompt');
        if (!hasSeenBalancePrompt) {
          setTimeout(() => {
            setShowInitialBalanceModal(true);
          }, 1000);
        }
      }
      
      // Charger les objectifs (3 premiers)
      const goalsResponse = await api.get('/goals');
      setRecentGoals(goalsResponse.data.goals?.slice(0, 3) || []);
      
      // Charger les notifications non lues
      const notificationsResponse = await api.get('/notifications?unreadOnly=true&limit=10');
      setNotifications(notificationsResponse.data.notifications || []);
      setUnreadNotifications(notificationsResponse.data.unreadCount || 0);
      
    } catch (error: any) {
      console.error('Erreur chargement dashboard:', error);
      // L'intercepteur API gère automatiquement les erreurs 401
    } finally {
      setLoading(false);
    }
  };

  // Fonction de rafraîchissement
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Fonction helper pour afficher le temps relatif
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  // Fonction pour charger les données utilisateur
  const loadUser = useCallback(async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUserName(userData.name || userData.email?.split('@')[0] || 'Utilisateur');
      setProfilePhoto(userData.profilePhoto || null);
    }
  }, []);

  // Recharger les données utilisateur quand on revient sur la page
  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  useEffect(() => {
    loadUser();
    loadDashboardData();

    // Animations d'entrée
    Animated.sequence([
      Animated.spring(balanceScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(quickActionsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(sectionsOpacity, {
          toValue: 1,
          duration: 500,
          delay: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Animation pulse du badge de notification
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(badgePulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const toggleSearch = () => {
    if (searchVisible) {
      // Fermer la recherche
      Animated.parallel([
        Animated.timing(searchWidth, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(searchOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setSearchVisible(false);
        setSearchQuery('');
      });
    } else {
      // Ouvrir la recherche
      setSearchVisible(true);
      Animated.parallel([
        Animated.timing(searchWidth, {
          toValue: width - 140,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(searchOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const toggleNotifications = () => {
    if (notificationsVisible) {
      // Fermer le modal
      Animated.parallel([
        Animated.timing(modalSlide, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setNotificationsVisible(false);
      });
    } else {
      // Ouvrir le modal
      setNotificationsVisible(true);
      Animated.parallel([
        Animated.timing(modalSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const openAddTransaction = () => {
    setAddTransactionVisible(true);
    Animated.timing(transactionModalSlide, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const closeAddTransaction = () => {
    Animated.timing(transactionModalSlide, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setAddTransactionVisible(false);
    });
  };

  const handleSaveInitialBalance = async () => {
    const amount = parseFloat(initialBalance);
    if (!initialBalance || isNaN(amount) || amount < 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    try {
      // Créer une transaction de type "income" pour le solde initial
      await api.post('/transactions', {
        type: 'income',
        category: 'Solde initial',
        amount: amount,
        date: new Date().toISOString(),
        note: 'Solde de départ'
      });

      await AsyncStorage.setItem('hasSeenBalancePrompt', 'true');
      setShowInitialBalanceModal(false);
      setInitialBalance('');
      await loadDashboardData();
      
      Alert.alert('Succès', 'Votre solde initial a été ajouté !');
    } catch (error: any) {
      console.error('Erreur ajout solde initial:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le solde initial');
    }
  };

  const skipInitialBalance = async () => {
    await AsyncStorage.setItem('hasSeenBalancePrompt', 'true');
    setShowInitialBalanceModal(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header moderne */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {!searchVisible && (
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#733fea', '#98e0f8']}
                  style={styles.avatar}
                >
                  {profilePhoto ? (
                    <Image 
                      source={{ uri: profilePhoto }} 
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {userName.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </LinearGradient>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.welcomeText}>Bienvenue</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
            </View>
          )}
          
          {searchVisible && (
            <Animated.View 
              style={[
                styles.searchContainer,
                {
                  width: searchWidth,
                  opacity: searchOpacity,
                }
              ]}
            >
              <MaterialCommunityIcons name="magnify" size={20} color="rgba(253, 253, 253, 0.5)" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher des transactions..."
                placeholderTextColor="rgba(253, 253, 253, 0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                cursorColor="#733fea"
                selectionColor="rgba(115, 63, 234, 0.3)"
              />
            </Animated.View>
          )}
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.headerButton, searchVisible && styles.headerButtonActive]}
              onPress={toggleSearch}
            >
              <MaterialCommunityIcons 
                name={searchVisible ? "close" : "magnify"} 
                size={24} 
                color="#fdfdfd" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={toggleNotifications}
            >
              <MaterialCommunityIcons name="bell-outline" size={24} color="#fdfdfd" />
              {unreadNotifications > 0 && (
                <Animated.View 
                  style={[
                    styles.notificationBadge,
                    {
                      transform: [{ scale: badgePulse }],
                    }
                  ]} 
                >
                  <Text style={styles.badgeText}>
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Text>
                </Animated.View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
        {/* Carte de solde principale */}
        <Animated.View 
          style={[
            styles.balanceCardContainer,
            {
              transform: [{ scale: balanceScale }],
            }
          ]}
        >
          <LinearGradient
            colors={['#733fea', '#98e0f8']}
            style={styles.balanceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceTop}>
              <View style={styles.balanceLeft}>
                <Text style={styles.balanceLabel}>Solde Total</Text>
                <Text style={styles.balanceAmount}>
                  {loading ? '...' : `${balance.toFixed(2).replace('.', ',')} ${currencySymbol}`}
                </Text>
              </View>
              <View style={styles.walletIconContainer}>
                <MaterialCommunityIcons name="wallet" size={28} color="#fff" />
              </View>
            </View>
            
            <View style={styles.balanceStats}>
              <View style={styles.statItem}>
                <View style={styles.statIconGreen}>
                  <MaterialCommunityIcons name="arrow-up" size={16} color="#10B981" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Revenus</Text>
                  <Text style={styles.statValue}>
                    {loading ? '...' : `${income.toFixed(2).replace('.', ',')} ${currencySymbol}`}
                  </Text>
                </View>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <View style={styles.statIconRed}>
                  <MaterialCommunityIcons name="arrow-down" size={16} color="#F44336" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Dépenses</Text>
                  <Text style={styles.statValue}>
                    {loading ? '...' : `${expense.toFixed(2).replace('.', ',')} ${currencySymbol}`}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Actions rapides */}
        <Animated.View 
          style={[
            styles.quickActionsSection,
            {
              opacity: quickActionsOpacity,
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={openAddTransaction}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(115, 63, 234, 0.15)' }]}>
              <MaterialCommunityIcons name="plus" size={24} color="#733fea" />
            </View>
            <Text style={styles.quickActionText}>Ajouter</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/transactions')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(152, 224, 248, 0.15)' }]}>
              <MaterialCommunityIcons name="swap-horizontal" size={24} color="#98e0f8" />
            </View>
            <Text style={styles.quickActionText}>Transfert</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/stats')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <MaterialCommunityIcons name="chart-bar" size={24} color="#10B981" />
            </View>
            <Text style={styles.quickActionText}>Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/goals')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(244, 67, 54, 0.15)' }]}>
              <MaterialCommunityIcons name="target" size={24} color="#F44336" />
            </View>
            <Text style={styles.quickActionText}>Objectifs</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Transactions récentes */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: sectionsOpacity,
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions récentes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Chargement...</Text>
            </View>
          ) : recentTransactions.length > 0 ? (
            <View>
              {recentTransactions.map((transaction: any) => (
                <TouchableOpacity 
                  key={transaction.id || transaction._id}
                  style={styles.transactionItem}
                  onPress={() => router.push('/(tabs)/transactions')}
                >
                  <View style={[
                    styles.transactionIcon,
                    { backgroundColor: transaction.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 67, 54, 0.15)' }
                  ]}>
                    <MaterialCommunityIcons 
                      name={transaction.type === 'income' ? 'arrow-up' : 'arrow-down'} 
                      size={20} 
                      color={transaction.type === 'income' ? '#10B981' : '#F44336'} 
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionCategory}>{transaction.category}</Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'income' ? '#10B981' : '#F44336' }
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2).replace('.', ',')} {currencySymbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="receipt-text-outline" size={48} color="#733fea" />
              </View>
              <Text style={styles.emptyText}>Aucune transaction</Text>
              <Text style={styles.emptySubtext}>Commencez à suivre vos dépenses</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={openAddTransaction}
              >
                <Text style={styles.emptyButtonText}>Ajouter une transaction</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Objectifs */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: sectionsOpacity,
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes objectifs</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/goals')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Chargement...</Text>
            </View>
          ) : recentGoals.length > 0 ? (
            <View>
              {recentGoals.map((goal: any) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <TouchableOpacity 
                    key={goal.id || goal._id}
                    style={styles.goalItem}
                    onPress={() => router.push('/(tabs)/goals')}
                  >
                    <View style={[styles.goalIcon, { backgroundColor: `${goal.color}20` }]}>
                      <MaterialCommunityIcons name={goal.icon || 'target'} size={24} color={goal.color || '#733fea'} />
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <View style={styles.goalProgressBar}>
                        <View style={[styles.goalProgressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: goal.color || '#733fea' }]} />
                      </View>
                      <Text style={styles.goalAmount}>
                        {goal.currentAmount.toFixed(0)} {currencySymbol} / {goal.targetAmount.toFixed(0)} {currencySymbol} ({progress.toFixed(0)}%)
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="flag-outline" size={48} color="#98e0f8" />
              </View>
              <Text style={styles.emptyText}>Aucun objectif</Text>
              <Text style={styles.emptySubtext}>Définissez vos objectifs d'épargne</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => router.push('/(tabs)/goals')}
              >
                <Text style={styles.emptyButtonText}>Créer un objectif</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Modal de notifications */}
      <Modal
        visible={notificationsVisible}
        transparent
        animationType="none"
        onRequestClose={toggleNotifications}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={toggleNotifications}
          >
            <Animated.View style={{ opacity: modalOpacity }}>
              <View style={styles.backdropBlur} />
            </Animated.View>
          </TouchableOpacity>

          <Animated.View 
            style={[
              styles.notificationsModal,
              {
                transform: [{ translateY: modalSlide }],
              }
            ]}
          >
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={toggleNotifications}
              >
                <MaterialCommunityIcons name="close" size={24} color="#fdfdfd" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.notificationsList}
              showsVerticalScrollIndicator={false}
            >
              {notifications.length > 0 ? (
                <>
                  {notifications.map((notification: any) => {
                    const getNotificationIcon = (type: string) => {
                      switch (type) {
                        case 'success': return { icon: 'check-circle', color: '#10B981' };
                        case 'warning': return { icon: 'alert-circle', color: '#F44336' };
                        case 'goal': return { icon: 'target', color: '#733fea' };
                        case 'info': return { icon: 'information', color: '#98e0f8' };
                        default: return { icon: 'bell', color: '#733fea' };
                      }
                    };
                    
                    const iconData = getNotificationIcon(notification.type);
                    
                    return (
                      <TouchableOpacity 
                        key={notification.id || notification._id}
                        style={styles.notificationItem}
                      >
                        <View style={[
                          styles.notificationIconContainer, 
                          { backgroundColor: `${iconData.color}26` }
                        ]}>
                          <MaterialCommunityIcons 
                            name={iconData.icon as any} 
                            size={24} 
                            color={iconData.color} 
                          />
                        </View>
                        <View style={styles.notificationContent}>
                          <Text style={styles.notificationTitle}>{notification.title}</Text>
                          <Text style={styles.notificationText}>{notification.message}</Text>
                          <Text style={styles.notificationTime}>
                            {getTimeAgo(notification.createdAt)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  <View style={{ height: 20 }} />
                </>
              ) : (
                <View style={styles.emptyNotifications}>
                  <MaterialCommunityIcons name="bell-off-outline" size={48} color="rgba(253, 253, 253, 0.3)" />
                  <Text style={styles.emptyNotificationsText}>Aucune notification</Text>
                  <Text style={styles.emptyNotificationsSubtext}>
                    Vous êtes à jour !
                  </Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.markAllReadButton}>
              <Text style={styles.markAllReadText}>Tout marquer comme lu</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal d'ajout de transaction */}
      <Modal
        visible={addTransactionVisible}
        transparent
        animationType="none"
        onRequestClose={closeAddTransaction}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeAddTransaction}
          >
            <View style={styles.backdropBlur} />
          </TouchableOpacity>

          <Animated.View 
            style={[
              styles.transactionModal,
              {
                transform: [{ translateY: transactionModalSlide }],
              }
            ]}
          >
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle transaction</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={closeAddTransaction}
              >
                <MaterialCommunityIcons name="close" size={24} color="#fdfdfd" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.transactionForm}
              showsVerticalScrollIndicator={false}
            >
              {/* Type de transaction */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Type</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity 
                    style={[
                      styles.typeButton, 
                      transactionType === 'expense' && styles.typeButtonExpenseActive
                    ]}
                    onPress={() => setTransactionType('expense')}
                  >
                    <MaterialCommunityIcons 
                      name="arrow-down" 
                      size={20} 
                      color={transactionType === 'expense' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} 
                    />
                    <Text style={transactionType === 'expense' ? styles.typeButtonTextActive : styles.typeButtonText}>
                      Dépense
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.typeButton, 
                      transactionType === 'income' && styles.typeButtonIncomeActive
                    ]}
                    onPress={() => setTransactionType('income')}
                  >
                    <MaterialCommunityIcons 
                      name="arrow-up" 
                      size={20} 
                      color={transactionType === 'income' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} 
                    />
                    <Text style={transactionType === 'income' ? styles.typeButtonTextActive : styles.typeButtonText}>
                      Revenu
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Montant */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Montant</Text>
                <View style={styles.amountInput}>
                  <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                  <TextInput
                    style={styles.amountField}
                    placeholder="0.00"
                    placeholderTextColor="rgba(253, 253, 253, 0.3)"
                    keyboardType="decimal-pad"
                    cursorColor="#733fea"
                    selectionColor="rgba(115, 63, 234, 0.3)"
                  />
                </View>
              </View>

              {/* Catégorie */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Catégorie</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {transactionType === 'expense' ? (
                    <>
                      <TouchableOpacity style={[styles.categoryChip, styles.categoryChipActive]}>
                        <MaterialCommunityIcons name="food" size={20} color="#fff" />
                        <Text style={styles.categoryChipTextActive}>Nourriture</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.categoryChip}>
                        <MaterialCommunityIcons name="home" size={20} color="rgba(253, 253, 253, 0.6)" />
                        <Text style={styles.categoryChipText}>Logement</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.categoryChip}>
                        <MaterialCommunityIcons name="car" size={20} color="rgba(253, 253, 253, 0.6)" />
                        <Text style={styles.categoryChipText}>Transport</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.categoryChip}>
                        <MaterialCommunityIcons name="shopping" size={20} color="rgba(253, 253, 253, 0.6)" />
                        <Text style={styles.categoryChipText}>Shopping</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.categoryChip}>
                        <MaterialCommunityIcons name="heart" size={20} color="rgba(253, 253, 253, 0.6)" />
                        <Text style={styles.categoryChipText}>Santé</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.categoryChip}>
                        <MaterialCommunityIcons name="gamepad-variant" size={20} color="rgba(253, 253, 253, 0.6)" />
                        <Text style={styles.categoryChipText}>Loisirs</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity style={[styles.categoryChip, styles.categoryChipActive]}>
                        <MaterialCommunityIcons name="cash" size={20} color="#fff" />
                        <Text style={styles.categoryChipTextActive}>Salaire</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.categoryChip}>
                        <MaterialCommunityIcons name="briefcase" size={20} color="rgba(253, 253, 253, 0.6)" />
                        <Text style={styles.categoryChipText}>Freelance</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.categoryChip}>
                        <MaterialCommunityIcons name="chart-line" size={20} color="rgba(253, 253, 253, 0.6)" />
                        <Text style={styles.categoryChipText}>Investissement</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.categoryChip}>
                        <MaterialCommunityIcons name="gift" size={20} color="rgba(253, 253, 253, 0.6)" />
                        <Text style={styles.categoryChipText}>Cadeau</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.categoryChip}>
                        <MaterialCommunityIcons name="dots-horizontal" size={20} color="rgba(253, 253, 253, 0.6)" />
                        <Text style={styles.categoryChipText}>Autre</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </ScrollView>
              </View>

              {/* Date */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <MaterialCommunityIcons name="calendar" size={20} color="#733fea" />
                  <Text style={styles.dateButtonText}>
                    {selectedDate.toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="rgba(253, 253, 253, 0.4)" />
                </TouchableOpacity>
              </View>

              {/* Note */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Note (optionnel)</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Ajouter une note..."
                  placeholderTextColor="rgba(253, 253, 253, 0.4)"
                  multiline
                  numberOfLines={3}
                  cursorColor="#733fea"
                  selectionColor="rgba(115, 63, 234, 0.3)"
                />
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={closeAddTransaction}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal Calendrier */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.calendarOverlay}>
          <TouchableOpacity 
            style={styles.calendarBackdrop}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          />
          
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity 
                onPress={() => {
                  const newMonth = new Date(calendarMonth);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setCalendarMonth(newMonth);
                }}
              >
                <MaterialCommunityIcons name="chevron-left" size={28} color="#fdfdfd" />
              </TouchableOpacity>
              
              <Text style={styles.calendarTitle}>
                {calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </Text>
              
              <TouchableOpacity 
                onPress={() => {
                  const newMonth = new Date(calendarMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setCalendarMonth(newMonth);
                }}
              >
                <MaterialCommunityIcons name="chevron-right" size={28} color="#fdfdfd" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDays}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                <Text key={i} style={styles.weekDay}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {(() => {
                const year = calendarMonth.getFullYear();
                const month = calendarMonth.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const startDay = firstDay === 0 ? 6 : firstDay - 1;
                
                const days = [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                for (let i = 0; i < startDay; i++) {
                  days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
                }
                
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(year, month, day);
                  date.setHours(0, 0, 0, 0);
                  const isSelected = selectedDate.toDateString() === date.toDateString();
                  const isToday = today.toDateString() === date.toDateString();
                  
                  days.push(
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                        isToday && !isSelected && styles.dayCellToday,
                      ]}
                      onPress={() => {
                        setSelectedDate(date);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                        isToday && !isSelected && styles.dayTextToday,
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                }
                
                return days;
              })()}
            </View>

            <TouchableOpacity 
              style={styles.calendarCloseButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.calendarCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Solde Initial */}
      <Modal
        visible={showInitialBalanceModal}
        transparent
        animationType="fade"
        onRequestClose={skipInitialBalance}
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.initialBalanceModal}>
            <View style={styles.initialBalanceIcon}>
              <MaterialCommunityIcons name="wallet-plus" size={48} color="#733fea" />
            </View>
            
            <Text style={styles.initialBalanceTitle}>Bienvenue ! 👋</Text>
            <Text style={styles.initialBalanceText}>
              Pour commencer, ajoutez votre solde actuel. Cela nous aidera à suivre vos finances.
            </Text>
            
            <View style={styles.initialBalanceInputContainer}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <TextInput
                style={styles.initialBalanceInput}
                placeholder="0.00"
                placeholderTextColor="rgba(253, 253, 253, 0.3)"
                keyboardType="decimal-pad"
                value={initialBalance}
                onChangeText={setInitialBalance}
                cursorColor="#733fea"
                selectionColor="rgba(115, 63, 234, 0.3)"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.initialBalanceSaveButton}
              onPress={handleSaveInitialBalance}
            >
              <Text style={styles.initialBalanceSaveText}>Ajouter mon solde</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.initialBalanceSkipButton}
              onPress={skipInitialBalance}
            >
              <Text style={styles.initialBalanceSkipText}>Plus tard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  // Header
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
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 13,
    color: 'rgba(253, 253, 253, 0.6)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fdfdfd',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F44336',
    borderWidth: 2,
    borderColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerButtonActive: {
    backgroundColor: '#733fea',
  },
  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#fdfdfd',
    height: 44,
  },
  // Modal de notifications
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  notificationsModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.8,
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(253, 253, 253, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fdfdfd',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationsList: {
    paddingHorizontal: 24,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.6)',
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.4)',
  },
  markAllReadButton: {
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    alignItems: 'center',
  },
  markAllReadText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#733fea',
  },
  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Balance Card
  balanceCardContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#733fea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  balanceLeft: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  walletIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconGreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconRed: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
  // Quick Actions
  quickActionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    transform: [{ scale: 1 }],
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    color: '#fdfdfd',
    fontWeight: '600',
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fdfdfd',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#733fea',
  },
  // Empty States
  emptyState: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(115, 63, 234, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.6)',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#733fea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Modal de transaction
  transactionModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingBottom: 20,
  },
  transactionForm: {
    paddingHorizontal: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.8)',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    gap: 8,
  },
  typeButtonExpenseActive: {
    backgroundColor: '#F44336',
  },
  typeButtonIncomeActive: {
    backgroundColor: '#10B981',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.6)',
  },
  typeButtonTextActive: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#733fea',
    marginRight: 8,
  },
  amountField: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fdfdfd',
    paddingVertical: 16,
  },
  categoryScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#733fea',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.6)',
  },
  categoryChipTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#fdfdfd',
    fontWeight: '500',
  },
  noteInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#fdfdfd',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.8)',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#733fea',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Calendrier
  calendarOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  calendarBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  calendarModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fdfdfd',
    textTransform: 'capitalize',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.6)',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: '#733fea',
    borderRadius: 12,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#733fea',
    borderRadius: 12,
  },
  dayText: {
    fontSize: 16,
    color: '#fdfdfd',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dayTextToday: {
    color: '#733fea',
    fontWeight: 'bold',
  },
  calendarCloseButton: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  calendarCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: 'rgba(253, 253, 253, 0.5)',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 8,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: 'rgba(253, 253, 253, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalAmount: {
    fontSize: 13,
    color: 'rgba(253, 253, 253, 0.6)',
  },
  // Modal Solde Initial
  initialBalanceModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  initialBalanceIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(115, 63, 234, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  initialBalanceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 12,
    textAlign: 'center',
  },
  initialBalanceText: {
    fontSize: 15,
    color: 'rgba(253, 253, 253, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  initialBalanceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    width: '100%',
  },
  initialBalanceInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fdfdfd',
    paddingVertical: 16,
    textAlign: 'center',
  },
  initialBalanceSaveButton: {
    backgroundColor: '#733fea',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  initialBalanceSaveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  initialBalanceSkipButton: {
    paddingVertical: 12,
  },
  initialBalanceSkipText: {
    fontSize: 15,
    color: 'rgba(253, 253, 253, 0.6)',
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyNotificationsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyNotificationsSubtext: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.5)',
  },
});
