import * as SMS from 'expo-sms';
import { EmergencyContact, MedicalProfile, EmergencySession } from '../types/accessibility';
import { SecureStorage } from './SecureStorage';
import { LocationService, LocationData } from './LocationService';

export class EmergencyContactService {
  static async notifyEmergencyContacts(
    medicalProfile: MedicalProfile,
    emergencySession: EmergencySession,
    location?: LocationData
  ): Promise<string[]> {
    const notifiedContacts: string[] = [];

    try {
      // Check if SMS is available
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        console.warn('SMS is not available on this device');
        await SecureStorage.addAuditEntry({
          timestamp: new Date().toISOString(),
          action: 'sms_not_available',
          details: 'SMS functionality not available on device'
        });
        return notifiedContacts;
      }

      // Get primary emergency contacts first
      const primaryContacts = medicalProfile.emergencyContacts.filter(contact => contact.isPrimary);
      const secondaryContacts = medicalProfile.emergencyContacts.filter(contact => !contact.isPrimary);

      // Notify primary contacts first
      for (const contact of primaryContacts) {
        const success = await this.sendEmergencyText(contact, medicalProfile, emergencySession, location);
        if (success) {
          notifiedContacts.push(contact.name);
        }
      }

      // If no primary contacts were notified, try secondary contacts
      if (notifiedContacts.length === 0) {
        for (const contact of secondaryContacts) {
          const success = await this.sendEmergencyText(contact, medicalProfile, emergencySession, location);
          if (success) {
            notifiedContacts.push(contact.name);
          }
        }
      }

      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'emergency_contacts_notified',
        details: `Notified ${notifiedContacts.length} contacts: ${notifiedContacts.join(', ')}`
      });

      return notifiedContacts;
    } catch (error) {
      console.error('Failed to notify emergency contacts:', error);
      
      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'emergency_notification_failed',
        details: `Error: ${error}`
      });

      return notifiedContacts;
    }
  }

  private static async sendEmergencyText(
    contact: EmergencyContact,
    medicalProfile: MedicalProfile,
    emergencySession: EmergencySession,
    location?: LocationData
  ): Promise<boolean> {
    try {
      const message = this.buildEmergencyMessage(medicalProfile, emergencySession, location);
      
      const result = await SMS.sendSMSAsync([contact.phoneNumber], message);
      
      if (result.result === 'sent') {
        await SecureStorage.addAuditEntry({
          timestamp: new Date().toISOString(),
          action: 'emergency_sms_sent',
          details: `SMS sent to ${contact.name} (${contact.relationship}) at ${contact.phoneNumber}`
        });
        return true;
      } else {
        console.warn(`SMS to ${contact.name} was not sent:`, result);
        await SecureStorage.addAuditEntry({
          timestamp: new Date().toISOString(),
          action: 'emergency_sms_failed',
          details: `SMS to ${contact.name} failed: ${result.result}`
        });
        return false;
      }
    } catch (error) {
      console.error(`Failed to send SMS to ${contact.name}:`, error);
      
      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'emergency_sms_error',
        details: `SMS to ${contact.name} error: ${error}`
      });

      return false;
    }
  }

  private static buildEmergencyMessage(
    medicalProfile: MedicalProfile,
    emergencySession: EmergencySession,
    location?: LocationData
  ): string {
    const { firstName, lastName } = medicalProfile.personalInfo;
    const startTime = new Date(emergencySession.startTime).toLocaleString();
    
    let message = `🚨 EMERGENCY ALERT 🚨\n\n`;
    message += `${firstName} ${lastName} has activated an emergency response.\n\n`;
    message += `Time: ${startTime}\n`;
    message += `Emergency ID: ${emergencySession.id}\n\n`;

    if (location) {
      message += `📍 Location: ${LocationService.formatLocationForSharing(location)}\n`;
      message += `Map: ${LocationService.formatLocationForMaps(location)}\n\n`;
    } else {
      message += `📍 Location: Unavailable (location services disabled or permission denied)\n\n`;
    }

    // Add critical medical information
    if (medicalProfile.personalInfo.bloodType) {
      message += `🩸 Blood Type: ${medicalProfile.personalInfo.bloodType}\n`;
    }

    if (medicalProfile.personalInfo.allergies.length > 0) {
      message += `⚠️ Allergies: ${medicalProfile.personalInfo.allergies.join(', ')}\n`;
    }

    if (medicalProfile.personalInfo.medications.length > 0) {
      message += `💊 Medications: ${medicalProfile.personalInfo.medications.join(', ')}\n`;
    }

    if (medicalProfile.medicalConditions.length > 0) {
      message += `🏥 Conditions: ${medicalProfile.medicalConditions.join(', ')}\n`;
    }

    message += `\nEmergency services have been contacted. This is an automated message from the Trilogy Care Emergency App.`;

    return message;
  }

  static async validateEmergencyContacts(contacts: EmergencyContact[]): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    if (contacts.length === 0) {
      errors.push('At least one emergency contact is required');
    }

    const hasPrimary = contacts.some(contact => contact.isPrimary);
    if (!hasPrimary) {
      errors.push('At least one primary emergency contact is required');
    }

    for (const contact of contacts) {
      if (!contact.name.trim()) {
        errors.push(`Contact name is required`);
      }

      if (!contact.phoneNumber.trim()) {
        errors.push(`Phone number is required for ${contact.name || 'contact'}`);
      } else if (!this.isValidPhoneNumber(contact.phoneNumber)) {
        errors.push(`Invalid phone number for ${contact.name}: ${contact.phoneNumber}`);
      }

      if (!contact.relationship.trim()) {
        errors.push(`Relationship is required for ${contact.name || 'contact'}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation - accepts various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
    return phoneRegex.test(cleanNumber) && cleanNumber.length >= 10;
  }

  static formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phoneNumber; // Return original if we can't format it
  }

  static async getEmergencyContactsStatus(medicalProfile: MedicalProfile | null): Promise<{
    hasContacts: boolean;
    hasPrimaryContact: boolean;
    contactCount: number;
    isReady: boolean;
  }> {
    if (!medicalProfile) {
      return {
        hasContacts: false,
        hasPrimaryContact: false,
        contactCount: 0,
        isReady: false
      };
    }

    const contacts = medicalProfile.emergencyContacts;
    const hasContacts = contacts.length > 0;
    const hasPrimaryContact = contacts.some(contact => contact.isPrimary);
    const validation = await this.validateEmergencyContacts(contacts);

    return {
      hasContacts,
      hasPrimaryContact,
      contactCount: contacts.length,
      isReady: hasContacts && hasPrimaryContact && validation.isValid
    };
  }
}