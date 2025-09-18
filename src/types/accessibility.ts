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

// Phase 3: Medical Profile and Emergency Flow Types
export interface MedicalProfile {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    bloodType?: string;
    allergies: string[];
    medications: string[];
  };
  emergencyContacts: EmergencyContact[];
  medicalConditions: string[];
  additionalNotes?: string;
  lastUpdated: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  isPrimary: boolean;
}

export interface EmergencySession {
  id: string;
  startTime: string;
  status: EmergencyStatus;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  };
  medicalProfileId: string;
  contactsNotified: string[];
  auditLog: AuditEntry[];
}

export type EmergencyStatus = 'detection' | 'confirmation' | 'in_progress' | 'follow_up' | 'cancelled' | 'completed';

export interface AuditEntry {
  timestamp: string;
  action: string;
  details?: string;
  userId?: string;
}

export interface EmergencyFlowProps {
  currentStatus: EmergencyStatus;
  session: EmergencySession | null;
  medicalProfile: MedicalProfile | null;
  onStatusChange: (status: EmergencyStatus) => void;
  onCancel: () => void;
}

// Phase 4: Healthcare Features Types
export interface MedicationReminder {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: MedicationFrequency;
  times: string[]; // Array of time strings (HH:MM format)
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  lastTaken?: string;
  missedDoses: number;
}

export type MedicationFrequency = 'daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'weekly' | 'as_needed';

export interface CareCoordinator {
  id: string;
  name: string;
  title: string;
  organization: string;
  phoneNumber: string;
  email?: string;
  specialization?: string;
  isPrimary: boolean;
}

export interface AccessibilityPreferences {
  textSize: 'small' | 'medium' | 'large' | 'extra_large';
  highContrast: boolean;
  hapticFeedback: boolean;
  voiceAnnouncements: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

export interface HealthcareSettings {
  medicationReminders: boolean;
  emergencyAlerts: boolean;
  careCoordinatorNotifications: boolean;
  dataBackup: boolean;
  accessibilityPreferences: AccessibilityPreferences;
}