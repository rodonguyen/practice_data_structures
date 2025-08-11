/**
 * Core TypeScript interfaces and types for enhanced timer system
 * Provides type-safe definitions for multi-timer application with interval marks
 */

/** Unique identifier type for timers and marks */
export type TimerId = string;
export type MarkId = string;

/** Timer state enumeration with comprehensive status tracking */
export enum TimerState {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  STOPPED = 'stopped'
}

/** Mark notification states for visual feedback system */
export enum MarkNotificationState {
  PENDING = 'pending',
  TRIGGERED = 'triggered',
  ACKNOWLEDGED = 'acknowledged'
}

/** High-precision time representation in centiseconds */
export interface PrecisionTime {
  readonly minutes: number;
  readonly seconds: number;
  readonly centiseconds: number;
  readonly totalCentiseconds: number;
}

/** Timer mark configuration with precise timing and notification settings */
export interface TimerMark {
  readonly id: MarkId;
  readonly name: string;
  readonly targetTime: PrecisionTime;
  readonly description?: string;
  readonly notificationSettings: MarkNotificationSettings;
  readonly isEnabled: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Mark notification configuration for visual feedback */
export interface MarkNotificationSettings {
  readonly blinkCount: number;
  readonly blinkColor: string;
  readonly blinkDurationMs: number;
  readonly soundEnabled: boolean;
  readonly soundUrl?: string;
  readonly vibrationEnabled: boolean;
}

/** Comprehensive timer configuration with marks support */
export interface TimerConfig {
  readonly id: TimerId;
  readonly name: string;
  readonly description?: string;
  readonly targetDuration?: PrecisionTime;
  readonly isCountdown: boolean;
  readonly marks: ReadonlyArray<TimerMark>;
  readonly autoStart: boolean;
  readonly autoReset: boolean;
  readonly precision: TimerPrecision;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Timer precision configuration for different use cases */
export enum TimerPrecision {
  SECONDS = 'seconds',
  CENTISECONDS = 'centiseconds',
  MILLISECONDS = 'milliseconds'
}

/** Current timer runtime state with high precision */
export interface TimerRuntime {
  readonly id: TimerId;
  readonly state: TimerState;
  readonly currentTime: PrecisionTime;
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly pausedDuration: number;
  readonly triggeredMarks: ReadonlySet<MarkId>;
  readonly activeNotifications: ReadonlyArray<MarkNotification>;
  readonly lastTick: number;
  readonly tickRate: number;
}

/** Active mark notification with state tracking */
export interface MarkNotification {
  readonly markId: MarkId;
  readonly timerId: TimerId;
  readonly state: MarkNotificationState;
  readonly triggeredAt: Date;
  readonly blinkCount: number;
  readonly maxBlinkCount: number;
}

/** Immutable timer snapshot combining config and runtime */
export interface TimerSnapshot {
  readonly config: TimerConfig;
  readonly runtime: TimerRuntime;
}

/** Timer creation parameters with sensible defaults */
export interface CreateTimerParams {
  readonly name: string;
  readonly description?: string;
  readonly targetDuration?: PrecisionTime;
  readonly isCountdown?: boolean;
  readonly marks?: ReadonlyArray<Omit<TimerMark, 'id' | 'createdAt' | 'updatedAt'>>;
  readonly autoStart?: boolean;
  readonly autoReset?: boolean;
  readonly precision?: TimerPrecision;
}

/** Mark creation parameters for interval management */
export interface CreateMarkParams {
  readonly name: string;
  readonly targetTime: PrecisionTime;
  readonly description?: string;
  readonly notificationSettings?: Partial<MarkNotificationSettings>;
  readonly isEnabled?: boolean;
}

/** Mark update parameters with partial updates */
export interface UpdateMarkParams {
  readonly name?: string;
  readonly targetTime?: PrecisionTime;
  readonly description?: string;
  readonly notificationSettings?: Partial<MarkNotificationSettings>;
  readonly isEnabled?: boolean;
}

/** Timer control commands for state management */
export type TimerCommand = 
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'RESET' }
  | { type: 'SET_TIME'; payload: PrecisionTime }
  | { type: 'ADD_MARK'; payload: CreateMarkParams }
  | { type: 'UPDATE_MARK'; payload: { markId: MarkId; updates: UpdateMarkParams } }
  | { type: 'REMOVE_MARK'; payload: MarkId }
  | { type: 'TOGGLE_MARK'; payload: MarkId }
  | { type: 'ACKNOWLEDGE_NOTIFICATION'; payload: MarkId };

/** Timer events for reactive programming */
export type TimerEvent =
  | { type: 'TIMER_CREATED'; payload: TimerSnapshot }
  | { type: 'TIMER_STARTED'; payload: { timerId: TimerId; startTime: Date } }
  | { type: 'TIMER_PAUSED'; payload: { timerId: TimerId; pausedAt: Date } }
  | { type: 'TIMER_RESUMED'; payload: { timerId: TimerId; resumedAt: Date } }
  | { type: 'TIMER_STOPPED'; payload: { timerId: TimerId; stoppedAt: Date } }
  | { type: 'TIMER_RESET'; payload: { timerId: TimerId; resetAt: Date } }
  | { type: 'TIMER_COMPLETED'; payload: { timerId: TimerId; completedAt: Date } }
  | { type: 'TIMER_TICK'; payload: { timerId: TimerId; currentTime: PrecisionTime } }
  | { type: 'MARK_TRIGGERED'; payload: { timerId: TimerId; mark: TimerMark; triggeredAt: Date } }
  | { type: 'MARK_NOTIFICATION_STARTED'; payload: MarkNotification }
  | { type: 'MARK_NOTIFICATION_BLINK'; payload: { notificationId: MarkId; blinkCount: number } }
  | { type: 'MARK_NOTIFICATION_COMPLETED'; payload: { notificationId: MarkId; completedAt: Date } }
  | { type: 'MARK_ADDED'; payload: { timerId: TimerId; mark: TimerMark } }
  | { type: 'MARK_UPDATED'; payload: { timerId: TimerId; mark: TimerMark } }
  | { type: 'MARK_REMOVED'; payload: { timerId: TimerId; markId: MarkId } }
  | { type: 'ERROR'; payload: { timerId: TimerId; error: TimerError } };

/** Comprehensive error types for robust error handling */
export interface TimerError {
  readonly code: TimerErrorCode;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Date;
  readonly timerId?: TimerId;
  readonly markId?: MarkId;
}

export enum TimerErrorCode {
  TIMER_NOT_FOUND = 'TIMER_NOT_FOUND',
  MARK_NOT_FOUND = 'MARK_NOT_FOUND',
  INVALID_TIME_FORMAT = 'INVALID_TIME_FORMAT',
  INVALID_TIMER_STATE = 'INVALID_TIMER_STATE',
  DUPLICATE_MARK_TIME = 'DUPLICATE_MARK_TIME',
  MARK_TIME_OUT_OF_BOUNDS = 'MARK_TIME_OUT_OF_BOUNDS',
  NOTIFICATION_SYSTEM_ERROR = 'NOTIFICATION_SYSTEM_ERROR',
  PERSISTENCE_ERROR = 'PERSISTENCE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

/** Utility type for timer collections with type safety */
export type TimerCollection = ReadonlyMap<TimerId, TimerSnapshot>;

/** Event handler type for reactive timer system */
export type TimerEventHandler<T extends TimerEvent = TimerEvent> = (event: T) => void;

/** Subscription management for event system */
export interface EventSubscription {
  readonly id: string;
  readonly eventType: TimerEvent['type'];
  readonly handler: TimerEventHandler;
  readonly timerId?: TimerId;
  unsubscribe(): void;
}