// Simple demo without storage
import { Timer, TimerManager, EventEmitter, TimeUtils } from './dist/index.js';

console.log('🕐 Simple Multi-Timer Demo\n');

// Create event emitter and timer manager without storage
const eventEmitter = new EventEmitter();
const timerManager = new TimerManager(); // No storage backend

console.log('✅ Timer system initialized!');

// Create a timer with marks
const timer = new Timer({
  name: 'Demo Timer',
  targetDuration: TimeUtils.createPrecisionTime(0, 10, 0), // 10 seconds
  isCountdown: true,
  marks: [
    {
      name: '7 Second Mark',
      targetTime: TimeUtils.createPrecisionTime(0, 7, 0),
      description: 'First notification point'
    },
    {
      name: '3 Second Mark', 
      targetTime: TimeUtils.createPrecisionTime(0, 3, 0),
      description: 'Almost finished!'
    }
  ]
}, eventEmitter);

console.log(`📝 Created: "${timer.config.name}"`);
console.log(`⏱️  Duration: ${TimeUtils.formatTime(timer.config.targetDuration)}`);
console.log(`🎯 Marks: ${timer.config.marks.length}`);

// Subscribe to events
eventEmitter.subscribe('TIMER_STARTED', (event) => {
  console.log('\n🚀 Timer started!');
});

eventEmitter.subscribe('MARK_TRIGGERED', (event) => {
  const mark = event.payload.mark;
  console.log(`\n🔔 MARK: "${mark.name}" - ${mark.description}`);
  console.log('   🔴 Blinking red...');
});

eventEmitter.subscribe('TIMER_COMPLETED', (event) => {
  console.log('\n✅ TIMER COMPLETED! 🎉');
});

// Show current time every second
let lastSecond = -1;
eventEmitter.subscribe('TIMER_TICK', (event) => {
  const time = event.payload.currentTime;
  const currentSecond = time.seconds;
  
  if (currentSecond !== lastSecond) {
    console.log(`   ⏱️  ${TimeUtils.formatTime(time)}`);
    lastSecond = currentSecond;
  }
});

// Start the timer
console.log('\n▶️  Starting 10-second countdown...\n');
timer.start();