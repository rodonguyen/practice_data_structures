/**
 * Basic usage examples for the multi-timer application
 * Demonstrates core functionality and interval marks system
 */

import { 
  createTimerApp, 
  TimeUtils, 
  TimerState,
  type CreateTimerParams,
  type CreateMarkParams,
  type TimerEvent,
  LocalStorageBackend
} from '../src/index.js';

/**
 * Example 1: Create a basic timer with interval marks
 */
async function basicTimerExample(): Promise<void> {
  console.log('=== Basic Timer with Interval Marks ===');
  
  // Create application instance
  const app = await createTimerApp(new LocalStorageBackend('timer-example'));
  await app.initialize();
  
  // Create timer configuration
  const timerConfig: CreateTimerParams = {
    name: 'Workout Timer',
    description: 'High-intensity interval training session',
    targetDuration: TimeUtils.createPrecisionTime(10, 0, 0), // 10 minutes
    isCountdown: true,
    marks: [
      {
        name: 'Warm-up Complete',
        targetTime: TimeUtils.createPrecisionTime(8, 30, 0), // 8:30 remaining
        description: 'Switch to high intensity',
        notificationSettings: {
          blinkCount: 3,
          blinkColor: '#FF6B00',
          blinkDurationMs: 300,
          soundEnabled: true,
          vibrationEnabled: false
        }
      },
      {
        name: 'Mid-point Check',
        targetTime: TimeUtils.createPrecisionTime(5, 0, 0), // 5:00 remaining
        description: 'Halfway through the workout',
        notificationSettings: {
          blinkCount: 5,
          blinkColor: '#FF0000',
          blinkDurationMs: 200,
          soundEnabled: true,
          vibrationEnabled: true
        }
      },
      {
        name: 'Cool-down Phase',
        targetTime: TimeUtils.createPrecisionTime(2, 0, 0), // 2:00 remaining
        description: 'Begin cool-down routine',
        notificationSettings: {
          blinkCount: 2,
          blinkColor: '#00FF00',
          blinkDurationMs: 400,
          soundEnabled: false,
          vibrationEnabled: false
        }
      }
    ]
  };
  
  // Create timer
  const timer = await app.manager.createTimer(timerConfig);
  console.log(`Created timer: ${timer.config.name} (${timer.id})`);
  console.log(`Target duration: ${TimeUtils.formatTime(timer.config.targetDuration!)}`);
  console.log(`Number of marks: ${timer.config.marks.length}`);
  
  // Subscribe to mark notifications
  const subscription = app.manager.subscribe('MARK_TRIGGERED', (event) => {
    const { mark, triggeredAt } = event.payload;
    console.log(`🔔 Mark triggered: "${mark.name}" at ${TimeUtils.formatTime(mark.targetTime)}`);
    console.log(`   Description: ${mark.description}`);
    console.log(`   Triggered at: ${triggeredAt.toLocaleTimeString()}`);
  });
  
  // Subscribe to notification blinks
  app.manager.subscribe('MARK_NOTIFICATION_BLINK', (event) => {
    const { blinkCount } = event.payload;
    console.log(`   📍 Blink ${blinkCount}`);
  });
  
  // Start timer
  console.log('\nStarting timer...');
  await timer.start();
  
  // Simulate timer progression (for demonstration)
  await simulateTimerProgression(timer, [
    { atTime: TimeUtils.createPrecisionTime(8, 30, 0), description: 'Warm-up mark' },
    { atTime: TimeUtils.createPrecisionTime(5, 0, 0), description: 'Mid-point mark' },
    { atTime: TimeUtils.createPrecisionTime(2, 0, 0), description: 'Cool-down mark' }
  ]);
  
  // Cleanup
  subscription.unsubscribe();
  await app.shutdown();
}

/**
 * Example 2: Multiple concurrent timers
 */
