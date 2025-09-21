# Multi-Timer Application Architecture

## Overview

This TypeScript application provides a robust, enterprise-grade architecture for a multi-timer system with advanced interval marks functionality. The design emphasizes type safety, performance, maintainability, and scalability for solo development.

## Core Features

### 🎯 **Enhanced Timer System**
- **Multiple Concurrent Timers**: Run multiple independent timers simultaneously
- **Interval Marks**: Set precise time markers with custom notifications
- **High Precision**: Centisecond accuracy (0.01s) for professional timing needs
- **Visual Feedback**: Configurable red blinking notifications (3 blinks by default)
- **Flexible Timer Types**: Count-up, countdown, and unlimited duration timers

### 🔧 **Advanced Functionality**
- **Dynamic Mark Management**: Add, edit, delete, and toggle marks during runtime
- **State Persistence**: Automatic saving and restoration of timer states
- **Event-Driven Architecture**: Reactive programming with comprehensive event system
- **Type Safety**: Strict TypeScript with comprehensive interfaces and validation
- **Error Handling**: Robust error boundaries with typed exceptions

## Architecture Components

### 📁 **Project Structure**
```
src/
├── types/           # Core TypeScript interfaces and types
├── core/            # Timer and manager implementations
├── events/          # Event emitter and subscription system
├── storage/         # Persistence layer with multiple backends
├── utils/           # Utility functions and validation
└── index.ts         # Main exports and application factory

examples/            # Usage examples and demonstrations
tests/              # Test suites (Vitest)
```

### 🏗️ **Core Architecture Layers**

#### **1. Type System (`src/types/timer.types.ts`)**
Comprehensive TypeScript interfaces providing:
- **PrecisionTime**: High-accuracy time representation
- **TimerMark**: Interval mark configuration with notifications
- **TimerConfig & TimerRuntime**: Complete timer state management
- **TimerCommand & TimerEvent**: Command pattern and event types
- **Error Types**: Structured error handling with specific error codes

#### **2. Timer Engine (`src/core/timer.ts`)**
Core timer implementation featuring:
- **High-Precision Timing**: Uses `performance.now()` for centisecond accuracy
- **Mark Trigger System**: Automatic detection and notification of interval marks
- **State Management**: Immutable state updates with comprehensive validation
- **Visual Notifications**: Configurable blinking sequences with customizable colors
- **Command Processing**: Type-safe command execution with error boundaries

#### **3. Timer Manager (`src/core/timer-manager.ts`)**
Centralized orchestration providing:
- **Multi-Timer Coordination**: Manage multiple timer instances
- **Batch Operations**: Start/pause/stop multiple timers simultaneously  
- **Statistics & Analytics**: Comprehensive usage metrics and insights
- **Import/Export**: Data portability with versioned formats
- **Event Aggregation**: Centralized event handling for all timers

#### **4. Event System (`src/events/event-emitter.ts`)**
Reactive programming infrastructure:
- **Type-Safe Events**: Strongly typed event payloads and handlers
- **Scoped Subscriptions**: Timer-specific or global event subscriptions
- **Subscription Management**: Automatic cleanup and memory leak prevention
- **Error Isolation**: Handler errors don't affect other subscribers
- **Performance Optimized**: Efficient event dispatch with minimal overhead

#### **5. Storage Layer (`src/storage/storage-manager.ts`)**
Flexible persistence system:
- **Multiple Backends**: LocalStorage, FileSystem, and Memory storage
- **Data Serialization**: Safe JSON serialization with date handling
- **Versioned Data**: Forward-compatible data formats
- **Metadata Tracking**: Storage statistics and usage analytics
- **Error Recovery**: Graceful handling of storage failures

#### **6. Utility Functions (`src/utils/`)**
Comprehensive helper libraries:
- **TimeUtils**: High-precision time arithmetic and formatting
- **ValidationUtils**: Type-safe validation with detailed error messages
- **Format Options**: Multiple time display formats (standard, compact, human-readable)

## Key Design Patterns

### 🎨 **Immutable State Management**
- All state updates create new objects rather than mutating existing ones
- Ensures predictable behavior and easier debugging
- Enables time-travel debugging and state snapshots

### 🎭 **Command Pattern**
- Timer operations encapsulated as typed command objects
- Enables undo/redo functionality and operation queuing
- Provides clear separation between UI actions and business logic

### 🎪 **Observer Pattern** 
- Event-driven architecture with comprehensive event types
- Decoupled communication between system components
- Real-time UI updates through reactive subscriptions

### 🎯 **Factory Pattern**
- `TimerApp` factory for fully configured application instances
- `createTimerApp()` and `quickStart()` convenience functions
- Dependency injection for storage backends

## Type Safety Features

### 🛡️ **Strict TypeScript Configuration**
```typescript
// tsconfig.json highlights
"strict": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"noImplicitReturns": true,
"noUncheckedIndexedAccess": true,
"exactOptionalPropertyTypes": true
```

