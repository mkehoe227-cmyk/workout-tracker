import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme';
import type { LogStackParamList } from './types';
import { LogHomeScreen } from '../screens/log/LogHomeScreen';
import { ActiveSessionScreen } from '../screens/log/ActiveSessionScreen';
import { SessionSummaryScreen } from '../screens/log/SessionSummaryScreen';

const Stack = createNativeStackNavigator<LogStackParamList>();

export function LogStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerBackTitle: 'Back',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="LogHome" component={LogHomeScreen} options={{ title: 'Log Workout' }} />
      <Stack.Screen name="ActiveSession" component={ActiveSessionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} options={{ headerShown: false, gestureEnabled: false }} />
    </Stack.Navigator>
  );
}
