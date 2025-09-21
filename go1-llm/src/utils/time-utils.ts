/**
 * High-precision time utilities for centisecond accuracy
 * Provides comprehensive time manipulation and formatting functions
 */

import type { PrecisionTime } from '../types/timer.types.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Comprehensive time utilities with high precision support
 */
export class TimeUtils {
  private static readonly CENTISECONDS_PER_SECOND = 100;
  private static readonly CENTISECONDS_PER_MINUTE = 6000;
  private static readonly SECONDS_PER_MINUTE = 60;
  
  /**
   * Create PrecisionTime from individual components
   */
  static createPrecisionTime(minutes: number, seconds: number, centiseconds: number): PrecisionTime {
    // Normalize input values
    const totalCentiseconds = this.normalizeToCentiseconds(minutes, seconds, centiseconds);
    
    // Calculate normalized components
    const normalizedMinutes = Math.floor(totalCentiseconds / this.CENTISECONDS_PER_MINUTE);
    const remainingCentiseconds = totalCentiseconds % this.CENTISECONDS_PER_MINUTE;
    const normalizedSeconds = Math.floor(remainingCentiseconds / this.CENTISECONDS_PER_SECOND);
    const normalizedCentiseconds = remainingCentiseconds % this.CENTISECONDS_PER_SECOND;
    
    return {
      minutes: normalizedMinutes,
      seconds: normalizedSeconds,
      centiseconds: normalizedCentiseconds,
      totalCentiseconds
    };
  }
  
  /**
   * Create PrecisionTime from total centiseconds
   */
  static fromCentiseconds(totalCentiseconds: number): PrecisionTime {
    const minutes = Math.floor(totalCentiseconds / this.CENTISECONDS_PER_MINUTE);
    const remainingCentiseconds = totalCentiseconds % this.CENTISECONDS_PER_MINUTE;
    const seconds = Math.floor(remainingCentiseconds / this.CENTISECONDS_PER_SECOND);
    const centiseconds = remainingCentiseconds % this.CENTISECONDS_PER_SECOND;
    
    return {
      minutes,
      seconds,
      centiseconds,
      totalCentiseconds
    };
  }
  
  /**
   * Create PrecisionTime from milliseconds
   */
  static fromMilliseconds(milliseconds: number): PrecisionTime {
    return this.fromCentiseconds(Math.floor(milliseconds / 10));
  }
  
  /**
   * Create PrecisionTime from seconds
   */
  static fromSeconds(seconds: number): PrecisionTime {
    return this.fromCentiseconds(seconds * this.CENTISECONDS_PER_SECOND);
  }
  
  /**
   * Create PrecisionTime from time string (MM:SS.CC format)
   */
  static fromTimeString(timeString: string): PrecisionTime {
    const timeRegex = /^(\d{1,3}):(\d{2})(?:\.(\d{2}))?$/;
    const match = timeString.match(timeRegex);
    
    if (!match) {
      throw new Error(`Invalid time format: ${timeString}. Expected MM:SS.CC or MM:SS`);
    }
    
    const minutes = parseInt(match[1]!, 10);
    const seconds = parseInt(match[2]!, 10);
    const centiseconds = match[3] ? parseInt(match[3], 10) : 0;
    
    if (seconds >= 60 || centiseconds >= 100) {
      throw new Error(`Invalid time values: seconds (${seconds}) must be < 60, centiseconds (${centiseconds}) must be < 100`);
    }
    
    return this.createPrecisionTime(minutes, seconds, centiseconds);
  }
  
  /**
   * Convert PrecisionTime to milliseconds
   */
  static toMilliseconds(time: PrecisionTime): number {
    return time.totalCentiseconds * 10;
  }
  
  /**
   * Convert PrecisionTime to seconds (with decimal)
   */
  static toDecimalSeconds(time: PrecisionTime): number {
    return time.totalCentiseconds / this.CENTISECONDS_PER_SECOND;
  }
  
  /**
   * Add centiseconds to PrecisionTime
   */
  static addCentiseconds(time: PrecisionTime, centiseconds: number): PrecisionTime {
    return this.fromCentiseconds(time.totalCentiseconds + centiseconds);
  }
  
  /**
   * Subtract centiseconds from PrecisionTime
   */
  static subtractCentiseconds(time: PrecisionTime, centiseconds: number): PrecisionTime {
    const result = time.totalCentiseconds - centiseconds;
    return this.fromCentiseconds(Math.max(0, result));
  }
  
