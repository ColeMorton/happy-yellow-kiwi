import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Linking 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CareCoordinator } from '../types/accessibility';
import { SecureStorage } from '../services/SecureStorage';
import { ScreenReaderAnnouncer, WCAG_CONSTANTS } from '../utils/accessibility';
import AccessibleTextInput from '../components/forms/AccessibleTextInput';
import AccessibleSelect from '../components/forms/AccessibleSelect';
import EmergencyButton from '../components/emergency/EmergencyButton';
import { FormValidation } from '../components/forms/FormValidation';

interface CareCoordinatorScreenProps {
  onContactsUpdated?: () => void;
  onCancel?: () => void;
}

export const CareCoordinatorScreen: React.FC<CareCoordinatorScreenProps> = ({
  onContactsUpdated,
  onCancel
}) => {
  const [coordinators, setCoordinators] = useState<CareCoordinator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form fields for adding new coordinator
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const titleOptions = [
    { label: 'Dr. (Doctor)', value: 'Dr.' },
    { label: 'Nurse', value: 'Nurse' },
    { label: 'PA (Physician Assistant)', value: 'PA' },
    { label: 'NP (Nurse Practitioner)', value: 'NP' },
    { label: 'Therapist', value: 'Therapist' },
    { label: 'Social Worker', value: 'Social Worker' },
    { label: 'Case Manager', value: 'Case Manager' },
    { label: 'Pharmacist', value: 'Pharmacist' },
    { label: 'Other', value: 'Other' },
  ];

  const specializationOptions = [
    { label: 'Primary Care', value: 'Primary Care' },
    { label: 'Cardiology', value: 'Cardiology' },
    { label: 'Endocrinology', value: 'Endocrinology' },
    { label: 'Neurology', value: 'Neurology' },
    { label: 'Oncology', value: 'Oncology' },
    { label: 'Psychiatry', value: 'Psychiatry' },
    { label: 'Physical Therapy', value: 'Physical Therapy' },
    { label: 'Mental Health', value: 'Mental Health' },
    { label: 'Emergency Medicine', value: 'Emergency Medicine' },
    { label: 'Other', value: 'Other' },
  ];

  useEffect(() => {
    loadCareCoordinators();
  }, []);

  useEffect(() => {
    ScreenReaderAnnouncer.announce(
      'Care coordinator contacts screen. Manage your healthcare team contact information.',
      { priority: 'medium', delay: 500 }
    );
  }, []);

  const loadCareCoordinators = async () => {
    try {
      // For now, store care coordinators in async storage
      // In a real app, this might be part of the medical profile
      const storedCoordinators = await SecureStorage.getAuditLog();
      // This is a simplified implementation - in practice, you'd have dedicated storage
      setCoordinators([]);
    } catch (error) {
      console.error('Failed to load care coordinators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setName('');
    setTitle('');
    setOrganization('');
    setPhoneNumber('');
    setEmail('');
    setSpecialization('');
    setIsPrimary(false);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const formData: Record<string, string> = {
      name,
      title,
      organization,
      phoneNumber
    };

    if (email) {
      formData.email = email;
    }

    const validationRules: Record<string, any> = {
      name: FormValidation.commonRules.name,
      title: { required: true, minLength: 2, maxLength: 50 },
      organization: { required: true, minLength: 2, maxLength: 100 },
      phoneNumber: FormValidation.commonRules.phone
    };

    if (email) {
      validationRules.email = FormValidation.commonRules.email;
    }

    const validation = FormValidation.validateForm(formData, validationRules);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      ScreenReaderAnnouncer.announce('Please fix the form errors before saving.', { priority: 'high' });
      return false;
    }

    setErrors({});
    return true;
  };

  const addCareCoordinator = async () => {
    if (!validateForm()) return;

    try {
      const newCoordinator: CareCoordinator = {
        id: `coordinator_${Date.now()}`,
        name: FormValidation.sanitizeInput(name),
        title: FormValidation.sanitizeInput(title),
        organization: FormValidation.sanitizeInput(organization),
        phoneNumber: FormValidation.formatPhoneNumber(phoneNumber),
        email: email ? FormValidation.sanitizeInput(email) : undefined,
        specialization: specialization ? FormValidation.sanitizeInput(specialization) : undefined,
        isPrimary
      };

      // If setting as primary, remove primary status from others
      const updatedCoordinators = coordinators.map(coord => ({
        ...coord,
        isPrimary: isPrimary ? false : coord.isPrimary
      }));

      updatedCoordinators.push(newCoordinator);
      setCoordinators(updatedCoordinators);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await ScreenReaderAnnouncer.announce(
        `Added ${newCoordinator.title} ${newCoordinator.name} to your care team.`,
        { priority: 'high' }
      );

      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'care_coordinator_added',
        details: `Added ${newCoordinator.title} ${newCoordinator.name} from ${newCoordinator.organization}`
      });

      clearForm();
      onContactsUpdated?.();
    } catch (error) {
      console.error('Failed to add care coordinator:', error);
      Alert.alert('Error', 'Failed to add care coordinator. Please try again.');
    }
  };

  const removeCareCoordinator = async (coordinatorId: string) => {
    const coordinator = coordinators.find(c => c.id === coordinatorId);
    
    Alert.alert(
      'Remove Care Coordinator',
      `Are you sure you want to remove ${coordinator?.name} from your care team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedCoordinators = coordinators.filter(c => c.id !== coordinatorId);
            setCoordinators(updatedCoordinators);
            
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await ScreenReaderAnnouncer.announce(
              `Removed ${coordinator?.name} from your care team.`,
              { priority: 'high' }
            );

            await SecureStorage.addAuditEntry({
              timestamp: new Date().toISOString(),
              action: 'care_coordinator_removed',
              details: `Removed ${coordinator?.name} from care team`
            });

            onContactsUpdated?.();
          }
        }
      ]
    );
  };

  const contactCoordinator = async (coordinator: CareCoordinator, method: 'call' | 'email') => {
    try {
      if (method === 'call') {
        const phoneUrl = `tel:${coordinator.phoneNumber.replace(/[^\d]/g, '')}`;
        const canOpen = await Linking.canOpenURL(phoneUrl);
        
        if (canOpen) {
          await Haptics.selectionAsync();
          await Linking.openURL(phoneUrl);
          
          await SecureStorage.addAuditEntry({
            timestamp: new Date().toISOString(),
            action: 'care_coordinator_called',
            details: `Initiated call to ${coordinator.name}`
          });
        } else {
          Alert.alert('Error', 'Unable to make phone calls on this device.');
        }
      } else if (method === 'email' && coordinator.email) {
        const emailUrl = `mailto:${coordinator.email}`;
        const canOpen = await Linking.canOpenURL(emailUrl);
        
        if (canOpen) {
          await Haptics.selectionAsync();
          await Linking.openURL(emailUrl);
          
          await SecureStorage.addAuditEntry({
            timestamp: new Date().toISOString(),
            action: 'care_coordinator_emailed',
            details: `Initiated email to ${coordinator.name}`
          });
        } else {
          Alert.alert('Error', 'Unable to send emails on this device.');
        }
      }
    } catch (error) {
      console.error('Failed to contact coordinator:', error);
      Alert.alert('Error', 'Failed to initiate contact. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading care coordinators...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title} accessibilityRole="header">
        Care Coordinators
      </Text>
      
      <Text style={styles.subtitle}>
        Manage your healthcare team contacts for easy communication and emergency situations.
      </Text>

      {/* Existing Coordinators */}
      {coordinators.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Your Care Team
          </Text>
          
          {coordinators.map((coordinator) => (
            <View key={coordinator.id} style={styles.coordinatorCard}>
              <View style={styles.coordinatorHeader}>
                <Text style={styles.coordinatorName}>
                  {coordinator.title} {coordinator.name}
                  {coordinator.isPrimary && (
                    <Text style={styles.primaryBadge}> • Primary</Text>
                  )}
                </Text>
                {coordinator.specialization && (
                  <Text style={styles.coordinatorSpecialization}>
                    {coordinator.specialization}
                  </Text>
                )}
              </View>
              
              <Text style={styles.coordinatorOrganization}>
                {coordinator.organization}
              </Text>
              
              <View style={styles.coordinatorActions}>
                <EmergencyButton
                  onPress={() => contactCoordinator(coordinator, 'call')}
                  size="small"
                  accessibilityLabel={`Call ${coordinator.name}`}
                  accessibilityHint={`Calls ${coordinator.phoneNumber}`}
                  style={styles.callButton}
                />
                
                {coordinator.email && (
                  <EmergencyButton
                    onPress={() => contactCoordinator(coordinator, 'email')}
                    size="small"
                    accessibilityLabel={`Email ${coordinator.name}`}
                    accessibilityHint={`Sends email to ${coordinator.email}`}
                    style={styles.emailButton}
                  />
                )}
                
                <EmergencyButton
                  onPress={() => removeCareCoordinator(coordinator.id)}
                  size="small"
                  accessibilityLabel={`Remove ${coordinator.name} from care team`}
                  style={styles.removeButton}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add New Coordinator Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Add Care Coordinator
        </Text>
        
        <AccessibleTextInput
          label="Name"
          value={name}
          onChangeText={setName}
          required={true}
          errorText={errors.name}
          autoCapitalize="words"
          autoCorrect={false}
          placeholder="Dr. Jane Smith"
        />
        
        <AccessibleSelect
          label="Title"
          options={titleOptions}
          value={title}
          onValueChange={setTitle}
          required={true}
          errorText={errors.title}
          placeholder="Select title"
        />
        
        <AccessibleTextInput
          label="Organization"
          value={organization}
          onChangeText={setOrganization}
          required={true}
          errorText={errors.organization}
          autoCapitalize="words"
          placeholder="City General Hospital"
        />
        
        <AccessibleTextInput
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          required={true}
          errorText={errors.phoneNumber}
          keyboardType="phone-pad"
          placeholder="(555) 123-4567"
        />
        
        <AccessibleTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          errorText={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="doctor@hospital.com (optional)"
        />
        
        <AccessibleSelect
          label="Specialization"
          options={specializationOptions}
          value={specialization}
          onValueChange={setSpecialization}
          placeholder="Select specialization (optional)"
        />
        
        <View style={styles.checkboxContainer}>
          <EmergencyButton
            onPress={() => setIsPrimary(!isPrimary)}
            size="small"
            accessibilityLabel={`Primary care coordinator ${isPrimary ? 'enabled' : 'disabled'}`}
            accessibilityHint="Toggle whether this is your primary care coordinator"
            style={[styles.checkbox, isPrimary && styles.checkboxSelected]}
          />
          <Text style={styles.checkboxLabel}>Primary Care Coordinator</Text>
        </View>
        
        <EmergencyButton
          onPress={addCareCoordinator}
          size="large"
          accessibilityLabel="Add care coordinator"
          accessibilityHint="Adds this person to your care coordinator list"
          style={styles.addButton}
        />
      </View>

      {/* Cancel Button */}
      {onCancel && (
        <View style={styles.buttonContainer}>
          <EmergencyButton
            onPress={onCancel}
            size="medium"
            accessibilityLabel="Cancel and return"
            accessibilityHint="Returns to previous screen without saving"
            style={styles.cancelButton}
          />
        </View>
      )}
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
  coordinatorCard: {
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  coordinatorHeader: {
    marginBottom: 8,
  },
  coordinatorName: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  primaryBadge: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#1976d2',
    fontWeight: '600',
  },
  coordinatorSpecialization: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#666666',
    fontStyle: 'italic',
  },
  coordinatorOrganization: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#555555',
    marginBottom: 12,
  },
  coordinatorActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  callButton: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  emailButton: {
    backgroundColor: '#ff9800',
    borderColor: '#ff9800',
  },
  removeButton: {
    backgroundColor: '#f44336',
    borderColor: '#f44336',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  addButton: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 40,
  },
  cancelButton: {
    backgroundColor: '#666666',
    borderColor: '#666666',
  },
});

export default CareCoordinatorScreen;