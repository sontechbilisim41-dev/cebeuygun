import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface SecureStorageOptions {
  requireAuthentication?: boolean;
  showModal?: boolean;
  promptMessage?: string;
}

class SecureStorage {
  private keyPrefix = 'courier_app_';

  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async setItem(
    key: string, 
    value: string, 
    options?: SecureStorageOptions
  ): Promise<void> {
    try {
      const secureKey = this.getKey(key);
      
      const storeOptions: SecureStore.SecureStoreOptions = {};
      
      if (Platform.OS === 'ios' && options?.requireAuthentication) {
        storeOptions.requireAuthentication = true;
        storeOptions.authenticationPrompt = options.promptMessage || 'Authenticate to access secure data';
      }

      await SecureStore.setItemAsync(secureKey, value, storeOptions);
    } catch (error) {
      console.error(`SecureStorage setItem error for key ${key}:`, error);
      throw new Error(`Failed to store secure data: ${key}`);
    }
  }

  async getItem(
    key: string, 
    options?: SecureStorageOptions
  ): Promise<string | null> {
    try {
      const secureKey = this.getKey(key);
      
      const storeOptions: SecureStore.SecureStoreOptions = {};
      
      if (Platform.OS === 'ios' && options?.requireAuthentication) {
        storeOptions.requireAuthentication = true;
        storeOptions.authenticationPrompt = options.promptMessage || 'Authenticate to access secure data';
      }

      const value = await SecureStore.getItemAsync(secureKey, storeOptions);
      return value;
    } catch (error) {
      console.error(`SecureStorage getItem error for key ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const secureKey = this.getKey(key);
      await SecureStore.deleteItemAsync(secureKey);
    } catch (error) {
      console.error(`SecureStorage removeItem error for key ${key}:`, error);
      throw new Error(`Failed to remove secure data: ${key}`);
    }
  }

  async hasItem(key: string): Promise<boolean> {
    try {
      const value = await this.getItem(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      // Get all keys and remove only our app's keys
      const allKeys = await this.getAllKeys();
      await Promise.all(
        allKeys.map(key => this.removeItem(key.replace(this.keyPrefix, '')))
      );
    } catch (error) {
      console.error('SecureStorage clear error:', error);
      throw new Error('Failed to clear secure storage');
    }
  }

  private async getAllKeys(): Promise<string[]> {
    // This is a simplified implementation
    // In a real app, you might want to maintain a list of keys
    const commonKeys = [
      'accessToken',
      'refreshToken',
      'userCredentials',
      'biometricEnabled',
      'lastLoginTime',
    ];
    
    const existingKeys: string[] = [];
    
    for (const key of commonKeys) {
      const hasKey = await this.hasItem(key);
      if (hasKey) {
        existingKeys.push(this.getKey(key));
      }
    }
    
    return existingKeys;
  }

  // Utility methods for common data types
  async setObject(key: string, object: any, options?: SecureStorageOptions): Promise<void> {
    const jsonString = JSON.stringify(object);
    await this.setItem(key, jsonString, options);
  }

  async getObject<T>(key: string, options?: SecureStorageOptions): Promise<T | null> {
    try {
      const jsonString = await this.getItem(key, options);
      if (!jsonString) return null;
      
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`SecureStorage getObject error for key ${key}:`, error);
      return null;
    }
  }

  async setBoolean(key: string, value: boolean, options?: SecureStorageOptions): Promise<void> {
    await this.setItem(key, value.toString(), options);
  }

  async getBoolean(key: string, options?: SecureStorageOptions): Promise<boolean | null> {
    const value = await this.getItem(key, options);
    if (value === null) return null;
    return value === 'true';
  }

  async setNumber(key: string, value: number, options?: SecureStorageOptions): Promise<void> {
    await this.setItem(key, value.toString(), options);
  }

  async getNumber(key: string, options?: SecureStorageOptions): Promise<number | null> {
    const value = await this.getItem(key, options);
    if (value === null) return null;
    
    const number = parseFloat(value);
    return isNaN(number) ? null : number;
  }
}

export const secureStorage = new SecureStorage();