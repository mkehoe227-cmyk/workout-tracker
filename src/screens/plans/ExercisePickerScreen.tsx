import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import exerciseData from '../../data/exercises.json';
import type { PlansStackParamList, ExercisePickerScreenProps } from '../../navigation/types';
import type { ExerciseTemplate } from '../../types';

type Nav = NativeStackNavigationProp<PlansStackParamList>;

const ALL_TEMPLATES: ExerciseTemplate[] = exerciseData as ExerciseTemplate[];

export function ExercisePickerScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<ExercisePickerScreenProps['route']>();
  const { splitId, workoutId } = route.params;
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_TEMPLATES.slice(0, 50);
    const q = query.toLowerCase();
    return ALL_TEMPLATES.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.muscle.toLowerCase().includes(q)
    ).slice(0, 80);
  }, [query]);

  function goToForm(template?: ExerciseTemplate) {
    nav.navigate('ExerciseForm', { splitId, workoutId, template });
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Search exercises or muscle..."
        placeholderTextColor="#555"
        autoFocus
        clearButtonMode="while-editing"
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <Pressable style={styles.customRow} onPress={() => goToForm()}>
            <Text style={styles.customIcon}>✏️</Text>
            <Text style={styles.customText}>Custom exercise</Text>
          </Pressable>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => goToForm(item)}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{item.name}</Text>
              {item.muscle ? (
                <Text style={styles.rowMuscle}>{item.muscle}</Text>
              ) : null}
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  search: {
    backgroundColor: '#1C1C1E',
    color: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 8,
  },
  customIcon: { fontSize: 18, marginRight: 12 },
  customText: { color: '#6C63FF', fontSize: 16, fontWeight: '500' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  rowInfo: { flex: 1 },
  rowName: { color: '#FFF', fontSize: 16 },
  rowMuscle: { color: '#888', fontSize: 13, marginTop: 2 },
  arrow: { color: '#555', fontSize: 20 },
  separator: { height: 1, backgroundColor: '#2C2C2E' },
});
