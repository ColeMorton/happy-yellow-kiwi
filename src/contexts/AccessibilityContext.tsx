import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityPreferences } from '../types/accessibility';
import { SecureStorage } from '../services/SecureStorage';

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreferences: (newPreferences: Partial<AccessibilityPreferences>) => Promise<void>;
  getTextSize: (baseSize: number) => number;
  getScaledValue: (value: number) => number;
  isHighContrast: boolean;
  isReducedMotion: boolean;
}

const defaultPreferences: AccessibilityPreferences = {
  textSize: 'medium',
  highContrast: false,
  hapticFeedback: true,
  voiceAnnouncements: true,
  reducedMotion: false,
  screenReaderOptimized: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const ACCESSIBILITY_STORAGE_KEY = 'accessibility_preferences';

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const storedPreferences = await AsyncStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      if (storedPreferences) {
        const parsed = JSON.parse(storedPreferences) as AccessibilityPreferences;
        setPreferences(parsed);
        
        await SecureStorage.addAuditEntry({
          timestamp: new Date().toISOString(),
          action: 'accessibility_preferences_loaded',
          details: `Text size: ${parsed.textSize}, High contrast: ${parsed.highContrast}`
        });
      }
    } catch (error) {
      console.error('Failed to load accessibility preferences:', error);
    }
  };

  const updatePreferences = async (newPreferences: Partial<AccessibilityPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);
      
      await AsyncStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(updatedPreferences));
      
      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'accessibility_preferences_updated',
        details: `Updated preferences: ${Object.keys(newPreferences).join(', ')}`
      });
    } catch (error) {
      console.error('Failed to save accessibility preferences:', error);
    }
  };

  const getTextSizeMultiplier = (): number => {
    switch (preferences.textSize) {
      case 'small':
        return 0.85;
      case 'medium':
        return 1.0;
      case 'large':
        return 1.2;
      case 'extra_large':
        return 1.5;
      default:
        return 1.0;
    }
  };

  const getTextSize = (baseSize: number): number => {
    return Math.round(baseSize * getTextSizeMultiplier());
  };

  const getScaledValue = (value: number): number => {
    const multiplier = getTextSizeMultiplier();
    // Only scale values that make sense to scale (like padding, margins)
    // Keep minimum touch targets at least 44px regardless of text size
    if (value >= 44) {
      return Math.max(44, Math.round(value * multiplier));
    }
    return Math.round(value * multiplier);
  };

  const contextValue: AccessibilityContextType = {
    preferences,
    updatePreferences,
    getTextSize,
    getScaledValue,
    isHighContrast: preferences.highContrast,
    isReducedMotion: preferences.reducedMotion,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Hook for dynamic styling based on accessibility preferences
export const useAccessibleStyles = () => {
  const { getTextSize, getScaledValue, isHighContrast, isReducedMotion } = useAccessibility();

  const getColors = () => ({
    primary: isHighContrast ? '#000000' : '#2196f3',
    secondary: isHighContrast ? '#333333' : '#666666',
    background: isHighContrast ? '#ffffff' : '#ffffff',
    surface: isHighContrast ? '#f0f0f0' : '#f8f9fa',
    text: isHighContrast ? '#000000' : '#333333',
    textSecondary: isHighContrast ? '#333333' : '#666666',
    border: isHighContrast ? '#000000' : '#dddddd',
    error: isHighContrast ? '#000000' : '#f44336',
    success: isHighContrast ? '#000000' : '#4caf50',
    warning: isHighContrast ? '#333333' : '#ff9800',
  });

  const getDynamicStyle = (baseStyle: any) => {
    const colors = getColors();
    const scaledStyle = { ...baseStyle };

    // Apply text size scaling
    if (baseStyle.fontSize) {
      scaledStyle.fontSize = getTextSize(baseStyle.fontSize);
    }

    // Apply value scaling for spacing
    ['padding', 'paddingHorizontal', 'paddingVertical', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].forEach(prop => {
      if (baseStyle[prop]) {
        scaledStyle[prop] = getScaledValue(baseStyle[prop]);
      }
    });

    ['margin', 'marginHorizontal', 'marginVertical', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight'].forEach(prop => {
      if (baseStyle[prop]) {
        scaledStyle[prop] = getScaledValue(baseStyle[prop]);
      }
    });

    // Apply high contrast colors
    if (isHighContrast) {
      if (baseStyle.color) {
        scaledStyle.color = colors.text;
      }
      if (baseStyle.backgroundColor) {
        scaledStyle.backgroundColor = colors.background;
      }
      if (baseStyle.borderColor) {
        scaledStyle.borderColor = colors.border;
      }
    }

    // Remove animations if reduced motion is enabled
    if (isReducedMotion) {
      delete scaledStyle.animationDuration;
      delete scaledStyle.transitionDuration;
    }

    return scaledStyle;
  };

  return {
    getTextSize,
    getScaledValue,
    getColors,
    getDynamicStyle,
    isHighContrast,
    isReducedMotion,
  };
};

export default AccessibilityContext;