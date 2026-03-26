import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

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

// Screen prop helpers
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
