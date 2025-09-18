import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MedicalProfile, EmergencyContact } from '../types/accessibility';
import { SecureStorage } from '../services/SecureStorage';
import { LocationService } from '../services/LocationService';
import { ScreenReaderAnnouncer, WCAG_CONSTANTS } from '../utils/accessibility';
import AccessibleTextInput from '../components/forms/AccessibleTextInput';
import AccessibleSelect from '../components/forms/AccessibleSelect';
import EmergencyButton from '../components/emergency/EmergencyButton';
import { FormValidation, ValidationRule } from '../components/forms/FormValidation';

interface MedicalProfileScreenProps {
  onProfileSaved?: () => void;
  onCancel?: () => void;
}

export const MedicalProfileScreen: React.FC<MedicalProfileScreenProps> = ({
  onProfileSaved,
  onCancel
}) => {
  const [profile, setProfile] = useState<Partial<MedicalProfile>>({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      bloodType: '',
      allergies: [],
      medications: []
    },
    emergencyContacts: [],
    medicalConditions: [],
    additionalNotes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<string>('unknown');

  // Form fields for allergies, medications, and conditions
  const [allergyInput, setAllergyInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');
  const [isEmergencyContactPrimary, setIsEmergencyContactPrimary] = useState(false);

  const bloodTypeOptions = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
  ];

  const relationshipOptions = [
    { label: 'Spouse', value: 'Spouse' },
    { label: 'Parent', value: 'Parent' },
    { label: 'Child', value: 'Child' },
    { label: 'Sibling', value: 'Sibling' },
    { label: 'Friend', value: 'Friend' },
    { label: 'Caregiver', value: 'Caregiver' },
    { label: 'Doctor', value: 'Doctor' },
    { label: 'Other', value: 'Other' },
  ];

  useEffect(() => {
    loadExistingProfile();
    checkLocationPermissionStatus();
  }, []);

  useEffect(() => {
    ScreenReaderAnnouncer.announce(
      'Medical profile setup screen. Fill out your medical information for emergency situations.',
      { priority: 'medium', delay: 500 }
    );
  }, []);

  const loadExistingProfile = async () => {
    try {
      const existingProfile = await SecureStorage.getMedicalProfile();
      if (existingProfile) {
        setProfile(existingProfile);
      }
    } catch (error) {
      console.error('Failed to load medical profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkLocationPermissionStatus = async () => {
    try {
      const status = await LocationService.getLocationStatus();
      if (status.canGetLocation) {
        setLocationPermissionStatus('granted');
      } else if (!status.hasPermission) {
        setLocationPermissionStatus('denied');
      } else if (!status.isEnabled) {
        setLocationPermissionStatus('disabled');
      } else {
        setLocationPermissionStatus('unknown');
      }
    } catch (error) {
      console.error('Failed to check location permission status:', error);
      setLocationPermissionStatus('error');
    }
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await LocationService.requestPermissions();
      if (granted) {
        setLocationPermissionStatus('granted');
        await ScreenReaderAnnouncer.announce(
          'Location permission granted. This will help share your location during emergencies.',
          { priority: 'high' }
        );
      } else {
        setLocationPermissionStatus('denied');
        await ScreenReaderAnnouncer.announce(
          'Location permission denied. Emergency services will still be contacted without location information.',
          { priority: 'medium' }
        );
      }
    } catch (error) {
      console.error('Failed to request location permission:', error);
      setLocationPermissionStatus('error');
    }
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo!,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addAllergy = () => {
    if (!allergyInput.trim()) return;
    
    const validation = FormValidation.validateField(allergyInput, FormValidation.commonRules.allergy);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, allergy: validation.error! }));
      return;
    }

    const sanitized = FormValidation.sanitizeInput(allergyInput);
    setProfile(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo!,
        allergies: [...(prev.personalInfo?.allergies || []), sanitized]
      }
    }));
    setAllergyInput('');
    setErrors(prev => ({ ...prev, allergy: '' }));
  };

  const removeAllergy = (index: number) => {
    setProfile(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo!,
        allergies: prev.personalInfo?.allergies?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addMedication = () => {
    if (!medicationInput.trim()) return;
    
    const validation = FormValidation.validateField(medicationInput, FormValidation.commonRules.medication);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, medication: validation.error! }));
      return;
    }

    const sanitized = FormValidation.sanitizeInput(medicationInput);
    setProfile(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo!,
        medications: [...(prev.personalInfo?.medications || []), sanitized]
      }
    }));
    setMedicationInput('');
    setErrors(prev => ({ ...prev, medication: '' }));
  };

  const removeMedication = (index: number) => {
    setProfile(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo!,
        medications: prev.personalInfo?.medications?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addMedicalCondition = () => {
    if (!conditionInput.trim()) return;
    
    const validation = FormValidation.validateField(conditionInput, FormValidation.commonRules.medicalCondition);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, condition: validation.error! }));
      return;
    }

    const sanitized = FormValidation.sanitizeInput(conditionInput);
    setProfile(prev => ({
      ...prev,
      medicalConditions: [...(prev.medicalConditions || []), sanitized]
    }));
    setConditionInput('');
    setErrors(prev => ({ ...prev, condition: '' }));
  };

  const removeMedicalCondition = (index: number) => {
    setProfile(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions?.filter((_, i) => i !== index) || []
    }));
  };

  const addEmergencyContact = () => {
    const contactData = {
      name: emergencyContactName,
      phone: emergencyContactPhone,
      relationship: emergencyContactRelationship
    };

    const validationRules = {
      name: FormValidation.commonRules.emergencyContactName,
      phone: FormValidation.commonRules.phone,
      relationship: FormValidation.commonRules.emergencyContactRelationship
    };

    const validation = FormValidation.validateForm(contactData, validationRules);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, ...validation.errors }));
      return;
    }

    const newContact: EmergencyContact = {
      id: `contact_${Date.now()}`,
      name: FormValidation.sanitizeInput(emergencyContactName),
      phoneNumber: FormValidation.formatPhoneNumber(emergencyContactPhone),
      relationship: FormValidation.sanitizeInput(emergencyContactRelationship),
      isPrimary: isEmergencyContactPrimary
    };

    setProfile(prev => ({
      ...prev,
      emergencyContacts: [...(prev.emergencyContacts || []), newContact]
    }));

    // Clear form
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setEmergencyContactRelationship('');
    setIsEmergencyContactPrimary(false);
    setErrors(prev => ({ ...prev, name: '', phone: '', relationship: '' }));
  };

  const removeEmergencyContact = (id: string) => {
    setProfile(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts?.filter(contact => contact.id !== id) || []
    }));
  };

  const validateAndSave = async () => {
    const personalInfo = profile.personalInfo!;
    
    const validationData: Record<string, string> = {
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      dateOfBirth: personalInfo.dateOfBirth
    };

    const validationRules: Record<string, any> = {
      firstName: FormValidation.commonRules.name,
      lastName: FormValidation.commonRules.name,
      dateOfBirth: FormValidation.commonRules.dateOfBirth
    };

    if (personalInfo.bloodType) {
      validationData.bloodType = personalInfo.bloodType;
      validationRules.bloodType = FormValidation.commonRules.bloodType;
    }

    const validation = FormValidation.validateForm(validationData, validationRules);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      ScreenReaderAnnouncer.announce('Please fix the form errors before saving.', { priority: 'high' });
      return;
    }

    // Check for at least one emergency contact
    if (!profile.emergencyContacts || profile.emergencyContacts.length === 0) {
      Alert.alert(
        'Emergency Contact Required',
        'Please add at least one emergency contact before saving your profile.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSaving(true);

    try {
      const completeProfile: MedicalProfile = {
        id: profile.id || `profile_${Date.now()}`,
        personalInfo: {
          firstName: FormValidation.sanitizeInput(personalInfo.firstName),
          lastName: FormValidation.sanitizeInput(personalInfo.lastName),
          dateOfBirth: personalInfo.dateOfBirth,
          bloodType: personalInfo.bloodType ? FormValidation.formatBloodType(personalInfo.bloodType) : undefined,
          allergies: personalInfo.allergies || [],
          medications: personalInfo.medications || []
        },
        emergencyContacts: profile.emergencyContacts,
        medicalConditions: profile.medicalConditions || [],
        additionalNotes: profile.additionalNotes || '',
        lastUpdated: new Date().toISOString()
      };

      await SecureStorage.saveMedicalProfile(completeProfile);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await ScreenReaderAnnouncer.announce('Medical profile saved successfully.', { priority: 'high' });

      Alert.alert(
        'Profile Saved',
        'Your medical profile has been saved securely.',
        [
          {
            text: 'OK',
            onPress: () => onProfileSaved?.()
          }
        ]
      );
    } catch (error) {
      console.error('Failed to save medical profile:', error);
      Alert.alert(
        'Save Failed',
        'There was an error saving your profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading medical profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title} accessibilityRole="header">
        Medical Profile
      </Text>
      
      <Text style={styles.subtitle}>
        This information will be shared with emergency services and your contacts during an emergency.
      </Text>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Personal Information
        </Text>
        
        <AccessibleTextInput
          label="First Name"
          value={profile.personalInfo?.firstName || ''}
          onChangeText={(value) => updatePersonalInfo('firstName', value)}
          required={true}
          errorText={errors.firstName}
          autoCapitalize="words"
          autoCorrect={false}
        />
        
        <AccessibleTextInput
          label="Last Name"
          value={profile.personalInfo?.lastName || ''}
          onChangeText={(value) => updatePersonalInfo('lastName', value)}
          required={true}
          errorText={errors.lastName}
          autoCapitalize="words"
          autoCorrect={false}
        />
        
        <AccessibleTextInput
          label="Date of Birth"
          value={profile.personalInfo?.dateOfBirth || ''}
          onChangeText={(value) => updatePersonalInfo('dateOfBirth', value)}
          required={true}
          errorText={errors.dateOfBirth}
          placeholder="YYYY-MM-DD"
          helperText="Format: YYYY-MM-DD (e.g., 1990-01-15)"
          keyboardType="numeric"
        />
        
        <AccessibleSelect
          label="Blood Type"
          options={bloodTypeOptions}
          value={profile.personalInfo?.bloodType || ''}
          onValueChange={(value) => updatePersonalInfo('bloodType', value)}
          placeholder="Select blood type (optional)"
          errorText={errors.bloodType}
        />
      </View>

      {/* Allergies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Allergies
        </Text>
        
        <View style={styles.addItemContainer}>
          <AccessibleTextInput
            label="Add Allergy"
            value={allergyInput}
            onChangeText={setAllergyInput}
            errorText={errors.allergy}
            placeholder="e.g., Penicillin, Peanuts"
            containerStyle={styles.addItemInput}
          />
          <EmergencyButton
            onPress={addAllergy}
            size="small"
            accessibilityLabel="Add allergy"
            accessibilityHint="Adds the allergy to your medical profile"
            style={styles.addButton}
          />
        </View>
        
        {profile.personalInfo?.allergies?.map((allergy, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listItemText}>{allergy}</Text>
            <EmergencyButton
              onPress={() => removeAllergy(index)}
              size="small"
              accessibilityLabel={`Remove ${allergy} allergy`}
              style={styles.removeButton}
            />
          </View>
        ))}
      </View>

      {/* Medications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Current Medications
        </Text>
        
        <View style={styles.addItemContainer}>
          <AccessibleTextInput
            label="Add Medication"
            value={medicationInput}
            onChangeText={setMedicationInput}
            errorText={errors.medication}
            placeholder="e.g., Aspirin 325mg daily"
            containerStyle={styles.addItemInput}
          />
          <EmergencyButton
            onPress={addMedication}
            size="small"
            accessibilityLabel="Add medication"
            accessibilityHint="Adds the medication to your medical profile"
            style={styles.addButton}
          />
        </View>
        
        {profile.personalInfo?.medications?.map((medication, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listItemText}>{medication}</Text>
            <EmergencyButton
              onPress={() => removeMedication(index)}
              size="small"
              accessibilityLabel={`Remove ${medication} medication`}
              style={styles.removeButton}
            />
          </View>
        ))}
      </View>

      {/* Medical Conditions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Medical Conditions
        </Text>
        
        <View style={styles.addItemContainer}>
          <AccessibleTextInput
            label="Add Medical Condition"
            value={conditionInput}
            onChangeText={setConditionInput}
            errorText={errors.condition}
            placeholder="e.g., Diabetes, Hypertension"
            containerStyle={styles.addItemInput}
          />
          <EmergencyButton
            onPress={addMedicalCondition}
            size="small"
            accessibilityLabel="Add medical condition"
            accessibilityHint="Adds the condition to your medical profile"
            style={styles.addButton}
          />
        </View>
        
        {profile.medicalConditions?.map((condition, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listItemText}>{condition}</Text>
            <EmergencyButton
              onPress={() => removeMedicalCondition(index)}
              size="small"
              accessibilityLabel={`Remove ${condition} condition`}
              style={styles.removeButton}
            />
          </View>
        ))}
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Emergency Contacts
        </Text>
        
        <AccessibleTextInput
          label="Contact Name"
          value={emergencyContactName}
          onChangeText={setEmergencyContactName}
          errorText={errors.name}
          autoCapitalize="words"
          autoCorrect={false}
        />
        
        <AccessibleTextInput
          label="Phone Number"
          value={emergencyContactPhone}
          onChangeText={setEmergencyContactPhone}
          errorText={errors.phone}
          keyboardType="phone-pad"
          placeholder="(555) 123-4567"
        />
        
        <AccessibleSelect
          label="Relationship"
          options={relationshipOptions}
          value={emergencyContactRelationship}
          onValueChange={setEmergencyContactRelationship}
          errorText={errors.relationship}
          placeholder="Select relationship"
        />
        
        <View style={styles.checkboxContainer}>
          <EmergencyButton
            onPress={() => setIsEmergencyContactPrimary(!isEmergencyContactPrimary)}
            size="small"
            accessibilityLabel={`Primary contact ${isEmergencyContactPrimary ? 'enabled' : 'disabled'}`}
            accessibilityHint="Toggle whether this is a primary emergency contact"
            style={[styles.checkbox, isEmergencyContactPrimary && styles.checkboxSelected]}
          />
          <Text style={styles.checkboxLabel}>Primary Contact</Text>
        </View>
        
        <EmergencyButton
          onPress={addEmergencyContact}
          size="medium"
          accessibilityLabel="Add emergency contact"
          accessibilityHint="Adds this contact to your emergency contact list"
          style={styles.addContactButton}
        />
        
        {profile.emergencyContacts?.map((contact) => (
          <View key={contact.id} style={styles.contactItem}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactDetails}>
                {contact.phoneNumber} • {contact.relationship}
                {contact.isPrimary && ' • Primary'}
              </Text>
            </View>
            <EmergencyButton
              onPress={() => removeEmergencyContact(contact.id)}
              size="small"
              accessibilityLabel={`Remove ${contact.name} from emergency contacts`}
              style={styles.removeButton}
            />
          </View>
        ))}
      </View>

      {/* Location Permission */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Emergency Location Sharing
        </Text>
        
        <View style={styles.locationPermissionCard}>
          <Text style={styles.locationPermissionTitle}>
            📍 Location Permission Status: {
              locationPermissionStatus === 'granted' ? '✅ Granted' :
              locationPermissionStatus === 'denied' ? '❌ Denied' :
              locationPermissionStatus === 'disabled' ? '⚠️ Disabled' :
              '❓ Unknown'
            }
          </Text>
          
          <Text style={styles.locationPermissionDescription}>
            {locationPermissionStatus === 'granted' ? 
              'Your location can be shared with emergency services during emergencies.' :
              'Location sharing helps emergency services find you faster. This is optional but recommended for emergency situations.'
            }
          </Text>
          
          {locationPermissionStatus !== 'granted' && (
            <EmergencyButton
              onPress={requestLocationPermission}
              size="medium"
              accessibilityLabel="Request location permission"
              accessibilityHint="Requests permission to share your location during emergencies"
              style={styles.locationPermissionButton}
            />
          )}
        </View>
      </View>

      {/* Additional Notes */}
      <View style={styles.section}>
        <AccessibleTextInput
          label="Additional Notes"
          value={profile.additionalNotes || ''}
          onChangeText={(value) => setProfile(prev => ({ ...prev, additionalNotes: value }))}
          placeholder="Any additional medical information..."
          multiline={true}
          numberOfLines={4}
          helperText="Optional: Any other medical information that might be helpful in an emergency"
        />
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <EmergencyButton
          onPress={validateAndSave}
          disabled={isSaving}
          size="large"
          accessibilityLabel={isSaving ? "Saving medical profile" : "Save medical profile"}
          accessibilityHint="Saves your medical information securely"
          style={styles.saveButton}
        />
        
        {onCancel && (
          <EmergencyButton
            onPress={onCancel}
            size="medium"
            accessibilityLabel="Cancel profile setup"
            accessibilityHint="Returns to previous screen without saving"
            style={styles.cancelButton}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    color: '#666666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  addItemInput: {
    flex: 1,
    marginRight: 12,
    marginBottom: 0,
  },
  addButton: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#333333',
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#f44336',
    borderColor: '#f44336',
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#dddddd',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  checkboxLabel: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#333333',
  },
  addContactButton: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginBottom: 8,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  contactDetails: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#666666',
  },
  buttonContainer: {
    gap: 16,
    marginTop: 32,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#666666',
    borderColor: '#666666',
  },
  locationPermissionCard: {
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  locationPermissionTitle: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  locationPermissionDescription: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#1565c0',
    lineHeight: 20,
    marginBottom: 12,
  },
  locationPermissionButton: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
});

export default MedicalProfileScreen;