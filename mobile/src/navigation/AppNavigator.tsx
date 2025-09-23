import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList, BottomTabParamList } from '../types';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SessionsScreen } from '../screens/SessionsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#e5e7eb',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: () => null, // TODO: Add icons
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          title: 'Sessões',
          tabBarIcon: () => null, // TODO: Add icons
        }}
      />
      <Tab.Screen
        name="Study"
        component={DashboardScreen} // Placeholder
        options={{
          title: 'Estudo',
          tabBarIcon: () => null, // TODO: Add icons
        }}
      />
      <Tab.Screen
        name="Coaches"
        component={DashboardScreen} // Placeholder
        options={{
          title: 'Coaches',
          tabBarIcon: () => null, // TODO: Add icons
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DashboardScreen} // Placeholder
        options={{
          title: 'Perfil',
          tabBarIcon: () => null, // TODO: Add icons
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};