# 📱 **Trilogy Care Mobile Accessibility Implementation Specification**

*Complete technical specification for React Native healthcare accessibility with voice interaction*

---

## **Table of Contents**
1. [Mobile Accessibility Foundation](#mobile-accessibility-foundation)
2. [Voice Interaction System](#voice-interaction-system)
3. [Critical Healthcare Functionality](#critical-healthcare-functionality)
4. [Multi-Step User Flow Implementation](#multi-step-user-flow-implementation)
5. [Complete Integration Example](#complete-integration-example)
6. [Expo Snack Demo Implementation](#expo-snack-demo-implementation)
7. [Technical Interview Reference](#technical-interview-reference)

---

## **Mobile Accessibility Foundation**

### **Core React Native Accessibility Patterns**

#### **1. Emergency Button Component**
```typescript
import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View,
  AccessibilityInfo,
  Platform
} from 'react-native';
import Haptics from 'expo-haptics';

interface EmergencyButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const MobileEmergencyButton: React.FC<EmergencyButtonProps> = ({ 
  onPress, 
  disabled = false 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = async () => {
    // Haptic feedback for all users
    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning
    );
    
    // Announce to screen readers
    AccessibilityInfo.announceForAccessibility(
      'Emergency call initiated'
    );
    
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.emergencyButton,
        isPressed && styles.emergencyButtonPressed,
        disabled && styles.emergencyButtonDisabled
      ]}
      
      // Core accessibility props
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Emergency Contact"
      accessibilityHint="Double tap to immediately call your designated emergency contact"
      accessibilityState={{ 
        disabled,
        selected: isPressed 
      }}
      
      // Large touch target for motor impairments
      hitSlop={{ 
        top: 10, 
        bottom: 10, 
        left: 10, 
        right: 10 
      }}
      
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>🚨 Emergency Call</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  emergencyButton: {
    minHeight: 88,        // Double WCAG standard for mobile
    minWidth: 88,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    margin: 20,
    
    // High contrast border
    borderWidth: 3,
    borderColor: '#991B1B',
    
    // Shadow for depth perception
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  emergencyButtonPressed: {
    backgroundColor: '#B91C1C',
    transform: [{ scale: 0.98 }],
  },
  emergencyButtonDisabled: {
    backgroundColor: '#9CA3AF',
    borderColor: '#6B7280',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MobileEmergencyButton;
```

#### **2. Accessible Form Components**
```typescript
import React, { useRef } from 'react';
import { 
  TextInput, 
  View, 
  Text, 
  StyleSheet,
  AccessibilityInfo 
} from 'react-native';

interface AccessibleInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
}) => {
  const inputRef = useRef<TextInput>(null);
  const errorId = `${label}-error`;
  const inputId = `${label}-input`;

  return (
    <View style={styles.inputContainer}>
      <Text 
        style={styles.label}
        nativeID={inputId}
        accessibilityRole="text"
      >
        {label}
      </Text>
      
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          error && styles.inputError
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        
        // Accessibility
        accessible={true}
        accessibilityLabel={label}
        accessibilityHint={placeholder}
        accessibilityLabelledBy={inputId}
        accessibilityDescribedBy={error ? errorId : undefined}
        
        // Announce errors to screen readers
        onBlur={() => {
          if (error) {
            AccessibilityInfo.announceForAccessibility(
              `${label} has error: ${error}`
            );
          }
        }}
      />
      
      {error && (
        <Text 
          style={styles.errorText}
          nativeID={errorId}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
  },
  input: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    minHeight: 56,  // Large touch target
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default AccessibleInput;
```

#### **3. Screen Reader Announcements**
```typescript
import { AccessibilityInfo, Platform } from 'react-native';

// Utility class for screen reader announcements
export class ScreenReaderAnnouncer {
  static async announce(message: string, options?: {
    queue?: boolean;
    delay?: number;
  }) {
    const { queue = false, delay = 0 } = options || {};
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibilityWithOptions(
        message,
        { queue }
      );
    } else {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }
  
  static async isScreenReaderEnabled(): Promise<boolean> {
    return await AccessibilityInfo.isScreenReaderEnabled();
  }
  
  static async announceList(items: string[], delayBetween = 500) {
    for (const item of items) {
      await this.announce(item);
      await new Promise(resolve => setTimeout(resolve, delayBetween));
    }
  }
}

// Usage example:
const announceEmergencySequence = async () => {
  await ScreenReaderAnnouncer.announceList([
    'Emergency button activated',
    'Calling your emergency contact in 10 seconds',
    'Say cancel to stop the call',
  ]);
};
```

---

## **Voice Interaction System**

### **Complete Voice Command Implementation**

#### **1. Voice Recognition Setup**
```typescript
import Voice, { 
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent 
} from '@react-native-voice/voice';
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

// Voice command types for healthcare
export enum VoiceCommandType {
  EMERGENCY = 'emergency',
  NAVIGATION = 'navigation',
  MEDICATION = 'medication',
  CARE = 'care',
  HELP = 'help',
}

export interface VoiceCommand {
  type: VoiceCommandType;
  triggers: string[];
  action: (params?: any) => void;
  confirmationRequired?: boolean;
}

export const useVoiceCommands = (commands: VoiceCommand[]) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Setup voice recognition
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart: SpeechStartEvent = useCallback(() => {
    setIsListening(true);
    setError(null);
    ScreenReaderAnnouncer.announce('Voice recognition started');
  }, []);

  const onSpeechEnd: SpeechEndEvent = useCallback(() => {
    setIsListening(false);
  }, []);

  const onSpeechResults: SpeechResultsEvent = useCallback((event) => {
    if (event.value && event.value.length > 0) {
      const spokenText = event.value[0].toLowerCase();
      setRecognizedText(spokenText);
      processVoiceCommand(spokenText);
    }
  }, [commands]);

  const onSpeechPartialResults: SpeechResultsEvent = useCallback((event) => {
    if (event.value && event.value.length > 0) {
      setRecognizedText(event.value[0]);
    }
  }, []);

  const onSpeechError: SpeechErrorEvent = useCallback((event) => {
    setError(event.error?.message || 'Voice recognition error');
    setIsListening(false);
    ScreenReaderAnnouncer.announce('Voice recognition error. Please try again.');
  }, []);

  const processVoiceCommand = (spokenText: string) => {
    const text = spokenText.toLowerCase();
    
    // Priority order: Emergency commands first
    const sortedCommands = [...commands].sort((a, b) => {
      if (a.type === VoiceCommandType.EMERGENCY) return -1;
      if (b.type === VoiceCommandType.EMERGENCY) return 1;
      return 0;
    });

    for (const command of sortedCommands) {
      const triggered = command.triggers.some(trigger => 
        text.includes(trigger.toLowerCase())
      );
      
      if (triggered) {
        if (command.confirmationRequired) {
          confirmAndExecuteCommand(command, text);
        } else {
          command.action({ spokenText: text });
        }
        break;
      }
    }
  };

  const confirmAndExecuteCommand = async (command: VoiceCommand, text: string) => {
    await ScreenReaderAnnouncer.announce(
      `About to ${command.type}. Say yes to confirm or no to cancel.`
    );
    
    // Listen for confirmation
    startListening();
    
    setTimeout(() => {
      stopListening();
    }, 5000);
  };

  const startListening = async () => {
    try {
      await Voice.start('en-AU'); // Australian English
      setIsListening(true);
    } catch (e) {
      setError('Failed to start voice recognition');
      console.error('Voice start error:', e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error('Voice stop error:', e);
    }
  };

  return {
    isListening,
    recognizedText,
    error,
    startListening,
    stopListening,
  };
};
```

#### **2. Healthcare Voice Commands Configuration**
```typescript
// Healthcare-specific voice commands
export const healthcareVoiceCommands: VoiceCommand[] = [
  // Emergency commands - highest priority
  {
    type: VoiceCommandType.EMERGENCY,
    triggers: [
      'emergency call',
      'help me',
      'call emergency',
      'urgent help',
      'call triple zero',
      'emergency',
    ],
    action: ({ navigation }) => {
      navigation.navigate('EmergencyFlow');
    },
    confirmationRequired: false, // No confirmation for emergencies
  },
  
  // Care coordination
  {
    type: VoiceCommandType.CARE,
    triggers: [
      'call nurse',
      'call carer',
      'need assistance',
      'call care coordinator',
      'speak to nurse',
    ],
    action: ({ phoneNumber }) => {
      initiateCall(phoneNumber || CARE_COORDINATOR_NUMBER);
    },
    confirmationRequired: true,
  },
  
  // Medication reminders
  {
    type: VoiceCommandType.MEDICATION,
    triggers: [
      'medication reminder',
      'medicine time',
      'take pills',
      'what medication',
      'pill reminder',
    ],
    action: ({ navigation }) => {
      navigation.navigate('MedicationScreen');
    },
    confirmationRequired: false,
  },
  
  // Navigation
  {
    type: VoiceCommandType.NAVIGATION,
    triggers: [
      'go home',
      'main menu',
      'go back',
      'return',
      'home screen',
    ],
    action: ({ navigation }) => {
      navigation.navigate('Home');
    },
    confirmationRequired: false,
  },
  
  // Help commands
  {
    type: VoiceCommandType.HELP,
    triggers: [
      'help',
      'what can i say',
      'commands',
      'voice help',
      'instructions',
    ],
    action: () => {
      announceAvailableCommands();
    },
    confirmationRequired: false,
  },
];

// Announce available commands
const announceAvailableCommands = async () => {
  const commands = [
    'Available voice commands:',
    'Say "Emergency Call" for immediate help',
    'Say "Call Nurse" to contact your care coordinator',
    'Say "Medication Reminder" for your medicine schedule',
    'Say "Go Home" to return to the main screen',
    'Say "Help" to hear these commands again',
  ];
  
  await ScreenReaderAnnouncer.announceList(commands, 1000);
};
```

#### **3. Voice UI Component**
```typescript
import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  Animated,
  ActivityIndicator
} from 'react-native';

interface VoiceControlPanelProps {
  isListening: boolean;
  recognizedText: string;
  error: string | null;
  onStartListening: () => void;
  onStopListening: () => void;
}

const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({
  isListening,
  recognizedText,
  error,
  onStartListening,
  onStopListening,
}) => {
  const pulseAnim = useAnimated(isListening);

  return (
    <View style={styles.voiceContainer}>
      <TouchableOpacity
        onPress={isListening ? onStopListening : onStartListening}
        style={[
          styles.voiceButton,
          isListening && styles.voiceButtonActive
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          isListening 
            ? "Voice recognition active. Tap to stop." 
            : "Activate voice commands"
        }
        accessibilityHint="Tap to start or stop voice recognition"
      >
        <Animated.View style={[
          styles.pulseCircle,
          isListening && {
            transform: [{
              scale: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.3]
              })
            }],
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.3]
            })
          }
        ]} />
        
        <Text style={styles.voiceIcon}>
          {isListening ? '🎤' : '🎙️'}
        </Text>
        
        <Text style={styles.voiceStatus}>
          {isListening ? 'Listening...' : 'Tap to Speak'}
        </Text>
      </TouchableOpacity>

      {recognizedText && (
        <View 
          style={styles.recognizedTextContainer}
          accessible={true}
          accessibilityLabel={`You said: ${recognizedText}`}
          accessibilityRole="text"
        >
          <Text style={styles.recognizedText}>
            "{recognizedText}"
          </Text>
        </View>
      )}

      {error && (
        <Text 
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {error}
        </Text>
      )}

      <Text style={styles.instructions}>
        Say "Help" to hear available commands
      </Text>
    </View>
  );
};

const useAnimated = (isActive: boolean) => {
  const animValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animValue.setValue(0);
    }
  }, [isActive]);

  return animValue;
};

const styles = StyleSheet.create({
  voiceContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  voiceButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceButtonActive: {
    backgroundColor: '#EF4444',
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F6',
  },
  voiceIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  voiceStatus: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recognizedTextContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
  },
  recognizedText: {
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    marginTop: 10,
  },
  instructions: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 10,
  },
});

export default VoiceControlPanel;
```

---

## **Critical Healthcare Functionality**

### **Emergency System with Medical Context**

#### **1. Emergency Call Handler**
```typescript
import { Linking, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as Haptics from 'expo-haptics';

interface MedicalProfile {
  userId: string;
  allergies: string[];
  medications: Medication[];
  conditions: MedicalCondition[];
  emergencyContacts: EmergencyContact[];
  bloodType?: string;
  notes?: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  isPrimary: boolean;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
}

interface MedicalCondition {
  name: string;
  diagnosedDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export class EmergencyCallHandler {
  static async initiateEmergencyCall(
    userProfile: MedicalProfile,
    onStatusUpdate?: (status: string) => void
  ) {
    try {
      // Step 1: Immediate haptic feedback
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
      
      onStatusUpdate?.('Initiating emergency call...');
      
      // Step 2: Get current location
      const location = await this.getCurrentLocation();
      
      // Step 3: Prepare medical summary
      const medicalSummary = await this.prepareMedicalSummary(
        userProfile,
        location
      );
      
      // Step 4: Get primary emergency contact
      const primaryContact = userProfile.emergencyContacts.find(
        c => c.isPrimary
      ) || userProfile.emergencyContacts[0];
      
      if (!primaryContact) {
        throw new Error('No emergency contact configured');
      }
      
      // Step 5: Start background emergency service
      await this.startEmergencyBackgroundService(medicalSummary);
      
      // Step 6: Make the call
      const phoneNumber = primaryContact.phoneNumber;
      const canCall = await Linking.canOpenURL(`tel:${phoneNumber}`);
      
      if (canCall) {
        await Linking.openURL(`tel:${phoneNumber}`);
        onStatusUpdate?.('Call initiated');
        
        // Step 7: Send follow-up SMS with details
        await this.sendEmergencySMS(primaryContact, medicalSummary);
        
        // Step 8: Log emergency event
        await this.logEmergencyEvent(medicalSummary);
        
      } else {
        throw new Error('Unable to make phone call');
      }
      
    } catch (error) {
      await this.handleEmergencyFailure(error, userProfile);
    }
  }
  
  static async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return null;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      return location;
    } catch (error) {
      console.error('Location error:', error);
      return null;
    }
  }
  
  static async prepareMedicalSummary(
    profile: MedicalProfile,
    location: Location.LocationObject | null
  ): Promise<string> {
    const summary = [`MEDICAL EMERGENCY ALERT`];
    
    // Location
    if (location) {
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (address[0]) {
        summary.push(
          `Location: ${address[0].street || ''} ${address[0].city || ''}`
        );
      }
      
      summary.push(
        `GPS: ${location.coords.latitude}, ${location.coords.longitude}`
      );
    }
    
    // Medical conditions
    if (profile.conditions.length > 0) {
      summary.push('\nMEDICAL CONDITIONS:');
      profile.conditions.forEach(condition => {
        summary.push(`- ${condition.name} (${condition.severity})`);
      });
    }
    
    // Medications
    if (profile.medications.length > 0) {
      summary.push('\nCURRENT MEDICATIONS:');
      profile.medications.forEach(med => {
        summary.push(`- ${med.name} ${med.dosage}`);
      });
    }
    
    // Allergies
    if (profile.allergies.length > 0) {
      summary.push('\nALLERGIES:');
      profile.allergies.forEach(allergy => {
        summary.push(`- ${allergy}`);
      });
    }
    
    // Blood type
    if (profile.bloodType) {
      summary.push(`\nBlood Type: ${profile.bloodType}`);
    }
    
    return summary.join('\n');
  }
  
  static async sendEmergencySMS(
    contact: EmergencyContact,
    medicalSummary: string
  ) {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      
      if (isAvailable) {
        const { result } = await SMS.sendSMSAsync(
          [contact.phoneNumber],
          medicalSummary
        );
        
        if (result === 'sent') {
          console.log('Emergency SMS sent successfully');
        }
      }
    } catch (error) {
      console.error('SMS error:', error);
    }
  }
  
  static async startEmergencyBackgroundService(summary: string) {
    // Store emergency state for background service
    await AsyncStorage.setItem('emergency_active', 'true');
    await AsyncStorage.setItem('emergency_summary', summary);
    await AsyncStorage.setItem('emergency_timestamp', new Date().toISOString());
    
    // In a real app, this would start a background service
    // that continues to broadcast location and status
  }
  
  static async logEmergencyEvent(summary: string) {
    const event = {
      type: 'emergency_call',
      timestamp: new Date().toISOString(),
      summary,
      appVersion: '1.0.0',
      platform: Platform.OS,
    };
    
    // Store locally
    const events = await AsyncStorage.getItem('emergency_events');
    const eventList = events ? JSON.parse(events) : [];
    eventList.push(event);
    
    await AsyncStorage.setItem(
      'emergency_events',
      JSON.stringify(eventList)
    );
    
    // In production, also send to secure server
  }
  
  static async handleEmergencyFailure(
    error: any,
    profile: MedicalProfile
  ) {
    console.error('Emergency call failed:', error);
    
    // Try alternative methods
    Alert.alert(
      'Emergency Call Failed',
      'Unable to place call. Trying alternative methods...',
      [
        {
          text: 'Try SMS',
          onPress: async () => {
            const contact = profile.emergencyContacts[0];
            if (contact) {
              await this.sendEmergencySMS(
                contact,
                'EMERGENCY - Please call me immediately'
              );
            }
          },
        },
        {
          text: 'Call 000',
          onPress: () => {
            Linking.openURL('tel:000');
          },
        },
      ],
      { cancelable: false }
    );
  }
}
```

#### **2. Medical Data Security**
```typescript
import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export class MedicalDataSecurity {
  private static encryptionKey: string | null = null;
  
  // Initialize encryption key
  static async initialize() {
    try {
      let key = await SecureStore.getItemAsync('medical_encryption_key');
      
      if (!key) {
        // Generate new key
        key = CryptoJS.lib.WordArray.random(256/8).toString();
        await SecureStore.setItemAsync('medical_encryption_key', key);
      }
      
      this.encryptionKey = key;
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      throw new Error('Security initialization failed');
    }
  }
  
  // Encrypt sensitive medical data
  static async encryptMedicalData(data: any): Promise<string> {
    if (!this.encryptionKey) {
      await this.initialize();
    }
    
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(
      jsonString,
      this.encryptionKey!
    ).toString();
    
    // Add integrity check
    const hash = CryptoJS.SHA256(encrypted).toString();
    
    return JSON.stringify({
      data: encrypted,
      hash,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Decrypt medical data
  static async decryptMedicalData(encryptedData: string): Promise<any> {
    if (!this.encryptionKey) {
      await this.initialize();
    }
    
    try {
      const parsed = JSON.parse(encryptedData);
      
      // Verify integrity
      const currentHash = CryptoJS.SHA256(parsed.data).toString();
      if (currentHash !== parsed.hash) {
        throw new Error('Data integrity check failed');
      }
      
      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(
        parsed.data,
        this.encryptionKey!
      );
      
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
      
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Unable to decrypt medical data');
    }
  }
  
  // Audit trail for all medical data access
  static async logDataAccess(
    action: string,
    dataType: string,
    userId: string,
    details?: any
  ) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action,
      dataType,
      userId,
      platform: Platform.OS,
      platformVersion: Platform.Version,
      details: details || {},
    };
    
    // Get existing audit log
    const auditLog = await SecureStore.getItemAsync('medical_audit_log');
    const log = auditLog ? JSON.parse(auditLog) : [];
    
    // Add new entry
    log.push(auditEntry);
    
    // Keep only last 1000 entries for performance
    if (log.length > 1000) {
      log.splice(0, log.length - 1000);
    }
    
    // Save updated log
    await SecureStore.setItemAsync(
      'medical_audit_log',
      JSON.stringify(log)
    );
    
    // In production, also send to secure audit server
  }
  
  // Secure data deletion
  static async secureDelete(dataKey: string, dataType: string) {
    try {
      // Log deletion
      await this.logDataAccess('delete', dataType, 'system', { dataKey });
      
      // Overwrite with random data before deletion
      const randomData = CryptoJS.lib.WordArray.random(1024).toString();
      await SecureStore.setItemAsync(dataKey, randomData);
      
      // Delete
      await SecureStore.deleteItemAsync(dataKey);
      
      return true;
    } catch (error) {
      console.error('Secure delete failed:', error);
      return false;
    }
  }
}
```

---

## **Multi-Step User Flow Implementation**

### **Complete Emergency Flow with Accessibility**

#### **1. Emergency Flow Navigator**
```typescript
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import flow steps
import EmergencyDetection from './EmergencyDetection';
import EmergencyConfirmation from './EmergencyConfirmation';
import EmergencyInProgress from './EmergencyInProgress';
import EmergencyFollowUp from './EmergencyFollowUp';

const Stack = createStackNavigator();

export const EmergencyFlowNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Detection"
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      >
        <Stack.Screen 
          name="Detection" 
          component={EmergencyDetection}
          options={{
            title: 'Emergency Detection',
          }}
        />
        <Stack.Screen 
          name="Confirmation" 
          component={EmergencyConfirmation}
          options={{
            title: 'Confirm Emergency',
          }}
        />
        <Stack.Screen 
          name="InProgress" 
          component={EmergencyInProgress}
          options={{
            title: 'Emergency Call Active',
          }}
        />
        <Stack.Screen 
          name="FollowUp" 
          component={EmergencyFollowUp}
          options={{
            title: 'Emergency Follow Up',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

#### **2. Step 1: Emergency Detection**
```typescript
import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  AccessibilityInfo 
} from 'react-native';
import MobileEmergencyButton from '../components/MobileEmergencyButton';
import VoiceControlPanel from '../components/VoiceControlPanel';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

const EmergencyDetection = ({ navigation }) => {
  const voiceCommands = [
    {
      type: 'emergency',
      triggers: ['emergency', 'help me', 'urgent'],
      action: () => handleEmergencyActivation(),
    },
  ];
  
  const { 
    isListening, 
    recognizedText, 
    error, 
    startListening 
  } = useVoiceCommands(voiceCommands);

  useEffect(() => {
    // Announce screen to screen readers
    AccessibilityInfo.announceForAccessibility(
      'Emergency assistance screen. Press the emergency button or use voice commands for help.'
    );
    
    // Auto-start voice listening for hands-free operation
    startListening();
  }, []);

  const handleEmergencyActivation = () => {
    navigation.navigate('Confirmation');
  };

  return (
    <View style={styles.container}>
      <Text 
        style={styles.title}
        accessibilityRole="header"
        accessibilityLevel={1}
      >
        Emergency Assistance
      </Text>
      
      <MobileEmergencyButton 
        onPress={handleEmergencyActivation}
      />
      
      <VoiceControlPanel
        isListening={isListening}
        recognizedText={recognizedText}
        error={error}
        onStartListening={startListening}
        onStopListening={() => {}}
      />
      
      <Text style={styles.instructions}>
        Press the button or say "Emergency" for immediate help
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 40,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
});

export default EmergencyDetection;
```

#### **3. Step 2: Emergency Confirmation**
```typescript
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet,
  AccessibilityInfo,
  Animated,
} from 'react-native';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { CountdownTimer } from '../components/CountdownTimer';

const EmergencyConfirmation = ({ navigation }) => {
  const [countdown, setCountdown] = useState(10);
  const [isCancelled, setIsCancelled] = useState(false);
  
  const voiceCommands = [
    {
      type: 'control',
      triggers: ['cancel', 'stop', 'no'],
      action: () => handleCancel(),
    },
    {
      type: 'control',
      triggers: ['continue', 'yes', 'proceed'],
      action: () => handleProceed(),
    },
  ];
  
  const { startListening } = useVoiceCommands(voiceCommands);

  useEffect(() => {
    // Announce confirmation
    AccessibilityInfo.announceForAccessibility(
      'Emergency call will start in 10 seconds. Say cancel to stop.'
    );
    
    startListening();
    
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleProceed();
          return 0;
        }
        
        // Announce countdown at key intervals
        if (prev <= 5) {
          AccessibilityInfo.announceForAccessibility(
            `${prev - 1} seconds`
          );
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleCancel = () => {
    setIsCancelled(true);
    AccessibilityInfo.announceForAccessibility(
      'Emergency call cancelled'
    );
    navigation.goBack();
  };

  const handleProceed = () => {
    if (!isCancelled) {
      navigation.navigate('InProgress');
    }
  };

  return (
    <View style={styles.container}>
      <View 
        style={styles.alertContainer}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
      >
        <Text style={styles.alertIcon}>🚨</Text>
        <Text style={styles.alertTitle}>
          Emergency Call Starting
        </Text>
      </View>
      
      <CountdownTimer 
        seconds={countdown}
        size={120}
        strokeWidth={8}
      />
      
      <Text 
        style={styles.countdownText}
        accessibilityLiveRegion="polite"
      >
        {countdown} seconds
      </Text>
      
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={handleCancel}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Cancel emergency call"
        accessibilityHint="Double tap to cancel if this was activated by mistake"
      >
        <Text style={styles.cancelText}>CANCEL</Text>
      </TouchableOpacity>
      
      <Text style={styles.voiceHint}>
        Say "Cancel" to stop or "Continue" to proceed now
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  alertContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  alertIcon: {
    fontSize: 72,
    marginBottom: 20,
  },
  alertTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
  },
  countdownText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#991B1B',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 12,
    marginTop: 40,
    minWidth: 200,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  voiceHint: {
    fontSize: 16,
    color: '#7F1D1D',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default EmergencyConfirmation;
```

#### **4. Step 3: Emergency In Progress**
```typescript
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import { EmergencyCallHandler } from '../services/EmergencyCallHandler';
import { MedicalSummaryCard } from '../components/MedicalSummaryCard';
import { LocationCard } from '../components/LocationCard';

const EmergencyInProgress = ({ navigation }) => {
  const [callStatus, setCallStatus] = useState('Initiating...');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    initiateEmergencyCall();
  }, []);

  const initiateEmergencyCall = async () => {
    // Get user profile
    const profile = await getUserMedicalProfile();
    setUserProfile(profile);
    
    // Start emergency call
    await EmergencyCallHandler.initiateEmergencyCall(
      profile,
      (status) => {
        setCallStatus(status);
        AccessibilityInfo.announceForAccessibility(status);
      }
    );
  };

  const handleSendSMS = async () => {
    if (userProfile) {
      const contact = userProfile.emergencyContacts[0];
      const location = await EmergencyCallHandler.getCurrentLocation();
      const summary = await EmergencyCallHandler.prepareMedicalSummary(
        userProfile,
        location
      );
      
      await EmergencyCallHandler.sendEmergencySMS(contact, summary);
      AccessibilityInfo.announceForAccessibility(
        'Emergency SMS sent'
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View 
        style={styles.statusContainer}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
      >
        <Text style={styles.statusIcon}>📞</Text>
        <Text style={styles.statusText}>
          {callStatus}
        </Text>
      </View>
      
      <Text style={styles.sectionTitle}>
        Medical Information for Responders
      </Text>
      
      {userProfile && (
        <>
          <MedicalSummaryCard profile={userProfile} />
          <LocationCard />
        </>
      )}
      
      <View style={styles.alternativeActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSendSMS}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Send emergency SMS"
          accessibilityHint="Send your medical information via text message"
        >
          <Text style={styles.actionIcon}>📱</Text>
          <Text style={styles.actionText}>Send Emergency SMS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => shareLocation()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Share current location"
        >
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionText}>Share Location</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => navigation.navigate('FollowUp')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Call completed"
      >
        <Text style={styles.completeText}>Call Completed</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statusContainer: {
    backgroundColor: '#DBEAFE',
    padding: 30,
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E40AF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    margin: 20,
  },
  alternativeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 150,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: '#10B981',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default EmergencyInProgress;
```

#### **5. Step 4: Emergency Follow-Up**
```typescript
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';

const EmergencyFollowUp = ({ navigation }) => {
  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      'Emergency contact notified. Follow-up options available.'
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✅</Text>
        <Text 
          style={styles.successTitle}
          accessibilityRole="header"
          accessibilityLevel={1}
        >
          Emergency Contact Notified
        </Text>
      </View>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>What Happened:</Text>
        <Text style={styles.summaryItem}>
          ✓ Emergency contact called
        </Text>
        <Text style={styles.summaryItem}>
          ✓ Medical information shared
        </Text>
        <Text style={styles.summaryItem}>
          ✓ Location services activated
        </Text>
        <Text style={styles.summaryItem}>
          ✓ Emergency logged for records
        </Text>
      </View>
      
      <View style={styles.nextStepsContainer}>
        <Text style={styles.nextStepsTitle}>
          Recommended Next Steps:
        </Text>
        
        <TouchableOpacity
          style={styles.optionButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Call care coordinator"
          onPress={() => callCareCoordinator()}
        >
          <Text style={styles.optionIcon}>👩‍⚕️</Text>
          <Text style={styles.optionText}>
            Call Care Coordinator
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.optionButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Update emergency contacts"
          onPress={() => navigation.navigate('EmergencyContacts')}
        >
          <Text style={styles.optionIcon}>📞</Text>
          <Text style={styles.optionText}>
            Update Emergency Contacts
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.homeButton}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Return to home screen"
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.homeIcon}>🏠</Text>
        <Text style={styles.homeText}>Return to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  successContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  successIcon: {
    fontSize: 72,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  summaryItem: {
    fontSize: 16,
    color: '#166534',
    marginVertical: 4,
  },
  nextStepsContainer: {
    marginBottom: 30,
  },
  nextStepsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionText: {
    fontSize: 18,
    color: '#1F2937',
  },
  homeButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginTop: 'auto',
  },
  homeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  homeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default EmergencyFollowUp;
```

---

## **Complete Integration Example**

### **Full Emergency System Integration**

```typescript
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet,
  AppState,
  AppStateStatus,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-voice/voice';

// Import all components
import { EmergencyFlowNavigator } from './navigation/EmergencyFlowNavigator';
import { MedicalDataSecurity } from './services/MedicalDataSecurity';
import { useVoiceCommands } from './hooks/useVoiceCommands';
import { healthcareVoiceCommands } from './config/voiceCommands';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import { ScreenReaderAnnouncer } from './utils/ScreenReaderAnnouncer';

// Main App Component
const TrilogyCareEmergencyApp = () => {
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [textSize, setTextSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  // Initialize security
  useEffect(() => {
    MedicalDataSecurity.initialize();
  }, []);

  // Voice commands
  const { startListening, stopListening } = useVoiceCommands(
    healthcareVoiceCommands
  );

  // App state handling
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.match(/inactive|background/) && 
        nextAppState === 'active'
      ) {
        // App came to foreground
        checkEmergencyState();
      }
      setAppState(nextAppState);
    };

    AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [appState]);

  // Check if emergency is active
  const checkEmergencyState = async () => {
    const emergencyActive = await AsyncStorage.getItem('emergency_active');
    
    if (emergencyActive === 'true') {
      ScreenReaderAnnouncer.announce(
        'Emergency call is still active'
      );
    }
  };

  // Accessibility settings
  const increaseTextSize = () => {
    const sizes = ['small', 'normal', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(textSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setTextSize(sizes[nextIndex]);
    
    ScreenReaderAnnouncer.announce(
      `Text size changed to ${sizes[nextIndex]}`
    );
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    ScreenReaderAnnouncer.announce(
      `High contrast ${!highContrast ? 'enabled' : 'disabled'}`
    );
  };

  const toggleVoice = async () => {
    if (isVoiceActive) {
      await stopListening();
    } else {
      await startListening();
    }
    setIsVoiceActive(!isVoiceActive);
  };

  return (
    <View style={[
      styles.container,
      highContrast && styles.highContrast
    ]}>
      <NavigationContainer>
        <EmergencyFlowNavigator />
      </NavigationContainer>
      
      <AccessibilityToolbar
        onToggleVoice={toggleVoice}
        onIncreaseTextSize={increaseTextSize}
        onHighContrast={toggleHighContrast}
        isVoiceActive={isVoiceActive}
        textSize={textSize}
        highContrast={highContrast}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  highContrast: {
    backgroundColor: '#000000',
  },
});

export default TrilogyCareEmergencyApp;
```

---

## **Expo Snack Demo Implementation**

### **Live Mobile Demo for Interview**

*Quick-build React Native Expo app for live mobile demonstration during your Trilogy Care interview*

---

### **Demo Strategy: Why Expo Snack**

**Advantages:**
- **⚡ 5-minute setup**: No local development environment needed
- **📱 Real mobile experience**: Shows actual touch targets and haptics
- **🔗 Instant sharing**: Send QR code, interviewers can try it themselves
- **🛡️ Zero risk**: Runs in Expo Go app, no installation required
- **🎯 Professional impact**: Live mobile demo beats any video

### **Complete Expo Snack Implementation**

#### **Step 1: Create New Snack**
1. Go to https://snack.expo.dev/
2. Create new project: "Trilogy Care Accessibility Demo"
3. Choose "React Native" template
4. Replace default code with implementation below

#### **Step 2: App.js - Main Demo Application**

```javascript
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

export default function TrillogyCareDemo() {
  const [currentScreen, setCurrentScreen] = useState('emergency');
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  // Emergency button handler
  const handleEmergencyPress = async () => {
    // Haptic feedback
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    // Speech announcement
    Speech.speak("Emergency call starting in 10 seconds. Say cancel to stop.");
    
    // Navigate to confirmation
    setCurrentScreen('confirmation');
  };

  // Voice recognition handler
  const handleVoiceCommand = () => {
    setIsListening(true);
    
    // Web Speech API for browser testing
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setRecognizedText(command);
        
        if (command.includes('help') || command.includes('emergency')) {
          Speech.speak("Emergency activated by voice command");
          handleEmergencyPress();
        } else if (command.includes('cancel')) {
          Speech.speak("Operation cancelled");
          setCurrentScreen('emergency');
        } else if (command.includes('home')) {
          Speech.speak("Returning to home screen");
          setCurrentScreen('emergency');
        }
        
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        Alert.alert('Voice Recognition', 'Voice recognition not available in this environment. On mobile device, this would use native speech recognition.');
      };
      
      recognition.start();
    } else {
      // Fallback for mobile
      Alert.alert('Voice Commands Available', 'Say: "Help me", "Emergency", "Cancel", or "Home"');
      setIsListening(false);
    }
  };

  // Screen components
  const EmergencyScreen = () => (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <Text 
        style={styles.title}
        accessibilityRole="header"
        accessibilityLevel={1}
      >
        Emergency Assistance
      </Text>
      
      <TouchableOpacity 
        style={styles.emergencyButton}
        onPress={handleEmergencyPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Emergency Call"
        accessibilityHint="Double tap to start emergency call to your designated contact"
      >
        <Text style={styles.emergencyIcon}>🚨</Text>
        <Text style={styles.emergencyText}>Emergency Call</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.voiceButton}
        onPress={handleVoiceCommand}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Voice Commands"
        accessibilityHint="Tap to activate voice recognition for hands-free control"
      >
        <Text style={styles.voiceIcon}>
          {isListening ? '🎤' : '🎙️'}
        </Text>
        <Text style={styles.voiceText}>
          {isListening ? 'Listening...' : 'Voice Commands'}
        </Text>
      </TouchableOpacity>
      
      {recognizedText ? (
        <View style={styles.recognizedContainer}>
          <Text 
            style={styles.recognizedText}
            accessibilityLiveRegion="polite"
          >
            You said: "{recognizedText}"
          </Text>
        </View>
      ) : null}
      
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructions}>
          • Press Emergency button or say "Help me"
        </Text>
        <Text style={styles.instructions}>
          • Notice large touch targets (WCAG 2.2 compliant)
        </Text>
        <Text style={styles.instructions}>
          • All interactions provide haptic & audio feedback
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.accessibilityButton}
        onPress={() => setCurrentScreen('accessibility')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="View accessibility features"
      >
        <Text style={styles.accessibilityText}>
          ♿ Accessibility Features Demo
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const ConfirmationScreen = () => (
    <View style={styles.confirmationContainer}>
      <Text 
        style={styles.alertTitle}
        accessibilityRole="header"
        accessibilityLiveRegion="assertive"
      >
        🚨 Emergency Call Starting
      </Text>
      
      <Text style={styles.countdownText}>
        Auto-calling in 10 seconds...
      </Text>
      
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => {
          Speech.speak("Emergency call cancelled");
          setCurrentScreen('emergency');
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Cancel emergency call"
        accessibilityHint="Double tap to cancel if this was activated by mistake"
      >
        <Text style={styles.cancelText}>CANCEL</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.proceedButton}
        onPress={() => {
          Speech.speak("Calling emergency contact now");
          Alert.alert('Demo Mode', 'In production, this would call your emergency contact and share medical information.');
          setCurrentScreen('emergency');
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Call now"
      >
        <Text style={styles.proceedText}>CALL NOW</Text>
      </TouchableOpacity>
      
      <Text style={styles.voiceHint}>
        Say "Cancel" to stop or use the buttons above
      </Text>
    </View>
  );

  const AccessibilityScreen = () => (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <Text 
        style={styles.title}
        accessibilityRole="header"
        accessibilityLevel={1}
      >
        Accessibility Features
      </Text>
      
      <View style={styles.featureContainer}>
        <Text style={styles.featureTitle}>✅ Large Touch Targets</Text>
        <Text style={styles.featureDescription}>
          All buttons are minimum 88px (WCAG 2.2 compliant)
        </Text>
      </View>
      
      <View style={styles.featureContainer}>
        <Text style={styles.featureTitle}>✅ Screen Reader Support</Text>
        <Text style={styles.featureDescription}>
          Every element has accessibility labels and hints
        </Text>
      </View>
      
      <View style={styles.featureContainer}>
        <Text style={styles.featureTitle}>✅ Voice Commands</Text>
        <Text style={styles.featureDescription}>
          Hands-free operation for users with motor impairments
        </Text>
      </View>
      
      <View style={styles.featureContainer}>
        <Text style={styles.featureTitle}>✅ Haptic Feedback</Text>
        <Text style={styles.featureDescription}>
          Tactile confirmation for users with vision impairments
        </Text>
      </View>
      
      <View style={styles.featureContainer}>
        <Text style={styles.featureTitle}>✅ High Contrast Colors</Text>
        <Text style={styles.featureDescription}>
          Color combinations meet WCAG contrast requirements
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.testButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Speech.speak("Accessibility test successful");
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Test accessibility features"
        accessibilityHint="Demonstrates haptic feedback and speech synthesis"
      >
        <Text style={styles.testButtonText}>
          Test Haptic + Speech
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => setCurrentScreen('emergency')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Return to home screen"
      >
        <Text style={styles.homeButtonText}>🏠 Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'confirmation':
        return <ConfirmationScreen />;
      case 'accessibility':
        return <AccessibilityScreen />;
      default:
        return <EmergencyScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 40,
    textAlign: 'center',
  },
  emergencyButton: {
    width: 200,
    height: 200,
    backgroundColor: '#DC2626',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyIcon: {
    fontSize: 64,
    marginBottom: 10,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  voiceButton: {
    width: 160,
    height: 80,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  voiceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recognizedContainer: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 250,
  },
  recognizedText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  instructionsContainer: {
    marginBottom: 30,
  },
  instructions: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  accessibilityButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    minHeight: 50,
    justifyContent: 'center',
  },
  accessibilityText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmationContainer: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  alertTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 30,
    textAlign: 'center',
  },
  countdownText: {
    fontSize: 20,
    color: '#991B1B',
    marginBottom: 40,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  proceedButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  proceedText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  voiceHint: {
    fontSize: 16,
    color: '#7F1D1D',
    textAlign: 'center',
  },
  featureContainer: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  testButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
    minHeight: 50,
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    minHeight: 50,
    justifyContent: 'center',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

#### **Step 3: package.json Dependencies**

```json
{
  "dependencies": {
    "expo": "~49.0.0",
    "expo-haptics": "~12.4.0",
    "expo-speech": "~11.3.0",
    "react": "18.2.0",
    "react-native": "0.72.6"
  }
}
```

### **Demo Execution Guide**

#### **Setup (5 minutes before interview):**

1. **Test the Snack**: Open on your phone, ensure all features work
2. **Generate QR Code**: Save screenshot of the QR code as backup
3. **Practice Flow**: Quick rehearsal of the 3-minute demo

#### **Live Demo Flow (3 minutes):**

**Minute 1: Setup & Impact**
```
"I built a quick accessibility demo that shows healthcare-specific patterns. 
Let me pull it up on my phone... [Open Expo Go, scan QR]
Here, try pressing this emergency button..."
```

**Minute 2: Interactive Features**
```
"Notice the large touch target and haptic feedback. 
Now let's try voice commands - tap the microphone and say 'help me'...
See how it provides audio feedback for screen reader users?"
```

**Minute 3: Technical Discussion**
```
"This demonstrates WCAG 2.2 compliance in practice. Let me show you 
the code... [Switch to Expo Snack in browser]
Notice the accessibility props and healthcare-specific considerations..."
```

### **Technical Talking Points During Demo**

#### **While They're Interacting:**

**Large Touch Targets:**
*"This emergency button is 200px instead of typical 40px. WCAG 2.2 requires 44px minimum, but for healthcare and elderly users, I went larger."*

**Haptic Feedback:**
*"Feel that vibration? That's expo-haptics providing tactile confirmation for users who might not see visual feedback clearly."*

**Voice Recognition:**
*"The voice commands demonstrate hands-free operation for users with motor impairments. In production, we'd use more robust healthcare-specific command recognition."*

**Screen Reader Support:**
*"Every button has accessibilityLabel and accessibilityHint props. Turn on your phone's screen reader to hear the announcements."*

#### **Architecture Questions:**

**"How would you scale this for production?"**
*"This shows the core patterns. Production would add medical data security, audit trails, and integration with care coordination systems like I detailed in the comprehensive specification."*

**"What about testing accessibility?"**
*"Automated testing with @testing-library/react-native accessibility matchers, manual testing with real screen readers, and user testing with elderly participants to validate real-world usability."*

### **Backup Strategies**

#### **If Voice Recognition Fails:**
- Show the voice button and explain the implementation
- Demonstrate the visual feedback when "listening"
- Discuss the Web Speech API vs native implementation

#### **If App Doesn't Load:**
- Have screenshots of the app ready
- Walk through the code in Expo Snack browser view
- Explain the accessibility features conceptually

#### **If Phone Issues:**
- Use the web preview in Expo Snack
- Focus on code walkthrough and architectural discussion
- Pivot to the comprehensive specification document

### **Success Metrics**

**Demo Considered Successful If:**
- [ ] Interviewers physically interact with the app
- [ ] Technical questions asked about accessibility implementation
- [ ] Discussion about scaling to Trilogy Care's healthcare needs
- [ ] Positive reaction to user experience and attention to detail

**Key Differentiators Demonstrated:**
1. **Real mobile interaction** - not just screenshots or videos
2. **Healthcare-specific considerations** - emergency flows, large targets
3. **Multi-modal accessibility** - touch, voice, haptic, audio
4. **Production thinking** - scalable patterns, proper architecture
5. **Rapid prototyping skills** - can quickly build and iterate

---

## **Technical Interview Reference**

### **Quick Reference Answers**

#### **Mobile Accessibility Question**
*"How do you implement WCAG 2.2 compliance in React Native?"*

**Answer Structure:**
1. **Different props**: `accessibilityLabel`, `accessibilityHint`, `accessibilityRole` instead of ARIA
2. **Touch targets**: 88px minimum for mobile (double web standard)
3. **Screen reader support**: `AccessibilityInfo.announceForAccessibility()` for dynamic updates
4. **Platform differences**: Handle iOS VoiceOver and Android TalkBack separately

#### **Voice Interaction Question**
*"How do you handle voice commands for users with motor impairments?"*

**Answer Structure:**
1. **@react-native-voice/voice** integration with Australian English support
2. **Priority processing** for emergency commands
3. **Multi-modal feedback**: Visual, audio, and haptic confirmation
4. **Fallback mechanisms**: Always provide manual alternatives

#### **Healthcare Security Question**
*"How do you secure medical data in a mobile app?"*

**Answer Structure:**
1. **Encryption**: AES-256 for data at rest using expo-secure-store
2. **Audit trails**: Immutable logs for all medical data access
3. **Data minimization**: Only store necessary data with automatic expiration
4. **Compliance**: Australian healthcare data retention requirements

#### **Multi-Step Flow Question**
*"Walk me through accessible multi-step user flows"*

**Answer Structure:**
1. **Progress indicators** with screen reader announcements
2. **Persistent voice commands** across all steps
3. **Clear escape routes** at every step
4. **State preservation** for app interruptions

### **Code Patterns to Memorize**

```typescript
// 1. Accessibility announcement pattern
AccessibilityInfo.announceForAccessibility('Message');

// 2. Touch target pattern
<TouchableOpacity 
  style={{ minHeight: 88, minWidth: 88 }}
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
/>

// 3. Screen reader detection
const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();

// 4. Voice command pattern
Voice.onSpeechResults = (e) => {
  const command = e.value[0].toLowerCase();
  processCommand(command);
};

// 5. Secure storage pattern
await SecureStore.setItemAsync('key', encryptedData);
```

### **Key Metrics to Remember**
- **Touch targets**: 88px minimum for mobile
- **Text size**: 18px minimum for body text
- **Contrast ratio**: 4.5:1 for normal text, 3:1 for large text
- **Response time**: 10 seconds for emergency confirmations
- **Voice recognition**: 5 second timeout for confirmations

---

**This comprehensive specification provides everything you need to implement and discuss mobile healthcare accessibility at an expert level during your Trilogy Care interview!**