import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { ExerciseTemplate } from '../types';

// Auth stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// App tab navigator
export type AppTabParamList = {
  Plans: undefined;
  Log: undefined;
  Dashboard: undefined;
  Progress: undefined;
};

// Plans nested stack
export type PlansStackParamList = {
  SplitsList: undefined;
  SplitForm: { splitId?: string };
  SplitDetail: { splitId: string };
  WorkoutForm: { splitId: string; workoutId?: string };
  WorkoutDetail: { splitId: string; workoutId: string };
  ExercisePicker: { splitId: string; workoutId: string };
  ExerciseForm: { splitId: string; workoutId: string; exerciseId?: string; template?: ExerciseTemplate };
};

// Screen prop helpers
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export type SplitsListScreenProps = NativeStackScreenProps<PlansStackParamList, 'SplitsList'>;
export type SplitFormScreenProps = NativeStackScreenProps<PlansStackParamList, 'SplitForm'>;
export type SplitDetailScreenProps = NativeStackScreenProps<PlansStackParamList, 'SplitDetail'>;
export type WorkoutFormScreenProps = NativeStackScreenProps<PlansStackParamList, 'WorkoutForm'>;
export type WorkoutDetailScreenProps = NativeStackScreenProps<PlansStackParamList, 'WorkoutDetail'>;
export type ExercisePickerScreenProps = NativeStackScreenProps<PlansStackParamList, 'ExercisePicker'>;
export type ExerciseFormScreenProps = NativeStackScreenProps<PlansStackParamList, 'ExerciseForm'>;
