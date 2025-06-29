import React, { useEffect, useRef } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  Event,
} from '@notifee/react-native';

import './global.css';
import HomeScreen from './src/screens/HomeScreen';
import AddNoteScreen from './src/screens/AddNoteScreen';
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ✅ Background notification handler (must be outside component)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS && detail.notification?.data?.noteId) {
    await AsyncStorage.setItem(
      'pendingNoteId',
      String(detail.notification.data.noteId),
    );
    console.log('Notification pressed while app killed', detail.notification?.data);
  }
});

export default function App() {
  const scheme = useColorScheme();
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    const setupNotifications = async () => {
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        console.log('Notification permission granted');
        await notifee.createChannel({
          id: 'reminder-channel',
          name: 'Reminder Notifications',
          description: 'Channel for reminder notifications',
          importance: AndroidImportance.HIGH,
        });
      } else {
        console.log('Notification permission denied');
      }
    };

    const onForegroundEvent = notifee.onForegroundEvent(
      async ({ type, detail }: Event) => {
        if (type === EventType.PRESS && detail.notification?.data?.noteId) {
          const noteId = detail.notification.data.noteId;
          navigationRef.current?.navigate('AddNote', {
            existingNote: {
              id: String(noteId),
              title: '',
              content: '',
              timestamp: 0,
            },
          });
        }
      },
    );

    const handleInitialNotification = async () => {
      const initialNotification = await notifee.getInitialNotification();

      if (
        initialNotification?.notification?.data?.noteId &&
        navigationRef.current
      ) {
        const noteId = initialNotification.notification.data.noteId;
        navigationRef.current.navigate('AddNote', {
          existingNote: {
            id: String(noteId),
            title: '',
            content: '',
            timestamp: 0,
          },
        });
      } else {
        const pendingNoteId = await AsyncStorage.getItem('pendingNoteId');
        if (pendingNoteId) {
          await AsyncStorage.removeItem('pendingNoteId');
          navigationRef.current?.navigate('AddNote', {
            existingNote: {
              id: String(pendingNoteId),
              title: '',
              content: '',
              timestamp: 0,
            },
          });
        }
      }
    };

    setupNotifications();
    handleInitialNotification();

    return () => {
      onForegroundEvent();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        ref={navigationRef}
        theme={scheme === 'dark' ? DarkTheme : DefaultTheme}
      >
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: scheme === 'dark' ? '#1E293B' : '#f2f2f2',
            },
            headerTintColor: scheme === 'dark' ? '#fff' : '#000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="Notes" component={HomeScreen} />
          <Stack.Screen name="AddNote" component={AddNoteScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      <Toast />
    </GestureHandlerRootView>
  );
}
