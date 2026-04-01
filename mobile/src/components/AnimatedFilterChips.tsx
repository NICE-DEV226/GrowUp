import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FilterOption {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

interface AnimatedFilterChipsProps {
  options: FilterOption[];
  selected: string;
  onSelect: (id: string) => void;
}

export const AnimatedFilterChips: React.FC<AnimatedFilterChipsProps> = ({
  options,
  selected,
  onSelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => (
        <FilterChip
          key={option.id}
          option={option}
          isSelected={selected === option.id}
          onPress={() => onSelect(option.id)}
        />
      ))}
    </ScrollView>
  );
};

interface FilterChipProps {
  option: FilterOption;
  isSelected: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ option, isSelected, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const backgroundAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(backgroundAnim, {
      toValue: isSelected ? 1 : 0,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2a2a2a', option.color || '#733fea'],
  });

  return (
    <Animated.View
      style={[
        styles.chip,
        {
          transform: [{ scale: scaleAnim }],
          backgroundColor,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.chipContent}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {option.icon && (
          <MaterialCommunityIcons
            name={option.icon as any}
            size={18}
            color={isSelected ? '#fff' : 'rgba(253, 253, 253, 0.6)'}
          />
        )}
        <Text
          style={[
            styles.chipText,
            isSelected && styles.chipTextActive,
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    marginRight: 8,
    overflow: 'hidden',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(253, 253, 253, 0.6)',
  },
  chipTextActive: {
    color: '#fff',
  },
});
