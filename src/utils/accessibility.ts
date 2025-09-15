import { AccessibilityInfo, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { ScreenReaderAnnouncement } from '../types/accessibility';

export class ScreenReaderAnnouncer {
  static async announce(
    message: string, 
    options?: {
      queue?: boolean;
      delay?: number;
      priority?: 'low' | 'medium' | 'high';
    }
  ): Promise<void> {
    const { queue = false, delay = 0, priority = 'medium' } = options || {};
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    try {
      // Check if screen reader is enabled
      const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      
      if (isScreenReaderEnabled) {
        // Use platform-specific screen reader announcement
        if (Platform.OS === 'ios') {
          if (AccessibilityInfo.announceForAccessibilityWithOptions) {
            AccessibilityInfo.announceForAccessibilityWithOptions(
              message,
              { queue }
            );
          } else {
            AccessibilityInfo.announceForAccessibility(message);
          }
        } else {
          AccessibilityInfo.announceForAccessibility(message);
        }
      } else {
        // Fallback to text-to-speech for all users
        await Speech.speak(message, {
          language: 'en-AU',
          pitch: 1.0,
          rate: priority === 'high' ? 1.2 : 0.9,
        });
      }
    } catch (error) {
      console.warn('Failed to announce message:', error);
      // Final fallback to basic speech
      try {
        await Speech.speak(message);
      } catch (speechError) {
        console.error('Speech synthesis failed:', speechError);
      }
    }
  }
  
  static async isScreenReaderEnabled(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isScreenReaderEnabled();
    } catch (error) {
      console.warn('Failed to check screen reader status:', error);
      return false;
    }
  }
  
  static async announceList(
    announcements: ScreenReaderAnnouncement[], 
    delayBetween = 500
  ): Promise<void> {
    for (const announcement of announcements) {
      await this.announce(announcement.message, {
        priority: announcement.priority,
        delay: announcement.delay,
      });
      await new Promise(resolve => setTimeout(resolve, delayBetween));
    }
  }
}

export const WCAG_CONSTANTS = {
  MINIMUM_TOUCH_TARGET: 44,
  RECOMMENDED_TOUCH_TARGET: 88, // For healthcare/elderly users
  MINIMUM_FONT_SIZE: 16,
  LARGE_FONT_SIZE: 18,
  CONTRAST_RATIOS: {
    NORMAL_TEXT: 4.5,
    LARGE_TEXT: 3.0,
    UI_COMPONENTS: 3.0,
    ERROR: '#ff4444',
    SUCCESS: '#22c55e',
    INFO: '#3b82f6',
    DISABLED: '#9ca3af',
  },
  ANIMATION_DURATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500,
  },
} as const;

export const AccessibilityHelpers = {
  getMinimumTouchTarget: () => WCAG_CONSTANTS.RECOMMENDED_TOUCH_TARGET,
  
  getHitSlop: (padding = 10) => ({
    top: padding,
    bottom: padding,
    left: padding,
    right: padding,
  }),
  
  createAccessibilityProps: (
    label: string,
    hint?: string,
    role?: string
  ) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role as any,
  }),
};