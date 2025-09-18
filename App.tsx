import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import EmergencyDetectionScreen from './src/screens/EmergencyDetectionScreen';
import EmergencyConfirmationScreen from './src/screens/EmergencyConfirmationScreen';
import EmergencyInProgressScreen from './src/screens/EmergencyInProgressScreen';
import EmergencyFollowUpScreen from './src/screens/EmergencyFollowUpScreen';
import { ScreenReaderAnnouncer } from './src/utils/accessibility';
import { EmergencyStatus, EmergencySession, MedicalProfile } from './src/types/accessibility';
import { SecureStorage } from './src/services/SecureStorage';
import { LocationService } from './src/services/LocationService';
import { EmergencyContactService } from './src/services/EmergencyContactService';

// App now uses EmergencyStatus from types

export default function App() {
  const [appState, setAppState] = useState(AppState.currentState);
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus>('detection');
  const [emergencySession, setEmergencySession] = useState<EmergencySession | null>(null);
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile | null>(null);

  useEffect(() => {
    // Initialize app - load medical profile and check for active emergency session
    const initializeApp = async () => {
      try {
        const profile = await SecureStorage.getMedicalProfile();
        const session = await SecureStorage.getEmergencySession();
        
        setMedicalProfile(profile);
        
        if (session && session.status !== 'completed' && session.status !== 'cancelled') {
          setEmergencySession(session);
          setEmergencyStatus(session.status);
        } else {
          setEmergencySession(null);
          setEmergencyStatus('detection');
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();

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

  const handleStatusChange = async (newStatus: EmergencyStatus) => {
    try {
      setEmergencyStatus(newStatus);
      
      if (newStatus === 'confirmation') {
        // Create new emergency session
        const sessionId = `emergency_${Date.now()}`;
        const session: EmergencySession = {
          id: sessionId,
          startTime: new Date().toISOString(),
          status: 'confirmation',
          medicalProfileId: medicalProfile?.id || 'unknown',
          contactsNotified: [],
          auditLog: [{
            timestamp: new Date().toISOString(),
            action: 'emergency_initiated',
            details: 'Emergency button pressed'
          }]
        };
        
        setEmergencySession(session);
        await SecureStorage.saveEmergencySession(session);
        
      } else if (newStatus === 'in_progress') {
        if (emergencySession) {
          let location: any = null;
          let locationStatus = 'unavailable';
          
          try {
            // Attempt to get location with timeout for emergency situations
            location = await Promise.race([
              LocationService.getLocationForEmergency(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Location timeout')), 5000)
              )
            ]);
            
            if (location) {
              locationStatus = 'obtained';
            } else {
              locationStatus = 'permission_denied';
            }
          } catch (error) {
            console.warn('Location request timed out or failed during emergency:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            locationStatus = errorMessage === 'Location timeout' ? 'timeout' : 'failed';
            location = null;
          }
          
          const updatedSession: EmergencySession = {
            ...emergencySession,
            status: 'in_progress',
            location: location || undefined,
            auditLog: [
              ...emergencySession.auditLog,
              {
                timestamp: new Date().toISOString(),
                action: 'emergency_confirmed',
                details: `Emergency confirmed - Location: ${locationStatus}`
              }
            ]
          };
          
          // Notify emergency contacts if profile exists
          if (medicalProfile) {
            try {
              const notifiedContacts = await EmergencyContactService.notifyEmergencyContacts(
                medicalProfile,
                updatedSession,
                location || undefined
              );
              
              updatedSession.contactsNotified = notifiedContacts;
              updatedSession.auditLog.push({
                timestamp: new Date().toISOString(),
                action: 'contacts_notified',
                details: `Notified ${notifiedContacts.length} contacts - Location status: ${locationStatus}`
              });
            } catch (contactError) {
              console.error('Failed to notify emergency contacts:', contactError);
              updatedSession.auditLog.push({
                timestamp: new Date().toISOString(),
                action: 'contact_notification_failed',
                details: `Failed to notify contacts: ${contactError}`
              });
            }
          }
          
          setEmergencySession(updatedSession);
          await SecureStorage.saveEmergencySession(updatedSession);
          
          // Provide user feedback about location status
          if (locationStatus === 'permission_denied') {
            ScreenReaderAnnouncer.announce(
              'Emergency activated. Location permission was denied - emergency contacts will be notified without location.',
              { priority: 'high' }
            );
          } else if (locationStatus === 'obtained') {
            ScreenReaderAnnouncer.announce(
              'Emergency activated. Your location and medical information are being shared with emergency contacts.',
              { priority: 'high' }
            );
          } else {
            ScreenReaderAnnouncer.announce(
              'Emergency activated. Emergency contacts are being notified. Location information unavailable.',
              { priority: 'high' }
            );
          }
        }
        
      } else if (newStatus === 'completed' || newStatus === 'cancelled') {
        if (emergencySession) {
          const updatedSession: EmergencySession = {
            ...emergencySession,
            status: newStatus,
            auditLog: [
              ...emergencySession.auditLog,
              {
                timestamp: new Date().toISOString(),
                action: `emergency_${newStatus}`,
                details: `Emergency ${newStatus}`
              }
            ]
          };
          
          setEmergencySession(updatedSession);
          await SecureStorage.saveEmergencySession(updatedSession);
        }
        
        // After a delay, return to detection screen
        setTimeout(() => {
          setEmergencyStatus('detection');
          setEmergencySession(null);
        }, 3000);
      }
      
    } catch (error) {
      console.error('Failed to handle status change:', error);
      Alert.alert(
        'Error',
        'An error occurred during the emergency process. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleEmergencyCancel = async () => {
    try {
      await handleStatusChange('cancelled');
      ScreenReaderAnnouncer.announce('Emergency cancelled. Returning to main screen.', { priority: 'medium' });
    } catch (error) {
      console.error('Failed to cancel emergency:', error);
    }
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
    const commonProps = {
      currentStatus: emergencyStatus,
      session: emergencySession,
      medicalProfile,
      onStatusChange: handleStatusChange,
      onCancel: handleEmergencyCancel
    };

    switch (emergencyStatus) {
      case 'confirmation':
        return (
          <EmergencyConfirmationScreen
            onConfirm={() => handleStatusChange('in_progress')}
            onCancel={handleEmergencyCancel}
            countdownSeconds={10}
          />
        );
      case 'in_progress':
        return (
          <EmergencyInProgressScreen {...commonProps} />
        );
      case 'follow_up':
        return (
          <EmergencyFollowUpScreen {...commonProps} />
        );
      case 'detection':
      default:
        return (
          <EmergencyDetectionScreen {...commonProps} />
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