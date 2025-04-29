// src/services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Cross-platform storage service that works on web and mobile
 * 
 * Web: Uses localStorage (synchronous)
 * Mobile: Uses AsyncStorage (asynchronous)
 */
class StorageService {
  constructor() {
    this.isWeb = Platform.OS === 'web';
  }

  /**
   * Set an item in storage
   * @param {string} key - Storage key
   * @param {string} value - Storage value (must be a string)
   * @returns {Promise<void>}
   */
  async setItem(key, value) {
    try {
      if (this.isWeb) {
        localStorage.setItem(key, value);
        return Promise.resolve();
      } else {
        return await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Storage error in setItem:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Get an item from storage
   * @param {string} key - Storage key
   * @returns {Promise<string|null>} - Retrieved value or null if not found
   */
  async getItem(key) {
    try {
      if (this.isWeb) {
        const value = localStorage.getItem(key);
        return Promise.resolve(value);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error('Storage error in getItem:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Remove an item from storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async removeItem(key) {
    try {
      if (this.isWeb) {
        localStorage.removeItem(key);
        return Promise.resolve();
      } else {
        return await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Storage error in removeItem:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Clear all items from storage
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      if (this.isWeb) {
        localStorage.clear();
        return Promise.resolve();
      } else {
        return await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Storage error in clear:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Get all keys from storage
   * @returns {Promise<string[]>} - Array of keys
   */
  async getAllKeys() {
    try {
      if (this.isWeb) {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          keys.push(localStorage.key(i));
        }
        return Promise.resolve(keys);
      } else {
        return await AsyncStorage.getAllKeys();
      }
    } catch (error) {
      console.error('Storage error in getAllKeys:', error);
      return Promise.reject(error);
    }
  }
}

// Create and export a singleton instance
const storageService = new StorageService();
export default storageService;