import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Animated, TextInput, Modal, Dimensions, RefreshControl, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { getCurrencySymbol } from '../../src/utils/currency';

const { height } = Dimensions.get('window');

// Composant TransactionItem
const TransactionItem = ({ transaction, index, onPress, currencySymbol = '€' }: any) => {
  const itemAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(itemAnim, {
      toValue: 1,
      delay: index * 50,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

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

  return (
    <Animated.View
      style={{
        opacity: itemAnim,
        transform: [
          { 
            translateX: itemAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          },
          { scale: scaleAnim }
        ],
      }}
    >
      <TouchableOpacity 
        style={styles.transactionItem}
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[
          styles.transactionIcon,
          { backgroundColor: transaction.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 67, 54, 0.15)' }
        ]}>
          <MaterialCommunityIcons 
            name={transaction.icon as any} 
            size={24} 
            color={transaction.color} 
          />
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionCategory}>{transaction.category}</Text>
          <Text style={styles.transactionNote}>{transaction.note}</Text>
          <Text style={styles.transactionDate}>
            {new Date(transaction.date).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
        </View>

        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            { color: transaction.type === 'income' ? '#10B981' : '#F44336' }
          ]}>
            {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{transaction.amount.toFixed(2)}
          </Text>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={20} 
            color="rgba(253, 253, 253, 0.3)" 
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Transactions() {
  const { currency } = useAuthStore();
  const currencySymbol = getCurrencySymbol(currency);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Données du backend
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour l'édition
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  
  // États pour l'ajout de transaction
  const [addVisible, setAddVisible] = useState(false);
  const [addType, setAddType] = useState<'income' | 'expense'>('expense');
  const [addAmount, setAddAmount] = useState('');
  const [addCategory, setAddCategory] = useState('');
  const [addNote, setAddNote] = useState('');
  const [addDate, setAddDate] = useState(new Date());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const router = useRouter();

  // Charger les transactions depuis le backend
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions', {
        params: {
          type: filter === 'all' ? undefined : filter,
          search: searchQuery || undefined,
          limit: 1000
        }
      });
      setTransactions(response.data.transactions || []);
    } catch (error: any) {
      console.error('Erreur chargement transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };
  const detailsSlide = useRef(new Animated.Value(height)).current;
  const editSlide = useRef(new Animated.Value(height)).current;
  const statsScale = useRef(new Animated.Value(0.9)).current;
  const filtersOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(statsScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(filtersOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    // Charger les transactions au montage
    loadTransactions();
  }, []);

  // Recharger quand le filtre ou la recherche change
  useEffect(() => {
    if (!loading) {
      loadTransactions();
    }
  }, [filter, searchQuery]);

  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (searchQuery && !t.category.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !t.note?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const openDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setDetailsVisible(true);
    Animated.timing(detailsSlide, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const closeDetails = () => {
    Animated.timing(detailsSlide, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDetailsVisible(false);
      setSelectedTransaction(null);
    });
  };

  const openEdit = () => {
    // Pré-remplir le formulaire avec les données de la transaction
    if (selectedTransaction) {
      setEditType(selectedTransaction.type);
      setEditAmount(selectedTransaction.amount.toString());
      setEditCategory(selectedTransaction.category);
      setEditNote(selectedTransaction.note || '');
      setEditDate(new Date(selectedTransaction.date));
    }
    
    closeDetails();
    setTimeout(() => {
      setEditVisible(true);
      Animated.timing(editSlide, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 300);
  };

  const closeEdit = () => {
    Animated.timing(editSlide, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setEditVisible(false);
    });
  };

  const handleAddTransaction = async () => {
    if (!addAmount || !addCategory) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await api.post('/transactions', {
        type: addType,
        category: addCategory,
        amount: parseFloat(addAmount),
        date: addDate.toISOString(),
        note: addNote || undefined
      });

      // Réinitialiser le formulaire
      setAddAmount('');
      setAddCategory('');
      setAddNote('');
      setAddDate(new Date());
      setAddVisible(false);

      // Recharger les transactions
      await loadTransactions();
      Alert.alert('Succès', 'Transaction créée avec succès');
    } catch (error: any) {
      console.error('Erreur création transaction:', error);
      Alert.alert('Erreur', error.response?.data?.error || 'Impossible de créer la transaction');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setAddVisible(true)}
            >
              <MaterialCommunityIcons 
                name="plus" 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => setSearchVisible(!searchVisible)}
            >
              <MaterialCommunityIcons 
                name={searchVisible ? "close" : "magnify"} 
                size={24} 
                color="#fdfdfd" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {searchVisible && (
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="rgba(253, 253, 253, 0.5)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor="rgba(253, 253, 253, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              cursorColor="#733fea"
              selectionColor="rgba(115, 63, 234, 0.3)"
            />
          </View>
        )}

        {/* Stats cards */}
        <Animated.View 
          style={[
            styles.statsContainer,
            {
              transform: [{ scale: statsScale }],
            }
          ]}
        >
          <View style={styles.statCard}>
            <View style={styles.statIconGreen}>
              <MaterialCommunityIcons name="arrow-up" size={20} color="#10B981" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Revenus</Text>
              <Text style={styles.statValue}>{currencySymbol}{totalIncome.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconRed}>
              <MaterialCommunityIcons name="arrow-down" size={20} color="#F44336" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Dépenses</Text>
              <Text style={styles.statValue}>{currencySymbol}{totalExpense.toFixed(2)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Filtres */}
        <Animated.View 
          style={[
            styles.filterContainer,
            {
              opacity: filtersOpacity,
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={filter === 'all' ? styles.filterTextActive : styles.filterText}>
              Tout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, filter === 'income' && styles.filterChipActive]}
            onPress={() => setFilter('income')}
          >
            <MaterialCommunityIcons 
              name="arrow-up" 
              size={16} 
              color={filter === 'income' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} 
            />
            <Text style={filter === 'income' ? styles.filterTextActive : styles.filterText}>
              Revenus
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, filter === 'expense' && styles.filterChipActive]}
            onPress={() => setFilter('expense')}
          >
            <MaterialCommunityIcons 
              name="arrow-down" 
              size={16} 
              color={filter === 'expense' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} 
            />
            <Text style={filter === 'expense' ? styles.filterTextActive : styles.filterText}>
              Dépenses
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Liste des transactions */}
      <Animated.View 
        style={[
          styles.listContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
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
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="receipt-text-outline" size={64} color="#733fea" />
              </View>
              <Text style={styles.emptyText}>Aucune transaction</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Aucun résultat pour votre recherche' : 'Commencez à ajouter vos transactions'}
              </Text>
            </View>
          ) : (
            <>
              {filteredTransactions.map((transaction, index) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  index={index}
                  onPress={() => openDetails(transaction)}
                  currencySymbol={currencySymbol}
                />
              ))}
              <View style={{ height: 100 }} />
            </>
          )}
        </ScrollView>
      </Animated.View>

      {/* Modal de détails */}
      <Modal
        visible={detailsVisible}
        transparent
        animationType="none"
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeDetails}
          >
            <View style={styles.backdropBlur} />
          </TouchableOpacity>

          <Animated.View 
            style={[
              styles.detailsModal,
              {
                transform: [{ translateY: detailsSlide }],
              }
            ]}
          >
            <View style={styles.modalHandle} />
            
            <View style={styles.detailsHeader}>
              <View style={[
                styles.detailsIconLarge,
                { backgroundColor: selectedTransaction?.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 67, 54, 0.15)' }
              ]}>
                <MaterialCommunityIcons 
                  name={selectedTransaction?.icon} 
                  size={40} 
                  color={selectedTransaction?.color} 
                />
              </View>
              
              <Text style={styles.detailsCategory}>{selectedTransaction?.category}</Text>
              
              <Text style={[
                styles.detailsAmount,
                { color: selectedTransaction?.type === 'income' ? '#10B981' : '#F44336' }
              ]}>
                {selectedTransaction?.type === 'income' ? '+' : '-'}{currencySymbol}{selectedTransaction?.amount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons name="calendar" size={20} color="#733fea" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>
                    {selectedTransaction && new Date(selectedTransaction.date).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons name="tag" size={20} color="#733fea" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>
                    {selectedTransaction?.type === 'income' ? 'Revenu' : 'Dépense'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons name="text" size={20} color="#733fea" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Note</Text>
                  <Text style={styles.detailValue}>{selectedTransaction?.note}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons name="wallet" size={20} color="#733fea" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Compte</Text>
                  <Text style={styles.detailValue}>Compte Principal</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                activeOpacity={0.8}
                onPress={openEdit}
              >
                <MaterialCommunityIcons name="pencil" size={20} color="#733fea" />
                <Text style={styles.actionButtonText}>Modifier</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.actionButtonDanger]}
                activeOpacity={0.8}
                onPress={() => {
                  // TODO: Confirmer suppression
                  closeDetails();
                }}
              >
                <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
                <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>Supprimer</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeDetails}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal d'édition */}
      <Modal
        visible={editVisible}
        transparent
        animationType="none"
        onRequestClose={closeEdit}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeEdit}
          >
            <View style={styles.backdropBlur} />
          </TouchableOpacity>

          <Animated.View 
            style={[
              styles.detailsModal,
              {
                transform: [{ translateY: editSlide }],
              }
            ]}
          >
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier la transaction</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={closeEdit}
              >
                <MaterialCommunityIcons name="close" size={24} color="#fdfdfd" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.editForm}
              showsVerticalScrollIndicator={false}
            >
              {/* Type */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Type</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity 
                    style={[
                      styles.typeButton,
                      editType === 'expense' && styles.typeButtonExpenseActive
                    ]}
                    onPress={() => setEditType('expense')}
                  >
                    <MaterialCommunityIcons 
                      name="arrow-down" 
                      size={20} 
                      color={editType === 'expense' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} 
                    />
                    <Text style={editType === 'expense' ? styles.typeButtonTextActive : styles.typeButtonText}>
                      Dépense
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.typeButton,
                      editType === 'income' && styles.typeButtonIncomeActive
                    ]}
                    onPress={() => setEditType('income')}
                  >
                    <MaterialCommunityIcons 
                      name="arrow-up" 
                      size={20} 
                      color={editType === 'income' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} 
                    />
                    <Text style={editType === 'income' ? styles.typeButtonTextActive : styles.typeButtonText}>
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
                    value={editAmount}
                    onChangeText={setEditAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="rgba(253, 253, 253, 0.3)"
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
                  {editType === 'expense' ? (
                    <>
                      <TouchableOpacity 
                        style={[styles.categoryChip, editCategory === 'Nourriture' && styles.categoryChipActive]}
                        onPress={() => setEditCategory('Nourriture')}
                      >
                        <MaterialCommunityIcons name="food" size={20} color={editCategory === 'Nourriture' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} />
                        <Text style={editCategory === 'Nourriture' ? styles.categoryChipTextActive : styles.categoryChipText}>Nourriture</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.categoryChip, editCategory === 'Logement' && styles.categoryChipActive]}
                        onPress={() => setEditCategory('Logement')}
                      >
                        <MaterialCommunityIcons name="home" size={20} color={editCategory === 'Logement' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} />
                        <Text style={editCategory === 'Logement' ? styles.categoryChipTextActive : styles.categoryChipText}>Logement</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.categoryChip, editCategory === 'Transport' && styles.categoryChipActive]}
                        onPress={() => setEditCategory('Transport')}
                      >
                        <MaterialCommunityIcons name="car" size={20} color={editCategory === 'Transport' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} />
                        <Text style={editCategory === 'Transport' ? styles.categoryChipTextActive : styles.categoryChipText}>Transport</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.categoryChip, editCategory === 'Shopping' && styles.categoryChipActive]}
                        onPress={() => setEditCategory('Shopping')}
                      >
                        <MaterialCommunityIcons name="shopping" size={20} color={editCategory === 'Shopping' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} />
                        <Text style={editCategory === 'Shopping' ? styles.categoryChipTextActive : styles.categoryChipText}>Shopping</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.categoryChip, editCategory === 'Santé' && styles.categoryChipActive]}
                        onPress={() => setEditCategory('Santé')}
                      >
                        <MaterialCommunityIcons name="heart" size={20} color={editCategory === 'Santé' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} />
                        <Text style={editCategory === 'Santé' ? styles.categoryChipTextActive : styles.categoryChipText}>Santé</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity 
                        style={[styles.categoryChip, editCategory === 'Salaire' && styles.categoryChipActive]}
                        onPress={() => setEditCategory('Salaire')}
                      >
                        <MaterialCommunityIcons name="cash" size={20} color={editCategory === 'Salaire' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} />
                        <Text style={editCategory === 'Salaire' ? styles.categoryChipTextActive : styles.categoryChipText}>Salaire</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.categoryChip, editCategory === 'Freelance' && styles.categoryChipActive]}
                        onPress={() => setEditCategory('Freelance')}
                      >
                        <MaterialCommunityIcons name="briefcase" size={20} color={editCategory === 'Freelance' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} />
                        <Text style={editCategory === 'Freelance' ? styles.categoryChipTextActive : styles.categoryChipText}>Freelance</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.categoryChip, editCategory === 'Investissement' && styles.categoryChipActive]}
                        onPress={() => setEditCategory('Investissement')}
                      >
                        <MaterialCommunityIcons name="chart-line" size={20} color={editCategory === 'Investissement' ? '#fff' : 'rgba(253, 253, 253, 0.6)'} />
                        <Text style={editCategory === 'Investissement' ? styles.categoryChipTextActive : styles.categoryChipText}>Investissement</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </ScrollView>
              </View>

              {/* Date */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Date</Text>
                <View style={styles.dateOptions}>
                  <TouchableOpacity 
                    style={[styles.dateOptionButton, editDate.toDateString() === new Date().toDateString() && styles.dateOptionActive]}
                    onPress={() => setEditDate(new Date())}
                  >
                    <Text style={editDate.toDateString() === new Date().toDateString() ? styles.dateOptionTextActive : styles.dateOptionText}>
                      Aujourd'hui
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.dateOptionButton, editDate.toDateString() === new Date(Date.now() - 86400000).toDateString() && styles.dateOptionActive]}
                    onPress={() => setEditDate(new Date(Date.now() - 86400000))}
                  >
                    <Text style={editDate.toDateString() === new Date(Date.now() - 86400000).toDateString() ? styles.dateOptionTextActive : styles.dateOptionText}>
                      Hier
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.dateOptionButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <MaterialCommunityIcons name="calendar" size={20} color="rgba(253, 253, 253, 0.6)" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.selectedDateText}>
                  {editDate.toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              </View>

              {/* Note */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Note</Text>
                <TextInput
                  style={[styles.textInput, styles.noteInput]}
                  value={editNote}
                  onChangeText={setEditNote}
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
                onPress={closeEdit}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => {
                  // TODO: Envoyer les modifications à l'API
                  console.log('Modifications:', {
                    id: selectedTransaction?.id,
                    type: editType,
                    amount: parseFloat(editAmount),
                    category: editCategory,
                    note: editNote,
                    date: editDate.toISOString(),
                  });
                  closeEdit();
                }}
              >
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal de calendrier */}
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

            {/* Jours de la semaine */}
            <View style={styles.weekDays}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                <Text key={i} style={styles.weekDay}>{day}</Text>
              ))}
            </View>

            {/* Grille de jours */}
            <View style={styles.daysGrid}>
              {(() => {
                const year = calendarMonth.getFullYear();
                const month = calendarMonth.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const startDay = firstDay === 0 ? 6 : firstDay - 1;
                
                const days = [];
                
                // Jours vides avant le 1er
                for (let i = 0; i < startDay; i++) {
                  days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
                }
                
                // Jours du mois
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(year, month, day);
                  const isSelected = editDate.toDateString() === date.toDateString();
                  const isToday = new Date().toDateString() === date.toDateString();
                  
                  days.push(
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                        isToday && !isSelected && styles.dayCellToday,
                      ]}
                      onPress={() => {
                        setEditDate(date);
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
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fdfdfd',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#733fea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#fdfdfd',
    paddingVertical: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  statIconGreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconRed: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.6)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fdfdfd',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#733fea',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.6)',
  },
  filterTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  listContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 4,
  },
  transactionNote: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.6)',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.4)',
  },
  transactionRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(115, 63, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.6)',
    textAlign: 'center',
  },
  // Modal de détails
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
  detailsModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  detailsHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailsIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsCategory: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 8,
  },
  detailsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  detailsContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(115, 63, 234, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: 'rgba(253, 253, 253, 0.6)',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
  },
  detailsActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    gap: 8,
  },
  actionButtonDanger: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#733fea',
  },
  actionButtonTextDanger: {
    color: '#F44336',
  },
  closeButton: {
    marginHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#733fea',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Modal d'édition
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
  editForm: {
    paddingHorizontal: 24,
  },
  formSection: {
    marginBottom: 20,
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
  textInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fdfdfd',
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  dateOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dateOptionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateOptionActive: {
    backgroundColor: '#733fea',
  },
  dateOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.6)',
  },
  dateOptionTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  selectedDateText: {
    fontSize: 15,
    color: '#fdfdfd',
    textAlign: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(115, 63, 234, 0.1)',
    borderRadius: 12,
    fontWeight: '500',
  },
  // Modal de calendrier
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
});