  /**
   * Add two PrecisionTime values
   */
  static add(time1: PrecisionTime, time2: PrecisionTime): PrecisionTime {
    return this.fromCentiseconds(time1.totalCentiseconds + time2.totalCentiseconds);
  }
  
  /**
   * Subtract two PrecisionTime values
   */
  static subtract(time1: PrecisionTime, time2: PrecisionTime): PrecisionTime {
    const result = time1.totalCentiseconds - time2.totalCentiseconds;
    return this.fromCentiseconds(Math.max(0, result));
  }
  
  /**
   * Compare two PrecisionTime values
   */
  static compare(time1: PrecisionTime, time2: PrecisionTime): number {
    return time1.totalCentiseconds - time2.totalCentiseconds;
  }
  
  /**
   * Check if two PrecisionTime values are equal
   */
  static isEqual(time1: PrecisionTime, time2: PrecisionTime): boolean {
    return time1.totalCentiseconds === time2.totalCentiseconds;
  }
  
  /**
   * Check if time1 is less than time2
   */
  static isLess(time1: PrecisionTime, time2: PrecisionTime): boolean {
    return time1.totalCentiseconds < time2.totalCentiseconds;
  }
  
  /**
   * Check if time1 is greater than time2
   */
  static isGreater(time1: PrecisionTime, time2: PrecisionTime): boolean {
    return time1.totalCentiseconds > time2.totalCentiseconds;
  }
  
  /**
   * Check if time1 is less than or equal to time2
   */
  static isLessOrEqual(time1: PrecisionTime, time2: PrecisionTime): boolean {
    return time1.totalCentiseconds <= time2.totalCentiseconds;
  }
  
  /**
   * Check if time1 is greater than or equal to time2
   */
  static isGreaterOrEqual(time1: PrecisionTime, time2: PrecisionTime): boolean {
    return time1.totalCentiseconds >= time2.totalCentiseconds;
  }
  
  /**
   * Check if PrecisionTime is zero
   */
  static isZero(time: PrecisionTime): boolean {
    return time.totalCentiseconds === 0;
  }
  
  /**
   * Get the minimum of two PrecisionTime values
   */
  static min(time1: PrecisionTime, time2: PrecisionTime): PrecisionTime {
    return this.isLess(time1, time2) ? time1 : time2;
  }
  
  /**
   * Get the maximum of two PrecisionTime values
   */
  static max(time1: PrecisionTime, time2: PrecisionTime): PrecisionTime {
    return this.isGreater(time1, time2) ? time1 : time2;
  }
  
  /**
   * Format PrecisionTime as string with various options
   */
  static formatTime(time: PrecisionTime, options: TimeFormatOptions = {}): string {
    const {
      showCentiseconds = true,
      showMinutes = true,
      padMinutes = true,
      separator = ':',
      centisecondSeparator = '.',
      minWidth = 'auto'
    } = options;
    
    let formatted = '';
    
    if (showMinutes || time.minutes > 0) {
      if (padMinutes) {
        formatted += time.minutes.toString().padStart(2, '0');
      } else {
        formatted += time.minutes.toString();
      }
      formatted += separator;
    }
    
    formatted += time.seconds.toString().padStart(2, '0');
    
    if (showCentiseconds) {
      formatted += centisecondSeparator;
      formatted += time.centiseconds.toString().padStart(2, '0');
    }
    
    // Apply minimum width padding if specified
    if (minWidth !== 'auto') {
      formatted = formatted.padStart(minWidth, '0');
    }
    
    return formatted;
  }
  
  /**
   * Format PrecisionTime as compact string (e.g., "5m30.25s")
   */
  static formatCompact(time: PrecisionTime): string {
    let formatted = '';
    
    if (time.minutes > 0) {
      formatted += `${time.minutes}m`;
    }
    
    if (time.seconds > 0 || time.centiseconds > 0) {
      if (time.centiseconds > 0) {
        const decimalSeconds = time.seconds + time.centiseconds / 100;
        formatted += `${decimalSeconds.toFixed(2)}s`;
      } else {
        formatted += `${time.seconds}s`;
      }
    }
    
    return formatted || '0s';
  }
  
