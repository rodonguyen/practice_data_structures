# Multi-Timer Application - Implementation Plan

## Project Overview

A sophisticated multi-timer application with interval marks, high-precision timing (centiseconds), and cross-platform deployment (web app + Windows executable).

### Key Features
- **Multiple Concurrent Timers**: Run several timers simultaneously
- **Interval Marks System**: Set custom marks (e.g., 5:00, 10:15) with visual notifications
- **High Precision Timing**: 2-decimal precision (centiseconds: MM:SS.CC)
- **Visual Feedback**: Red blinking (3 times) when marks are reached
- **Cross-Platform**: Web app and Windows executable deployment

## Technology Stack & Architecture

### Core Technologies
```typescript
// Frontend Framework
React 18 + TypeScript 5+
Vite (bundler) - fast dev, optimized builds

// State Management
Zustand - lightweight, TypeScript-friendly

// Styling & UI
Tailwind CSS - utility-first design
Headless UI - accessible components

// Deployment
Web: Vercel/Netlify
Windows: Tauri (preferred) or Electron
```

### Why This Approach?
1. **TypeScript + React**: Type safety, component reusability, large ecosystem
2. **Vite**: Fast development server, excellent TypeScript support
3. **Zustand**: Simple state management, no boilerplate, TS-friendly
4. **Tailwind**: Rapid UI development, consistent design system
5. **Tauri**: Lighter than Electron, better performance for desktop app

## Application Architecture

### Core Type System
```typescript
// High-precision time representation
interface PrecisionTime {
  minutes: number;
  seconds: number;
  centiseconds: number; // 0-99 for 0.01s precision
}

// Timer with interval marks
interface Timer {
  id: string;
  name: string;
  totalDuration: PrecisionTime;
  remaining: PrecisionTime;
  marks: TimerMark[];
  state: 'idle' | 'running' | 'paused' | 'completed';
  currentMarkIndex: number | null;
  createdAt: Date;
}

// Interval mark definition
interface TimerMark {
  id: string;
  time: PrecisionTime; // When to trigger (e.g., 5:00.00)
  label?: string; // Optional description
  triggered: boolean; // Has this mark been reached?
  notificationSettings: {
    visual: boolean; // Red blinking
    audio: boolean;  // Sound alert
    vibration: boolean; // Mobile vibration
  };
}
```

### State Management Architecture
```typescript
// Zustand store structure
interface TimerStore {
  // State
  timers: Timer[];
  activeTimerId: string | null;
  globalSettings: AppSettings;
  
  // Timer Operations
  createTimer: (name: string, duration: PrecisionTime) => string;
  deleteTimer: (id: string) => void;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  
  // Mark Operations
  addMark: (timerId: string, mark: Omit<TimerMark, 'id'>) => void;
  updateMark: (timerId: string, markId: string, updates: Partial<TimerMark>) => void;
  deleteMark: (timerId: string, markId: string) => void;
  
  // Precision Timer Engine
  updateTimerTick: (timerId: string, currentTime: PrecisionTime) => void;
  checkMarkTriggers: (timerId: string) => TimerMark[];
}
```

### Component Architecture
```
App
├── TimerHeader (global controls, settings)
├── TimerCreator (new timer form)
├── TimerGrid
│   └── TimerCard[] (individual timer with marks)
│       ├── PrecisionDisplay (MM:SS.CC format)
│       ├── MarkTimeline (visual mark indicators)
│       ├── TimerControls (start/pause/reset)
│       └── MarkManager (add/edit marks)
├── MarkCreationModal (detailed mark editing)
└── NotificationSystem (visual/audio alerts)
```

## Enhanced Features Implementation

### 1. Interval Marks System

**Mark Creation UI**:
- Quick add with time input: `[MM]:[SS].[CC]`
- Preset buttons: [5:00], [10:00], [15:00], [30:00]
- Pattern creator: "Every 5 minutes starting at 2:00"
- Batch import/export for reusable mark templates

**Mark Visualization**:
```
Timeline: ●────●────●────────────────● 15:00
          5:00 10:00
```
- Proportional positioning on horizontal timeline
- Color coding: blue (upcoming), gray (passed), red (active)
- Mark labels show below timeline

**Mark Notifications**:
1. Visual: Timer card border flashes red 3 times (0.5s each)
2. Audio: Optional sound notification (configurable)
3. State update: Mark becomes "triggered", next mark activates

### 2. High-Precision Timing Engine

**Implementation Strategy**:
```typescript
class PrecisionTimer {
  private startTime: number = 0;
  private pausedTime: number = 0;
  private rafId: number = 0;
  
  start() {
    this.startTime = performance.now();
    this.tick();
  }
  
  private tick() {
    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime - this.pausedTime;
    const remaining = this.totalDuration - elapsed;
    
    // Convert to MM:SS.CC format
    const precision = this.toPrecisionTime(remaining);
    
    // Check for mark triggers
    this.checkMarks(elapsed);
    
    // Continue if not finished
    if (remaining > 0) {
      this.rafId = requestAnimationFrame(() => this.tick());
    }
  }
  
  private toPrecisionTime(ms: number): PrecisionTime {
    const totalCentiseconds = Math.floor(ms / 10);
    const minutes = Math.floor(totalCentiseconds / 6000);
    const seconds = Math.floor((totalCentiseconds % 6000) / 100);
    const centiseconds = totalCentiseconds % 100;
    
    return { minutes, seconds, centiseconds };
  }
}
```

**Why This Approach**:
- `performance.now()`: More accurate than `Date.now()`
- `requestAnimationFrame()`: Smooth 60fps updates
- Pause handling: Track paused time separately
- Centisecond precision: Divide by 10ms instead of 1000ms

