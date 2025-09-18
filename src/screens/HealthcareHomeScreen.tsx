import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar,
  Platform 
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { MedicalProfile, MedicationReminder } from '../types/accessibility';
import { SecureStorage } from '../services/SecureStorage';
import { MedicationReminderService } from '../services/MedicationReminderService';
import { ScreenReaderAnnouncer, WCAG_CONSTANTS } from '../utils/accessibility';
import { useAccessibleStyles } from '../contexts/AccessibilityContext';
import EmergencyButton from '../components/emergency/EmergencyButton';
import MedicalSummaryCard from '../components/cards/MedicalSummaryCard';
import AccessibilityToolbar from '../components/accessibility/AccessibilityToolbar';

interface HealthcareHomeScreenProps {
  onNavigate?: (screen: string) => void;
  onEmergency?: () => void;
}

export const HealthcareHomeScreen: React.FC<HealthcareHomeScreenProps> = ({
  onNavigate,
  onEmergency
}) => {
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile | null>(null);
  const [upcomingMedications, setUpcomingMedications] = useState<MedicationReminder[]>([]);
  const [isAccessibilityToolbarVisible, setIsAccessibilityToolbarVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { getColors, getDynamicStyle } = useAccessibleStyles();
  const colors = getColors();

  useEffect(() => {
    loadData();
    MedicationReminderService.initialize();
  }, []);

  useEffect(() => {
    ScreenReaderAnnouncer.announce(
      'Healthcare home screen. Access your medical information, medication reminders, and emergency services.',
      { priority: 'medium', delay: 500 }
    );
  }, []);

  const loadData = async () => {
    try {
      const [profile, medications] = await Promise.all([
        SecureStorage.getMedicalProfile(),
        MedicationReminderService.getUpcomingMedications(24)
      ]);

      setMedicalProfile(profile);
      setUpcomingMedications(medications);
    } catch (error) {
      console.error('Failed to load healthcare data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = async (screen: string, screenName: string) => {
    await Haptics.selectionAsync();
    await ScreenReaderAnnouncer.announce(`Opening ${screenName}`, { priority: 'medium' });
    onNavigate?.(screen);
  };

  const handleEmergency = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await ScreenReaderAnnouncer.announce('Emergency activated', { priority: 'high' });
    onEmergency?.();
  };

  const toggleAccessibilityToolbar = async () => {
    await Haptics.selectionAsync();
    setIsAccessibilityToolbarVisible(!isAccessibilityToolbarVisible);
    
    if (!isAccessibilityToolbarVisible) {
      await ScreenReaderAnnouncer.announce('Opening accessibility settings', { priority: 'medium' });
    }
  };

  const dynamicStyles = {
    container: getDynamicStyle({
      flex: 1,
      backgroundColor: colors.background,
    }),
    title: getDynamicStyle({
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    }),
    subtitle: getDynamicStyle({
      fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
    }),
    sectionTitle: getDynamicStyle({
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    }),
    quickActionsContainer: getDynamicStyle({
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 32,
    }),
    actionButton: getDynamicStyle({
      flex: 1,
      minWidth: 150,
    }),
    emergencySection: getDynamicStyle({
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    }),
    medicationItem: getDynamicStyle({
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginBottom: 8,
    }),
    medicationName: getDynamicStyle({
      fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
      fontWeight: '600',
      color: colors.text,
    }),
    medicationTime: getDynamicStyle({
      fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE - 2,
      color: colors.textSecondary,
    }),
    noDataText: getDynamicStyle({
      fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      padding: 16,
    }),
  };

  if (isLoading) {
    return (
      <View style={[dynamicStyles.container, styles.centerContent]}>
        <Text style={dynamicStyles.noDataText}>Loading healthcare information...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <ExpoStatusBar style="light" backgroundColor="#1F2937" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={dynamicStyles.title} accessibilityRole="header">
            Healthcare Hub
          </Text>
          <Text style={dynamicStyles.subtitle}>
            Manage your health information and emergency care
          </Text>
        </View>

        {/* Emergency Section */}
        <View style={dynamicStyles.emergencySection}>
          <Text style={dynamicStyles.sectionTitle} accessibilityRole="header">
            🚨 Emergency Access
          </Text>
          <EmergencyButton 
            onPress={handleEmergency}
            size="large"
            accessibilityLabel="Emergency assistance"
            accessibilityHint="Activates emergency response with medical information sharing"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle} accessibilityRole="header">
            Quick Actions
          </Text>
          <View style={dynamicStyles.quickActionsContainer}>
            <EmergencyButton
              onPress={() => handleNavigate('medical-profile', 'medical profile')}
              size="medium"
              accessibilityLabel="Medical profile"
              accessibilityHint="View and edit your medical information"
              style={[dynamicStyles.actionButton, { backgroundColor: colors.primary }]}
            />
            <EmergencyButton
              onPress={() => handleNavigate('medications', 'medication reminders')}
              size="medium"
              accessibilityLabel="Medication reminders"
              accessibilityHint="Manage your medication schedule and reminders"
              style={[dynamicStyles.actionButton, { backgroundColor: colors.success }]}
            />
            <EmergencyButton
              onPress={() => handleNavigate('care-coordinators', 'care coordinators')}
              size="medium"
              accessibilityLabel="Care coordinators"
              accessibilityHint="Manage your healthcare team contacts"
              style={[dynamicStyles.actionButton, { backgroundColor: colors.warning }]}
            />
            <EmergencyButton
              onPress={toggleAccessibilityToolbar}
              size="medium"
              accessibilityLabel="Accessibility settings"
              accessibilityHint="Adjust text size, contrast, and accessibility preferences"
              style={[dynamicStyles.actionButton, { backgroundColor: colors.secondary }]}
            />
          </View>
        </View>

        {/* Medical Profile Summary */}
        {medicalProfile ? (
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle} accessibilityRole="header">
              Medical Summary
            </Text>
            <MedicalSummaryCard 
              medicalProfile={medicalProfile} 
              compact={true}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle} accessibilityRole="header">
              Medical Profile
            </Text>
            <View style={[dynamicStyles.emergencySection, { borderLeftColor: colors.warning }]}>
              <Text style={dynamicStyles.noDataText}>
                No medical profile found. Set up your medical information for emergency situations.
              </Text>
              <EmergencyButton
                onPress={() => handleNavigate('medical-profile', 'medical profile setup')}
                size="medium"
                accessibilityLabel="Set up medical profile"
                accessibilityHint="Create your medical profile with emergency information"
                style={{ backgroundColor: colors.primary, marginTop: 12 }}
              />
            </View>
          </View>
        )}

        {/* Upcoming Medications */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle} accessibilityRole="header">
            Upcoming Medications
          </Text>
          {upcomingMedications.length > 0 ? (
            upcomingMedications.map((medication) => (
              <View key={medication.id} style={dynamicStyles.medicationItem}>
                <View style={styles.medicationInfo}>
                  <Text style={dynamicStyles.medicationName}>
                    {medication.medicationName}
                  </Text>
                  <Text style={dynamicStyles.medicationTime}>
                    Next: {MedicationReminderService.formatTime(medication.times[0])}
                  </Text>
                </View>
                <Text style={dynamicStyles.medicationTime}>
                  {medication.dosage}
                </Text>
              </View>
            ))
          ) : (
            <View style={dynamicStyles.medicationItem}>
              <Text style={dynamicStyles.noDataText}>
                No upcoming medications. Set up medication reminders to track your schedule.
              </Text>
            </View>
          )}
        </View>

        {/* Accessibility Notice */}
        <View style={styles.accessibilityNotice}>
          <Text style={[dynamicStyles.noDataText, { color: colors.primary }]}>
            This app is designed for accessibility. All features work with screen readers, 
            large text, and haptic feedback. Use the accessibility settings to customize your experience.
          </Text>
        </View>
      </ScrollView>

      <AccessibilityToolbar
        visible={isAccessibilityToolbarVisible}
        onClose={() => setIsAccessibilityToolbarVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  medicationInfo: {
    flex: 1,
  },
  accessibilityNotice: {
    marginTop: 32,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
});

export default HealthcareHomeScreen;