import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList, BottomTabParamList } from '../types';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SessionsScreen } from '../screens/SessionsScreen';
import { StudyScreen } from '../screens/study/StudyScreen';
import { CoachesScreen } from '../screens/marketplace/CoachesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4ade80',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#2d2d2d',
          borderTopColor: '#374151',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          title: 'Sessões',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🎮</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Study"
        component={StudyScreen}
        options={{
          title: 'Estudo',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Coaches"
        component={CoachesScreen}
        options={{
          title: 'Coaches',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👨‍🏫</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
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
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};