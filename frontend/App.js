// App.js
import React from 'react';
import MainTabNavigator from './navigation/MainTabNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <MainTabNavigator />
      </PaperProvider>
    </QueryClientProvider>
  );
}
