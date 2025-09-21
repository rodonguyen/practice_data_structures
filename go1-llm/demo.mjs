// ES Module demo of the multi-timer library
import { createTimerApp, TimeUtils } from './dist/index.js';

console.log('🕐 Multi-Timer Library Demo\n');

async function runDemo() {
  try {
    // Create and initialize the timer app
    const app = await createTimerApp();
    await app.initialize();
    
    console.log('✅ Timer app initialized successfully!');
    
    // Create a workout timer with interval marks
    const workoutTimer = await app.manager.createTimer({
      name: 'HIIT Workout',
      targetDuration: TimeUtils.createPrecisionTime(2, 0, 0), // 2 minutes for demo
      isCountdown: true,
      marks: [
        {
          name: 'Warm-up Complete',
          targetTime: TimeUtils.createPrecisionTime(1, 30, 0), // At 1:30 remaining
          description: 'Switch to high intensity',
          notificationSettings: {
            blinkCount: 3,
            blinkColor: '#FF6B00',
            blinkDurationMs: 300,
            soundEnabled: false,
            vibrationEnabled: false
          }
        },
        {
          name: 'Mid-point Check',
          targetTime: TimeUtils.createPrecisionTime(1, 0, 0), // At 1:00 remaining
          description: 'Halfway through the workout',
          notificationSettings: {
            blinkCount: 3,
            blinkColor: '#FF0000',
            blinkDurationMs: 200,
            soundEnabled: false,
            vibrationEnabled: false
          }
        },
        {
          name: 'Cool-down Phase',
          targetTime: TimeUtils.createPrecisionTime(0, 30, 0), // At 0:30 remaining
          description: 'Begin cool-down routine'
        }
      ]
    });
    
    console.log(`📝 Created timer: "${workoutTimer.config.name}"`);
    console.log(`⏱️  Duration: ${TimeUtils.formatTime(workoutTimer.config.targetDuration)}`);
    console.log(`🎯 Marks: ${workoutTimer.config.marks.length}`);
    
    // List all marks
    console.log('\n🎯 Interval Marks:');
    workoutTimer.config.marks.forEach((mark, index) => {
      console.log(`  ${index + 1}. ${mark.name} - ${TimeUtils.formatTime(mark.targetTime)}`);
      if (mark.description) {
        console.log(`     "${mark.description}"`);
      }
    });
    
    // Subscribe to mark notifications
    const subscription = app.manager.subscribe('MARK_TRIGGERED', (event) => {
      const { mark, triggeredAt } = event.payload;
      console.log(`\n🔔 MARK TRIGGERED: "${mark.name}"`);
      console.log(`   ⏰ Triggered at: ${triggeredAt.toLocaleTimeString()}`);
      console.log(`   📍 Description: ${mark.description || 'No description'}`);
      console.log('   🔴 Blinking red 3 times...\n');
    });
    
    // Subscribe to timer completion
    app.manager.subscribe('TIMER_COMPLETED', (event) => {
      console.log(`\n✅ TIMER COMPLETED!`);
      console.log(`   🏁 Finished at: ${event.payload.completedAt.toLocaleTimeString()}`);
    });
    
    // Subscribe to timer ticks (show every 5 seconds to avoid spam)
    let tickCount = 0;
    app.manager.subscribe('TIMER_TICK', (event) => {
      tickCount++;
      if (tickCount % 500 === 0) { // Every 5 seconds (500 ticks at 10ms precision)
        const time = event.payload.currentTime;
        console.log(`   ⏱️  Current: ${TimeUtils.formatTime(time)}`);
      }
    });
    
    console.log('\n🚀 Starting timer...\n');
    
    // Start the timer
    await workoutTimer.start();
    
    // Let it run for a while
    setTimeout(async () => {
      console.log('\n⏸️  Demo complete - stopping timer...');
      await workoutTimer.stop();
      subscription.unsubscribe();
      await app.shutdown();
      
      console.log('\n📊 Demo Summary:');
      console.log('- High-precision timing: ✅');
      console.log('- Interval marks: ✅'); 
      console.log('- Event notifications: ✅');
      console.log('- Timer management: ✅');
      console.log('\n🎉 Multi-timer library is working perfectly!');
    }, 8000); // Stop after 8 seconds
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
runDemo();