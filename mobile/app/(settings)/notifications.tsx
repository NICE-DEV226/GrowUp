import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Switch,
  Alert
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function NotificationSettings() {
  const router = useRouter();
  const { t } = useTranslation();
  
  // Notifications push
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  // Notifications par catégorie
  const [transactionNotifs, setTransactionNotifs] = useState(true);
  const [goalNotifs, setGoalNotifs] = useState(true);
  const [budgetNotifs, setBudgetNotifs] = useState(true);
  const [reminderNotifs, setReminderNotifs] = useState(true);
  
  // Notifications par email
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setPushEnabled(parsed.pushEnabled ?? true);
        setSoundEnabled(parsed.soundEnabled ?? true);
        setVibrationEnabled(parsed.vibrationEnabled ?? true);
        setTransactionNotifs(parsed.transactionNotifs ?? true);
        setGoalNotifs(parsed.goalNotifs ?? true);
        setBudgetNotifs(parsed.budgetNotifs ?? true);
        setReminderNotifs(parsed.reminderNotifs ?? true);
        setEmailEnabled(parsed.emailEnabled ?? false);
        setWeeklyReport(parsed.weeklyReport ?? false);
        setMonthlyReport(parsed.monthlyReport ?? true);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const saveSettings = async (key: string, value: boolean) => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      const parsed = settings ? JSON.parse(settings) : {};
      parsed[key] = value;
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(parsed));
      
      // TODO: Envoyer au backend
      // await api.put('/users/me/notification-settings', parsed);
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
    }
  };

  const handleToggle = (key: string, value: boolean, setter: (val: boolean) => void) => {
    setter(value);
    saveSettings(key, value);
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onValueChange,
    color = '#733fea'
  }: any) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#2a2a2a', true: color }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
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
          <Text style={styles.headerTitle}>{t('notifications')}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications Push */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('pushNotifications')}</Text>
          
          <SettingItem
            icon="bell"
            title={t('enableNotifications')}
            subtitle={t('receiveNotifications')}
            value={pushEnabled}
            onValueChange={(val: boolean) => handleToggle('pushEnabled', val, setPushEnabled)}
            color="#733fea"
          />

          {pushEnabled && (
            <>
              <SettingItem
                icon="volume-high"
                title={t('sound')}
                subtitle={t('playSound')}
                value={soundEnabled}
                onValueChange={(val: boolean) => handleToggle('soundEnabled', val, setSoundEnabled)}
                color="#10B981"
              />

              <SettingItem
                icon="vibrate"
                title={t('vibration')}
                subtitle={t('vibrateOnNotification')}
                value={vibrationEnabled}
                onValueChange={(val: boolean) => handleToggle('vibrationEnabled', val, setVibrationEnabled)}
                color="#98e0f8"
              />
            </>
          )}
        </View>

        {/* Notifications par catégorie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notificationTypes')}</Text>
          
          <SettingItem
            icon="cash-multiple"
            title={t('transactions')}
            subtitle={t('newTransactionsAdded')}
            value={transactionNotifs}
            onValueChange={(val: boolean) => handleToggle('transactionNotifs', val, setTransactionNotifs)}
            color="#10B981"
          />

          <SettingItem
            icon="target"
            title={t('goals')}
            subtitle={t('progressAndAchievements')}
            value={goalNotifs}
            onValueChange={(val: boolean) => handleToggle('goalNotifs', val, setGoalNotifs)}
            color="#98e0f8"
          />

          <SettingItem
            icon="alert-circle"
            title={t('budgetNotifications')}
            subtitle={t('budgetExceededAlerts')}
            value={budgetNotifs}
            onValueChange={(val: boolean) => handleToggle('budgetNotifs', val, setBudgetNotifs)}
            color="#FFC107"
          />

          <SettingItem
            icon="clock-alert"
            title={t('reminderNotifications')}
            subtitle={t('savingsReminders')}
            value={reminderNotifs}
            onValueChange={(val: boolean) => handleToggle('reminderNotifs', val, setReminderNotifs)}
            color="#FF6B6B"
          />
        </View>

        {/* Notifications par email */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('emailNotifications')}</Text>
          
          <SettingItem
            icon="email"
            title={t('enableEmails')}
            subtitle={t('receiveEmailNotifications')}
            value={emailEnabled}
            onValueChange={(val: boolean) => handleToggle('emailEnabled', val, setEmailEnabled)}
            color="#733fea"
          />

          {emailEnabled && (
            <>
              <SettingItem
                icon="calendar-week"
                title={t('weeklyReport')}
                subtitle={t('weeklyFinancialSummary')}
                value={weeklyReport}
                onValueChange={(val: boolean) => handleToggle('weeklyReport', val, setWeeklyReport)}
                color="#10B981"
              />

              <SettingItem
                icon="calendar-month"
                title={t('monthlyReport')}
                subtitle={t('monthlyFinancialReport')}
                value={monthlyReport}
                onValueChange={(val: boolean) => handleToggle('monthlyReport', val, setMonthlyReport)}
                color="#98e0f8"
              />
            </>
          )}
        </View>

        {/* Heures silencieuses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quietHours')}</Text>
          
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => Alert.alert(
              'Heures silencieuses',
              'Définissez une plage horaire pendant laquelle vous ne recevrez pas de notifications.\n\nCette fonctionnalité sera disponible prochainement.'
            )}
          >
            <View style={styles.timeLeft}>
              <MaterialCommunityIcons name="moon-waning-crescent" size={24} color="#733fea" />
              <View style={styles.timeText}>
                <Text style={styles.timeTitle}>{t('silentMode')}</Text>
                <Text style={styles.timeSubtitle}>{t('notConfigured')}</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(253, 253, 253, 0.3)" />
          </TouchableOpacity>
        </View>

        {/* Test de notification */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => Alert.alert(
              '🔔 Notification test',
              'Ceci est une notification de test de GrowUp !',
              [{ text: 'OK' }]
            )}
          >
            <MaterialCommunityIcons name="bell-ring" size={20} color="#733fea" />
            <Text style={styles.testButtonText}>{t('sendTestNotification')}</Text>
          </TouchableOpacity>
        </View>

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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: 'rgba(253, 253, 253, 0.5)',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
  },
  timeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    marginLeft: 12,
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdfdfd',
    marginBottom: 2,
  },
  timeSubtitle: {
    fontSize: 13,
    color: 'rgba(253, 253, 253, 0.5)',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(115, 63, 234, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(115, 63, 234, 0.3)',
  },
  testButtonText: {
    color: '#733fea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
