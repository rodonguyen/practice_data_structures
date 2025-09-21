/**
 * Timer Manager - Centralized state management for multiple timers
 * Handles timer lifecycle, persistence, and complex state coordination
 */

import type {
  TimerId,
  TimerSnapshot,
  TimerCollection,
  CreateTimerParams,
  TimerCommand,
  TimerEvent,
  TimerEventHandler,
  EventSubscription,
  TimerError
} from '../types/timer.types.js';

import {
  TimerErrorCode,
  TimerState
} from '../types/timer.types.js';

import { Timer } from './timer.js';
import { EventEmitter } from '../events/event-emitter.js';
import { StorageManager } from '../storage/storage-manager.js';

/**
 * Centralized manager for multiple timer instances
 * Provides state management, persistence, and coordination
 */
export class TimerManager {
  private readonly _timers: Map<TimerId, Timer> = new Map();
  private readonly _eventEmitter: EventEmitter;
  private readonly _storageManager: StorageManager;
  private _isInitialized: boolean = false;
  
  constructor(storageManager?: StorageManager) {
    this._eventEmitter = new EventEmitter();
    this._storageManager = storageManager ?? new StorageManager();
    
    // Set up automatic persistence on relevant events
    this.setupAutoPersistence();
  }
  
  /**
   * Initialize the timer manager and load persisted timers
   */
  async initialize(): Promise<void> {
    if (this._isInitialized) {
      return;
    }
    
    try {
      const persistedTimers = await this._storageManager.loadTimers();
      
      for (const timerData of persistedTimers) {
        const timer = await this.restoreTimer(timerData);
        this._timers.set(timer.id, timer);
      }
      
      this._isInitialized = true;
    } catch (error) {
      throw this.createError(
        TimerErrorCode.PERSISTENCE_ERROR,
        'Failed to initialize timer manager',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Create a new timer with configuration
   */
  async createTimer(params: CreateTimerParams): Promise<Timer> {
    const timer = new Timer(params, this._eventEmitter);
    this._timers.set(timer.id, timer);
    
    // Auto-persist new timer
    await this.persistTimer(timer);
    
    // Auto-start if configured
    if (timer.config.autoStart) {
      await timer.start();
    }
    
    return timer;
  }
  
  /**
   * Get timer by ID
   */
  getTimer(timerId: TimerId): Timer | undefined {
    return this._timers.get(timerId);
  }
  
  /**
   * Get all timers as immutable collection
   */
  getTimers(): TimerCollection {
    const snapshots = new Map<TimerId, TimerSnapshot>();
    for (const [id, timer] of this._timers) {
      snapshots.set(id, timer.snapshot);
    }
    return snapshots;
  }
  
  /**
   * Get timers by state
   */
  getTimersByState(state: TimerState): Timer[] {
    return Array.from(this._timers.values()).filter(timer => timer.state === state);
  }
  
  /**
   * Get running timers
   */
  getRunningTimers(): Timer[] {
    return this.getTimersByState(TimerState.RUNNING);
  }
  
  /**
   * Get paused timers
   */
  getPausedTimers(): Timer[] {
    return this.getTimersByState(TimerState.PAUSED);
  }
  
  /**
   * Get completed timers
   */
  getCompletedTimers(): Timer[] {
    return this.getTimersByState(TimerState.COMPLETED);
  }
  
  /**
   * Remove timer by ID
   */
  async removeTimer(timerId: TimerId): Promise<void> {
    const timer = this._timers.get(timerId);
    if (!timer) {
      throw this.createError(
        TimerErrorCode.TIMER_NOT_FOUND,
        `Timer not found: ${timerId}`
      );
    }
    
    // Stop timer and cleanup
    await timer.stop();
    timer.destroy();
    
    // Remove from collections
    this._timers.delete(timerId);
    
    // Remove from persistence
    await this._storageManager.removeTimer(timerId);
  }
  
  /**
   * Execute command on specific timer
   */
  async executeCommand(timerId: TimerId, command: TimerCommand): Promise<void> {
    const timer = this._timers.get(timerId);
    if (!timer) {
      throw this.createError(
        TimerErrorCode.TIMER_NOT_FOUND,
        `Timer not found: ${timerId}`
      );
    }
    
    await timer.execute(command);
  }
  
  /**
   * Start all idle timers
   */
  async startAll(): Promise<void> {
    const idleTimers = this.getTimersByState(TimerState.IDLE);
    await Promise.all(idleTimers.map(timer => timer.start()));
  }
  
  /**
   * Pause all running timers
   */
  async pauseAll(): Promise<void> {
    const runningTimers = this.getRunningTimers();
    await Promise.all(runningTimers.map(timer => timer.pause()));
  }
  
  /**
   * Resume all paused timers
   */
  async resumeAll(): Promise<void> {
    const pausedTimers = this.getPausedTimers();
    await Promise.all(pausedTimers.map(timer => timer.resume()));
  }
  
  /**
   * Stop all active timers
   */
  async stopAll(): Promise<void> {
    const activeTimers = [
      ...this.getRunningTimers(),
      ...this.getPausedTimers()
    ];
    await Promise.all(activeTimers.map(timer => timer.stop()));
  }
  
  /**
   * Reset all timers
   */
  async resetAll(): Promise<void> {
    await Promise.all(
      Array.from(this._timers.values()).map(timer => timer.reset())
    );
  }
  
  /**
   * Clear completed timers
   */
  async clearCompleted(): Promise<void> {
    const completedTimers = this.getCompletedTimers();
    await Promise.all(
      completedTimers.map(timer => this.removeTimer(timer.id))
    );
  }
  
  /**
   * Subscribe to timer events
   */
  subscribe(
    eventType: TimerEvent['type'],
    handler: TimerEventHandler,
    timerId?: TimerId
  ): EventSubscription {
    return this._eventEmitter.subscribe(eventType, handler, timerId);
  }
  
  /**
   * Subscribe to all events for specific timer
   */
  subscribeToTimer(timerId: TimerId, handler: TimerEventHandler): EventSubscription[] {
    const eventTypes: TimerEvent['type'][] = [
      'TIMER_STARTED',
      'TIMER_PAUSED',
      'TIMER_RESUMED',
      'TIMER_STOPPED',
      'TIMER_RESET',
      'TIMER_COMPLETED',
      'TIMER_TICK',
      'MARK_TRIGGERED',
      'MARK_NOTIFICATION_STARTED',
      'MARK_NOTIFICATION_BLINK',
      'MARK_NOTIFICATION_COMPLETED',
      'MARK_ADDED',
      'MARK_UPDATED',
      'MARK_REMOVED',
      'ERROR'
    ];
    
    return eventTypes.map(eventType => 
      this.subscribe(eventType, handler, timerId)
    );
  }
  
  /**
   * Get statistics about timer usage
   */
  getStatistics(): TimerManagerStatistics {
    const timers = Array.from(this._timers.values());
    
    return {
      totalTimers: timers.length,
      runningTimers: this.getRunningTimers().length,
      pausedTimers: this.getPausedTimers().length,
      completedTimers: this.getCompletedTimers().length,
      idleTimers: this.getTimersByState(TimerState.IDLE).length,
      stoppedTimers: this.getTimersByState(TimerState.STOPPED).length,
      totalMarks: timers.reduce((sum, timer) => sum + timer.config.marks.length, 0),
      activeNotifications: timers.reduce(
        (sum, timer) => sum + timer.runtime.activeNotifications.length, 
        0
      ),
      averageMarksPerTimer: timers.length > 0 
        ? timers.reduce((sum, timer) => sum + timer.config.marks.length, 0) / timers.length 
        : 0
    };
  }
  
  /**
   * Export all timers data
   */
  async exportData(): Promise<TimerExportData> {
    const timers = Array.from(this._timers.values()).map(timer => timer.snapshot);
    
    return {
      version: '1.0.0',
      exportedAt: new Date(),
      timers,
      statistics: this.getStatistics()
    };
  }
  
  /**
   * Import timers data
   */
  async importData(data: TimerExportData): Promise<void> {
    // Validate import data
    if (!data.timers || !Array.isArray(data.timers)) {
      throw this.createError(
        TimerErrorCode.VALIDATION_ERROR,
        'Invalid import data format'
      );
    }
    
    // Clear existing timers
    await this.clearAll();
    
    // Import timers
    for (const timerSnapshot of data.timers) {
      const timer = await this.restoreTimer(timerSnapshot);
      this._timers.set(timer.id, timer);
    }
    
    // Persist imported data
    await this.persistAllTimers();
  }
  
  /**
   * Persist all timers to storage
   */
  async persistAllTimers(): Promise<void> {
    const snapshots = Array.from(this._timers.values()).map(timer => timer.snapshot);
    await this._storageManager.saveTimers(snapshots);
  }
  
  /**
   * Clear all timers and data
   */
  async clearAll(): Promise<void> {
    // Stop and destroy all timers
    for (const timer of this._timers.values()) {
      await timer.stop();
      timer.destroy();
    }
    
    // Clear collections
    this._timers.clear();
    
    // Clear storage
    await this._storageManager.clear();
  }
  
  /**
   * Cleanup and shutdown manager
   */
  async destroy(): Promise<void> {
    await this.stopAll();
    
    for (const timer of this._timers.values()) {
      timer.destroy();
    }
    
    this._timers.clear();
    this._eventEmitter.destroy();
  }
  
  // Private implementation methods
  
  private setupAutoPersistence(): void {
    // Persist timer state on relevant events
    const persistenceEvents: TimerEvent['type'][] = [
      'TIMER_CREATED',
      'TIMER_STARTED',
      'TIMER_PAUSED',
      'TIMER_RESUMED',
      'TIMER_STOPPED',
      'TIMER_RESET',
      'TIMER_COMPLETED',
      'MARK_ADDED',
      'MARK_UPDATED',
      'MARK_REMOVED'
    ];
    
    for (const eventType of persistenceEvents) {
      this._eventEmitter.subscribe(eventType, async (event: TimerEvent) => {
        if ('timerId' in event.payload) {
          const timer = this._timers.get(event.payload.timerId as TimerId);
          if (timer) {
            await this.persistTimer(timer);
          }
        }
      });
    }
  }
  
  private async persistTimer(timer: Timer): Promise<void> {
    try {
      await this._storageManager.saveTimer(timer.snapshot);
    } catch (error) {
      // Log error but don't throw to avoid disrupting timer operation
      console.error('Failed to persist timer:', timer.id, error);
    }
  }
  
  private async restoreTimer(snapshot: TimerSnapshot): Promise<Timer> {
    // Create timer from snapshot data
    const params: CreateTimerParams = {
      name: snapshot.config.name,
      description: snapshot.config.description,
      targetDuration: snapshot.config.targetDuration,
      isCountdown: snapshot.config.isCountdown,
      marks: snapshot.config.marks.map(mark => ({
        name: mark.name,
        targetTime: mark.targetTime,
        description: mark.description,
        notificationSettings: mark.notificationSettings,
        isEnabled: mark.isEnabled
      })),
      autoStart: snapshot.config.autoStart,
      autoReset: snapshot.config.autoReset,
      precision: snapshot.config.precision
    };
    
    const timer = new Timer(params, this._eventEmitter);
    
    // Restore runtime state if needed
    if (snapshot.runtime.state !== TimerState.IDLE) {
      await timer.setTime(snapshot.runtime.currentTime);
      
      // Note: We don't restore running state on initialization
      // Timers should be manually restarted after app restart
    }
    
    return timer;
  }
  
  private createError(
    code: TimerErrorCode,
    message: string,
    details?: Record<string, unknown>
  ): TimerError {
    const error: TimerError = {
      code,
      message,
      timestamp: new Date()
    };
    
    if (details !== undefined) {
      return { ...error, details };
    }
    
    return error;
  }
}

/**
 * Timer manager statistics interface
 */
export interface TimerManagerStatistics {
  readonly totalTimers: number;
  readonly runningTimers: number;
  readonly pausedTimers: number;
  readonly completedTimers: number;
  readonly idleTimers: number;
  readonly stoppedTimers: number;
  readonly totalMarks: number;
  readonly activeNotifications: number;
  readonly averageMarksPerTimer: number;
}

/**
 * Timer export/import data format
 */
export interface TimerExportData {
  readonly version: string;
  readonly exportedAt: Date;
  readonly timers: ReadonlyArray<TimerSnapshot>;
  readonly statistics: TimerManagerStatistics;
}