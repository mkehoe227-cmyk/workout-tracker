import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import type { AppTabParamList } from './types';
import { PlansStack } from './PlansStack';

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
        headerStyle: { backgroundColor: '#0F0F0F' },
        headerTintColor: '#FFF',
        headerRight: () => <LogoutButton />,
        tabBarStyle: { backgroundColor: '#0F0F0F', borderTopColor: '#2C2C2E' },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#666',
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
    backgroundColor: '#0F0F0F',
  },
  placeholderText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
  placeholderSub: {
    color: '#666',
    marginTop: 8,
  },
  logout: {
    marginRight: 16,
  },
  logoutText: {
    color: '#6C63FF',
    fontSize: 15,
    fontWeight: '500',
  },
});
