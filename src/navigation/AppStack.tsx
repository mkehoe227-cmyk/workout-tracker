import React from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import type { AppTabParamList } from './types';
import { PlansStack } from './PlansStack';
import { LogStack } from './LogStack';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator<AppTabParamList>();

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
      <Tab.Screen name="Log" component={LogStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  logout: {
    marginRight: 16,
  },
  logoutText: {
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: '500',
  },
});
