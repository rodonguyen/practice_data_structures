// Simple demo of the multi-timer library
const { TimeUtils } = require('./dist/utils/time-utils.js');
const { Timer } = require('./dist/core/timer.js');
const { TimerManager } = require('./dist/core/timer-manager.js');
const { EventEmitter } = require('./dist/events/event-emitter.js');

console.log('🕐 Multi-Timer Library Demo\n');

// Create event emitter and timer manager
const eventEmitter = new EventEmitter();
const timerManager = new TimerManager();

// Subscribe to timer events
eventEmitter.subscribe('TIMER_STARTED', (event) => {
  console.log(`✅ Timer started: ${event.payload.timerId}`);
});

eventEmitter.subscribe('MARK_TRIGGERED', (event) => {
  console.log(`🔔 Mark triggered: "${event.payload.mark.name}" at ${TimeUtils.formatTime(event.payload.mark.targetTime)}`);
});

eventEmitter.subscribe('TIMER_TICK', (event) => {
  // Show tick every second (not every centisecond to avoid spam)
  const time = event.payload.currentTime;
  if (time.centiseconds === 0) {
    console.log(`   ⏱️  Current time: ${TimeUtils.formatTime(time)}`);
  }
});

console.log('Demo setup complete!');
console.log('Available classes:', {
  TimeUtils: typeof TimeUtils,
  Timer: typeof Timer,
  TimerManager: typeof TimerManager,
  EventEmitter: typeof EventEmitter
});

console.log('\nTime formatting examples:');
console.log('- 5 minutes:', TimeUtils.formatTime(TimeUtils.createPrecisionTime(5, 0, 0)));
console.log('- 1 min 30.5 sec:', TimeUtils.formatTime(TimeUtils.createPrecisionTime(1, 30, 50)));
console.log('- 45.25 seconds:', TimeUtils.formatTime(TimeUtils.createPrecisionTime(0, 45, 25)));