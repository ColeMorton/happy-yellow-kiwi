import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { EmergencyButtonProps } from '../../types/accessibility';
import { ScreenReaderAnnouncer, WCAG_CONSTANTS, AccessibilityHelpers } from '../../utils/accessibility';

const EmergencyButton: React.FC<EmergencyButtonProps> = ({ 
  onPress, 
  disabled = false,
  size = 'large',
  style,
  accessibilityLabel = 'Emergency Contact',
  accessibilityHint = 'Double tap to immediately call your designated emergency contact',
  ...accessibilityProps
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 120, height: 120, borderRadius: 60 };
      case 'medium':
        return { width: 160, height: 160, borderRadius: 80 };
      case 'large':
      default:
        return { width: 200, height: 200, borderRadius: 100 };
    }
  };

  const handlePress = async () => {
    if (disabled) return;

    try {
      // Haptic feedback for all users
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning
      );
      
      // Announce to screen readers with high priority
      await ScreenReaderAnnouncer.announce(
        'Emergency call initiated',
        { priority: 'high' }
      );
      
      onPress();
    } catch (error) {
      console.warn('Emergency button press failed:', error);
      // Still call onPress even if haptics fail
      onPress();
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.emergencyButton,
          sizeStyles,
          isPressed && styles.emergencyButtonPressed,
          disabled && styles.emergencyButtonDisabled,
          style
        ]}
        
        // Core accessibility props
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ 
          disabled,
          selected: isPressed 
        }}
        
        // Large touch target for motor impairments
        hitSlop={AccessibilityHelpers.getHitSlop(15)}
        
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        disabled={disabled}
        activeOpacity={0.8}
        
        {...accessibilityProps}
      >
        <Text style={[styles.buttonIcon, disabled && styles.disabledIcon]}>
          🚨
        </Text>
        <Text style={[styles.buttonText, disabled && styles.disabledText]}>
          Emergency Call
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    
    // High contrast border
    borderWidth: 4,
    borderColor: '#991B1B',
    
    // Shadow for depth perception
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
    }),
    
    // Ensure minimum touch target
    minHeight: WCAG_CONSTANTS.RECOMMENDED_TOUCH_TARGET,
    minWidth: WCAG_CONSTANTS.RECOMMENDED_TOUCH_TARGET,
  } as ViewStyle,
  
  emergencyButtonPressed: {
    backgroundColor: '#B91C1C',
    borderColor: '#7F1D1D',
    transform: [{ scale: 0.95 }],
  },
  
  emergencyButtonDisabled: {
    backgroundColor: '#9CA3AF',
    borderColor: '#6B7280',
  },
  
  buttonIcon: {
    fontSize: 48,
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: 160,
  } as TextStyle,
  
  disabledIcon: {
    opacity: 0.6,
  },
  
  disabledText: {
    color: '#D1D5DB',
    opacity: 0.6,
  },
});

export default EmergencyButton;