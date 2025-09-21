/**
 * Multi-Timer Application - Main Entry Point
 * Robust TypeScript architecture with enhanced interval marks functionality
 */

// Core exports
export { Timer } from './core/timer.js';
export { TimerManager } from './core/timer-manager.js';

// Event system exports
export { EventEmitter, ScopedEventEmitter } from './events/event-emitter.js';

// Storage exports
export { 
  StorageManager, 
  LocalStorageBackend, 
  MemoryStorageBackend, 
  FileSystemStorageBackend 
} from './storage/storage-manager.js';

// Utility exports
export { TimeUtils } from './utils/time-utils.js';
export { ValidationUtils, ValidationError } from './utils/validation-utils.js';

// Type exports
export type {
  // Core types
  TimerId,
  MarkId,
  TimerState,
  TimerPrecision,
  PrecisionTime,
  
  // Configuration types
  TimerConfig,
  TimerMark,
  CreateTimerParams,
  CreateMarkParams,
  UpdateMarkParams,
  
  // Runtime types
  TimerRuntime,
  TimerSnapshot,
  
  // Notification types
  MarkNotification,
  MarkNotificationState,
  MarkNotificationSettings,
  
  // Command and event types
  TimerCommand,
  TimerEvent,
  TimerEventHandler,
  EventSubscription,
  
  // Error types
  TimerError,
  TimerErrorCode,
  
  // Collection types
  TimerCollection
} from './types/timer.types.js';

// Import core classes
import { Timer } from './core/timer.js';
import { TimerManager } from './core/timer-manager.js';
import { EventEmitter, ScopedEventEmitter } from './events/event-emitter.js';
import { StorageManager, LocalStorageBackend, MemoryStorageBackend, FileSystemStorageBackend } from './storage/storage-manager.js';
import { TimeUtils } from './utils/time-utils.js';
import { ValidationUtils, ValidationError } from './utils/validation-utils.js';

// Storage types
export type {
  StorageBackend,
  StorageMetadata,
  StorageStatistics,
  StorageExportData
} from './storage/storage-manager.js';

// Import StorageBackend for use in this file
import type { StorageBackend } from './storage/storage-manager.js';

// Manager statistics
export type {
  TimerManagerStatistics,
  TimerExportData
} from './core/timer-manager.js';

// Event emitter statistics
export type {
  EventEmitterStatistics
} from './events/event-emitter.js';

// Time formatting
export type {
  TimeFormatOptions
} from './utils/time-utils.js';

/**
 * Application Factory - Create a fully configured timer application instance
 */
export class TimerApp {
  private readonly _manager: TimerManager;
  
  constructor(storageBackend?: StorageBackend) {
    const storage = storageBackend ? new StorageManager(storageBackend) : undefined;
    this._manager = new TimerManager(storage);
  }
  
  /**
   * Get the timer manager instance
   */
  get manager(): TimerManager {
    return this._manager;
  }
  
  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    await this._manager.initialize();
  }
  
  /**
   * Shutdown the application
   */
  async shutdown(): Promise<void> {
    await this._manager.destroy();
  }
}

/**
 * Create a new timer application instance
 */
export function createTimerApp(storageBackend?: StorageBackend): TimerApp {
  return new TimerApp(storageBackend);
}

/**
 * Quick start helper - creates and initializes a timer application
 */
export async function quickStart(storageBackend?: StorageBackend): Promise<TimerApp> {
  const app = createTimerApp(storageBackend);
  await app.initialize();
  return app;
}

/**
 * Default export for convenient importing
 */
export default {
  // Core classes
  Timer,
  TimerManager,
  TimerApp,
  
  // Event system
  EventEmitter,
  ScopedEventEmitter,
  
  // Storage
  StorageManager,
  LocalStorageBackend,
  MemoryStorageBackend,
  FileSystemStorageBackend,
  
  // Utilities
  TimeUtils,
  ValidationUtils,
  ValidationError,
  
  // Factory functions
  createTimerApp,
  quickStart
};