### 🔒 **Comprehensive Interfaces**
- **Union Types**: Precise command and event type definitions
- **Readonly Properties**: Immutable interfaces prevent accidental mutations
- **Generic Types**: Type-safe event handling with payload constraints
- **Branded Types**: Strong typing for IDs (TimerId, MarkId)

### ✅ **Runtime Validation**
- Schema validation for all input parameters
- Type guards for external data (storage, imports)
- Comprehensive error messages with context

## Performance Optimizations

### ⚡ **High-Precision Timing**
- `performance.now()` for sub-millisecond accuracy
- Configurable tick rates based on precision requirements
- Efficient interval management with automatic cleanup

### 🚀 **Memory Management**
- Automatic subscription cleanup on timer destruction
- Efficient event handler management with weak references
- Lazy loading of storage backends

### 📊 **Scalability Features**
- Concurrent timer support with independent tick cycles
- Batched storage operations for multiple timers
- Efficient mark trigger checking with early termination

## Usage Examples

### Basic Timer with Interval Marks
```typescript
import { createTimerApp, TimeUtils } from './src/index.js';

const app = await createTimerApp();
await app.initialize();

const timer = await app.manager.createTimer({
  name: 'Workout Timer',
  targetDuration: TimeUtils.createPrecisionTime(10, 0, 0), // 10 minutes
  isCountdown: true,
  marks: [
    {
      name: 'Warm-up Complete',
      targetTime: TimeUtils.createPrecisionTime(8, 30, 0), // 8:30 remaining
      notificationSettings: {
        blinkCount: 3,
        blinkColor: '#FF0000',
        blinkDurationMs: 200
      }
    }
  ]
});

// Subscribe to mark notifications
app.manager.subscribe('MARK_TRIGGERED', (event) => {
  console.log(`Mark triggered: ${event.payload.mark.name}`);
  // Trigger visual blinking in UI
});

await timer.start();
```

### Dynamic Mark Management
```typescript
// Add marks during runtime
const mark = await timer.addMark({
  name: 'Sprint Phase',
  targetTime: TimeUtils.createPrecisionTime(0, 5, 30), // 5:30
  description: 'Maximum intensity interval'
});

// Update existing marks
await timer.updateMark(mark.id, {
  targetTime: TimeUtils.createPrecisionTime(0, 6, 0) // Changed to 6:00
});

// Remove marks
await timer.removeMark(mark.id);
```

### High-Precision Timing
```typescript
// Centisecond precision for professional timing
const precisionMark = {
  name: '100m Split',
  targetTime: TimeUtils.createPrecisionTime(0, 9, 85), // 9.85 seconds
};

// Subscribe to high-frequency tick events
app.manager.subscribe('TIMER_TICK', (event) => {
  const time = event.payload.currentTime;
  console.log(`${TimeUtils.formatTime(time)} (${time.totalCentiseconds} cs)`);
});
```

## File Locations

### Core Implementation Files
- **C:\Users\duy8a\OneDrive\Documents\GitHub\practice_data_structures\go1-llm\src\types\timer.types.ts** - Core type definitions
- **C:\Users\duy8a\OneDrive\Documents\GitHub\practice_data_structures\go1-llm\src\core\timer.ts** - Timer class implementation
- **C:\Users\duy8a\OneDrive\Documents\GitHub\practice_data_structures\go1-llm\src\core\timer-manager.ts** - Manager implementation
- **C:\Users\duy8a\OneDrive\Documents\GitHub\practice_data_structures\go1-llm\src\events\event-emitter.ts** - Event system
- **C:\Users\duy8a\OneDrive\Documents\GitHub\practice_data_structures\go1-llm\src\storage\storage-manager.ts** - Persistence layer

### Utility Files
- **C:\Users\duy8a\OneDrive\Documents\GitHub\practice_data_structures\go1-llm\src\utils\time-utils.ts** - Time manipulation utilities
- **C:\Users\duy8a\OneDrive\Documents\GitHub\practice_data_structures\go1-llm\src\utils\validation-utils.ts** - Validation functions

### Main Export
- **C:\Users\duy8a\OneDrive\Documents\GitHub\practice_data_structures\go1-llm\src\index.ts** - Application entry point

### Examples
- **C:\Users\duy8a\OneDrive\Documents\GitHub\practice_data_structures\go1-llm\examples\basic-usage.ts** - Usage demonstrations

## Development Workflow

### Build & Development
```bash
npm run build          # Compile TypeScript
npm run build:watch    # Watch mode compilation
npm run dev            # Development server
```

### Testing & Quality
```bash
npm run test           # Run tests
npm run test:ui        # Test UI
npm run test:coverage  # Coverage report
npm run lint           # Code linting
npm run type-check     # TypeScript validation
```

This architecture provides a solid foundation for building a professional-grade multi-timer application with enterprise-level type safety, performance, and maintainability.