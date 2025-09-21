/**
 * Comprehensive validation utilities for timer system
 * Provides type-safe validation with detailed error messages
 */

import type {
  PrecisionTime,
  TimerMark,
  CreateMarkParams,
  UpdateMarkParams,
  CreateTimerParams,
  MarkNotificationSettings
} from '../types/timer.types.js';

import {
  TimerPrecision
} from '../types/timer.types.js';

import { TimeUtils } from './time-utils.js';

/**
 * Validation utilities with comprehensive type checking and business logic validation
 */
export class ValidationUtils {
  private static readonly MAX_TIMER_NAME_LENGTH = 100;
  private static readonly MAX_DESCRIPTION_LENGTH = 500;
  private static readonly MAX_MARK_NAME_LENGTH = 50;
  private static readonly MIN_BLINK_DURATION_MS = 50;
  private static readonly MAX_BLINK_DURATION_MS = 2000;
  private static readonly MIN_BLINK_COUNT = 1;
  private static readonly MAX_BLINK_COUNT = 10;
  private static readonly MAX_TIMER_DURATION_HOURS = 24;
  
  /**
   * Validate PrecisionTime object
   */
  static validatePrecisionTime(time: unknown, fieldName = 'time'): asserts time is PrecisionTime {
    if (!TimeUtils.isValidPrecisionTime(time)) {
      throw new ValidationError(`Invalid ${fieldName}: must be a valid PrecisionTime object`);
    }
    
    const maxTotalCentiseconds = this.MAX_TIMER_DURATION_HOURS * 60 * 60 * 100;
    if (time.totalCentiseconds > maxTotalCentiseconds) {
      throw new ValidationError(
        `Invalid ${fieldName}: duration cannot exceed ${this.MAX_TIMER_DURATION_HOURS} hours`
      );
    }
  }
  
  /**
   * Validate timer name
   */
  static validateTimerName(name: unknown, fieldName = 'name'): asserts name is string {
    if (typeof name !== 'string') {
      throw new ValidationError(`Invalid ${fieldName}: must be a string`);
    }
    
    if (name.trim().length === 0) {
      throw new ValidationError(`Invalid ${fieldName}: cannot be empty`);
    }
    
    if (name.length > this.MAX_TIMER_NAME_LENGTH) {
      throw new ValidationError(
        `Invalid ${fieldName}: cannot exceed ${this.MAX_TIMER_NAME_LENGTH} characters`
      );
    }
  }
  
