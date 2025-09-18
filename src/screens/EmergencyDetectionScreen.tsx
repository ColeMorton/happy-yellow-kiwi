import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { EmergencyFlowProps } from '../types/accessibility';
import EmergencyButton from '../components/emergency/EmergencyButton';
import { ScreenReaderAnnouncer, WCAG_CONSTANTS } from '../utils/accessibility';

export const EmergencyDetectionScreen: React.FC<EmergencyFlowProps> = ({
  onStatusChange
}) => {
  useEffect(() => {
    // Announce screen to screen readers
    ScreenReaderAnnouncer.announce(
      'Emergency detection screen. Press the emergency button if you need immediate assistance.',
      { priority: 'medium', delay: 500 }
    );
  }, []);

  const handleEmergencyPress = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await ScreenReaderAnnouncer.announce(
      'Emergency activated. Moving to confirmation.',
      { priority: 'high' }
    );
    onStatusChange('confirmation');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text 
          style={styles.title}
          accessibilityRole="header"
        >
          Emergency Assistance
        </Text>
        <Text style={styles.subtitle}>
          Immediate help when you need it most
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <EmergencyButton 
          onPress={handleEmergencyPress}
          size="large"
          accessibilityLabel="Emergency Contact Button"
          accessibilityHint="Double tap to start emergency response. This will begin the emergency protocol including location sharing and medical information."
        />
      </View>
      
      <View style={styles.instructionsContainer}>
        <Text 
          style={styles.instructionsTitle}
          accessibilityRole="header"
        >
          How It Works
        </Text>
        
        <View style={styles.instructionItem}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.instructionText}>
            Press the emergency button above
          </Text>
        </View>
        
        <View style={styles.instructionItem}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.instructionText}>
            Confirm the emergency in the next screen
          </Text>
        </View>
        
        <View style={styles.instructionItem}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.instructionText}>
            Emergency services and contacts will be notified
          </Text>
        </View>
        
        <View style={styles.instructionItem}>
          <Text style={styles.stepNumber}>4</Text>
          <Text style={styles.instructionText}>
            Your location and medical information will be shared
          </Text>
        </View>
      </View>
      
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>What Gets Shared</Text>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📍</Text>
          <Text style={styles.featureText}>Your current location</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🏥</Text>
          <Text style={styles.featureText}>Medical profile and conditions</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>👥</Text>
          <Text style={styles.featureText}>Emergency contact information</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>💊</Text>
          <Text style={styles.featureText}>Medications and allergies</Text>
        </View>
      </View>
      
      <View style={styles.accessibilityNotice}>
        <Text style={styles.accessibilityText}>
          This app is designed for accessibility. All features work with screen readers, 
          large text, and touch controls. Emergency activation includes haptic feedback 
          and audio announcements.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  instructionsContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 40,
    paddingHorizontal: 20,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 10,
  },
  stepNumber: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    fontWeight: 'bold',
    color: '#DC2626',
    marginRight: 16,
    marginTop: 2,
    minWidth: 24,
    textAlign: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    color: '#374151',
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 32,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  featureText: {
    flex: 1,
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#166534',
    lineHeight: 22,
  },
  accessibilityNotice: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    maxWidth: 400,
  },
  accessibilityText: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default EmergencyDetectionScreen;