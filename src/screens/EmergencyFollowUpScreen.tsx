import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { EmergencyFlowProps } from '../types/accessibility';
import EmergencyButton from '../components/emergency/EmergencyButton';
import { ScreenReaderAnnouncer, WCAG_CONSTANTS } from '../utils/accessibility';

export const EmergencyFollowUpScreen: React.FC<EmergencyFlowProps> = ({
  session,
  medicalProfile,
  onStatusChange,
  onCancel
}) => {
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Announce screen to screen readers
    ScreenReaderAnnouncer.announce(
      'Emergency follow-up screen. Please confirm your status and complete the emergency response.',
      { priority: 'high' }
    );
  }, []);

  const handleMarkCompleted = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await ScreenReaderAnnouncer.announce('Emergency marked as completed.', { priority: 'high' });
    setIsCompleted(true);
    onStatusChange('completed');
  };

  const handleNeedMoreHelp = async () => {
    Alert.alert(
      'Additional Help Needed',
      'Do you need additional emergency assistance?',
      [
        {
          text: 'No, I\'m okay',
          style: 'cancel'
        },
        {
          text: 'Yes, continue emergency',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await ScreenReaderAnnouncer.announce('Continuing emergency response.', { priority: 'high' });
            onStatusChange('in_progress');
          }
        }
      ]
    );
  };

  const handleStartNewEmergency = async () => {
    Alert.alert(
      'New Emergency',
      'Do you need to start a new emergency?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Start New Emergency',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            await ScreenReaderAnnouncer.announce('Starting new emergency.', { priority: 'high' });
            onStatusChange('detection');
          }
        }
      ]
    );
  };

  const getEmergencyDuration = (): string => {
    if (!session?.startTime) return 'Unknown';
    
    const start = new Date(session.startTime);
    const now = new Date();
    const durationMs = now.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isCompleted) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.completedIcon}>✅</Text>
          <Text 
            style={styles.title}
            accessibilityRole="header"
          >
            Emergency Completed
          </Text>
          <Text style={styles.subtitle}>
            Thank you for confirming your safety
          </Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Emergency Summary</Text>
          <Text style={styles.summaryText}>
            Duration: {getEmergencyDuration()}
          </Text>
          <Text style={styles.summaryText}>
            Status: Successfully completed
          </Text>
          <Text style={styles.summaryText}>
            Time: {new Date().toLocaleString()}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <EmergencyButton
            onPress={() => onCancel()}
            size="medium"
            accessibilityLabel="Return to main screen"
            accessibilityHint="Go back to the main emergency screen"
            style={styles.returnButton}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.statusIndicator}>
          <Text style={styles.statusDot}>🟡</Text>
          <Text style={styles.statusText}>FOLLOW-UP REQUIRED</Text>
        </View>
        
        <Text 
          style={styles.title}
          accessibilityRole="header"
        >
          Emergency Follow-Up
        </Text>
        
        <Text style={styles.subtitle}>
          Please confirm your current status
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Emergency Summary</Text>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>{getEmergencyDuration()}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Started:</Text>
          <Text style={styles.summaryValue}>
            {session?.startTime ? new Date(session.startTime).toLocaleTimeString() : 'Unknown'}
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Contacts Notified:</Text>
          <Text style={styles.summaryValue}>
            {session?.contactsNotified.length || 0} people
          </Text>
        </View>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <Text style={styles.statusQuestion}>
          Please let us know your current status. This helps us complete the emergency response properly.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <EmergencyButton
          onPress={handleMarkCompleted}
          size="large"
          accessibilityLabel="I'm okay - Mark emergency as completed"
          accessibilityHint="Confirms you are safe and completes the emergency response"
          style={styles.completedButton}
        />
        
        <EmergencyButton
          onPress={handleNeedMoreHelp}
          size="medium"
          accessibilityLabel="I need more help"
          accessibilityHint="Continue the emergency response if you still need assistance"
          style={styles.continueButton}
        />
        
        <EmergencyButton
          onPress={handleStartNewEmergency}
          size="medium"
          accessibilityLabel="Start new emergency"
          accessibilityHint="Start a completely new emergency if this is a different situation"
          style={styles.newEmergencyButton}
        />
      </View>

      <View style={styles.footerInfo}>
        <Text style={styles.footerText}>
          If you're experiencing a new emergency or your condition has worsened, 
          please use the "Start New Emergency" option or call emergency services directly.
        </Text>
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
    backgroundColor: '#fff8e1',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffa000',
  },
  statusDot: {
    fontSize: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f57c00',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    color: '#666666',
    textAlign: 'center',
  },
  completedIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    fontWeight: '600',
    color: '#333333',
  },
  summaryValue: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#555555',
  },
  statusSection: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
  },
  statusQuestion: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#1976d2',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  completedButton: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  continueButton: {
    backgroundColor: '#ff9800',
    borderColor: '#ff9800',
  },
  newEmergencyButton: {
    backgroundColor: '#f44336',
    borderColor: '#f44336',
  },
  returnButton: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  summarySection: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
  },
  summaryText: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#2e7d32',
    marginBottom: 8,
    lineHeight: 20,
  },
  footerInfo: {
    padding: 16,
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  footerText: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#ef6c00',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default EmergencyFollowUpScreen;