### 3. Visual Feedback System

**Red Blinking Implementation**:
```typescript
const triggerMarkNotification = async (markId: string) => {
  const element = document.getElementById(`timer-${timerId}`);
  
  // Flash red border 3 times
  for (let i = 0; i < 3; i++) {
    element.classList.add('border-red-500', 'border-4');
    await new Promise(resolve => setTimeout(resolve, 200));
    element.classList.remove('border-red-500', 'border-4');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Update mark state
  updateMarkTriggered(markId);
};
```

**CSS Animation Classes**:
```css
.timer-flash {
  animation: flash-red 0.2s ease-in-out 3;
}

@keyframes flash-red {
  0% { border-color: theme(colors.gray.200); }
  50% { border-color: theme(colors.red.500); }
  100% { border-color: theme(colors.gray.200); }
}
```

## User Interface Design

### TimerCard Enhanced Layout
```
┌─────────────────────────────────────┐
│ Workout Timer              [⚙] [×] │
│                                     │
│           12:34.56                  │
│         ╭─────────────╮             │
│         │ START/PAUSE │             │
│         ╰─────────────╯             │
│                                     │
│ ●────●────●─────────────────● 20:00 │
│ 5:00 10:00 15:00                    │
│                                     │
│ [+ Add Mark] [Presets] [Clear All]  │
└─────────────────────────────────────┘
```

### Mark Creation Modal
```
┌─────────────────────────────────────┐
│ Add Interval Mark                [×]│
│                                     │
│ Time: [12]:[34].[56]                │
│       MM  SS  CC                    │
│                                     │
│ Label: [Cool down phase]            │
│                                     │
│ Quick: [5:00][10:00][15:00][30:00]  │
│                                     │
│ Pattern: Every [5] min [0] sec      │
│          From [0:00] to [20:00]     │
│                                     │
│        [Cancel]    [Add Mark]       │
└─────────────────────────────────────┘
```

### Responsive Design Strategy
- **Desktop**: 3-4 timer cards per row, full mark timeline
- **Tablet**: 2 cards per row, abbreviated mark labels
- **Mobile**: 1 card per row, collapsible mark list

## Project Structure

```
multi-timer-app/
├── public/
│   ├── favicon.ico
│   ├── sounds/           # Notification sounds
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Timeline.tsx
│   │   ├── TimerCard.tsx
│   │   ├── PrecisionDisplay.tsx
│   │   ├── MarkTimeline.tsx
│   │   ├── MarkCreator.tsx
│   │   └── NotificationSystem.tsx
│   ├── hooks/
│   │   ├── useTimer.ts        # Timer lifecycle
│   │   ├── usePrecisionTimer.ts # High-precision engine
│   │   ├── useMarkManager.ts  # Mark operations
│   │   └── useNotifications.ts # Audio/visual alerts
│   ├── stores/
│   │   ├── timerStore.ts      # Main Zustand store
│   │   └── settingsStore.ts   # App preferences
│   ├── utils/
│   │   ├── timeUtils.ts       # Time formatting/parsing
│   │   ├── markUtils.ts       # Mark calculations
│   │   └── storageUtils.ts    # LocalStorage helpers
│   ├── types/
│   │   ├── timer.ts           # Core interfaces
│   │   └── events.ts          # Event types
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/               # Desktop app config
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── IMPLEMENTATION.md
```

## Development Phases

### Phase 1: Core Timer (3-4 days)
- [ ] Basic timer creation and management
- [ ] High-precision timing engine (MM:SS.CC)
- [ ] Start/pause/reset functionality
- [ ] LocalStorage persistence
- [ ] Basic UI with Tailwind

### Phase 2: Marks System (4-5 days)
- [ ] Mark creation and editing interface
- [ ] Timeline visualization component
- [ ] Mark trigger detection and notifications
- [ ] Visual feedback (red blinking)
- [ ] Audio notifications (optional)

### Phase 3: Enhanced UX (3-4 days)
- [ ] Mark presets and patterns
- [ ] Batch mark creation
- [ ] Keyboard shortcuts
- [ ] Responsive design (mobile/tablet)
- [ ] Dark mode toggle

### Phase 4: Polish & Deploy (2-3 days)
- [ ] Error handling and edge cases
- [ ] Performance optimizations
- [ ] Web app deployment (Vercel)
- [ ] Tauri setup and Windows build
- [ ] Testing and bug fixes

**Total Estimated Time: 12-16 days**

## Key Implementation Decisions

### Q: Why Zustand over Redux?
**A**: Simpler setup, less boilerplate, excellent TypeScript support, perfect for solo development.

### Q: Why Tauri over Electron?
**A**: Smaller bundle size (~10MB vs ~100MB), better performance, modern Rust-based architecture.

### Q: How to handle timing precision?
**A**: Use `performance.now()` + `requestAnimationFrame()` for smooth 60fps updates with centisecond accuracy.

### Q: How to manage multiple concurrent timers?
**A**: Single RAF loop checking all active timers, event-driven mark notifications.

### Q: How to make mark creation convenient?
**A**: Quick presets + pattern creator + visual timeline editing for different user preferences.

## Next Steps

1. **Finalize Requirements**: Confirm any additional features or constraints
2. **Setup Project**: Initialize Vite + TypeScript + Tailwind
3. **Start Phase 1**: Begin with core timer functionality
4. **Iterative Development**: Regular testing and feedback integration
5. **Deployment**: Prepare both web and desktop versions

---

*This document will be updated as implementation progresses and requirements evolve.*