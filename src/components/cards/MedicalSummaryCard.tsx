import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MedicalProfile } from '../../types/accessibility';
import { WCAG_CONSTANTS } from '../../utils/accessibility';

interface MedicalSummaryCardProps {
  medicalProfile: MedicalProfile;
  compact?: boolean;
  style?: any;
}

export const MedicalSummaryCard: React.FC<MedicalSummaryCardProps> = ({
  medicalProfile,
  compact = false,
  style
}) => {
  const { personalInfo, emergencyContacts, medicalConditions } = medicalProfile;
  const primaryContact = emergencyContacts.find(contact => contact.isPrimary);

  const renderCompactView = () => (
    <View style={[styles.card, styles.compactCard, style]}>
      <View style={styles.header}>
        <Text style={styles.compactName} accessibilityRole="header">
          {personalInfo.firstName} {personalInfo.lastName}
        </Text>
        {personalInfo.bloodType && (
          <Text style={styles.bloodTypeBadge}>
            {personalInfo.bloodType}
          </Text>
        )}
      </View>
      
      {personalInfo.allergies.length > 0 && (
        <View style={styles.compactSection}>
          <Text style={styles.compactLabel}>⚠️ Allergies:</Text>
          <Text style={styles.compactValue}>
            {personalInfo.allergies.slice(0, 2).join(', ')}
            {personalInfo.allergies.length > 2 && ` (+${personalInfo.allergies.length - 2} more)`}
          </Text>
        </View>
      )}
      
      {primaryContact && (
        <View style={styles.compactSection}>
          <Text style={styles.compactLabel}>📞 Emergency:</Text>
          <Text style={styles.compactValue}>
            {primaryContact.name} - {primaryContact.phoneNumber}
          </Text>
        </View>
      )}
    </View>
  );

  const renderFullView = () => (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.fullName} accessibilityRole="header">
          {personalInfo.firstName} {personalInfo.lastName}
        </Text>
        <Text style={styles.lastUpdated}>
          Updated: {new Date(medicalProfile.lastUpdated).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date of Birth:</Text>
            <Text style={styles.infoValue}>
              {new Date(personalInfo.dateOfBirth).toLocaleDateString()}
            </Text>
          </View>
          {personalInfo.bloodType && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Blood Type:</Text>
              <Text style={[styles.infoValue, styles.bloodTypeText]}>
                {personalInfo.bloodType}
              </Text>
            </View>
          )}
        </View>
      </View>

      {personalInfo.allergies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Allergies</Text>
          <View style={styles.tagContainer}>
            {personalInfo.allergies.map((allergy, index) => (
              <View key={index} style={styles.allergyTag}>
                <Text style={styles.tagText}>{allergy}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {personalInfo.medications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Current Medications</Text>
          <View style={styles.tagContainer}>
            {personalInfo.medications.map((medication, index) => (
              <View key={index} style={styles.medicationTag}>
                <Text style={styles.tagText}>{medication}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {medicalConditions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏥 Medical Conditions</Text>
          <View style={styles.tagContainer}>
            {medicalConditions.map((condition, index) => (
              <View key={index} style={styles.conditionTag}>
                <Text style={styles.tagText}>{condition}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {emergencyContacts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Emergency Contacts</Text>
          {emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactItem}>
              <Text style={styles.contactName}>
                {contact.name}
                {contact.isPrimary && (
                  <Text style={styles.primaryBadge}> • Primary</Text>
                )}
              </Text>
              <Text style={styles.contactDetails}>
                {contact.phoneNumber} • {contact.relationship}
              </Text>
            </View>
          ))}
        </View>
      )}

      {medicalProfile.additionalNotes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Additional Notes</Text>
          <Text style={styles.notesText}>
            {medicalProfile.additionalNotes}
          </Text>
        </View>
      )}
    </View>
  );

  return compact ? renderCompactView() : renderFullView();
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  compactCard: {
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  compactName: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  lastUpdated: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE - 2,
    color: '#666666',
    fontStyle: 'italic',
  },
  bloodTypeBadge: {
    backgroundColor: '#f44336',
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 40,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: WCAG_CONSTANTS.LARGE_FONT_SIZE,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    minWidth: 120,
  },
  infoLabel: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#666666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#333333',
    fontWeight: '500',
  },
  bloodTypeText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  medicationTag: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  conditionTag: {
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#333333',
    fontWeight: '500',
  },
  contactItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactName: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  primaryBadge: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE - 2,
    color: '#1976d2',
    fontWeight: '600',
  },
  contactDetails: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE - 2,
    color: '#666666',
  },
  notesText: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE,
    color: '#555555',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  compactSection: {
    marginBottom: 8,
  },
  compactLabel: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE - 2,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 2,
  },
  compactValue: {
    fontSize: WCAG_CONSTANTS.MINIMUM_FONT_SIZE - 2,
    color: '#333333',
  },
});

export default MedicalSummaryCard;