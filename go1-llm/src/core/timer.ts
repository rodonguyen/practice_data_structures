/**
 * Core Timer class with mark functionality and precision timing
 * Implements high-precision timing system with interval marks support
 */

import type {
  TimerId,
  MarkId,
  TimerState,
  TimerConfig,
  TimerRuntime,
  TimerSnapshot,
  TimerMark,
  PrecisionTime,
  TimerCommand,
  TimerEvent,
  CreateTimerParams,
  CreateMarkParams,
  UpdateMarkParams,
  TimerPrecision,
  MarkNotification,
  MarkNotificationState,
  TimerError,
  TimerErrorCode
} from '@types/timer.types.js';

import { EventEmitter } from '@events/event-emitter.js';
import { TimeUtils } from '@utils/time-utils.js';
import { ValidationUtils } from '@utils/validation-utils.js';

/**
 * High-precision timer with advanced mark system
 * Supports centisecond precision and complex interval notifications
 */
export class Timer {
  private readonly _id: TimerId;
  private readonly _eventEmitter: EventEmitter<TimerEvent>;
  private _config: TimerConfig;
  private _runtime: TimerRuntime;
  private _tickInterval: NodeJS.Timeout | null = null;
  private _notificationTimeouts: Map<MarkId, NodeJS.Timeout> = new Map();
  
  constructor(params: CreateTimerParams, eventEmitter: EventEmitter<TimerEvent>) {
    this._id = TimeUtils.generateId();
    this._eventEmitter = eventEmitter;
    
    // Initialize configuration with defaults
    this._config = this.createConfig(params);
    
    // Initialize runtime state
    this._runtime = this.createInitialRuntime();
    
    // Emit creation event
    this._eventEmitter.emit({
      type: 'TIMER_CREATED',
      payload: this.snapshot
    });
  }
  
  /** Unique timer identifier */
  get id(): TimerId {
    return this._id;
  }
  
  /** Current timer configuration */
  get config(): TimerConfig {
    return this._config;
  }
  
  /** Current runtime state */
  get runtime(): TimerRuntime {
    return this._runtime;
  }
  
  /** Immutable snapshot of timer state */
  get snapshot(): TimerSnapshot {
    return {
      config: this._config,
      runtime: this._runtime
    };
  }
  
  /** Current timer state */
  get state(): TimerState {
    return this._runtime.state;
  }
  
  /** Current time with high precision */
  get currentTime(): PrecisionTime {
    return this._runtime.currentTime;
  }
  
  /** Check if timer is running */
  get isRunning(): boolean {
    return this._runtime.state === TimerState.RUNNING;
  }
  
  /** Check if timer is paused */
  get isPaused(): boolean {
    return this._runtime.state === TimerState.PAUSED;
  }
  
  /** Check if timer is completed */
  get isCompleted(): boolean {
    return this._runtime.state === TimerState.COMPLETED;
  }
  
  /**
   * Execute timer command with validation and error handling
   */
  async execute(command: TimerCommand): Promise<void> {
    try {
      await this.validateCommand(command);
      await this.processCommand(command);
    } catch (error) {
      this.handleError(error as Error, command);
    }
  }
  
  /**
   * Start the timer
   */
  async start(): Promise<void> {
    if (this._runtime.state !== TimerState.IDLE && this._runtime.state !== TimerState.STOPPED) {
      throw this.createError(TimerErrorCode.INVALID_TIMER_STATE, 
        `Cannot start timer from state: ${this._runtime.state}`);
    }
    
    const startTime = new Date();
    
    this._runtime = {
      ...this._runtime,
      state: TimerState.RUNNING,
      startTime,
      endTime: undefined,
      pausedDuration: 0,
      lastTick: performance.now()
    };
    
    this.startTicking();
    
    this._eventEmitter.emit({
      type: 'TIMER_STARTED',
      payload: { timerId: this._id, startTime }
    });
  }
  
  /**
   * Pause the timer
   */
  async pause(): Promise<void> {
    if (this._runtime.state !== TimerState.RUNNING) {
      throw this.createError(TimerErrorCode.INVALID_TIMER_STATE,
        `Cannot pause timer from state: ${this._runtime.state}`);
    }
    
    const pausedAt = new Date();
    this.stopTicking();
    
    this._runtime = {
      ...this._runtime,
      state: TimerState.PAUSED
    };
    
    this._eventEmitter.emit({
      type: 'TIMER_PAUSED',
      payload: { timerId: this._id, pausedAt }
    });
  }
  
