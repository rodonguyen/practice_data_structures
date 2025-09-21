/**
 * Storage manager for timer persistence
 * Provides comprehensive data storage and retrieval with error handling
 */

import type {
  TimerId,
  TimerSnapshot,
  TimerError,
  TimerErrorCode
} from '../types/timer.types.js';

/**
 * Abstract storage interface for different storage backends
 */
export interface StorageBackend {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  exists(key: string): Promise<boolean>;
}

/**
 * Local storage backend implementation
 */
export class LocalStorageBackend implements StorageBackend {
  private readonly keyPrefix: string;
  
  constructor(keyPrefix = 'timer-app') {
    this.keyPrefix = keyPrefix;
  }
  
  async get(key: string): Promise<any> {
    try {
      const item = localStorage.getItem(this.getFullKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      throw new Error(`Failed to get item from localStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async set(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(this.getFullKey(key), JSON.stringify(value));
    } catch (error) {
      throw new Error(`Failed to set item in localStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getFullKey(key));
    } catch (error) {
      throw new Error(`Failed to remove item from localStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async clear(): Promise<void> {
    try {
      const keys = await this.keys();
      for (const key of keys) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      throw new Error(`Failed to clear localStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async keys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${this.keyPrefix}:`)) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      throw new Error(`Failed to get keys from localStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async exists(key: string): Promise<boolean> {
    try {
      return localStorage.getItem(this.getFullKey(key)) !== null;
    } catch (error) {
      throw new Error(`Failed to check existence in localStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private getFullKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }
}

/**
 * In-memory storage backend for testing
 */
export class MemoryStorageBackend implements StorageBackend {
  private readonly storage: Map<string, any> = new Map();
  
  async get(key: string): Promise<any> {
    return this.storage.get(key) ?? null;
  }
  
  async set(key: string, value: any): Promise<void> {
    this.storage.set(key, value);
  }
  
  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }
  
  async clear(): Promise<void> {
    this.storage.clear();
  }
  
  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }
  
  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }
}

/**
 * File system storage backend for Node.js environments
 */
export class FileSystemStorageBackend implements StorageBackend {
  private readonly basePath: string;
  
  constructor(basePath = './timer-data') {
    this.basePath = basePath;
  }
  
  async get(key: string): Promise<any> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const filePath = path.join(this.basePath, `${key}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async set(key: string, value: any): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      // Ensure directory exists
      await fs.mkdir(this.basePath, { recursive: true });
      
      const filePath = path.join(this.basePath, `${key}.json`);
      await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async remove(key: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const filePath = path.join(this.basePath, `${key}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error(`Failed to remove file: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  
  async clear(): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const files = await fs.readdir(this.basePath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      await Promise.all(
        jsonFiles.map(file => fs.unlink(path.join(this.basePath, file)))
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error(`Failed to clear directory: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  
  async keys(): Promise<string[]> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const files = await fs.readdir(this.basePath);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => path.basename(file, '.json'))
        .map(name => `timer-data:${name}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw new Error(`Failed to read directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async exists(key: string): Promise<boolean> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const filePath = path.join(this.basePath, `${key}.json`);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Storage manager with multiple backend support and data serialization
 */
export class StorageManager {
  private readonly backend: StorageBackend;
  private readonly timerKeyPrefix = 'timer';
  private readonly metadataKey = 'metadata';
  
  constructor(backend?: StorageBackend) {
    this.backend = backend ?? new LocalStorageBackend();
  }
  
  /**
   * Save a single timer
   */
  async saveTimer(timer: TimerSnapshot): Promise<void> {
    try {
      const serializedTimer = this.serializeTimer(timer);
      await this.backend.set(this.getTimerKey(timer.config.id), serializedTimer);
      
      // Update metadata
      await this.updateMetadata();
    } catch (error) {
      throw this.createStorageError(
        'Failed to save timer',
        { timerId: timer.config.id, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Save multiple timers
   */
  async saveTimers(timers: TimerSnapshot[]): Promise<void> {
    try {
      const savePromises = timers.map(timer => this.saveTimer(timer));
      await Promise.all(savePromises);
    } catch (error) {
      throw this.createStorageError(
        'Failed to save multiple timers',
        { count: timers.length, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Load a single timer by ID
   */
  async loadTimer(timerId: TimerId): Promise<TimerSnapshot | null> {
    try {
      const serializedTimer = await this.backend.get(this.getTimerKey(timerId));
      
      if (!serializedTimer) {
        return null;
      }
      
      return this.deserializeTimer(serializedTimer);
    } catch (error) {
      throw this.createStorageError(
        'Failed to load timer',
        { timerId, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Load all timers
   */
  async loadTimers(): Promise<TimerSnapshot[]> {
    try {
      const keys = await this.backend.keys();
      const timerKeys = keys.filter(key => key.includes(this.timerKeyPrefix));
      
      const loadPromises = timerKeys.map(async key => {
        const serializedTimer = await this.backend.get(key);
        return serializedTimer ? this.deserializeTimer(serializedTimer) : null;
      });
      
      const timers = await Promise.all(loadPromises);
      return timers.filter((timer): timer is TimerSnapshot => timer !== null);
    } catch (error) {
      throw this.createStorageError(
        'Failed to load timers',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Remove a single timer
   */
  async removeTimer(timerId: TimerId): Promise<void> {
    try {
      await this.backend.remove(this.getTimerKey(timerId));
      await this.updateMetadata();
    } catch (error) {
      throw this.createStorageError(
        'Failed to remove timer',
        { timerId, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Check if timer exists in storage
   */
  async hasTimer(timerId: TimerId): Promise<boolean> {
    try {
      return await this.backend.exists(this.getTimerKey(timerId));
    } catch (error) {
      throw this.createStorageError(
        'Failed to check timer existence',
        { timerId, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Get list of stored timer IDs
   */
  async getTimerIds(): Promise<TimerId[]> {
    try {
      const keys = await this.backend.keys();
      const timerKeys = keys.filter(key => key.includes(this.timerKeyPrefix));
      
      return timerKeys.map(key => {
        const parts = key.split(':');
        return parts[parts.length - 1]!; // Get the timer ID from the key
      });
    } catch (error) {
      throw this.createStorageError(
        'Failed to get timer IDs',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Get storage statistics
   */
  async getStatistics(): Promise<StorageStatistics> {
    try {
      const timerIds = await this.getTimerIds();
      const metadata = await this.getMetadata();
      
      return {
        totalTimers: timerIds.length,
        lastUpdated: metadata.lastUpdated,
        storageBackend: this.backend.constructor.name,
        totalKeys: (await this.backend.keys()).length
      };
    } catch (error) {
      throw this.createStorageError(
        'Failed to get storage statistics',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Export all data
   */
  async exportData(): Promise<StorageExportData> {
    try {
      const timers = await this.loadTimers();
      const metadata = await this.getMetadata();
      const statistics = await this.getStatistics();
      
      return {
        version: '1.0.0',
        exportedAt: new Date(),
        metadata,
        statistics,
        timers
      };
    } catch (error) {
      throw this.createStorageError(
        'Failed to export data',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Import data (replaces existing data)
   */
  async importData(data: StorageExportData): Promise<void> {
    try {
      // Validate import data
      if (!data.timers || !Array.isArray(data.timers)) {
        throw new Error('Invalid import data: timers must be an array');
      }
      
      // Clear existing data
      await this.clear();
      
      // Import timers
      await this.saveTimers(data.timers);
      
      // Update metadata
      await this.updateMetadata();
    } catch (error) {
      throw this.createStorageError(
        'Failed to import data',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    try {
      await this.backend.clear();
    } catch (error) {
      throw this.createStorageError(
        'Failed to clear storage',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  // Private implementation methods
  
  private getTimerKey(timerId: TimerId): string {
    return `${this.timerKeyPrefix}:${timerId}`;
  }
  
  private serializeTimer(timer: TimerSnapshot): SerializedTimer {
    return {
      version: '1.0.0',
      serializedAt: new Date().toISOString(),
      config: {
        ...timer.config,
        createdAt: timer.config.createdAt.toISOString(),
        updatedAt: timer.config.updatedAt.toISOString(),
        marks: timer.config.marks.map(mark => ({
          ...mark,
          createdAt: mark.createdAt.toISOString(),
          updatedAt: mark.updatedAt.toISOString()
        }))
      },
      runtime: {
        ...timer.runtime,
        startTime: timer.runtime.startTime?.toISOString(),
        endTime: timer.runtime.endTime?.toISOString(),
        triggeredMarks: Array.from(timer.runtime.triggeredMarks),
        activeNotifications: timer.runtime.activeNotifications.map(notification => ({
          ...notification,
          triggeredAt: notification.triggeredAt.toISOString()
        }))
      }
    };
  }
  
  private deserializeTimer(serialized: SerializedTimer): TimerSnapshot {
    return {
      config: {
        ...serialized.config,
        createdAt: new Date(serialized.config.createdAt),
        updatedAt: new Date(serialized.config.updatedAt),
        marks: serialized.config.marks.map((mark: any) => ({
          ...mark,
          createdAt: new Date(mark.createdAt),
          updatedAt: new Date(mark.updatedAt)
        }))
      },
      runtime: {
        ...serialized.runtime,
        startTime: serialized.runtime.startTime ? new Date(serialized.runtime.startTime) : undefined,
        endTime: serialized.runtime.endTime ? new Date(serialized.runtime.endTime) : undefined,
        triggeredMarks: new Set(serialized.runtime.triggeredMarks),
        activeNotifications: serialized.runtime.activeNotifications.map((notification: any) => ({
          ...notification,
          triggeredAt: new Date(notification.triggeredAt)
        }))
      }
    };
  }
  
  private async getMetadata(): Promise<StorageMetadata> {
    try {
      const metadata = await this.backend.get(this.metadataKey);
      
      if (!metadata) {
        return {
          version: '1.0.0',
          createdAt: new Date(),
          lastUpdated: new Date(),
          timerCount: 0
        };
      }
      
      return {
        ...metadata,
        createdAt: new Date(metadata.createdAt),
        lastUpdated: new Date(metadata.lastUpdated)
      };
    } catch (error) {
      // Return default metadata if unable to load
      return {
        version: '1.0.0',
        createdAt: new Date(),
        lastUpdated: new Date(),
        timerCount: 0
      };
    }
  }
  
  private async updateMetadata(): Promise<void> {
    try {
      const currentMetadata = await this.getMetadata();
      const timerIds = await this.getTimerIds();
      
      const updatedMetadata = {
        ...currentMetadata,
        lastUpdated: new Date(),
        timerCount: timerIds.length
      };
      
      await this.backend.set(this.metadataKey, {
        ...updatedMetadata,
        createdAt: updatedMetadata.createdAt.toISOString(),
        lastUpdated: updatedMetadata.lastUpdated.toISOString()
      });
    } catch (error) {
      // Log error but don't throw to avoid disrupting main operations
      console.error('Failed to update storage metadata:', error);
    }
  }
  
  private createStorageError(message: string, details?: Record<string, unknown>): TimerError {
    const error: TimerError = {
      code: 'PERSISTENCE_ERROR' as TimerErrorCode,
      message,
      timestamp: new Date()
    };
    
    if (details !== undefined) {
      return { ...error, details };
    }
    
    return error;
  }
}

// Supporting types and interfaces

interface SerializedTimer {
  version: string;
  serializedAt: string;
  config: any;
  runtime: any;
}

export interface StorageMetadata {
  version: string;
  createdAt: Date;
  lastUpdated: Date;
  timerCount: number;
}

export interface StorageStatistics {
  totalTimers: number;
  lastUpdated: Date;
  storageBackend: string;
  totalKeys: number;
}

export interface StorageExportData {
  version: string;
  exportedAt: Date;
  metadata: StorageMetadata;
  statistics: StorageStatistics;
  timers: TimerSnapshot[];
}