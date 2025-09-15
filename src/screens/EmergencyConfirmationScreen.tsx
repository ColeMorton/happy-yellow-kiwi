import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { EmergencyConfirmationProps } from '../types/accessibility';
import EmergencyButton from '../components/emergency/EmergencyButton';
import { ScreenReaderAnnouncer, WCAG_CONSTANTS } from '../utils/accessibility';

export const EmergencyConfirmationScreen: React.FC<EmergencyConfirmationProps> = ({
  onConfirm,
  onCancel,
  countdownSeconds = 10
}) => {
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (isConfirmed) return;
    
    setIsConfirmed(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await ScreenReaderAnnouncer.announce('Emergency confirmed. Initiating emergency response.', { priority: 'high' });
    onConfirm();
  }, [isConfirmed, onConfirm]);

  const handleCancel = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await ScreenReaderAnnouncer.announce('Emergency cancelled.', { priority: 'high' });
    onCancel();
  }, [onCancel]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (countdown > 0 && !isConfirmed) {
      interval = setInterval(async () => {
        setCountdown(prev => {
          const newCount = prev - 1;
          
          // Announce countdown at specific intervals
          if (newCount <= 5 && newCount > 0) {
            ScreenReaderAnnouncer.announce(`${newCount} seconds remaining`, { priority: 'high' });
            Haptics.selectionAsync();
          } else if (newCount === 0) {
            handleConfirm();
          }
          
          return newCount;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [countdown, isConfirmed, handleConfirm]);

  useEffect(() => {
    // Initial announcement
    ScreenReaderAnnouncer.announce(
      `Emergency confirmation required. ${countdownSeconds} seconds to cancel or confirm.`,
      { priority: 'high' }
    );
  }, [countdownSeconds]);

  const getCountdownColor = () => {
    if (countdown <= 3) return '#ff4444';
    if (countdown <= 5) return '#ff8800';
    return '#666666';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text 
          style={styles.title}
          accessible={true}
          accessibilityRole="header"
        >
          Emergency Confirmation
        </Text>
        
        <Text 
          style={[styles.countdown, { color: getCountdownColor() }]}
          accessible={true}
          accessibilityRole="text"
          accessibilityLiveRegion="assertive"
          accessibilityLabel={`${countdown} seconds remaining`}
        >
          {countdown}
        </Text>
        
        <Text 
          style={styles.subtitle}
          accessible={true}
          accessibilityRole="text"
        >
          Emergency will be activated automatically in {countdown} seconds
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <EmergencyButton
          onPress={handleConfirm}
          disabled={isConfirmed}
          size="large"
          accessibilityLabel="Confirm emergency now"
          accessibilityHint="Immediately confirms and activates emergency response"
        />
        
        <View style={styles.cancelContainer}>
          <EmergencyButton
            onPress={handleCancel}
            disabled={isConfirmed}
            size="medium"
            accessibilityLabel="Cancel emergency"
            accessibilityHint="Cancels the emergency activation"
            style={styles.cancelButton}
          />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text 
          style={styles.infoText}
          accessible={true}
          accessibilityRole="text"
        >
          • Emergency services will be contacted
        </Text>
        <Text 
          style={styles.infoText}
          accessible={true}
          accessibilityRole="text"
        >
          • Your location will be shared
        </Text>
        <Text 
          style={styles.infoText}
          accessible={true}
          accessibilityRole="text"
        >
          • Medical information will be provided
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  countdown: {
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    minHeight: 80,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 32,
  },
  cancelContainer: {
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#666666',
    borderColor: '#666666',
  },
  infoContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#555555',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default EmergencyConfirmationScreen;