  /**
   * Format PrecisionTime as human-readable string
   */
  static formatHuman(time: PrecisionTime): string {
    const parts: string[] = [];
    
    if (time.minutes > 0) {
      parts.push(`${time.minutes} minute${time.minutes === 1 ? '' : 's'}`);
    }
    
    if (time.seconds > 0) {
      parts.push(`${time.seconds} second${time.seconds === 1 ? '' : 's'}`);
    }
    
    if (time.centiseconds > 0) {
      parts.push(`${time.centiseconds} centisecond${time.centiseconds === 1 ? '' : 's'}`);
    }
    
    if (parts.length === 0) {
      return '0 seconds';
    }
    
    if (parts.length === 1) {
      return parts[0]!;
    }
    
    if (parts.length === 2) {
      return `${parts[0]} and ${parts[1]}`;
    }
    
    return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
  }
  
  /**
   * Parse various time formats and return PrecisionTime
   */
  static parseTimeInput(input: string): PrecisionTime {
    // Try different formats
    const formats = [
      // MM:SS.CC
      /^(\d{1,3}):(\d{2})\.(\d{2})$/,
      // MM:SS
      /^(\d{1,3}):(\d{2})$/,
      // SS.CC
      /^(\d{1,2})\.(\d{2})$/,
      // SS
      /^(\d{1,3})$/
    ];
    
    for (const format of formats) {
      const match = input.match(format);
      if (match) {
        switch (format) {
          case formats[0]: // MM:SS.CC
            return this.createPrecisionTime(
              parseInt(match[1]!, 10),
              parseInt(match[2]!, 10),
              parseInt(match[3]!, 10)
            );
          case formats[1]: // MM:SS
            return this.createPrecisionTime(
              parseInt(match[1]!, 10),
              parseInt(match[2]!, 10),
              0
            );
          case formats[2]: // SS.CC
            return this.createPrecisionTime(
              0,
              parseInt(match[1]!, 10),
              parseInt(match[2]!, 10)
            );
          case formats[3]: // SS
            return this.createPrecisionTime(
              0,
              parseInt(match[1]!, 10),
              0
            );
        }
      }
    }
    
    throw new Error(`Unable to parse time input: ${input}`);
  }
  
  /**
   * Generate unique ID
   */
  static generateId(): string {
    return uuidv4();
  }
  
  /**
   * Get current high-resolution timestamp
   */
  static getHighResolutionTimestamp(): number {
    return performance.now();
  }
  
  /**
   * Calculate percentage of target duration
   */
  static calculateProgress(current: PrecisionTime, target: PrecisionTime): number {
    if (target.totalCentiseconds === 0) {
      return 0;
    }
    
    return Math.min(100, (current.totalCentiseconds / target.totalCentiseconds) * 100);
  }
  
  /**
   * Calculate remaining time
   */
  static calculateRemaining(current: PrecisionTime, target: PrecisionTime): PrecisionTime {
    return this.subtract(target, current);
  }
  
  /**
   * Validate PrecisionTime object
   */
  static isValidPrecisionTime(time: unknown): time is PrecisionTime {
    if (typeof time !== 'object' || time === null) {
      return false;
    }
    
    const t = time as any;
    
    return (
      typeof t.minutes === 'number' &&
      typeof t.seconds === 'number' &&
      typeof t.centiseconds === 'number' &&
      typeof t.totalCentiseconds === 'number' &&
      t.minutes >= 0 &&
      t.seconds >= 0 && t.seconds < 60 &&
      t.centiseconds >= 0 && t.centiseconds < 100 &&
      t.totalCentiseconds >= 0 &&
      t.totalCentiseconds === this.normalizeToCentiseconds(t.minutes, t.seconds, t.centiseconds)
    );
  }
  
  // Private utility methods
  
  private static normalizeToCentiseconds(minutes: number, seconds: number, centiseconds: number): number {
    return (minutes * this.CENTISECONDS_PER_MINUTE) + 
           (seconds * this.CENTISECONDS_PER_SECOND) + 
           centiseconds;
  }
}

/**
 * Time formatting options
 */
export interface TimeFormatOptions {
  readonly showCentiseconds?: boolean;
  readonly showMinutes?: boolean;
  readonly padMinutes?: boolean;
  readonly separator?: string;
  readonly centisecondSeparator?: string;
  readonly minWidth?: number | 'auto';
}