  /**
   * Resume the timer
   */
  async resume(): Promise<void> {
    if (this._runtime.state !== TimerState.PAUSED) {
      throw this.createError(TimerErrorCode.INVALID_TIMER_STATE,
        `Cannot resume timer from state: ${this._runtime.state}`);
    }
    
    const resumedAt = new Date();
    
    this._runtime = {
      ...this._runtime,
      state: TimerState.RUNNING,
      lastTick: performance.now()
    };
    
    this.startTicking();
    
    this._eventEmitter.emit({
      type: 'TIMER_RESUMED',
      payload: { timerId: this._id, resumedAt }
    });
  }
  
  /**
   * Stop the timer
   */
  async stop(): Promise<void> {
    if (this._runtime.state === TimerState.IDLE || this._runtime.state === TimerState.STOPPED) {
      return;
    }
    
    const stoppedAt = new Date();
    this.stopTicking();
    this.clearAllNotifications();
    
    this._runtime = {
      ...this._runtime,
      state: TimerState.STOPPED,
      endTime: stoppedAt
    };
    
    this._eventEmitter.emit({
      type: 'TIMER_STOPPED',
      payload: { timerId: this._id, stoppedAt }
    });
  }
  
  /**
   * Reset the timer to initial state
   */
  async reset(): Promise<void> {
    const resetAt = new Date();
    this.stopTicking();
    this.clearAllNotifications();
    
    this._runtime = this.createInitialRuntime();
    
    this._eventEmitter.emit({
      type: 'TIMER_RESET',
      payload: { timerId: this._id, resetAt }
    });
  }
  
  /**
   * Set timer to specific time
   */
  async setTime(time: PrecisionTime): Promise<void> {
    ValidationUtils.validatePrecisionTime(time);
    
    this._runtime = {
      ...this._runtime,
      currentTime: time
    };
    
    // Check if any marks should be triggered at this new time
    await this.checkAndTriggerMarks();
  }
  
  /**
   * Add a new mark to the timer
   */
  async addMark(params: CreateMarkParams): Promise<TimerMark> {
    ValidationUtils.validateCreateMarkParams(params);
    
    // Check for duplicate mark times
    const existingMark = this._config.marks.find(mark => 
      TimeUtils.isEqual(mark.targetTime, params.targetTime));
    
    if (existingMark) {
      throw this.createError(TimerErrorCode.DUPLICATE_MARK_TIME,
        `Mark already exists at time: ${TimeUtils.formatTime(params.targetTime)}`);
    }
    
    const mark = this.createMark(params);
    
    this._config = {
      ...this._config,
      marks: [...this._config.marks, mark],
      updatedAt: new Date()
    };
    
    this._eventEmitter.emit({
      type: 'MARK_ADDED',
      payload: { timerId: this._id, mark }
    });
    
    return mark;
  }
  
  /**
   * Update existing mark
   */
  async updateMark(markId: MarkId, updates: UpdateMarkParams): Promise<TimerMark> {
    const markIndex = this._config.marks.findIndex(mark => mark.id === markId);
    if (markIndex === -1) {
      throw this.createError(TimerErrorCode.MARK_NOT_FOUND, 
        `Mark not found: ${markId}`);
    }
    
    const existingMark = this._config.marks[markIndex]!;
    const updatedMark: TimerMark = {
      ...existingMark,
      ...updates,
      id: markId,
      updatedAt: new Date()
    };
    
    ValidationUtils.validateTimerMark(updatedMark);
    
    const newMarks = [...this._config.marks];
    newMarks[markIndex] = updatedMark;
    
    this._config = {
      ...this._config,
      marks: newMarks,
      updatedAt: new Date()
    };
    
    this._eventEmitter.emit({
      type: 'MARK_UPDATED',
      payload: { timerId: this._id, mark: updatedMark }
    });
    
    return updatedMark;
  }
  
  /**
   * Remove mark from timer
   */
  async removeMark(markId: MarkId): Promise<void> {
    const markExists = this._config.marks.some(mark => mark.id === markId);
    if (!markExists) {
      throw this.createError(TimerErrorCode.MARK_NOT_FOUND,
        `Mark not found: ${markId}`);
    }
    
    this._config = {
      ...this._config,
      marks: this._config.marks.filter(mark => mark.id !== markId),
      updatedAt: new Date()
    };
    
    // Clear any active notifications for this mark
    this.clearNotification(markId);
    
    this._eventEmitter.emit({
      type: 'MARK_REMOVED',
      payload: { timerId: this._id, markId }
    });
  }
  
  /**
   * Acknowledge mark notification
   */
  async acknowledgeNotification(markId: MarkId): Promise<void> {
    const notification = this._runtime.activeNotifications.find(n => n.markId === markId);
    if (!notification) {
      return;
    }
    
    this.clearNotification(markId);
    
    this._runtime = {
      ...this._runtime,
      activeNotifications: this._runtime.activeNotifications.filter(n => n.markId !== markId)
    };
  }
  
  /**
   * Destroy timer and cleanup resources
   */
  destroy(): void {
    this.stopTicking();
    this.clearAllNotifications();
    this._notificationTimeouts.clear();
  }
  
