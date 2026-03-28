import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { useSplits } from '../../hooks/useSplits';
import type { PlansStackParamList } from '../../navigation/types';
import type { Split } from '../../types';

type Nav = NativeStackNavigationProp<PlansStackParamList>;

export function SplitsListScreen() {
  const { user } = useAuth();
  const { splits, loading, error } = useSplits(user?.uid ?? '');
  const nav = useNavigation<Nav>();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {splits.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No splits yet</Text>
          <Text style={styles.emptySub}>Tap + to create your first split</Text>
        </View>
      ) : (
        <FlatList
          data={splits}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <SplitCard split={item} nav={nav} />}
        />
      )}

      <Pressable style={styles.fab} onPress={() => nav.navigate('SplitForm', {})}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

function SplitCard({ split, nav }: { split: Split; nav: Nav }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => nav.navigate('SplitDetail', { splitId: split.id })}
    >
      <View style={styles.cardMain}>
        <Text style={styles.cardName}>{split.name}</Text>
        {split.description ? (
          <Text style={styles.cardDesc} numberOfLines={1}>{split.description}</Text>
        ) : null}
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F0F' },
  list: { padding: 16, paddingBottom: 100 },
  error: { color: '#FF453A', textAlign: 'center', margin: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: '#666', fontSize: 15, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardMain: { flex: 1 },
  cardName: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  cardDesc: { color: '#888', fontSize: 13, marginTop: 3 },
  cardArrow: { color: '#555', fontSize: 22, marginLeft: 8 },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { color: '#FFF', fontSize: 28, lineHeight: 32 },
});
