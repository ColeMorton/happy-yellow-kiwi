import * as SecureStore from 'expo-secure-store';
import { MedicalProfile, EmergencySession, AuditEntry } from '../types/accessibility';
import { EncryptedAsyncStorage } from './EncryptedAsyncStorage';

export class SecureStorage {
  private static readonly MEDICAL_PROFILE_KEY = 'medical_profile';
  private static readonly EMERGENCY_SESSION_KEY = 'emergency_session';
  private static readonly AUDIT_LOG_KEY = 'audit_log';
  
  // Threshold for using SecureStore vs EncryptedAsyncStorage (1.5KB to be safe)
  private static readonly SECURE_STORE_SIZE_LIMIT = 1536;

  /**
   * Determine storage method based on data size
   */
  private static async storeData(key: string, data: string): Promise<void> {
    if (data.length <= this.SECURE_STORE_SIZE_LIMIT) {
      await SecureStore.setItemAsync(key, data);
    } else {
      await EncryptedAsyncStorage.setItem(key, data);
      // Clear from SecureStore if it exists there
      try {
        await SecureStore.deleteItemAsync(key);
      } catch {
        // Ignore if not found in SecureStore
      }
    }
  }

  /**
   * Retrieve data from either storage method
   */
  private static async retrieveData(key: string): Promise<string | null> {
    // Try SecureStore first
    try {
      const data = await SecureStore.getItemAsync(key);
      if (data) {
        return data;
      }
    } catch {
      // Continue to try EncryptedAsyncStorage
    }

    // Try EncryptedAsyncStorage
    return await EncryptedAsyncStorage.getItem(key);
  }

  /**
   * Remove data from both storage methods
   */
  private static async removeData(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore if not found in SecureStore
    }
    
    try {
      await EncryptedAsyncStorage.removeItem(key);
    } catch {
      // Ignore if not found in EncryptedAsyncStorage
    }
  }

  // Medical Profile Storage
  static async saveMedicalProfile(profile: MedicalProfile): Promise<void> {
    try {
      const profileData = JSON.stringify(profile);
      await this.storeData(this.MEDICAL_PROFILE_KEY, profileData);
      
      // Log data access
      await this.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'medical_profile_saved',
        details: `Profile updated for ${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`
      });
    } catch (error) {
      throw new Error(`Failed to save medical profile: ${error}`);
    }
  }

  static async getMedicalProfile(): Promise<MedicalProfile | null> {
    try {
      const profileData = await this.retrieveData(this.MEDICAL_PROFILE_KEY);
      
      if (!profileData) {
        return null;
      }

      const profile = JSON.parse(profileData) as MedicalProfile;
      
      // Log data access
      await this.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'medical_profile_accessed',
        details: `Profile accessed for ${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`
      });

      return profile;
    } catch (error) {
      throw new Error(`Failed to retrieve medical profile: ${error}`);
    }
  }

  static async deleteMedicalProfile(): Promise<void> {
    try {
      await this.removeData(this.MEDICAL_PROFILE_KEY);
      
      await this.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'medical_profile_deleted',
        details: 'Medical profile permanently deleted'
      });
    } catch (error) {
      throw new Error(`Failed to delete medical profile: ${error}`);
    }
  }

  // Emergency Session Storage
  static async saveEmergencySession(session: EmergencySession): Promise<void> {
    try {
      const sessionData = JSON.stringify(session);
      await this.storeData(this.EMERGENCY_SESSION_KEY, sessionData);
      
      await this.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'emergency_session_saved',
        details: `Session ${session.id} saved with status: ${session.status}`
      });
    } catch (error) {
      throw new Error(`Failed to save emergency session: ${error}`);
    }
  }

  static async getEmergencySession(): Promise<EmergencySession | null> {
    try {
      const sessionData = await this.retrieveData(this.EMERGENCY_SESSION_KEY);
      
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData) as EmergencySession;
      
      await this.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'emergency_session_accessed',
        details: `Session ${session.id} accessed`
      });

      return session;
    } catch (error) {
      throw new Error(`Failed to retrieve emergency session: ${error}`);
    }
  }

  static async deleteEmergencySession(): Promise<void> {
    try {
      await this.removeData(this.EMERGENCY_SESSION_KEY);
      
      await this.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'emergency_session_deleted',
        details: 'Emergency session data cleared'
      });
    } catch (error) {
      throw new Error(`Failed to delete emergency session: ${error}`);
    }
  }

  // Audit Logging
  static async addAuditEntry(entry: AuditEntry): Promise<void> {
    try {
      const existingLogData = await this.retrieveData(this.AUDIT_LOG_KEY);
      let auditLog: AuditEntry[] = [];
      
      if (existingLogData) {
        auditLog = JSON.parse(existingLogData);
      }
      
      auditLog.push(entry);
      
      // Keep only last 50 entries to prevent storage bloat (reduced from 100)
      if (auditLog.length > 50) {
        auditLog = auditLog.slice(-50);
      }
      
      const auditLogData = JSON.stringify(auditLog);
      await this.storeData(this.AUDIT_LOG_KEY, auditLogData);
    } catch (error) {
      console.error('Failed to add audit entry:', error);
      // Don't throw here as audit logging shouldn't break main functionality
    }
  }

  static async getAuditLog(): Promise<AuditEntry[]> {
    try {
      const logData = await this.retrieveData(this.AUDIT_LOG_KEY);
      
      if (!logData) {
        return [];
      }

      return JSON.parse(logData) as AuditEntry[];
    } catch (error) {
      console.error('Failed to retrieve audit log:', error);
      return [];
    }
  }

  static async clearAuditLog(): Promise<void> {
    try {
      await this.removeData(this.AUDIT_LOG_KEY);
      
      // This is the only audit entry that doesn't get logged to prevent recursion
      console.log('Audit log cleared at:', new Date().toISOString());
    } catch (error) {
      console.error('Failed to clear audit log:', error);
    }
  }

  // Utility method to check if secure storage is available
  static async isAvailable(): Promise<boolean> {
    try {
      return await SecureStore.isAvailableAsync();
    } catch (error) {
      return false;
    }
  }

  // Utility method to clear all stored data (for testing/reset)
  static async clearAllData(): Promise<void> {
    try {
      await this.deleteMedicalProfile();
      await this.deleteEmergencySession();
      await this.clearAuditLog();
      
      // Clear all encrypted storage keys
      await EncryptedAsyncStorage.clearAll([
        this.MEDICAL_PROFILE_KEY,
        this.EMERGENCY_SESSION_KEY,
        this.AUDIT_LOG_KEY
      ]);
    } catch (error) {
      throw new Error(`Failed to clear all data: ${error}`);
    }
  }
}