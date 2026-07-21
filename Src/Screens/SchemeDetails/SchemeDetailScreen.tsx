// SchemeDetailScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SchemeDetailsCard from '../../Components/SchemeDetailsCard/SchemeDetailsCard';
import PremiumBackground from '../../Components/PremiumBackground/PremiumBackground';
import BottomTab from '../../Components/BottomTab/BottomTab';
import theme from '../../Utills/AppTheme';
import { AppText } from '../../Components/ui/appcomponents';
import { SafeAreaView } from 'react-native-safe-area-context';

const { COLORS, SIZES } = theme;

type FilterValue = 'all' | 'active' | 'due' | 'completed';

interface FilterButtonProps {
  title: string;
  value: FilterValue;
  isActive: boolean;
  onPress: (value: FilterValue) => void;
}

const FilterButton = ({ title, value, isActive, onPress }: FilterButtonProps) => (
  <TouchableOpacity style={[styles.filterButton, isActive && styles.filterButtonActive]} onPress={() => onPress(value)}>
    <AppText variant="label" color={isActive ? COLORS.white : COLORS.textSecondary}>
      {title}
    </AppText>
  </TouchableOpacity>
);

export default function AllSchemesScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<FilterValue>('all');

  const handleBackPress = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainDrawer');
  };

  return (
    <SafeAreaView style={styles.container}>
      <PremiumBackground />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <AppText variant="h6">All Schemes</AppText>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.filterContainer}>
        <FilterButton title="All" value="all" isActive={filter === 'all'} onPress={setFilter} />
        {/* <FilterButton title="Active" value="active" isActive={filter === 'active'} onPress={setFilter} /> */}
        <FilterButton title="Due" value="due" isActive={filter === 'due'} onPress={setFilter} />
        <FilterButton title="Finished" value="completed" isActive={filter === 'completed'} onPress={setFilter} />
      </View>

      <View style={styles.content}>
        <SchemeDetailsCard layout="vertical" filter={filter} />
      </View>
      <BottomTab activeScreen="SCHEMES" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: SIZES.padding.xs },
  headerRight: { width: 40 },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.md,
    marginHorizontal: 4,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
  },
  filterButtonActive: { backgroundColor: COLORS.accentDark },
  content: { flex: 1 },
});
