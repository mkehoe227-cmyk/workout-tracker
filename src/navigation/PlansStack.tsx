import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme';
import type { PlansStackParamList } from './types';
import { SplitsListScreen } from '../screens/splits/SplitsListScreen';
import { SplitFormScreen } from '../screens/splits/SplitFormScreen';
import { SplitDetailScreen } from '../screens/splits/SplitDetailScreen';
import { WorkoutFormScreen } from '../screens/splits/WorkoutFormScreen';
import { WorkoutDetailScreen } from '../screens/splits/WorkoutDetailScreen';
import { ExercisePickerScreen } from '../screens/plans/ExercisePickerScreen';
import { ExerciseFormScreen } from '../screens/plans/ExerciseFormScreen';

const Stack = createNativeStackNavigator<PlansStackParamList>();

export function PlansStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerBackTitle: 'Back',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="SplitsList" component={SplitsListScreen} options={{ title: 'My Splits' }} />
      <Stack.Screen name="SplitForm" component={SplitFormScreen} options={{ title: '' }} />
      <Stack.Screen name="SplitDetail" component={SplitDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="WorkoutForm" component={WorkoutFormScreen} options={{ title: '' }} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} options={{ title: 'Add Exercise' }} />
      <Stack.Screen name="ExerciseForm" component={ExerciseFormScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}