  // Private implementation methods
  
  private createConfig(params: CreateTimerParams): TimerConfig {
    const now = new Date();
    return {
      id: this._id,
      name: params.name,
      description: params.description,
      targetDuration: params.targetDuration,
      isCountdown: params.isCountdown ?? false,
      marks: params.marks?.map(mark => this.createMark(mark)) ?? [],
      autoStart: params.autoStart ?? false,
      autoReset: params.autoReset ?? false,
      precision: params.precision ?? TimerPrecision.CENTISECONDS,
      createdAt: now,
      updatedAt: now
    };
  }
  
  private createInitialRuntime(): TimerRuntime {
    const initialTime = this._config.isCountdown && this._config.targetDuration 
      ? this._config.targetDuration 
      : TimeUtils.createPrecisionTime(0, 0, 0);
      
    return {
      id: this._id,
      state: TimerState.IDLE,
      currentTime: initialTime,
      pausedDuration: 0,
      triggeredMarks: new Set(),
      activeNotifications: [],
      lastTick: 0,
      tickRate: this.getTickRate()
    };
  }
  
  private createMark(params: CreateMarkParams): TimerMark {
    const now = new Date();
    return {
      id: TimeUtils.generateId(),
      name: params.name,
      targetTime: params.targetTime,
      description: params.description,
      notificationSettings: {
        blinkCount: 3,
        blinkColor: '#FF0000',
        blinkDurationMs: 200,
        soundEnabled: false,
        vibrationEnabled: false,
        ...params.notificationSettings
      },
      isEnabled: params.isEnabled ?? true,
      createdAt: now,
      updatedAt: now
    };
  }
  
  private getTickRate(): number {
    switch (this._config.precision) {
      case TimerPrecision.MILLISECONDS:
        return 1;
      case TimerPrecision.CENTISECONDS:
        return 10;
      case TimerPrecision.SECONDS:
        return 1000;
      default:
        return 10;
    }
  }
  
  private startTicking(): void {
    if (this._tickInterval) {
      clearInterval(this._tickInterval);
    }
    
    this._tickInterval = setInterval(() => {
      this.tick();
    }, this._runtime.tickRate);
  }
  
  private stopTicking(): void {
    if (this._tickInterval) {
      clearInterval(this._tickInterval);
      this._tickInterval = null;
    }
  }
  
  private tick(): void {
    const now = performance.now();
    const deltaMs = now - this._runtime.lastTick;
    
    let newTime: PrecisionTime;
    
    if (this._config.isCountdown) {
      const deltaCentiseconds = Math.floor(deltaMs / 10);
      newTime = TimeUtils.subtractCentiseconds(this._runtime.currentTime, deltaCentiseconds);
      
      // Check for completion
      if (newTime.totalCentiseconds <= 0) {
        newTime = TimeUtils.createPrecisionTime(0, 0, 0);
        this.complete();
        return;
      }
    } else {
      const deltaCentiseconds = Math.floor(deltaMs / 10);
      newTime = TimeUtils.addCentiseconds(this._runtime.currentTime, deltaCentiseconds);
    }
    
    this._runtime = {
      ...this._runtime,
      currentTime: newTime,
      lastTick: now
    };
    
    this._eventEmitter.emit({
      type: 'TIMER_TICK',
      payload: { timerId: this._id, currentTime: newTime }
    });
    
    // Check for mark triggers
    this.checkAndTriggerMarks();
  }
  
  private async complete(): Promise<void> {
    const completedAt = new Date();
    this.stopTicking();
    
    this._runtime = {
      ...this._runtime,
      state: TimerState.COMPLETED,
      endTime: completedAt
    };
    
    this._eventEmitter.emit({
      type: 'TIMER_COMPLETED',
      payload: { timerId: this._id, completedAt }
    });
    
    if (this._config.autoReset) {
      setTimeout(() => this.reset(), 1000);
    }
  }
  
  private checkAndTriggerMarks(): void {
    for (const mark of this._config.marks) {
      if (!mark.isEnabled || this._runtime.triggeredMarks.has(mark.id)) {
        continue;
      }
      
      const shouldTrigger = this._config.isCountdown
        ? this._runtime.currentTime.totalCentiseconds <= mark.targetTime.totalCentiseconds
        : this._runtime.currentTime.totalCentiseconds >= mark.targetTime.totalCentiseconds;
      
      if (shouldTrigger) {
        this.triggerMark(mark);
      }
    }
  }
  
  private triggerMark(mark: TimerMark): void {
    const triggeredAt = new Date();
    
    // Add to triggered marks
    this._runtime = {
      ...this._runtime,
      triggeredMarks: new Set([...this._runtime.triggeredMarks, mark.id])
    };
    
    // Emit mark triggered event
    this._eventEmitter.emit({
      type: 'MARK_TRIGGERED',
      payload: { timerId: this._id, mark, triggeredAt }
    });
    
    // Start notification sequence
    this.startMarkNotification(mark, triggeredAt);
  }
  
