import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingOverlay />;

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
