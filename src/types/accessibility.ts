import { AccessibilityRole, AccessibilityState } from 'react-native';

export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  accessibilityLevel?: number;
}

export interface TouchTargetProps {
  minHeight?: number;
  minWidth?: number;
  hitSlop?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

export interface EmergencyButtonProps extends AccessibilityProps, TouchTargetProps {
  onPress: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export interface ScreenReaderAnnouncement {
  message: string;
  priority?: 'low' | 'medium' | 'high';
  delay?: number;
}

export interface EmergencyConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
  countdownSeconds?: number;
}