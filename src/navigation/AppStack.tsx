import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import type { AppTabParamList } from './types';
import { PlansStack } from './PlansStack';
import { theme } from '../theme';

const Tab = createBottomTabNavigator<AppTabParamList>();

function PlaceholderScreen({ label }: { label: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{label}</Text>
      <Text style={styles.placeholderSub}>Coming soon</Text>
    </View>
  );
}

function LogScreen() { return <PlaceholderScreen label="Log Workout" />; }
function DashboardScreen() { return <PlaceholderScreen label="Dashboard" />; }
function ProgressScreen() { return <PlaceholderScreen label="Progress" />; }

function LogoutButton() {
  return (
    <Pressable onPress={() => signOut(auth)} style={styles.logout}>
      <Text style={styles.logoutText}>Logout</Text>
    </Pressable>
  );
}

export function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerRight: () => <LogoutButton />,
        tabBarStyle: { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border, paddingTop: 4 },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textTertiary,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Plans" component={PlansStack} options={{ headerShown: false }} />
      <Tab.Screen name="Log" component={LogScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  placeholderText: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  placeholderSub: {
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  logout: {
    marginRight: 16,
  },
  logoutText: {
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: '500',
  },
});
