import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { EmergencyFlowProps } from '../types/accessibility';
import EmergencyButton from '../components/emergency/EmergencyButton';
import { ScreenReaderAnnouncer, WCAG_CONSTANTS } from '../utils/accessibility';

export const EmergencyInProgressScreen: React.FC<EmergencyFlowProps> = ({
  session,
  medicalProfile,
  onStatusChange,
  onCancel
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [contactsNotified, setContactsNotified] = useState<string[]>([]);

  useEffect(() => {
    // Announce screen to screen readers
    ScreenReaderAnnouncer.announce(
      'Emergency in progress. Help is on the way. Emergency contacts have been notified.',
      { priority: 'high' }
    );

    // Start elapsed time counter
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Simulate emergency contacts notification
    if (medicalProfile?.emergencyContacts) {
      const primaryContacts = medicalProfile.emergencyContacts
        .filter(contact => contact.isPrimary)
        .map(contact => contact.name);
      setContactsNotified(primaryContacts);
    }

    return () => clearInterval(interval);
  }, [medicalProfile]);

  const handleMoveToFollowUp = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await ScreenReaderAnnouncer.announce('Moving to follow-up phase.', { priority: 'high' });
    onStatusChange('follow_up');
  };

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Emergency',
      'Are you sure you want to cancel the emergency? This will stop all emergency procedures.',
      [
        {
          text: 'No, Continue',
          style: 'cancel'
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await ScreenReaderAnnouncer.announce('Emergency cancelled.', { priority: 'high' });
            onCancel();
          }
        }
      ]
    );
  };

  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.statusIndicator}>
          <Text style={styles.statusDot}>🔴</Text>
          <Text style={styles.statusText}>EMERGENCY ACTIVE</Text>
        </View>
        
        <Text 
          style={styles.title}
          accessibilityRole="header"
        >
          Emergency In Progress
        </Text>
        
        <Text 
          style={styles.timer}
          accessible={true}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
          accessibilityLabel={`Emergency duration: ${formatElapsedTime(elapsedTime)}`}
        >
          {formatElapsedTime(elapsedTime)}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Emergency Status</Text>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>✅</Text>
          <Text style={styles.statusItemText}>Emergency services contacted</Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>📍</Text>
          <Text style={styles.statusItemText}>
            {session?.location ? 
              `Location shared (±${Math.round(session.location.accuracy)}m accuracy)` : 
              'Location unavailable - Emergency contacts notified without location'
            }
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>👥</Text>
          <Text style={styles.statusItemText}>
            {contactsNotified.length > 0 
              ? `Contacts notified: ${contactsNotified.join(', ')}`
              : 'Notifying emergency contacts...'
            }
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>🏥</Text>
          <Text style={styles.statusItemText}>Medical information provided</Text>
        </View>
      </View>

      {medicalProfile && (
        <View style={styles.medicalInfo}>
          <Text style={styles.sectionTitle}>Medical Information Shared</Text>
          
          <Text style={styles.medicalItem}>
            <Text style={styles.medicalLabel}>Name: </Text>
            {medicalProfile.personalInfo.firstName} {medicalProfile.personalInfo.lastName}
          </Text>
          
          {medicalProfile.personalInfo.bloodType && (
            <Text style={styles.medicalItem}>
              <Text style={styles.medicalLabel}>Blood Type: </Text>
              {medicalProfile.personalInfo.bloodType}
            </Text>
          )}
          
          {medicalProfile.personalInfo.allergies.length > 0 && (
            <Text style={styles.medicalItem}>
              <Text style={styles.medicalLabel}>Allergies: </Text>
              {medicalProfile.personalInfo.allergies.join(', ')}
            </Text>
          )}
          
          {medicalProfile.personalInfo.medications.length > 0 && (
            <Text style={styles.medicalItem}>
              <Text style={styles.medicalLabel}>Medications: </Text>
              {medicalProfile.personalInfo.medications.join(', ')}
            </Text>
          )}
        </View>
      )}

      <View style={styles.instructionsSection}>
        <Text style={styles.sectionTitle}>What's Happening</Text>
        <Text style={styles.instructionText}>
          • Emergency services have been notified and are on their way
        </Text>
        <Text style={styles.instructionText}>
          • {session?.location ? 
              'Your location and medical information have been shared' :
              'Your medical information has been shared (location unavailable)'
            }
        </Text>
        <Text style={styles.instructionText}>
          • Emergency contacts are being notified
        </Text>
        <Text style={styles.instructionText}>
          • Stay calm and wait for help to arrive
        </Text>
        {!session?.location && (
          <Text style={[styles.instructionText, styles.locationWarning]}>
            • Location sharing was not available - ensure location services are enabled for future emergencies
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <EmergencyButton
          onPress={handleMoveToFollowUp}
          size="medium"
          accessibilityLabel="Move to follow-up"
          accessibilityHint="Proceed to emergency follow-up phase"
          style={styles.followUpButton}
        />
        
        <EmergencyButton
          onPress={handleCancel}
          size="small"
          accessibilityLabel="Cancel emergency"
          accessibilityHint="Cancel the emergency response"
          style={styles.cancelButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffebee',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f44336',
  },
  statusDot: {
    fontSize: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d32f2f',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#d32f2f',
    fontFamily: 'monospace',
  },
  infoSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  statusItemText: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    color: '#555555',
    flex: 1,
    lineHeight: 22,
  },
  medicalInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  medicalItem: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#555555',
    marginBottom: 8,
    lineHeight: 20,
  },
  medicalLabel: {
    fontWeight: '600',
    color: '#333333',
  },
  instructionsSection: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
  },
  instructionText: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#2e7d32',
    marginBottom: 8,
    lineHeight: 20,
  },
  locationWarning: {
    color: '#f57c00',
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 16,
    alignItems: 'center',
  },
  followUpButton: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#666666',
    borderColor: '#666666',
  },
});

export default EmergencyInProgressScreen;