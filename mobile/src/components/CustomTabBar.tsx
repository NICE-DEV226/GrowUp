import { View, TouchableOpacity, StyleSheet, Platform, Dimensions, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../hooks/useTranslation';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = 56;
const TAB_HEIGHT = Platform.OS === 'ios' ? 85 : 70;

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const { t } = useTranslation();
  
  const TABS = [
    { name: 'dashboard', icon: 'view-dashboard', label: t('dashboard') },
    { name: 'transactions', icon: 'swap-horizontal', label: t('transactions') },
    { name: 'goals', icon: 'target', label: t('goals') },
    { name: 'stats', icon: 'chart-line', label: t('stats') },
    { name: 'profile', icon: 'account-circle', label: t('profile') },
  ];
  const tabWidth = width / TABS.length;
  const translateX = useRef(new Animated.Value(state.index * tabWidth)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: false,
      damping: 20,
      stiffness: 90,
    }).start();
  }, [state.index]);

  return (
    <View style={styles.container}>
      {/* Barre principale */}
      <View style={styles.tabBar}>
        {/* Creux circulaire animé */}
        <Animated.View
          style={[
            styles.notch,
            {
              left: Animated.add(translateX, tabWidth / 2 - 40),
            },
          ]}
        >
          <View style={styles.notchCurveLeft} />
          <View style={styles.notchCenter} />
          <View style={styles.notchCurveRight} />
        </Animated.View>

        {/* Bouton flottant dans le creux */}
        <Animated.View
          style={[
            styles.floatingButton,
            {
              left: Animated.add(translateX, tabWidth / 2 - BUTTON_SIZE / 2),
            },
          ]}
        >
          <LinearGradient
            colors={['#733fea', '#9d5ff5']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name={TABS[state.index].icon as any}
              size={26}
              color="#fff"
            />
          </LinearGradient>
        </Animated.View>

        {/* Icônes et labels */}
        <View style={styles.tabsRow}>
          {TABS.map((tab, index) => {
            const isFocused = state.index === index;
            const route = state.routes[index];

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabItem
                key={tab.name}
                icon={tab.icon}
                label={tab.label}
                isFocused={isFocused}
                onPress={onPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

interface TabItemProps {
  icon: string;
  label: string;
  isFocused: boolean;
  onPress: () => void;
}

function TabItem({ icon, label, isFocused, onPress }: TabItemProps) {
  const opacity = useRef(new Animated.Value(isFocused ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isFocused ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={{ opacity, alignItems: 'center' }}>
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color="rgba(253, 253, 253, 0.6)"
        />
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_HEIGHT + 30,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_HEIGHT,
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 35,
  },
  notch: {
    position: 'absolute',
    top: 0,
    width: 80,
    height: 40,
    flexDirection: 'row',
    zIndex: 1,
  },
  notchCurveLeft: {
    width: 20,
    height: 40,
    backgroundColor: 'transparent',
    borderBottomRightRadius: 20,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#2a2a2a',
  },
  notchCenter: {
    width: 40,
    height: 40,
    backgroundColor: 'transparent',
  },
  notchCurveRight: {
    width: 20,
    height: 40,
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 20,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#2a2a2a',
  },
  floatingButton: {
    position: 'absolute',
    top: 5,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    zIndex: 100,
    shadowColor: '#733fea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  buttonGradient: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#1a1a1a',
  },
  tabsRow: {
    flexDirection: 'row',
    height: '100%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    paddingTop: 15,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.5)',
    marginTop: 4,
  },
});
