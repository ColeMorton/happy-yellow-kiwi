import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import EmergencyScreen from './src/screens/EmergencyScreen';
import EmergencyConfirmationScreen from './src/screens/EmergencyConfirmationScreen';
import { ScreenReaderAnnouncer } from './src/utils/accessibility';

type AppScreen = 'emergency' | 'confirmation';

export default function App() {
  const [appState, setAppState] = useState(AppState.currentState);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('emergency');

  useEffect(() => {
    // App state handling for accessibility
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.match(/inactive|background/) && 
        nextAppState === 'active'
      ) {
        // App came to foreground - announce to user
        ScreenReaderAnnouncer.announce(
          'Happy Yellow Kiwi Emergency App is now active',
          { priority: 'low', delay: 1000 }
        );
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [appState]);

  const handleEmergencyPress = () => {
    setCurrentScreen('confirmation');
    ScreenReaderAnnouncer.announce('Emergency activation started. Confirmation required.', { priority: 'high' });
  };

  const handleEmergencyConfirm = () => {
    Alert.alert(
      'Emergency Activated',
      'Emergency services have been contacted. Your location and medical information have been shared.',
      [
        {
          text: 'OK',
          style: 'default',
          onPress: () => {
            setCurrentScreen('emergency');
            ScreenReaderAnnouncer.announce('Emergency completed. Returning to main screen.', { priority: 'medium' });
          },
        },
      ],
      { 
        cancelable: false,
        userInterfaceStyle: 'light',
      }
    );
  };

  const handleEmergencyCancel = () => {
    setCurrentScreen('emergency');
    ScreenReaderAnnouncer.announce('Emergency cancelled. Returning to main screen.', { priority: 'medium' });
  };

  const showHelpDialog = () => {
    Alert.alert(
      'Help & Instructions',
      'How to use this emergency app:\n\n• Touch the red emergency button for immediate help\n• Your location and medical information will be shared\n• A confirmation screen will appear before making the call\n• Use screen reader navigation for accessibility support',
      [{ text: 'Got it', style: 'default' }],
      { userInterfaceStyle: 'light' }
    );
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'confirmation':
        return (
          <EmergencyConfirmationScreen
            onConfirm={handleEmergencyConfirm}
            onCancel={handleEmergencyCancel}
            countdownSeconds={10}
          />
        );
      case 'emergency':
      default:
        return (
          <EmergencyScreen 
            onEmergencyPress={handleEmergencyPress}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      {renderCurrentScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});