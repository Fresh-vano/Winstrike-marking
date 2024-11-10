// App.js
import React from 'react';
import MainTabNavigator from './navigation/MainTabNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import 'react-native-gesture-handler';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <MainTabNavigator />
        <Toast />
      </PaperProvider>
    </QueryClientProvider>
  );
}
