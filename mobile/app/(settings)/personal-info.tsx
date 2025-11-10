import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  TextInput,
  Alert
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useAuthStore } from '../../src/store/authStore';
import { useDataStore } from '../../src/store/dataStore';
import { formatDate } from '../../src/utils/dateFormatter';
import api from '../../src/services/api';

export default function PersonalInfo() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useAuthStore();
  const { refreshTrigger } = useDataStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Statistiques réelles
  const [memberSince, setMemberSince] = useState('');
  const [transactionCount, setTransactionCount] = useState(0);
  const [goalsCount, setGoalsCount] = useState(0);
  const [achievedGoalsCount, setAchievedGoalsCount] = useState(0);

  useEffect(() => {
    loadUserData();
    loadStatistics();
  }, []);

  // Recharger les statistiques à chaque fois qu'on revient sur la page
  useFocusEffect(
    useCallback(() => {
      loadStatistics();
    }, [])
  );

  // Rafraîchir automatiquement quand des données changent
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadStatistics();
    }
  }, [refreshTrigger]);

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setName(userData.name || '');
        setEmail(userData.email || '');
        setPhone(userData.phone || '');
        setAddress(userData.address || '');
        setCity(userData.city || '');
        setCountry(userData.country || '');
        setDateOfBirth(userData.dateOfBirth || '');
        
        // Date d'inscription
        if (userData.createdAt) {
          const date = new Date(userData.createdAt);
          const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
          setMemberSince(formatDate(date, language, options));
        } else {
          setMemberSince(formatDate(new Date('2025-11-01'), language, { year: 'numeric', month: 'long' }));
        }
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      // Charger les transactions depuis le backend
      const transactionsResponse = await api.get('/transactions?limit=1000');
      const transactions = transactionsResponse.data.transactions || [];
      setTransactionCount(transactions.length);

      // Charger les objectifs depuis le backend
      const goalsResponse = await api.get('/goals');
      const goals = goalsResponse.data.goals || [];
      setGoalsCount(goals.length);
      
      // Compter les objectifs atteints
      const achieved = goals.filter((goal: any) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        return progress >= 100 || goal.isAchieved;
      }).length;
      setAchievedGoalsCount(achieved);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      
      // Fallback sur AsyncStorage si le backend échoue
      try {
        const transactionsStr = await AsyncStorage.getItem('transactions');
        if (transactionsStr) {
          const transactions = JSON.parse(transactionsStr);
          setTransactionCount(transactions.length);
        }

        const goalsStr = await AsyncStorage.getItem('goals');
        if (goalsStr) {
          const goals = JSON.parse(goalsStr);
          setGoalsCount(goals.length);
          
          const achieved = goals.filter((goal: any) => goal.isAchieved).length;
          setAchievedGoalsCount(achieved);
        }
      } catch (fallbackError) {
        console.error('Erreur fallback:', fallbackError);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('error'), t('nameRequired'));
      return;
    }

    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        const updatedData = {
          ...userData,
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          country: country.trim(),
          dateOfBirth: dateOfBirth.trim(),
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(updatedData));
        
        // TODO: Envoyer au backend
        // await api.put('/users/me', updatedData);
        
        setIsEditing(false);
        Alert.alert(t('success'), t('informationUpdated'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('cannotSaveChanges'));
    }
  };

  const InfoField = ({ 
    icon, 
    label, 
    value, 
    onChangeText, 
    placeholder,
    editable = true,
    keyboardType = 'default'
  }: any) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <MaterialCommunityIcons name={icon} size={20} color="#733fea" />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <TextInput
        style={[
          styles.fieldInput,
          !editable && styles.fieldInputDisabled,
          !isEditing && styles.fieldInputReadonly
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(253, 253, 253, 0.3)"
        editable={editable && isEditing}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#733fea', '#9b6ff7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('personalInformation')}</Text>
          <TouchableOpacity 
            onPress={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            style={styles.editButton}
          >
            <MaterialCommunityIcons 
              name={isEditing ? "check" : "pencil"} 
              size={20} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informations de base */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('basicInformation')}</Text>
          
          <InfoField
            icon="account"
            label={t('fullName')}
            value={name}
            onChangeText={setName}
            placeholder={t('yourFullName')}
          />

          <InfoField
            icon="email"
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            editable={false}
            keyboardType="email-address"
          />

          <InfoField
            icon="phone"
            label={t('phone')}
            value={phone}
            onChangeText={setPhone}
            placeholder="+226xxxxxxxx"
            keyboardType="phone-pad"
          />

          <InfoField
            icon="calendar"
            label={t('dateOfBirth')}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="JJ/MM/AAAA"
          />
        </View>

        {/* Adresse */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('address')}</Text>
          
          <InfoField
            icon="home"
            label={t('address')}
            value={address}
            onChangeText={setAddress}
            placeholder="Route National 3"
          />

          <InfoField
            icon="city"
            label={t('city')}
            value={city}
            onChangeText={setCity}
            placeholder="Ouagadougou"
          />

          <InfoField
            icon="earth"
            label={t('country')}
            value={country}
            onChangeText={setCountry}
            placeholder="Burkina Faso"
          />
        </View>

        {/* Statistiques du compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('accountStatistics')}</Text>
          
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="calendar-check" size={24} color="#733fea" />
                <Text style={styles.statLabel}>{t('memberSince')}</Text>
                <Text style={styles.statValue}>{memberSince || 'Novembre 2025'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="chart-line" size={24} color="#10B981" />
                <Text style={styles.statLabel}>{t('transactions')}</Text>
                <Text style={styles.statValue}>{transactionCount}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="target" size={24} color="#98e0f8" />
                <Text style={styles.statLabel}>{t('goals')}</Text>
                <Text style={styles.statValue}>{goalsCount}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="trophy" size={24} color="#FFC107" />
                <Text style={styles.statLabel}>{t('achievedGoals')}</Text>
                <Text style={styles.statValue}>{achievedGoalsCount}</Text>
              </View>
            </View>
          </View>
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setIsEditing(false);
                loadUserData();
              }}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 50 }} />
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
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fdfdfd',
    marginBottom: 15,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.7)',
    marginLeft: 8,
  },
  fieldInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#fdfdfd',
    borderWidth: 1,
    borderColor: 'rgba(115, 63, 234, 0.3)',
  },
  fieldInputDisabled: {
    backgroundColor: 'rgba(42, 42, 42, 0.5)',
    borderColor: 'rgba(253, 253, 253, 0.1)',
  },
  fieldInputReadonly: {
    borderColor: 'rgba(253, 253, 253, 0.1)',
  },
  statCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(253, 253, 253, 0.1)',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(253, 253, 253, 0.5)',
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fdfdfd',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(253, 253, 253, 0.1)',
  },
  cancelButtonText: {
    color: '#fdfdfd',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#733fea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