async function multipleConcurrentTimersExample(): Promise<void> {
  console.log('\n=== Multiple Concurrent Timers ===');
  
  const app = await createTimerApp();
  await app.initialize();
  
  // Create multiple timers
  const studyTimer = await app.manager.createTimer({
    name: 'Study Session',
    targetDuration: TimeUtils.createPrecisionTime(25, 0, 0), // Pomodoro
    marks: [
      {
        name: 'Focus Check',
        targetTime: TimeUtils.createPrecisionTime(20, 0, 0)
      },
      {
        name: 'Final Sprint',
        targetTime: TimeUtils.createPrecisionTime(5, 0, 0)
      }
    ]
  });
  
  const cookingTimer = await app.manager.createTimer({
    name: 'Pasta Cooking',
    targetDuration: TimeUtils.createPrecisionTime(0, 8, 0), // 8 minutes
    isCountdown: true,
    marks: [
      {
        name: 'Al Dente Check',
        targetTime: TimeUtils.createPrecisionTime(0, 1, 0) // 1 minute remaining
      }
    ]
  });
  
  const exerciseTimer = await app.manager.createTimer({
    name: 'Plank Challenge',
    marks: [
      {
        name: '30-second mark',
        targetTime: TimeUtils.createPrecisionTime(0, 0, 30)
      },
      {
        name: '1-minute mark',
        targetTime: TimeUtils.createPrecisionTime(0, 1, 0)
      }
    ]
  });
  
  console.log(`Created ${app.manager.getTimers().size} timers`);
  
  // Start all timers
  await studyTimer.start();
  await cookingTimer.start();
  await exerciseTimer.start();
  
  console.log(`Running timers: ${app.manager.getRunningTimers().length}`);
  
  // Show statistics
  const stats = app.manager.getStatistics();
  console.log('Timer Statistics:', {
    total: stats.totalTimers,
    running: stats.runningTimers,
    marks: stats.totalMarks,
    averageMarks: stats.averageMarksPerTimer.toFixed(1)
  });
  
  await app.shutdown();
}

/**
 * Example 3: Dynamic mark management
 */
async function dynamicMarkManagementExample(): Promise<void> {
  console.log('\n=== Dynamic Mark Management ===');
  
  const app = await createTimerApp();
  await app.initialize();
  
  // Create timer without initial marks
  const timer = await app.manager.createTimer({
    name: 'Flexible Training',
    description: 'Training session with dynamic intervals'
  });
  
  console.log(`Created timer: ${timer.config.name}`);
  console.log(`Initial marks: ${timer.config.marks.length}`);
  
  // Add marks dynamically
  const warmupMark = await timer.addMark({
    name: 'Warm-up Complete',
    targetTime: TimeUtils.createPrecisionTime(0, 5, 0),
    description: 'Transition to main exercise',
    notificationSettings: {
      blinkCount: 2,
      blinkColor: '#FFA500',
      blinkDurationMs: 250
    }
  });
  
  console.log(`Added mark: ${warmupMark.name} at ${TimeUtils.formatTime(warmupMark.targetTime)}`);
  
  // Add more marks based on user preference
  const intenseMark = await timer.addMark({
    name: 'Intense Phase',
    targetTime: TimeUtils.createPrecisionTime(0, 10, 0),
    description: 'Maximum effort phase'
  });
  
  const recoveryMark = await timer.addMark({
    name: 'Recovery Time',
    targetTime: TimeUtils.createPrecisionTime(0, 15, 0),
    description: 'Lower intensity recovery'
  });
  
  console.log(`Total marks after additions: ${timer.config.marks.length}`);
  
  // Update a mark
  const updatedMark = await timer.updateMark(intenseMark.id, {
    name: 'High Intensity Phase',
    targetTime: TimeUtils.createPrecisionTime(0, 8, 30), // Changed time
    description: 'Push yourself to the limit!'
  });
  
  console.log(`Updated mark: ${updatedMark.name} to ${TimeUtils.formatTime(updatedMark.targetTime)}`);
  
  // Remove a mark
  await timer.removeMark(recoveryMark.id);
  console.log(`Removed recovery mark. Remaining marks: ${timer.config.marks.length}`);
  
  // List all marks
  console.log('\nFinal mark configuration:');
  timer.config.marks.forEach((mark, index) => {
    console.log(`  ${index + 1}. ${mark.name} - ${TimeUtils.formatTime(mark.targetTime)}`);
    console.log(`     ${mark.description || 'No description'}`);
  });
  
  await app.shutdown();
}

