import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  Switch 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAccessibility, useAccessibleStyles } from '../../contexts/AccessibilityContext';
import { ScreenReaderAnnouncer, WCAG_CONSTANTS } from '../../utils/accessibility';
import EmergencyButton from '../emergency/EmergencyButton';
import AccessibleSelect from '../forms/AccessibleSelect';

interface AccessibilityToolbarProps {
  visible: boolean;
  onClose: () => void;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  visible,
  onClose
}) => {
  const { preferences, updatePreferences } = useAccessibility();
  const { getColors, getDynamicStyle } = useAccessibleStyles();
  const colors = getColors();

  const textSizeOptions = [
    { label: 'Small', value: 'small' },
    { label: 'Medium (Default)', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'Extra Large', value: 'extra_large' },
  ];

  const handleTextSizeChange = async (value: string) => {
    await updatePreferences({ textSize: value as any });
    await Haptics.selectionAsync();
    await ScreenReaderAnnouncer.announce(
      `Text size changed to ${value}`,
      { priority: 'medium' }
    );
  };

  const handleHighContrastToggle = async (value: boolean) => {
    await updatePreferences({ highContrast: value });
    await Haptics.selectionAsync();
    await ScreenReaderAnnouncer.announce(
      `High contrast mode ${value ? 'enabled' : 'disabled'}`,
      { priority: 'medium' }
    );
  };

  const handleHapticFeedbackToggle = async (value: boolean) => {
    await updatePreferences({ hapticFeedback: value });
    if (value) {
      await Haptics.selectionAsync();
    }
    await ScreenReaderAnnouncer.announce(
      `Haptic feedback ${value ? 'enabled' : 'disabled'}`,
      { priority: 'medium' }
    );
  };

  const handleVoiceAnnouncementsToggle = async (value: boolean) => {
    await updatePreferences({ voiceAnnouncements: value });
    await Haptics.selectionAsync();
    if (value) {
      await ScreenReaderAnnouncer.announce(
        'Voice announcements enabled',
        { priority: 'medium' }
      );
    }
  };

  const handleReducedMotionToggle = async (value: boolean) => {
    await updatePreferences({ reducedMotion: value });
    await Haptics.selectionAsync();
    await ScreenReaderAnnouncer.announce(
      `Reduced motion ${value ? 'enabled' : 'disabled'}`,
      { priority: 'medium' }
    );
  };

  const handleScreenReaderOptimizedToggle = async (value: boolean) => {
    await updatePreferences({ screenReaderOptimized: value });
    await Haptics.selectionAsync();
    await ScreenReaderAnnouncer.announce(
      `Screen reader optimization ${value ? 'enabled' : 'disabled'}`,
      { priority: 'medium' }
    );
  };

  const handleClose = async () => {
    await ScreenReaderAnnouncer.announce(
      'Accessibility settings closed',
      { priority: 'medium' }
    );
    onClose();
  };

  const dynamicStyles = {
    modalContent: getDynamicStyle({
      backgroundColor: colors.background,
      borderRadius: 12,
      margin: 20,
      maxHeight: '80%',
      width: '90%',
      maxWidth: 400,
    }),
    title: getDynamicStyle({
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    }),
    settingItem: getDynamicStyle({
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: WCAG_CONSTANTS.RECOMMENDED_TOUCH_TARGET,
    }),
    settingLabel: getDynamicStyle({
      fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
      color: colors.text,
      flex: 1,
      marginRight: 16,
    }),
    settingDescription: getDynamicStyle({
      fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
      color: colors.textSecondary,
      marginTop: 4,
    }),
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={preferences.reducedMotion ? 'none' : 'slide'}
      onRequestClose={handleClose}
      accessible={true}
      accessibilityViewIsModal={true}
    >
      <View style={styles.modalOverlay}>
        <View style={dynamicStyles.modalContent}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.header}>
              <Text style={dynamicStyles.title} accessibilityRole="header">
                Accessibility Settings
              </Text>
              <EmergencyButton
                onPress={handleClose}
                size="small"
                accessibilityLabel="Close accessibility settings"
                accessibilityHint="Closes the accessibility settings modal"
                style={[styles.closeButton, { backgroundColor: colors.secondary }]}
              />
            </View>

            {/* Text Size Setting */}
            <View style={styles.section}>
              <AccessibleSelect
                label="Text Size"
                options={textSizeOptions}
                value={preferences.textSize}
                onValueChange={handleTextSizeChange}
                helperText="Adjusts the size of text throughout the app"
              />
            </View>

            {/* High Contrast Setting */}
            <View style={dynamicStyles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={dynamicStyles.settingLabel}>
                  High Contrast Mode
                </Text>
                <Text style={dynamicStyles.settingDescription}>
                  Increases contrast for better visibility
                </Text>
              </View>
              <Switch
                value={preferences.highContrast}
                onValueChange={handleHighContrastToggle}
                accessible={true}
                accessibilityLabel="High contrast mode toggle"
                accessibilityHint={`Currently ${preferences.highContrast ? 'enabled' : 'disabled'}. Toggle to change.`}
                accessibilityRole="switch"
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={preferences.highContrast ? colors.background : colors.textSecondary}
              />
            </View>

            {/* Haptic Feedback Setting */}
            <View style={dynamicStyles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={dynamicStyles.settingLabel}>
                  Haptic Feedback
                </Text>
                <Text style={dynamicStyles.settingDescription}>
                  Provides tactile feedback for interactions
                </Text>
              </View>
              <Switch
                value={preferences.hapticFeedback}
                onValueChange={handleHapticFeedbackToggle}
                accessible={true}
                accessibilityLabel="Haptic feedback toggle"
                accessibilityHint={`Currently ${preferences.hapticFeedback ? 'enabled' : 'disabled'}. Toggle to change.`}
                accessibilityRole="switch"
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={preferences.hapticFeedback ? colors.background : colors.textSecondary}
              />
            </View>

            {/* Voice Announcements Setting */}
            <View style={dynamicStyles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={dynamicStyles.settingLabel}>
                  Voice Announcements
                </Text>
                <Text style={dynamicStyles.settingDescription}>
                  Provides audio feedback for important actions
                </Text>
              </View>
              <Switch
                value={preferences.voiceAnnouncements}
                onValueChange={handleVoiceAnnouncementsToggle}
                accessible={true}
                accessibilityLabel="Voice announcements toggle"
                accessibilityHint={`Currently ${preferences.voiceAnnouncements ? 'enabled' : 'disabled'}. Toggle to change.`}
                accessibilityRole="switch"
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={preferences.voiceAnnouncements ? colors.background : colors.textSecondary}
              />
            </View>

            {/* Reduced Motion Setting */}
            <View style={dynamicStyles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={dynamicStyles.settingLabel}>
                  Reduced Motion
                </Text>
                <Text style={dynamicStyles.settingDescription}>
                  Minimizes animations and transitions
                </Text>
              </View>
              <Switch
                value={preferences.reducedMotion}
                onValueChange={handleReducedMotionToggle}
                accessible={true}
                accessibilityLabel="Reduced motion toggle"
                accessibilityHint={`Currently ${preferences.reducedMotion ? 'enabled' : 'disabled'}. Toggle to change.`}
                accessibilityRole="switch"
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={preferences.reducedMotion ? colors.background : colors.textSecondary}
              />
            </View>

            {/* Screen Reader Optimized Setting */}
            <View style={dynamicStyles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={dynamicStyles.settingLabel}>
                  Screen Reader Optimized
                </Text>
                <Text style={dynamicStyles.settingDescription}>
                  Optimizes interface for screen reader navigation
                </Text>
              </View>
              <Switch
                value={preferences.screenReaderOptimized}
                onValueChange={handleScreenReaderOptimizedToggle}
                accessible={true}
                accessibilityLabel="Screen reader optimization toggle"
                accessibilityHint={`Currently ${preferences.screenReaderOptimized ? 'enabled' : 'disabled'}. Toggle to change.`}
                accessibilityRole="switch"
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={preferences.screenReaderOptimized ? colors.background : colors.textSecondary}
              />
            </View>

            <View style={styles.footer}>
              <Text style={[dynamicStyles.settingDescription, { textAlign: 'center' }]}>
                These settings are saved locally and apply to all features of the app.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    marginLeft: 16,
  },
  section: {
    marginBottom: 20,
  },
  settingContent: {
    flex: 1,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
});

export default AccessibilityToolbar;