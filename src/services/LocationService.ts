import * as Location from 'expo-location';
import { SecureStorage } from './SecureStorage';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export class LocationService {
  private static hasPermission = false;

  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.hasPermission = status === 'granted';
      
      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'location_permission_requested',
        details: `Permission ${status}`
      });

      return this.hasPermission;
    } catch (error) {
      console.error('Failed to request location permissions:', error);
      return false;
    }
  }

  static async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      this.hasPermission = status === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Failed to check location permissions:', error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      // Check if we have permission
      if (!this.hasPermission) {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
          throw new Error('Location permission not granted');
        }
      }

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 0,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: new Date().toISOString()
      };

      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'location_accessed',
        details: `Location obtained with accuracy: ${locationData.accuracy}m`
      });

      return locationData;
    } catch (error) {
      console.error('Failed to get current location:', error);
      
      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'location_access_failed',
        details: `Error: ${error}`
      });

      return null;
    }
  }

  static async getLocationForEmergency(): Promise<LocationData | null> {
    try {
      // Check and request permissions first for emergency situations
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const permissionGranted = await this.requestPermissions();
        if (!permissionGranted) {
          await SecureStorage.addAuditEntry({
            timestamp: new Date().toISOString(),
            action: 'emergency_location_permission_denied',
            details: 'Location permission denied by user during emergency'
          });
          return null; // Return null instead of throwing to allow emergency to continue
        }
      }

      // Check if location services are enabled
      const servicesEnabled = await this.isLocationEnabled();
      if (!servicesEnabled) {
        await SecureStorage.addAuditEntry({
          timestamp: new Date().toISOString(),
          action: 'emergency_location_services_disabled',
          details: 'Location services disabled on device during emergency'
        });
        return null;
      }

      // For emergency situations, try to get location with balanced accuracy and speed
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 3000, // Faster timeout for emergency
        distanceInterval: 0,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: new Date().toISOString()
      };

      await SecureStorage.addAuditEntry({
        timestamp: new Date().toISOString(),
        action: 'emergency_location_obtained',
        details: `Emergency location obtained with accuracy: ${locationData.accuracy}m`
      });

      return locationData;
    } catch (error) {
      console.error('Failed to get emergency location:', error);
      
      // Try with lower accuracy as fallback only if we have permissions
      if (this.hasPermission) {
        try {
          const fallbackLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
            timeInterval: 1000,
            distanceInterval: 0,
          });

          const locationData: LocationData = {
            latitude: fallbackLocation.coords.latitude,
            longitude: fallbackLocation.coords.longitude,
            accuracy: fallbackLocation.coords.accuracy || 0,
            timestamp: new Date().toISOString()
          };

          await SecureStorage.addAuditEntry({
            timestamp: new Date().toISOString(),
            action: 'emergency_location_fallback',
            details: `Fallback location obtained with accuracy: ${locationData.accuracy}m`
          });

          return locationData;
        } catch (fallbackError) {
          console.error('Failed to get fallback location:', fallbackError);
          
          await SecureStorage.addAuditEntry({
            timestamp: new Date().toISOString(),
            action: 'emergency_location_failed',
            details: `Both primary and fallback location failed: ${fallbackError}`
          });

          return null;
        }
      } else {
        await SecureStorage.addAuditEntry({
          timestamp: new Date().toISOString(),
          action: 'emergency_location_no_permission',
          details: `Location request failed due to missing permissions: ${error}`
        });
        
        return null;
      }
    }
  }

  static formatLocationForSharing(location: LocationData): string {
    const { latitude, longitude, accuracy } = location;
    return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(accuracy)}m)`;
  }

  static formatLocationForMaps(location: LocationData): string {
    const { latitude, longitude } = location;
    return `https://maps.google.com/?q=${latitude},${longitude}`;
  }

  static calculateDistance(loc1: LocationData, loc2: LocationData): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.degreesToRadians(loc2.latitude - loc1.latitude);
    const dLon = this.degreesToRadians(loc2.longitude - loc1.longitude);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.degreesToRadians(loc1.latitude)) * Math.cos(this.degreesToRadians(loc2.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
  }

  private static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  static async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Failed to check if location services are enabled:', error);
      return false;
    }
  }

  static async getLocationStatus(): Promise<{
    hasPermission: boolean;
    isEnabled: boolean;
    canGetLocation: boolean;
  }> {
    const hasPermission = await this.checkPermissions();
    const isEnabled = await this.isLocationEnabled();
    
    return {
      hasPermission,
      isEnabled,
      canGetLocation: hasPermission && isEnabled
    };
  }
}