/**
 * Example 4: High-precision timing demonstration
 */
async function highPrecisionTimingExample(): Promise<void> {
  console.log('\n=== High-Precision Timing ===');
  
  const app = await createTimerApp();
  await app.initialize();
  
  // Create timer with centisecond precision marks
  const precisionTimer = await app.manager.createTimer({
    name: 'Sprint Training',
    description: 'Track split times with centisecond precision',
    marks: [
      {
        name: '50m Split',
        targetTime: TimeUtils.createPrecisionTime(0, 6, 85), // 6.85 seconds
        description: 'First 50 meters'
      },
      {
        name: '100m Finish',
        targetTime: TimeUtils.createPrecisionTime(0, 13, 42), // 13.42 seconds
        description: 'Race finish line'
      }
    ]
  });
  
  console.log(`Created precision timer: ${precisionTimer.config.name}`);
  
  // Subscribe to tick events for high-precision display
  let tickCount = 0;
  const tickSubscription = app.manager.subscribe('TIMER_TICK', (event) => {
    tickCount++;
    if (tickCount % 100 === 0) { // Display every second
      const time = event.payload.currentTime;
      console.log(`Current time: ${TimeUtils.formatTime(time)} (${time.totalCentiseconds} centiseconds)`);
    }
  });
  
  // Subscribe to marks with precise timing
  app.manager.subscribe('MARK_TRIGGERED', (event) => {
    const { mark, triggeredAt } = event.payload;
    const currentTime = event.payload.timerId; // Would get current time from timer
    console.log(`🏃 ${mark.name} reached!`);
    console.log(`   Target: ${TimeUtils.formatTime(mark.targetTime)}`);
    console.log(`   Precision: ${TimeUtils.formatCompact(mark.targetTime)}`);
  });
  
  console.log('\nDemonstrating time precision:');
  
  // Show various time formats
  const sampleTime = TimeUtils.createPrecisionTime(0, 13, 42);
  console.log(`Sample time (13.42s) in different formats:`);
  console.log(`  Standard: ${TimeUtils.formatTime(sampleTime)}`);
  console.log(`  Compact: ${TimeUtils.formatCompact(sampleTime)}`);
  console.log(`  Human: ${TimeUtils.formatHuman(sampleTime)}`);
  console.log(`  Milliseconds: ${TimeUtils.toMilliseconds(sampleTime)}ms`);
  console.log(`  Decimal seconds: ${TimeUtils.toDecimalSeconds(sampleTime)}s`);
  
  // Cleanup
  tickSubscription.unsubscribe();
  await app.shutdown();
}

/**
 * Utility function to simulate timer progression for demo purposes
 */
async function simulateTimerProgression(
  timer: any,
  checkpoints: Array<{ atTime: any; description: string }>
): Promise<void> {
  console.log('\n--- Simulating timer progression ---');
  
  for (const checkpoint of checkpoints) {
    // In real implementation, this would happen naturally through timer ticking
    console.log(`Setting timer to ${TimeUtils.formatTime(checkpoint.atTime)} (${checkpoint.description})`);
    await timer.setTime(checkpoint.atTime);
    
    // Small delay to see the effect
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('--- Simulation complete ---\n');
}

/**
 * Run all examples
 */
async function runAllExamples(): Promise<void> {
  try {
    await basicTimerExample();
    await multipleConcurrentTimersExample();
    await dynamicMarkManagementExample();
    await highPrecisionTimingExample();
    
    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Example failed:', error);
  }
}

// Export examples for individual use
export {
  basicTimerExample,
  multipleConcurrentTimersExample,
  dynamicMarkManagementExample,
  highPrecisionTimingExample,
  runAllExamples
};

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}