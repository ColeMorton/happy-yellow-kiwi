import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export class EncryptedAsyncStorage {
  private static readonly ENCRYPTION_KEY_PREFIX = 'enc_key_';
  
  /**
   * Generate a new encryption key for a data type
   */
  private static async generateEncryptionKey(dataType: string): Promise<string> {
    const key = await Crypto.getRandomBytesAsync(32);
    const keyString = Array.from(key).map((b: number) => b.toString(16).padStart(2, '0')).join('');
    await SecureStore.setItemAsync(`${this.ENCRYPTION_KEY_PREFIX}${dataType}`, keyString);
    return keyString;
  }

  /**
   * Get or create encryption key for a data type
   */
  private static async getEncryptionKey(dataType: string): Promise<string> {
    let key = await SecureStore.getItemAsync(`${this.ENCRYPTION_KEY_PREFIX}${dataType}`);
    if (!key) {
      key = await this.generateEncryptionKey(dataType);
    }
    return key;
  }

  /**
   * Simple XOR encryption (sufficient for Expo Go compatibility)
   */
  private static encrypt(data: string, key: string): string {
    const keyHexMatches = key.match(/.{2}/g);
    if (!keyHexMatches) throw new Error('Invalid encryption key format');
    
    const keyBytes = new Uint8Array(keyHexMatches.map(byte => parseInt(byte, 16)));
    const dataBytes = new TextEncoder().encode(data);
    const encrypted = new Uint8Array(dataBytes.length);
    
    for (let i = 0; i < dataBytes.length; i++) {
      encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return Array.from(encrypted).map((b: number) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Simple XOR decryption
   */
  private static decrypt(encryptedData: string, key: string): string {
    const keyHexMatches = key.match(/.{2}/g);
    const encryptedHexMatches = encryptedData.match(/.{2}/g);
    
    if (!keyHexMatches || !encryptedHexMatches) {
      throw new Error('Invalid encryption data format');
    }
    
    const keyBytes = new Uint8Array(keyHexMatches.map(byte => parseInt(byte, 16)));
    const encryptedBytes = new Uint8Array(encryptedHexMatches.map(byte => parseInt(byte, 16)));
    const decrypted = new Uint8Array(encryptedBytes.length);
    
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return new TextDecoder().decode(decrypted);
  }

  /**
   * Store encrypted data in AsyncStorage
   */
  static async setItem(dataType: string, data: string): Promise<void> {
    try {
      const key = await this.getEncryptionKey(dataType);
      const encryptedData = this.encrypt(data, key);
      await AsyncStorage.setItem(dataType, encryptedData);
    } catch (error) {
      throw new Error(`Failed to store encrypted data for ${dataType}: ${error}`);
    }
  }

  /**
   * Retrieve and decrypt data from AsyncStorage
   */
  static async getItem(dataType: string): Promise<string | null> {
    try {
      const encryptedData = await AsyncStorage.getItem(dataType);
      if (!encryptedData) {
        return null;
      }

      const key = await this.getEncryptionKey(dataType);
      return this.decrypt(encryptedData, key);
    } catch (error) {
      console.error(`Failed to retrieve encrypted data for ${dataType}:`, error);
      return null;
    }
  }

  /**
   * Remove encrypted data
   */
  static async removeItem(dataType: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(dataType);
      await SecureStore.deleteItemAsync(`${this.ENCRYPTION_KEY_PREFIX}${dataType}`);
    } catch (error) {
      throw new Error(`Failed to remove encrypted data for ${dataType}: ${error}`);
    }
  }

  /**
   * Check if encrypted data exists
   */
  static async hasItem(dataType: string): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(dataType);
      return data !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear all encrypted data and keys
   */
  static async clearAll(dataTypes: string[]): Promise<void> {
    try {
      const promises = dataTypes.map(async (dataType) => {
        await AsyncStorage.removeItem(dataType);
        await SecureStore.deleteItemAsync(`${this.ENCRYPTION_KEY_PREFIX}${dataType}`);
      });
      await Promise.all(promises);
    } catch (error) {
      throw new Error(`Failed to clear all encrypted data: ${error}`);
    }
  }
}