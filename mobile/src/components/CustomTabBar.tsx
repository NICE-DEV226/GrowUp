import { View, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const TABS = [
  { name: 'dashboard', icon: 'view-dashboard', color: '#733fea' },
  { name: 'transactions', icon: 'swap-horizontal', color: '#98e0f8' },
  { name: 'goals', icon: 'target', color: '#10B981' },
  { name: 'stats', icon: 'chart-line', color: '#FFC107' },
  { name: 'profile', icon: 'account-circle', color: '#F44336' },
];

export default function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
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
            <TabButton
              key={tab.name}
              icon={tab.icon}
              color={tab.color}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

interface TabButtonProps {
  icon: string;
  color: string;
  isFocused: boolean;
  onPress: () => void;
}

function TabButton({ icon, color, isFocused, onPress }: TabButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(iconScale, {
      toValue: isFocused ? 1.15 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.85,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isFocused ? '#fff' : 'transparent',
            transform: [{ scale }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <MaterialCommunityIcons
            name={icon as any}
            size={22}
            color={isFocused ? '#1a1a1a' : 'rgba(255, 255, 255, 0.6)'}
          />
        </Animated.View>
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
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