  private startMarkNotification(mark: TimerMark, triggeredAt: Date): void {
    const notification: MarkNotification = {
      markId: mark.id,
      timerId: this._id,
      state: MarkNotificationState.TRIGGERED,
      triggeredAt,
      blinkCount: 0,
      maxBlinkCount: mark.notificationSettings.blinkCount
    };
    
    this._runtime = {
      ...this._runtime,
      activeNotifications: [...this._runtime.activeNotifications, notification]
    };
    
    this._eventEmitter.emit({
      type: 'MARK_NOTIFICATION_STARTED',
      payload: notification
    });
    
    this.executeBlinkSequence(mark, notification);
  }
  
  private executeBlinkSequence(mark: TimerMark, notification: MarkNotification): void {
    let currentBlink = 0;
    const { blinkDurationMs, blinkCount } = mark.notificationSettings;
    
    const blinkInterval = setInterval(() => {
      currentBlink++;
      
      this._eventEmitter.emit({
        type: 'MARK_NOTIFICATION_BLINK',
        payload: { notificationId: mark.id, blinkCount: currentBlink }
      });
      
      if (currentBlink >= blinkCount) {
        clearInterval(blinkInterval);
        this.completeNotification(mark.id);
      }
    }, blinkDurationMs * 2); // Blink on/off cycle
    
    this._notificationTimeouts.set(mark.id, blinkInterval);
  }
  
  private completeNotification(markId: MarkId): void {
    const completedAt = new Date();
    
    this._runtime = {
      ...this._runtime,
      activeNotifications: this._runtime.activeNotifications.filter(n => n.markId !== markId)
    };
    
    this._eventEmitter.emit({
      type: 'MARK_NOTIFICATION_COMPLETED',
      payload: { notificationId: markId, completedAt }
    });
    
    this._notificationTimeouts.delete(markId);
  }
  
  private clearNotification(markId: MarkId): void {
    const timeout = this._notificationTimeouts.get(markId);
    if (timeout) {
      clearInterval(timeout);
      this._notificationTimeouts.delete(markId);
    }
  }
  
  private clearAllNotifications(): void {
    for (const timeout of this._notificationTimeouts.values()) {
      clearInterval(timeout);
    }
    this._notificationTimeouts.clear();
    
    this._runtime = {
      ...this._runtime,
      activeNotifications: []
    };
  }
  
  private async validateCommand(command: TimerCommand): Promise<void> {
    switch (command.type) {
      case 'SET_TIME':
        ValidationUtils.validatePrecisionTime(command.payload);
        break;
      case 'ADD_MARK':
        ValidationUtils.validateCreateMarkParams(command.payload);
        break;
      case 'UPDATE_MARK':
        ValidationUtils.validateUpdateMarkParams(command.payload.updates);
        break;
    }
  }
  
  private async processCommand(command: TimerCommand): Promise<void> {
    switch (command.type) {
      case 'START':
        return this.start();
      case 'PAUSE':
        return this.pause();
      case 'RESUME':
        return this.resume();
      case 'STOP':
        return this.stop();
      case 'RESET':
        return this.reset();
      case 'SET_TIME':
        return this.setTime(command.payload);
      case 'ADD_MARK':
        await this.addMark(command.payload);
        break;
      case 'UPDATE_MARK':
        await this.updateMark(command.payload.markId, command.payload.updates);
        break;
      case 'REMOVE_MARK':
        return this.removeMark(command.payload);
      case 'TOGGLE_MARK':
        await this.toggleMark(command.payload);
        break;
      case 'ACKNOWLEDGE_NOTIFICATION':
        return this.acknowledgeNotification(command.payload);
    }
  }
  
  private async toggleMark(markId: MarkId): Promise<void> {
    const mark = this._config.marks.find(m => m.id === markId);
    if (!mark) {
      throw this.createError(TimerErrorCode.MARK_NOT_FOUND, `Mark not found: ${markId}`);
    }
    
    await this.updateMark(markId, { isEnabled: !mark.isEnabled });
  }
  
  private createError(code: TimerErrorCode, message: string, details?: Record<string, unknown>): TimerError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
      timerId: this._id
    };
  }
  
  private handleError(error: Error, command: TimerCommand): void {
    const timerError: TimerError = error instanceof Error 
      ? {
          code: TimerErrorCode.VALIDATION_ERROR,
          message: error.message,
          timestamp: new Date(),
          timerId: this._id,
          details: { command }
        }
      : error as TimerError;
    
    this._eventEmitter.emit({
      type: 'ERROR',
      payload: { timerId: this._id, error: timerError }
    });
  }
}