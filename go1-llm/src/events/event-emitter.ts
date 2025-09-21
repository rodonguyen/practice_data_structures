/**
 * Timer-specific event emitter
 */

import type {
  TimerId,
  TimerEvent,
  TimerEventHandler,
  EventSubscription
} from '../types/timer.types.js';

import { TimeUtils } from '../utils/time-utils.js';

/**
 * Timer-specific event emitter with subscription management
 */
export class EventEmitter {
  private readonly _subscriptions: Map<string, EventSubscription> = new Map();
  private readonly _eventHandlers: Map<string, Set<EventSubscription>> = new Map();
  private _isDestroyed: boolean = false;
  
  /**
   * Emit an event to all subscribers
   */
  emit(event: TimerEvent): void {
    if (this._isDestroyed) {
      return;
    }
    
    const eventHandlers = this._eventHandlers.get(event.type);
    if (!eventHandlers) {
      return;
    }
    
    // Create a copy to avoid issues with concurrent modifications
    const handlersToNotify = Array.from(eventHandlers);
    
    for (const subscription of handlersToNotify) {
      try {
        // Filter by timerId if subscription specifies one
        if (subscription.timerId && 'timerId' in event.payload) {
          if ((event.payload as any).timerId !== subscription.timerId) {
            continue;
          }
        }
        
        subscription.handler(event);
      } catch (error) {
        console.error('Error handling timer event:', error);
      }
    }
  }
  
  /**
   * Subscribe to specific event type
   */
  subscribe(
    eventType: TimerEvent['type'],
    handler: TimerEventHandler,
    timerId?: TimerId
  ): EventSubscription {
    if (this._isDestroyed) {
      throw new Error('Cannot subscribe to destroyed event emitter');
    }
    
    const subscription: EventSubscription = {
      id: TimeUtils.generateId(),
      eventType,
      handler,
      timerId,
      unsubscribe: () => this.unsubscribe(subscription.id)
    };
    
    this._subscriptions.set(subscription.id, subscription);
    
    if (!this._eventHandlers.has(eventType)) {
      this._eventHandlers.set(eventType, new Set());
    }
    this._eventHandlers.get(eventType)!.add(subscription);
    
    return subscription;
  }
  
  /**
   * Unsubscribe by subscription ID
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this._subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }
    
    this._subscriptions.delete(subscriptionId);
    
    const eventHandlers = this._eventHandlers.get(subscription.eventType);
    if (eventHandlers) {
      eventHandlers.delete(subscription);
      if (eventHandlers.size === 0) {
        this._eventHandlers.delete(subscription.eventType);
      }
    }
    
    return true;
  }
  
  /**
   * Clear all subscriptions
   */
  clear(): void {
    this._subscriptions.clear();
    this._eventHandlers.clear();
  }
  
  /**
   * Destroy event emitter and cleanup resources
   */
  destroy(): void {
    if (this._isDestroyed) {
      return;
    }
    
    this.clear();
    this._isDestroyed = true;
  }
  
  /**
   * Check if emitter is destroyed
   */
  get isDestroyed(): boolean {
    return this._isDestroyed;
  }
  
  /**
   * Get subscription count
   */
  getSubscriptionCount(): number {
    return this._subscriptions.size;
  }
}

/**
 * Scoped event emitter for specific timer context
 */
export class ScopedEventEmitter {
  constructor(
    private readonly _parentEmitter: EventEmitter,
    private readonly _timerId: TimerId
  ) {}
  
  /**
   * Emit event with timer scope
   */
  emit(event: TimerEvent): void {
    // Ensure event payload includes timerId
    const scopedEvent = {
      ...event,
      payload: {
        ...event.payload,
        timerId: this._timerId
      }
    } as TimerEvent;
    
    this._parentEmitter.emit(scopedEvent);
  }
  
  /**
   * Subscribe to events for this timer only
   */
  subscribe(
    eventType: TimerEvent['type'],
    handler: TimerEventHandler
  ): EventSubscription {
    return this._parentEmitter.subscribe(eventType, handler, this._timerId);
  }
  
  /**
   * Get timer ID
   */
  get timerId(): TimerId {
    return this._timerId;
  }
}

/**
 * Event emitter statistics interface
 */
export interface EventEmitterStatistics {
  readonly totalSubscriptions: number;
  readonly totalEventTypes: number;
  readonly eventTypeStats: Record<string, number>;
  readonly isDestroyed: boolean;
}