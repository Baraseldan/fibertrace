import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MapScreen } from './screens/MapScreen';
import { JobsScreen } from './screens/JobsScreen';
import { colors } from './theme/colors';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            tabBarStyle: {
              backgroundColor: colors.sidebar,
              borderTopColor: colors.border,
              borderTopWidth: 1,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.mutedForeground,
            headerStyle: {
              backgroundColor: colors.card,
              borderBottomColor: colors.border,
              borderBottomWidth: 1,
            },
            headerTintColor: colors.foreground,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen
            name="Map"
            component={MapScreen}
            options={{
              title: 'FiberTrace Map',
              tabBarLabel: 'Map',
            }}
          />
          <Tab.Screen
            name="Jobs"
            component={JobsScreen}
            options={{
              title: 'Job Management',
              tabBarLabel: 'Jobs',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
