import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MedicationReminder, MedicationFrequency } from '../types/accessibility';
import { SecureStorage } from './SecureStorage';

export class MedicationReminderService {
  private static readonly STORAGE_KEY = 'medication_reminders';
  private static readonly SETTINGS_KEY = 'medication_settings';

  // Configure notification handler
  static async initialize(): Promise<void> {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Notification permission not granted');
      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'notification_permission_denied',
        details: 'User denied notification permissions for medication reminders'
      });
    } else {
      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'notification_permission_granted',
        details: 'User granted notification permissions for medication reminders'
      });
    }
  }

  static async getAllReminders(): Promise<MedicationReminder[]> {
    try {
      const remindersJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!remindersJson) return [];
      
      const reminders = JSON.parse(remindersJson) as MedicationReminder[];
      
      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'medication_reminders_accessed',
        details: `Retrieved ${reminders.length} medication reminders`
      });
      
      return reminders;
    } catch (error) {
      console.error('Failed to get medication reminders:', error);
      return [];
    }
  }

  static async saveReminder(reminder: MedicationReminder): Promise<boolean> {
    try {
      const reminders = await this.getAllReminders();
      const existingIndex = reminders.findIndex(r => r.id === reminder.id);
      
      if (existingIndex >= 0) {
        reminders[existingIndex] = reminder;
      } else {
        reminders.push(reminder);
      }
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(reminders));
      
      // Schedule notifications for this reminder
      if (reminder.isActive) {
        await this.scheduleNotificationsForReminder(reminder);
      } else {
        await this.cancelNotificationsForReminder(reminder.id);
      }
      
      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'medication_reminder_saved',
        details: `Saved reminder for ${reminder.medicationName} - ${reminder.dosage}`
      });
      
      return true;
    } catch (error) {
      console.error('Failed to save medication reminder:', error);
      
      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'medication_reminder_save_failed',
        details: `Failed to save reminder for ${reminder.medicationName}: ${error}`
      });
      
      return false;
    }
  }

  static async deleteReminder(reminderId: string): Promise<boolean> {
    try {
      const reminders = await this.getAllReminders();
      const reminder = reminders.find(r => r.id === reminderId);
      const filteredReminders = reminders.filter(r => r.id !== reminderId);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredReminders));
      await this.cancelNotificationsForReminder(reminderId);
      
      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'medication_reminder_deleted',
        details: `Deleted reminder for ${reminder?.medicationName || 'unknown medication'}`
      });
      
      return true;
    } catch (error) {
      console.error('Failed to delete medication reminder:', error);
      return false;
    }
  }

  static async markDoseTaken(reminderId: string): Promise<boolean> {
    try {
      const reminders = await this.getAllReminders();
      const reminderIndex = reminders.findIndex(r => r.id === reminderId);
      
      if (reminderIndex >= 0) {
        reminders[reminderIndex].lastTaken = new Date().toISOString();
        reminders[reminderIndex].missedDoses = Math.max(0, reminders[reminderIndex].missedDoses);
        
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(reminders));
        
        await SecureStorage.addAuditEntry({
          timestamp: new Date().toISOString(),
          action: 'medication_dose_taken',
          details: `Marked dose as taken for ${reminders[reminderIndex].medicationName}`
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to mark dose as taken:', error);
      return false;
    }
  }

  static async markDoseMissed(reminderId: string): Promise<boolean> {
    try {
      const reminders = await this.getAllReminders();
      const reminderIndex = reminders.findIndex(r => r.id === reminderId);
      
      if (reminderIndex >= 0) {
        reminders[reminderIndex].missedDoses += 1;
        
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(reminders));
        
        await SecureStorage.addAuditEntry({
          timestamp: new Date().toISOString(),
          action: 'medication_dose_missed',
          details: `Marked dose as missed for ${reminders[reminderIndex].medicationName} (total missed: ${reminders[reminderIndex].missedDoses})`
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to mark dose as missed:', error);
      return false;
    }
  }

  private static async scheduleNotificationsForReminder(reminder: MedicationReminder): Promise<void> {
    try {
      // Cancel existing notifications for this reminder
      await this.cancelNotificationsForReminder(reminder.id);
      
      const now = new Date();
      const startDate = new Date(reminder.startDate);
      const endDate = reminder.endDate ? new Date(reminder.endDate) : null;
      
      // Schedule notifications for the next 30 days or until end date
      const daysToSchedule = endDate ? 
        Math.min(30, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 
        30;
      
      for (let day = 0; day < daysToSchedule; day++) {
        const scheduleDate = new Date(now);
        scheduleDate.setDate(scheduleDate.getDate() + day);
        
        // Skip if before start date
        if (scheduleDate < startDate) continue;
        
        // Skip if after end date
        if (endDate && scheduleDate > endDate) break;
        
        // Skip if not a scheduled day for weekly frequency
        if (reminder.frequency === 'weekly' && scheduleDate.getDay() !== startDate.getDay()) {
          continue;
        }
        
        // Schedule notifications for each time
        for (const timeString of reminder.times) {
          const [hours, minutes] = timeString.split(':').map(Number);
          const notificationDate = new Date(scheduleDate);
          notificationDate.setHours(hours, minutes, 0, 0);
          
          // Skip if notification time has already passed today
          if (notificationDate <= now && day === 0) continue;
          
          await Notifications.scheduleNotificationAsync({
            identifier: `${reminder.id}_${day}_${timeString}`,
            content: {
              title: 'Medication Reminder',
              body: `Time to take ${reminder.medicationName} (${reminder.dosage})`,
              data: {
                reminderId: reminder.id,
                medicationName: reminder.medicationName,
                dosage: reminder.dosage,
                time: timeString
              },
              sound: 'default',
            },
            trigger: { 
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: Math.max(1, Math.floor((notificationDate.getTime() - Date.now()) / 1000))
            },
          });
        }
      }
      
      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'medication_notifications_scheduled',
        details: `Scheduled notifications for ${reminder.medicationName} for ${daysToSchedule} days`
      });
    } catch (error) {
      console.error('Failed to schedule notifications:', error);
    }
  }

  private static async cancelNotificationsForReminder(reminderId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const toCancel = scheduledNotifications
        .filter(notification => notification.identifier.startsWith(reminderId))
        .map(notification => notification.identifier);
      
      if (toCancel.length > 0) {
        for (const identifier of toCancel) {
          await Notifications.cancelScheduledNotificationAsync(identifier);
        }
        
        await SecureStorage.addAuditEntry({
          timestamp: new Date().toISOString(),
          action: 'medication_notifications_cancelled',
          details: `Cancelled ${toCancel.length} notifications for reminder ${reminderId}`
        });
      }
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  static async getDueMedications(): Promise<MedicationReminder[]> {
    try {
      const reminders = await this.getAllReminders();
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const dueReminders = reminders.filter(reminder => {
        if (!reminder.isActive) return false;
        
        // Check if it's a scheduled time
        const isScheduledTime = reminder.times.some(time => {
          const reminderTime = new Date();
          const [hours, minutes] = time.split(':').map(Number);
          reminderTime.setHours(hours, minutes, 0, 0);
          
          const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
          return timeDiff <= 15 * 60 * 1000; // Within 15 minutes
        });
        
        if (!isScheduledTime) return false;
        
        // Check if already taken today
        if (reminder.lastTaken) {
          const lastTaken = new Date(reminder.lastTaken);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (lastTaken >= today) return false; // Already taken today
        }
        
        return true;
      });
      
      return dueReminders;
    } catch (error) {
      console.error('Failed to get due medications:', error);
      return [];
    }
  }

  static async getUpcomingMedications(hoursAhead: number = 24): Promise<MedicationReminder[]> {
    try {
      const reminders = await this.getAllReminders();
      const now = new Date();
      const ahead = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
      
      const upcomingReminders = reminders.filter(reminder => {
        if (!reminder.isActive) return false;
        
        return reminder.times.some(time => {
          const [hours, minutes] = time.split(':').map(Number);
          const nextDose = new Date(now);
          nextDose.setHours(hours, minutes, 0, 0);
          
          // If time has passed today, check tomorrow
          if (nextDose <= now) {
            nextDose.setDate(nextDose.getDate() + 1);
          }
          
          return nextDose <= ahead;
        });
      });
      
      return upcomingReminders;
    } catch (error) {
      console.error('Failed to get upcoming medications:', error);
      return [];
    }
  }

  static generateFrequencyTimes(frequency: MedicationFrequency): string[] {
    switch (frequency) {
      case 'daily':
        return ['08:00'];
      case 'twice_daily':
        return ['08:00', '20:00'];
      case 'three_times_daily':
        return ['08:00', '14:00', '20:00'];
      case 'four_times_daily':
        return ['08:00', '12:00', '16:00', '20:00'];
      case 'weekly':
        return ['08:00'];
      case 'as_needed':
        return [];
      default:
        return ['08:00'];
    }
  }

  static formatFrequency(frequency: MedicationFrequency): string {
    switch (frequency) {
      case 'daily':
        return 'Once daily';
      case 'twice_daily':
        return 'Twice daily';
      case 'three_times_daily':
        return 'Three times daily';
      case 'four_times_daily':
        return 'Four times daily';
      case 'weekly':
        return 'Once weekly';
      case 'as_needed':
        return 'As needed';
      default:
        return 'Daily';
    }
  }

  static formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
}