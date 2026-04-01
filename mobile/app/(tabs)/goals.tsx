import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  StatusBar, 
  Animated, 
  TextInput, 
  Modal, 
  Alert, 
  RefreshControl 
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { getCurrencySymbol } from '../../src/utils/currency';
import { EmptyState } from '../../src/components/EmptyState';
import { SkeletonList } from '../../src/components/SkeletonLoader';
import { Toast } from '../../src/components/Toast';
import { useToast } from '../../src/hooks/useToast';
import { HapticButton } from '../../src/components/HapticButton';
import { AnimatedProgressRing } from '../../src/components/AnimatedProgressRing';
import { useI18n } from '../../src/i18n';

const { width, height } = Dimensions.get('window');

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  createdAt: string;
  priority: number;
  isAchieved: boolean;
  icon: string;
  color: string;
  category: string;
}

// Composant GoalCard avec animations
const GoalCard = ({ goal, index, onPress, currencySymbol = '€' }: { goal: Goal; index: number; onPress: () => void; currencySymbol?: string }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      delay: index * 80,
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

  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = goal.targetAmount - goal.currentAmount;
  const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <Animated.View
      style={{
        opacity: cardAnim,
        transform: [
          { 
            translateY: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            })
          },
          { scale: scaleAnim }
        ],
      }}
    >
      <TouchableOpacity 
        style={styles.goalCard}
        onPress={onPress}
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.goalHeader}>
          <View style={[styles.goalIcon, { backgroundColor: `${goal.color}20` }]}>
            <MaterialCommunityIcons name={goal.icon as any} size={24} color={goal.color} />
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalCategory}>{goal.category}</Text>
          </View>
          {goal.isAchieved && (
            <View style={styles.achievedBadge}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
            </View>
          )}
        </View>

        <View style={styles.goalProgress}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {goal.currentAmount.toFixed(0)} {currencySymbol} / {goal.targetAmount.toFixed(0)} {currencySymbol}
            </Text>
            <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground} />
            <LinearGradient
              colors={[goal.color, `${goal.color}80`]}
              style={[styles.progressBarFill, { width: `${progress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>

          <View style={styles.goalFooter}>
            {!goal.isAchieved && remaining > 0 && (
              <Text style={styles.remainingText}>
                Encore {remaining.toFixed(0)} {currencySymbol} à économiser
              </Text>
            )}
            {daysLeft !== null && daysLeft > 0 && !goal.isAchieved && (
              <View style={styles.deadlineChip}>
                <MaterialCommunityIcons name="clock-outline" size={12} color="#98e0f8" />
                <Text style={styles.deadlineText}>{daysLeft} jours</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Goals() {
  const { currency } = useAuthStore();
  const { t } = useI18n();
  const currencySymbol = getCurrencySymbol(currency);
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [addGoalVisible, setAddGoalVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [allocateVisible, setAllocateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  
  // États du formulaire
  const [goalTitle, setGoalTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedIcon, setSelectedIcon] = useState('flag');
  const [selectedColor, setSelectedColor] = useState('#733fea');
  const [selectedCategory, setSelectedCategory] = useState('Épargne');
  const [allocateAmount, setAllocateAmount] = useState('');

  // Animations
  const addModalSlide = useRef(new Animated.Value(height)).current;
  const detailsModalSlide = useRef(new Animated.Value(height)).current;
  const allocateModalSlide = useRef(new Animated.Value(height)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const goalsOpacity = useRef(new Animated.Value(0)).current;

  // Données du backend
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les objectifs depuis le backend
  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/goals');
      setGoals(response.data.goals || []);
    } catch (error: any) {
      console.error('Erreur chargement objectifs:', error);
      if (error.response?.status === 401) {
        Alert.alert('Session expirée', 'Veuillez vous reconnecter');
        router.replace('/(auth)/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(goalsOpacity, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Charger les objectifs au montage
    loadGoals();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  };

  const openAddGoal = () => {
    resetForm();
    setAddGoalVisible(true);
    Animated.spring(addModalSlide, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeAddGoal = () => {
    Animated.timing(addModalSlide, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setAddGoalVisible(false);
      resetForm();
    });
  };

  const openDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setDetailsVisible(true);
    Animated.spring(detailsModalSlide, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeDetails = () => {
    Animated.timing(detailsModalSlide, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDetailsVisible(false);
      setSelectedGoal(null);
    });
  };

  const openAllocate = () => {
    closeDetails();
    setTimeout(() => {
      setAllocateVisible(true);
      Animated.spring(allocateModalSlide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 300);
  };

  const closeAllocate = () => {
    Animated.timing(allocateModalSlide, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setAllocateVisible(false);
      setAllocateAmount('');
    });
  };

  const openEdit = () => {
    if (selectedGoal) {
      setGoalTitle(selectedGoal.title);
      setTargetAmount(selectedGoal.targetAmount.toString());
      setSelectedDate(selectedGoal.deadline ? new Date(selectedGoal.deadline) : null);
      setSelectedIcon(selectedGoal.icon);
      setSelectedColor(selectedGoal.color);
      setSelectedCategory(selectedGoal.category);
    }
    closeDetails();
    setTimeout(() => {
      setEditVisible(true);
    }, 300);
  };

  const closeEdit = () => {
    setEditVisible(false);
    resetForm();
  };

  const handleUpdateGoal = () => {
    if (!goalTitle.trim()) {
      Alert.alert(t.common.error, t.goals.enterTitle);
      return;
    }

    const amount = parseFloat(targetAmount);
    if (!targetAmount || isNaN(amount) || amount <= 0) {
      Alert.alert(t.common.error, t.goals.enterAmount);
      return;
    }

    if (selectedGoal) {
      const updatedGoals = goals.map(g => {
        if (g.id === selectedGoal.id) {
          return {
            ...g,
            title: goalTitle.trim(),
            targetAmount: amount,
            deadline: selectedDate ? selectedDate.toISOString() : undefined,
            icon: selectedIcon,
            color: selectedColor,
            category: selectedCategory,
          };
        }
        return g;
      });

      setGoals(updatedGoals);
      closeEdit();
      
      setTimeout(() => {
        Alert.alert(
          '✅ Objectif modifié !', 
          `Votre objectif "${goalTitle}" a été mis à jour.`,
          [{ text: 'OK', style: 'default' }]
        );
      }, 300);
    }
  };

  const resetForm = () => {
    setGoalTitle('');
    setTargetAmount('');
    setSelectedDate(null);
    setSelectedIcon('flag');
    setSelectedColor('#733fea');
    setSelectedCategory('Épargne');
  };

  const handleSaveGoal = async () => {
    if (!goalTitle.trim()) {
      Alert.alert(t.common.error, t.goals.enterTitle);
      return;
    }

    const amount = parseFloat(targetAmount);
    if (!targetAmount || isNaN(amount) || amount <= 0) {
      Alert.alert(t.common.error, t.goals.enterAmount);
      return;
    }

    try {
      await api.post('/goals', {
        title: goalTitle.trim(),
        targetAmount: amount,
        deadline: selectedDate ? selectedDate.toISOString() : undefined,
        icon: selectedIcon,
        color: selectedColor,
        category: selectedCategory,
      });

      closeAddGoal();
      await loadGoals();
      
      setTimeout(() => {
        showSuccess(t.toast.goalCreated);
      }, 300);
    } catch (error: any) {
      console.error('Erreur création objectif:', error);
      
      if (error.isRateLimit) {
        showError(t.toast.rateLimitError);
      } else {
        showError(error.response?.data?.error || t.toast.error);
      }
    }
  };

  const handleAllocate = async () => {
    if (!allocateAmount || !selectedGoal) return;

    const amount = parseFloat(allocateAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t.common.error, t.goals.enterAmount);
      return;
    }

    try {
      const response = await api.post(`/goals/${selectedGoal.id}/allocate`, {
        amount: amount
      });

      closeAllocate();
      await loadGoals();
      
      if (response.data.goal.isAchieved) {
        setTimeout(() => {
          showSuccess(t.toast.goalAchieved);
        }, 300);
      } else {
        setTimeout(() => {
          showSuccess(t.toast.updated);
        }, 300);
      }
    } catch (error: any) {
      console.error('Erreur allocation:', error);
      
      if (error.isRateLimit) {
        showError(t.toast.rateLimitError);
      } else {
        showError(error.response?.data?.error || t.toast.error);
      }
    }
  };

  const handleDeleteGoal = () => {
    if (!selectedGoal) return;
    
    Alert.alert(
      t.goals.deleteConfirm.split('?')[0],
      t.goals.deleteConfirm,
      [
        { text: t.common.cancel, style: 'cancel' },
        { 
          text: t.common.delete, 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/goals/${selectedGoal.id}`);
              closeDetails();
              await loadGoals();
              showSuccess(t.toast.goalDeleted);
            } catch (error: any) {
              console.error('Erreur suppression:', error);
              
              if (error.isRateLimit) {
                showError(t.toast.rateLimitError);
              } else {
                showError(t.toast.error);
              }
            }
          }
        },
      ]
    );
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t.goals.noDeadline;
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const categories = [
    { name: 'Épargne', icon: 'piggy-bank' },
    { name: 'Voyage', icon: 'beach' },
    { name: 'Technologie', icon: 'laptop' },
    { name: 'Véhicule', icon: 'car' },
    { name: 'Immobilier', icon: 'home' },
    { name: 'Sécurité', icon: 'shield-check' },
    { name: 'Cadeau', icon: 'gift' },
    { name: 'Éducation', icon: 'school' },
  ];

  const icons = [
    'flag', 'beach', 'laptop', 'car', 'home', 
    'shield-check', 'gift', 'school', 'heart',
    'star', 'trophy', 'diamond', 'wallet', 'cash'
  ];

  const colors = [
    '#733fea', '#98e0f8', '#10B981', '#F44336', 
    '#FFC107', '#FF6B6B', '#4ECDC4', '#95E1D3'
  ];

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const achievedGoals = goals.filter(g => g.isAchieved).length;
  const globalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Toast notifications */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
      
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>{t.goals.myGoals}</Text>
            <Text style={styles.headerSubtitle}>
              {goals.length} {goals.length > 1 ? t.goals.title.toLowerCase() : t.goals.title.toLowerCase().slice(0, -1)} • {achievedGoals} {t.goals.achieved.toLowerCase()}{achievedGoals > 1 ? 's' : ''}
            </Text>
          </View>
          <HapticButton 
            style={styles.addButton}
            onPress={openAddGoal}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#fdfdfd" />
          </HapticButton>
        </View>
      </Animated.View>

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
        <Animated.View style={[styles.statsCard, { opacity: goalsOpacity }]}>
          <View style={styles.statsGradient}>
            <View style={styles.statIconContainer}>
              <MaterialCommunityIcons name="piggy-bank" size={20} color="#733fea" />
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t.goals.totalSaved}</Text>
              <Text style={styles.statValue}>{currencySymbol}{totalSaved.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.statsGradient}>
            <View style={styles.statIconContainer}>
              <MaterialCommunityIcons name="target" size={20} color="#733fea" />
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t.goals.totalTarget}</Text>
              <Text style={styles.statValue}>{currencySymbol}{totalTarget.toFixed(2)}</Text>
            </View>
          </View>
        </Animated.View>

        {goals.length > 0 && (
          <Animated.View style={[styles.globalProgressCard, { opacity: goalsOpacity }]}>
            <View style={styles.globalProgressHeader}>
              <Text style={styles.globalProgressTitle}>{t.goals.globalProgress}</Text>
              <Text style={styles.globalProgressPercent}>{globalProgress.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground} />
              <LinearGradient
                colors={['#733fea', '#98e0f8']}
                style={[styles.progressBarFill, { width: `${globalProgress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </Animated.View>
        )}

        <Animated.View style={[styles.goalsSection, { opacity: goalsOpacity }]}>
          {loading ? (
            <SkeletonList count={3} />
          ) : goals.length === 0 ? (
            <EmptyState
              icon="target"
              title={t.emptyStates.noGoals.title}
              subtitle={t.emptyStates.noGoals.subtitle}
              actionLabel={t.emptyStates.noGoals.action}
              onAction={openAddGoal}
            />
          ) : (
            goals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={index}
                onPress={() => openDetails(goal)}
                currencySymbol={currencySymbol}
              />
            ))
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal Création Objectif */}
      <Modal
        visible={addGoalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeAddGoal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t.goals.addGoal}</Text>
            
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Catégorie */}
              <Text style={styles.inputLabel}>{t.goals.category}</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat.name && styles.categoryChipActive
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat.name);
                      setSelectedIcon(cat.icon);
                    }}
                  >
                    <MaterialCommunityIcons 
                      name={cat.icon as any} 
                      size={18} 
                      color={selectedCategory === cat.name ? '#fff' : 'rgba(253, 253, 253, 0.6)'} 
                    />
                    <Text style={selectedCategory === cat.name ? styles.categoryTextActive : styles.categoryText}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Titre */}
              <Text style={styles.inputLabel}>{t.goals.goalTitle} *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Vacances d'été"
                placeholderTextColor="rgba(253, 253, 253, 0.4)"
                value={goalTitle}
                onChangeText={setGoalTitle}
              />
              
              {/* Montant */}
              <Text style={styles.inputLabel}>{t.goals.targetAmount} *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 2000"
                placeholderTextColor="rgba(253, 253, 253, 0.4)"
                keyboardType="decimal-pad"
                value={targetAmount}
                onChangeText={setTargetAmount}
              />
              
              {/* Date limite */}
              <Text style={styles.inputLabel}>{t.goals.deadline} ({t.common.skip.toLowerCase()})</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={20} color="#733fea" />
                <Text style={styles.dateButtonText}>
                  {selectedDate ? formatDate(selectedDate.toISOString()) : t.goals.selectDeadline}
                </Text>
              </TouchableOpacity>
              {selectedDate && (
                <TouchableOpacity onPress={() => setSelectedDate(null)}>
                  <Text style={styles.clearDateText}>{t.common.delete} la date</Text>
                </TouchableOpacity>
              )}
              
              {/* Couleur */}
              <Text style={styles.inputLabel}>{t.goals.color}</Text>
              <View style={styles.colorGrid}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionActive
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <MaterialCommunityIcons name="check" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeAddGoal}>
                <Text style={styles.cancelButtonText}>{t.common.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveGoal}>
                <Text style={styles.saveButtonText}>{t.common.add}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Édition Objectif */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t.goals.editGoal}</Text>
            
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Catégorie */}
              <Text style={styles.inputLabel}>{t.goals.category}</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat.name && styles.categoryChipActive
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat.name);
                      setSelectedIcon(cat.icon);
                    }}
                  >
                    <MaterialCommunityIcons 
                      name={cat.icon as any} 
                      size={18} 
                      color={selectedCategory === cat.name ? '#fff' : 'rgba(253, 253, 253, 0.6)'} 
                    />
                    <Text style={selectedCategory === cat.name ? styles.categoryTextActive : styles.categoryText}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Titre */}
              <Text style={styles.inputLabel}>{t.goals.goalTitle} *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Vacances d'été"
                placeholderTextColor="rgba(253, 253, 253, 0.4)"
                value={goalTitle}
                onChangeText={setGoalTitle}
              />
              
              {/* Montant */}
              <Text style={styles.inputLabel}>{t.goals.targetAmount} *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 2000"
                placeholderTextColor="rgba(253, 253, 253, 0.4)"
                keyboardType="decimal-pad"
                value={targetAmount}
                onChangeText={setTargetAmount}
              />
              
              {/* Date limite */}
              <Text style={styles.inputLabel}>{t.goals.deadline} ({t.common.skip.toLowerCase()})</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={20} color="#733fea" />
                <Text style={styles.dateButtonText}>
                  {selectedDate ? formatDate(selectedDate.toISOString()) : t.goals.selectDeadline}
                </Text>
              </TouchableOpacity>
              {selectedDate && (
                <TouchableOpacity onPress={() => setSelectedDate(null)}>
                  <Text style={styles.clearDateText}>{t.common.delete} la date</Text>
                </TouchableOpacity>
              )}
              
              {/* Couleur */}
              <Text style={styles.inputLabel}>{t.goals.color}</Text>
              <View style={styles.colorGrid}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionActive
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <MaterialCommunityIcons name="check" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeEdit}>
                <Text style={styles.cancelButtonText}>{t.common.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateGoal}>
                <Text style={styles.saveButtonText}>{t.common.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Détails Objectif */}
      <Modal
        visible={detailsVisible}
        transparent
        animationType="slide"
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedGoal && (
              <>
                <Text style={styles.modalTitle}>{selectedGoal.title}</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.goals.totalSaved}:</Text>
                  <Text style={styles.detailValue}>{selectedGoal.currentAmount.toFixed(0)} €</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.goals.targetAmount}:</Text>
                  <Text style={styles.detailValue}>{selectedGoal.targetAmount.toFixed(0)} €</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.goals.remaining}:</Text>
                  <Text style={styles.detailValue}>
                    {(selectedGoal.targetAmount - selectedGoal.currentAmount).toFixed(0)} €
                  </Text>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground} />
                  <LinearGradient
                    colors={[selectedGoal.color, `${selectedGoal.color}80`]}
                    style={[
                      styles.progressBarFill, 
                      { width: `${calculateProgress(selectedGoal.currentAmount, selectedGoal.targetAmount)}%` }
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                
                {!selectedGoal.isAchieved && (
                  <TouchableOpacity style={styles.allocateBtn} onPress={openAllocate}>
                    <Text style={styles.allocateBtnText}>{t.goals.allocateFunds}</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.editBtn} onPress={openEdit}>
                  <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
                  <Text style={styles.editBtnText}>{t.common.edit}</Text>
                </TouchableOpacity>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteGoal}>
                    <Text style={styles.deleteBtnText}>{t.common.delete}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={closeDetails}>
                    <Text style={styles.cancelButtonText}>{t.common.close}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Allocation */}
      <Modal
        visible={allocateVisible}
        transparent
        animationType="slide"
        onRequestClose={closeAllocate}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t.goals.allocateFunds}</Text>
            
            {selectedGoal && (
              <>
                <Text style={styles.modalSubtitle}>{selectedGoal.title}</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder={t.goals.allocateAmount}
                  placeholderTextColor="rgba(253, 253, 253, 0.4)"
                  keyboardType="decimal-pad"
                  value={allocateAmount}
                  onChangeText={setAllocateAmount}
                  autoFocus
                />
                
                <View style={styles.quickAmounts}>
                  {[50, 100, 200, 500].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={styles.quickAmountBtn}
                      onPress={() => setAllocateAmount(amount.toString())}
                    >
                      <Text style={styles.quickAmountText}>+{amount}{currencySymbol}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={closeAllocate}>
                    <Text style={styles.cancelButtonText}>{t.common.cancel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleAllocate}>
                    <Text style={styles.saveButtonText}>{t.common.confirm}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
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
                  const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                  const isToday = today.toDateString() === date.toDateString();
                  const isPast = date < today;
                  
                  days.push(
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                        isToday && !isSelected && styles.dayCellToday,
                      ]}
                      onPress={() => {
                        if (!isPast) {
                          setSelectedDate(date);
                          setShowDatePicker(false);
                        }
                      }}
                      disabled={isPast}
                    >
                      <Text style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                        isToday && !isSelected && styles.dayTextToday,
                        isPast && styles.dayTextPast,
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
              <Text style={styles.calendarCloseText}>{t.common.close}</Text>
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#733fea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  statsCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statsGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.6)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(115, 63, 234, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  globalProgressCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  globalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  globalProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
  },
  globalProgressPercent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#733fea',
  },
  goalsSection: {
    marginBottom: 24,
  },
  goalCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 4,
  },
  goalCategory: {
    fontSize: 13,
    color: 'rgba(253, 253, 253, 0.5)',
  },
  achievedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalProgress: {
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#fdfdfd',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    color: '#733fea',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  remainingText: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.5)',
  },
  deadlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(152, 224, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  deadlineText: {
    fontSize: 11,
    color: '#98e0f8',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(253, 253, 253, 0.5)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#733fea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  modalScrollView: {
    maxHeight: height * 0.6,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fdfdfd',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(253, 253, 253, 0.7)',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fdfdfd',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'rgba(253, 253, 253, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#733fea',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailLabel: {
    fontSize: 16,
    color: 'rgba(253, 253, 253, 0.6)',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
  },
  allocateBtn: {
    backgroundColor: '#733fea',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  allocateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickAmountBtn: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(115, 63, 234, 0.3)',
  },
  quickAmountText: {
    color: '#733fea',
    fontSize: 14,
    fontWeight: '600',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 8,
    marginTop: 8,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#733fea',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.6)',
  },
  categoryTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#fdfdfd',
  },
  clearDateText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: '#fdfdfd',
  },
  editBtn: {
    flexDirection: 'row',
    backgroundColor: '#733fea',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  calendarModal: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  dayTextPast: {
    color: 'rgba(253, 253, 253, 0.3)',
  },
  calendarCloseButton: {
    backgroundColor: '#1a1a1a',
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
