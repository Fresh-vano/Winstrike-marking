// navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';

import UploadScreen from '../screens/UploadScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import AddDetailScreen from '../screens/AddDetailScreen';

const Tab = createBottomTabNavigator();
const HistoryStack = createStackNavigator();

const HistoryStackNavigator = () => {
  return (
    <HistoryStack.Navigator>
      <HistoryStack.Screen name="HistoryList" component={HistoryScreen} options={{ title: 'История' }} />
      <HistoryStack.Screen name="HistoryDetail" component={HistoryDetailScreen} options={{ title: 'Детали' }} />
    </HistoryStack.Navigator>
  );
};

const UploadStackNavigator = () => {
    return (
      <HistoryStack.Navigator>
        <HistoryStack.Screen name="UploadScreen" component={UploadScreen} options={{ title: 'Загрузка' }} />
        <HistoryStack.Screen name="HistoryDetail" component={HistoryDetailScreen} options={{ title: 'Детали' }} />
      </HistoryStack.Navigator>
    );
  };

const MainTabNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Статистика"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Загрузка') {
              iconName = 'cloud-upload';
            } else if (route.name === 'История') {
              iconName = 'history';
            } else if (route.name === 'Статистика') {
              iconName = 'chart-bar';
            }else if (route.name === 'Сборочная единица') {
                iconName = 'script';
            }

            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6CACE4',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Статистика" component={StatsScreen} />
        <Tab.Screen name="История" component={HistoryStackNavigator} options={{ headerShown: false }} />
        <Tab.Screen name="Загрузка" component={UploadStackNavigator} options={{ headerShown: false }}  />
        <Tab.Screen name="Сборочная единица" component={AddDetailScreen}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default MainTabNavigator;