  /**
   * Validate description
   */
  static validateDescription(description: unknown, fieldName = 'description'): asserts description is string | undefined {
    if (description !== undefined && typeof description !== 'string') {
      throw new ValidationError(`Invalid ${fieldName}: must be a string or undefined`);
    }
    
    if (typeof description === 'string' && description.length > this.MAX_DESCRIPTION_LENGTH) {
      throw new ValidationError(
        `Invalid ${fieldName}: cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
  }
  
  /**
   * Validate mark name
   */
  static validateMarkName(name: unknown, fieldName = 'mark name'): asserts name is string {
    if (typeof name !== 'string') {
      throw new ValidationError(`Invalid ${fieldName}: must be a string`);
    }
    
    if (name.trim().length === 0) {
      throw new ValidationError(`Invalid ${fieldName}: cannot be empty`);
    }
    
    if (name.length > this.MAX_MARK_NAME_LENGTH) {
      throw new ValidationError(
        `Invalid ${fieldName}: cannot exceed ${this.MAX_MARK_NAME_LENGTH} characters`
      );
    }
  }
  
  /**
   * Validate timer precision
   */
  static validateTimerPrecision(precision: unknown, fieldName = 'precision'): asserts precision is TimerPrecision {
    if (!Object.values(TimerPrecision).includes(precision as TimerPrecision)) {
      throw new ValidationError(
        `Invalid ${fieldName}: must be one of ${Object.values(TimerPrecision).join(', ')}`
      );
    }
  }
  
  /**
   * Validate mark notification settings
   */
  static validateMarkNotificationSettings(
    settings: unknown, 
    fieldName = 'notification settings'
  ): asserts settings is MarkNotificationSettings {
    if (typeof settings !== 'object' || settings === null) {
      throw new ValidationError(`Invalid ${fieldName}: must be an object`);
    }
    
    const s = settings as any;
    
    // Validate blink count
    if (typeof s.blinkCount !== 'number' || !Number.isInteger(s.blinkCount)) {
      throw new ValidationError(`Invalid ${fieldName}.blinkCount: must be an integer`);
    }
    
    if (s.blinkCount < this.MIN_BLINK_COUNT || s.blinkCount > this.MAX_BLINK_COUNT) {
      throw new ValidationError(
        `Invalid ${fieldName}.blinkCount: must be between ${this.MIN_BLINK_COUNT} and ${this.MAX_BLINK_COUNT}`
      );
    }
    
    // Validate blink color
    if (typeof s.blinkColor !== 'string') {
      throw new ValidationError(`Invalid ${fieldName}.blinkColor: must be a string`);
    }
    
    if (!this.isValidColor(s.blinkColor)) {
      throw new ValidationError(`Invalid ${fieldName}.blinkColor: must be a valid color value`);
    }
    
    // Validate blink duration
    if (typeof s.blinkDurationMs !== 'number' || !Number.isInteger(s.blinkDurationMs)) {
      throw new ValidationError(`Invalid ${fieldName}.blinkDurationMs: must be an integer`);
    }
    
    if (s.blinkDurationMs < this.MIN_BLINK_DURATION_MS || s.blinkDurationMs > this.MAX_BLINK_DURATION_MS) {
      throw new ValidationError(
        `Invalid ${fieldName}.blinkDurationMs: must be between ${this.MIN_BLINK_DURATION_MS} and ${this.MAX_BLINK_DURATION_MS}`
      );
    }
    
    // Validate boolean flags
    if (typeof s.soundEnabled !== 'boolean') {
      throw new ValidationError(`Invalid ${fieldName}.soundEnabled: must be a boolean`);
    }
    
    if (typeof s.vibrationEnabled !== 'boolean') {
      throw new ValidationError(`Invalid ${fieldName}.vibrationEnabled: must be a boolean`);
    }
    
    // Validate optional sound URL
    if (s.soundUrl !== undefined) {
      if (typeof s.soundUrl !== 'string') {
        throw new ValidationError(`Invalid ${fieldName}.soundUrl: must be a string or undefined`);
      }
      
      if (s.soundUrl.trim().length === 0) {
        throw new ValidationError(`Invalid ${fieldName}.soundUrl: cannot be empty string`);
      }
    }
  }
  
  /**
   * Validate create timer parameters
   */
  static validateCreateTimerParams(params: unknown): asserts params is CreateTimerParams {
    if (typeof params !== 'object' || params === null) {
      throw new ValidationError('Invalid timer parameters: must be an object');
    }
    
    const p = params as any;
    
    // Required fields
    this.validateTimerName(p.name, 'timer name');
    
    // Optional fields
    if (p.description !== undefined) {
      this.validateDescription(p.description, 'timer description');
    }
    
    if (p.targetDuration !== undefined) {
      this.validatePrecisionTime(p.targetDuration, 'target duration');
    }
    
    if (p.isCountdown !== undefined && typeof p.isCountdown !== 'boolean') {
      throw new ValidationError('Invalid isCountdown: must be a boolean');
    }
    
    if (p.marks !== undefined) {
      if (!Array.isArray(p.marks)) {
        throw new ValidationError('Invalid marks: must be an array');
      }
      
      for (let i = 0; i < p.marks.length; i++) {
        this.validateCreateMarkParams(p.marks[i], `marks[${i}]`);
      }
      
      // Check for duplicate mark times
      this.validateUniqueMarkTimes(p.marks);
    }
    
    if (p.autoStart !== undefined && typeof p.autoStart !== 'boolean') {
      throw new ValidationError('Invalid autoStart: must be a boolean');
    }
    
    if (p.autoReset !== undefined && typeof p.autoReset !== 'boolean') {
      throw new ValidationError('Invalid autoReset: must be a boolean');
    }
    
    if (p.precision !== undefined) {
      this.validateTimerPrecision(p.precision, 'timer precision');
    }
  }
  
  /**
   * Validate create mark parameters
   */
  static validateCreateMarkParams(params: unknown, fieldName = 'mark parameters'): asserts params is CreateMarkParams {
    if (typeof params !== 'object' || params === null) {
      throw new ValidationError(`Invalid ${fieldName}: must be an object`);
    }
    
    const p = params as any;
    
    // Required fields
    this.validateMarkName(p.name, `${fieldName}.name`);
    this.validatePrecisionTime(p.targetTime, `${fieldName}.targetTime`);
    
    // Optional fields
    if (p.description !== undefined) {
      this.validateDescription(p.description, `${fieldName}.description`);
    }
    
    if (p.notificationSettings !== undefined) {
      this.validatePartialMarkNotificationSettings(p.notificationSettings, `${fieldName}.notificationSettings`);
    }
    
    if (p.isEnabled !== undefined && typeof p.isEnabled !== 'boolean') {
      throw new ValidationError(`Invalid ${fieldName}.isEnabled: must be a boolean`);
    }
  }
  
  /**
   * Validate update mark parameters
   */
  static validateUpdateMarkParams(params: unknown, fieldName = 'mark update parameters'): asserts params is UpdateMarkParams {
    if (typeof params !== 'object' || params === null) {
      throw new ValidationError(`Invalid ${fieldName}: must be an object`);
    }
    
    const p = params as any;
    
    // All fields are optional for updates
    if (p.name !== undefined) {
      this.validateMarkName(p.name, `${fieldName}.name`);
    }
    
    if (p.targetTime !== undefined) {
      this.validatePrecisionTime(p.targetTime, `${fieldName}.targetTime`);
    }
    
    if (p.description !== undefined) {
      this.validateDescription(p.description, `${fieldName}.description`);
    }
    
    if (p.notificationSettings !== undefined) {
      this.validatePartialMarkNotificationSettings(p.notificationSettings, `${fieldName}.notificationSettings`);
    }
    
    if (p.isEnabled !== undefined && typeof p.isEnabled !== 'boolean') {
      throw new ValidationError(`Invalid ${fieldName}.isEnabled: must be a boolean`);
    }
  }
  
  /**
   * Validate complete timer mark object
   */
  static validateTimerMark(mark: unknown, fieldName = 'timer mark'): asserts mark is TimerMark {
    if (typeof mark !== 'object' || mark === null) {
      throw new ValidationError(`Invalid ${fieldName}: must be an object`);
    }
    
    const m = mark as any;
    
    // Validate all required fields
    if (typeof m.id !== 'string' || m.id.trim().length === 0) {
      throw new ValidationError(`Invalid ${fieldName}.id: must be a non-empty string`);
    }
    
    this.validateMarkName(m.name, `${fieldName}.name`);
    this.validatePrecisionTime(m.targetTime, `${fieldName}.targetTime`);
    
    if (m.description !== undefined) {
      this.validateDescription(m.description, `${fieldName}.description`);
    }
    
    this.validateMarkNotificationSettings(m.notificationSettings, `${fieldName}.notificationSettings`);
    
    if (typeof m.isEnabled !== 'boolean') {
      throw new ValidationError(`Invalid ${fieldName}.isEnabled: must be a boolean`);
    }
    
    if (!(m.createdAt instanceof Date)) {
      throw new ValidationError(`Invalid ${fieldName}.createdAt: must be a Date`);
    }
    
    if (!(m.updatedAt instanceof Date)) {
      throw new ValidationError(`Invalid ${fieldName}.updatedAt: must be a Date`);
    }
  }
  
  /**
   * Validate partial mark notification settings (for updates)
   */
  static validatePartialMarkNotificationSettings(
    settings: unknown, 
    fieldName = 'notification settings'
  ): void {
    if (typeof settings !== 'object' || settings === null) {
      throw new ValidationError(`Invalid ${fieldName}: must be an object`);
    }
    
    const s = settings as any;
    
    // All fields are optional for partial updates
    if (s.blinkCount !== undefined) {
      if (typeof s.blinkCount !== 'number' || !Number.isInteger(s.blinkCount)) {
        throw new ValidationError(`Invalid ${fieldName}.blinkCount: must be an integer`);
      }
      
      if (s.blinkCount < this.MIN_BLINK_COUNT || s.blinkCount > this.MAX_BLINK_COUNT) {
        throw new ValidationError(
          `Invalid ${fieldName}.blinkCount: must be between ${this.MIN_BLINK_COUNT} and ${this.MAX_BLINK_COUNT}`
        );
      }
    }
    
    if (s.blinkColor !== undefined) {
      if (typeof s.blinkColor !== 'string') {
        throw new ValidationError(`Invalid ${fieldName}.blinkColor: must be a string`);
      }
      
      if (!this.isValidColor(s.blinkColor)) {
        throw new ValidationError(`Invalid ${fieldName}.blinkColor: must be a valid color value`);
      }
    }
    
    if (s.blinkDurationMs !== undefined) {
      if (typeof s.blinkDurationMs !== 'number' || !Number.isInteger(s.blinkDurationMs)) {
        throw new ValidationError(`Invalid ${fieldName}.blinkDurationMs: must be an integer`);
      }
      
      if (s.blinkDurationMs < this.MIN_BLINK_DURATION_MS || s.blinkDurationMs > this.MAX_BLINK_DURATION_MS) {
        throw new ValidationError(
          `Invalid ${fieldName}.blinkDurationMs: must be between ${this.MIN_BLINK_DURATION_MS} and ${this.MAX_BLINK_DURATION_MS}`
        );
      }
    }
    
    if (s.soundEnabled !== undefined && typeof s.soundEnabled !== 'boolean') {
      throw new ValidationError(`Invalid ${fieldName}.soundEnabled: must be a boolean`);
    }
    
    if (s.vibrationEnabled !== undefined && typeof s.vibrationEnabled !== 'boolean') {
      throw new ValidationError(`Invalid ${fieldName}.vibrationEnabled: must be a boolean`);
    }
    
    if (s.soundUrl !== undefined) {
      if (typeof s.soundUrl !== 'string') {
        throw new ValidationError(`Invalid ${fieldName}.soundUrl: must be a string`);
      }
      
      if (s.soundUrl.trim().length === 0) {
        throw new ValidationError(`Invalid ${fieldName}.soundUrl: cannot be empty string`);
      }
    }
  }
  
  /**
   * Validate unique mark times in collection
   */
  static validateUniqueMarkTimes(marks: any[], fieldName = 'marks'): void {
    const seenTimes = new Set<number>();
    
    for (let i = 0; i < marks.length; i++) {
      const mark = marks[i];
      if (!mark?.targetTime) {
        continue;
      }
      
      const timeKey = mark.targetTime.totalCentiseconds;
      
      if (seenTimes.has(timeKey)) {
        const timeString = TimeUtils.formatTime(mark.targetTime);
        throw new ValidationError(
          `Invalid ${fieldName}: duplicate mark time found at ${timeString}`
        );
      }
      
      seenTimes.add(timeKey);
    }
  }
  
  /**
   * Validate mark time is within timer bounds
   */
  static validateMarkTimeInBounds(
    markTime: PrecisionTime, 
    timerDuration: PrecisionTime | undefined,
    isCountdown: boolean,
    fieldName = 'mark time'
  ): void {
    if (!timerDuration) {
      // No bounds to check for unlimited timers
      return;
    }
    
    if (isCountdown) {
      // For countdown timers, mark time should not exceed total duration
      if (TimeUtils.isGreater(markTime, timerDuration)) {
        throw new ValidationError(
          `Invalid ${fieldName}: mark time ${TimeUtils.formatTime(markTime)} exceeds timer duration ${TimeUtils.formatTime(timerDuration)}`
        );
      }
    } else {
      // For count-up timers, mark time should not exceed target duration
      if (TimeUtils.isGreater(markTime, timerDuration)) {
        throw new ValidationError(
          `Invalid ${fieldName}: mark time ${TimeUtils.formatTime(markTime)} exceeds target duration ${TimeUtils.formatTime(timerDuration)}`
        );
      }
    }
  }
  
  /**
   * Check if string is a valid color value
   */
  private static isValidColor(color: string): boolean {
    // Basic validation for common color formats
    const colorPatterns = [
      // Hex colors
      /^#([0-9A-Fa-f]{3}){1,2}$/,
      // RGB colors
      /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/,
      // RGBA colors
      /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/,
      // HSL colors
      /^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/,
      // HSLA colors
      /^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(0|1|0?\.\d+)\s*\)$/
    ];
    
    // Check against patterns
    for (const pattern of colorPatterns) {
      if (pattern.test(color)) {
        return true;
      }
    }
    
    // Check against CSS named colors
    const namedColors = [
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
      'pink', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'maroon',
      'navy', 'olive', 'teal', 'silver', 'aqua', 'fuchsia'
    ];
    
    return namedColors.includes(color.toLowerCase());
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}