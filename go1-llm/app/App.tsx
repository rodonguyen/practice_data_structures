import React, { useState, useEffect, useCallback } from 'react';
import { Timer, EventEmitter, TimeUtils } from '../dist/index.js';

// Timer interface for our state
interface TimerState {
  id: string;
  timer: Timer;
  currentTime: { minutes: number; seconds: number; centiseconds: number };
  status: 'idle' | 'running' | 'paused' | 'completed';
  progress: number;
  activeMarkIndex: number | null;
  triggeredMarks: Set<number>;
}

// Timer creation form data
interface TimerFormData {
  name: string;
  minutes: number;
  seconds: number;
  marks: Array<{
    name: string;
    minutes: number;
    seconds: number;
    description?: string;
  }>;
}

function App() {
  const [timers, setTimers] = useState<Map<string, TimerState>>(new Map());
  const [eventEmitter] = useState(() => new EventEmitter());
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Initialize event listeners
  useEffect(() => {
    // Timer tick events
    const tickSubscription = eventEmitter.subscribe('TIMER_TICK', (event) => {
      const { timerId, currentTime } = event.payload;
      
      setTimers(prev => {
        const newTimers = new Map(prev);
        const timerState = newTimers.get(timerId);
        if (timerState) {
          const totalCentiseconds = timerState.timer.config.targetDuration?.totalCentiseconds || 1;
          const progress = Math.max(0, Math.min(100, 
            ((totalCentiseconds - currentTime.totalCentiseconds) / totalCentiseconds) * 100
          ));
          
          newTimers.set(timerId, {
            ...timerState,
            currentTime,
            progress
          });
        }
        return newTimers;
      });
    });

    // Mark triggered events
    const markSubscription = eventEmitter.subscribe('MARK_TRIGGERED', async (event) => {
      const { timerId, mark } = event.payload;
      
      setTimers(prev => {
        const newTimers = new Map(prev);
        const timerState = newTimers.get(timerId);
        if (timerState) {
          const markIndex = timerState.timer.config.marks.findIndex(m => m.id === mark.id);
          if (markIndex !== -1) {
            // Add to triggered marks
            const triggeredMarks = new Set(timerState.triggeredMarks);
            triggeredMarks.add(markIndex);
            
            newTimers.set(timerId, {
              ...timerState,
              triggeredMarks,
              activeMarkIndex: markIndex
            });
            
            // Trigger visual effect
            const element = document.querySelector(`[data-timer-id="${timerId}"]`);
            if (element) {
              element.classList.add('mark-triggered');
              setTimeout(() => {
                element.classList.remove('mark-triggered');
              }, 1500);
            }
          }
        }
        return newTimers;
      });

      // Show desktop notification if available
      if (window.electronAPI) {
        await window.electronAPI.timerMarkTriggered({
          timerName: event.payload.mark.name,
          markName: event.payload.mark.name,
          timeRemaining: TimeUtils.formatTime(event.payload.currentTime || { minutes: 0, seconds: 0, centiseconds: 0 })
        });
      }
    });

    // Timer completion events
    const completedSubscription = eventEmitter.subscribe('TIMER_COMPLETED', (event) => {
      const { timerId } = event.payload;
      
      setTimers(prev => {
        const newTimers = new Map(prev);
        const timerState = newTimers.get(timerId);
        if (timerState) {
          newTimers.set(timerId, {
            ...timerState,
            status: 'completed',
            progress: 100
          });
        }
        return newTimers;
      });
    });

    // Timer start events
    const startedSubscription = eventEmitter.subscribe('TIMER_STARTED', (event) => {
      const { timerId } = event.payload;
      
      setTimers(prev => {
        const newTimers = new Map(prev);
        const timerState = newTimers.get(timerId);
        if (timerState) {
          newTimers.set(timerId, {
            ...timerState,
            status: 'running'
          });
        }
        return newTimers;
      });
    });

    // Timer pause events
    const pausedSubscription = eventEmitter.subscribe('TIMER_PAUSED', (event) => {
      const { timerId } = event.payload;
      
      setTimers(prev => {
        const newTimers = new Map(prev);
        const timerState = newTimers.get(timerId);
        if (timerState) {
          newTimers.set(timerId, {
            ...timerState,
            status: 'paused'
          });
        }
        return newTimers;
      });
    });

    return () => {
      tickSubscription.unsubscribe();
      markSubscription.unsubscribe();
      completedSubscription.unsubscribe();
      startedSubscription.unsubscribe();
      pausedSubscription.unsubscribe();
    };
  }, [eventEmitter]);

  // Create a new timer
  const createTimer = useCallback((formData: TimerFormData) => {
    const totalDuration = TimeUtils.createPrecisionTime(formData.minutes, formData.seconds, 0);
    
    const marks = formData.marks.map(mark => ({
      name: mark.name,
      targetTime: TimeUtils.createPrecisionTime(mark.minutes, mark.seconds, 0),
      description: mark.description,
      notificationSettings: {
        blinkCount: 3,
        blinkColor: '#ff4757',
        blinkDurationMs: 200,
        soundEnabled: true,
        vibrationEnabled: false
      }
    }));

    const timer = new Timer({
      name: formData.name,
      targetDuration: totalDuration,
      isCountdown: true,
      marks,
      precision: 'centiseconds'
    }, eventEmitter);

    const timerState: TimerState = {
      id: timer.id,
      timer,
      currentTime: totalDuration,
      status: 'idle',
      progress: 0,
      activeMarkIndex: null,
      triggeredMarks: new Set()
    };

    setTimers(prev => new Map(prev).set(timer.id, timerState));
    setShowCreateModal(false);
  }, [eventEmitter]);

  // Timer control functions
  const startTimer = useCallback(async (timerId: string) => {
    const timerState = timers.get(timerId);
    if (timerState) {
      await timerState.timer.start();
    }
  }, [timers]);

  const pauseTimer = useCallback(async (timerId: string) => {
    const timerState = timers.get(timerId);
    if (timerState) {
      await timerState.timer.pause();
    }
  }, [timers]);

  const resetTimer = useCallback(async (timerId: string) => {
    const timerState = timers.get(timerId);
    if (timerState) {
      await timerState.timer.reset();
      
      setTimers(prev => {
        const newTimers = new Map(prev);
        const resetState = newTimers.get(timerId);
        if (resetState) {
          newTimers.set(timerId, {
            ...resetState,
            currentTime: resetState.timer.config.targetDuration || TimeUtils.createPrecisionTime(0, 0, 0),
            status: 'idle',
            progress: 0,
            activeMarkIndex: null,
            triggeredMarks: new Set()
          });
        }
        return newTimers;
      });
    }
  }, [timers]);

  const deleteTimer = useCallback((timerId: string) => {
    const timerState = timers.get(timerId);
    if (timerState) {
      timerState.timer.destroy();
      setTimers(prev => {
        const newTimers = new Map(prev);
        newTimers.delete(timerId);
        return newTimers;
      });
    }
  }, [timers]);

  const formatTime = (time: { minutes: number; seconds: number; centiseconds: number }) => {
    return `${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}.${time.centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app">
      <div className="header">
        <h1>🕐 Multi-Timer</h1>
        <p>High-precision timers with interval marks</p>
      </div>

      <div className="timer-controls">
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + New Timer
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={() => createTimer({
            name: 'Quick 5 Min',
            minutes: 5,
            seconds: 0,
            marks: []
          })}
        >
          Quick 5 Min
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={() => createTimer({
            name: 'Pomodoro',
            minutes: 25,
            seconds: 0,
            marks: [
              { name: '5 min warning', minutes: 5, seconds: 0, description: '5 minutes remaining' }
            ]
          })}
        >
          Pomodoro (25m)
        </button>
      </div>

      {timers.size === 0 ? (
        <div className="empty-state">
          <h3>No timers yet</h3>
          <p>Create your first timer to get started!</p>
        </div>
      ) : (
        <div className="timers-grid">
          {Array.from(timers.values()).map((timerState) => (
            <TimerCard 
              key={timerState.id} 
              timerState={timerState}
              onStart={() => startTimer(timerState.id)}
              onPause={() => pauseTimer(timerState.id)}
              onReset={() => resetTimer(timerState.id)}
              onDelete={() => deleteTimer(timerState.id)}
              formatTime={formatTime}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTimerModal 
          onClose={() => setShowCreateModal(false)}
          onCreate={createTimer}
        />
      )}
    </div>
  );
}

// Timer Card Component
function TimerCard({ 
  timerState, 
  onStart, 
  onPause, 
  onReset, 
  onDelete, 
  formatTime 
}: {
  timerState: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDelete: () => void;
  formatTime: (time: any) => string;
}) {
  const { timer, currentTime, status, progress, triggeredMarks } = timerState;
  
  return (
    <div 
      className={`timer-card ${status}`}
      data-timer-id={timerState.id}
    >
      <div className="timer-header">
        <h3 className="timer-name">{timer.config.name}</h3>
        <button className="timer-delete" onClick={onDelete}>×</button>
      </div>

      <div className="timer-display">
        <div className="timer-time">
          {formatTime(currentTime)}
        </div>
        <div className="timer-status">
          {status === 'running' && '▶️ Running'}
          {status === 'paused' && '⏸️ Paused'}
          {status === 'completed' && '✅ Completed'}
          {status === 'idle' && '⏹️ Ready'}
        </div>
      </div>

      {timer.config.marks && timer.config.marks.length > 0 && (
        <div className="timer-marks">
          <div className="marks-title">Interval Marks ({timer.config.marks.length})</div>
          
          <div className="marks-timeline">
            <div 
              className="timeline-progress" 
              style={{ width: `${progress}%` }}
            />
            
            {timer.config.marks.map((mark, index) => {
              const totalDuration = timer.config.targetDuration?.totalCentiseconds || 1;
              const markPosition = ((totalDuration - mark.targetTime.totalCentiseconds) / totalDuration) * 100;
              
              return (
                <div
                  key={mark.id}
                  className={`timeline-mark ${
                    triggeredMarks.has(index) ? 'triggered' : 
                    progress >= markPosition ? 'active' : ''
                  }`}
                  style={{ left: `${markPosition}%` }}
                  title={`${mark.name} - ${formatTime(mark.targetTime)}`}
                />
              );
            })}
          </div>

          <div className="marks-list">
            {timer.config.marks.map((mark, index) => (
              <div 
                key={mark.id}
                className={`mark-item ${
                  triggeredMarks.has(index) ? 'triggered' : ''
                }`}
              >
                <span>{mark.name}</span>
                <span>{formatTime(mark.targetTime)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="timer-buttons">
        {status === 'running' ? (
          <button className="btn btn-secondary" onClick={onPause}>⏸️ Pause</button>
        ) : (
          <button className="btn btn-primary" onClick={onStart}>
            {status === 'paused' ? '▶️ Resume' : '▶️ Start'}
          </button>
        )}
        <button className="btn btn-secondary" onClick={onReset}>🔄 Reset</button>
      </div>
    </div>
  );
}

// Create Timer Modal Component
function CreateTimerModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (data: TimerFormData) => void;
}) {
  const [formData, setFormData] = useState<TimerFormData>({
    name: '',
    minutes: 5,
    seconds: 0,
    marks: []
  });

  const addMark = () => {
    setFormData(prev => ({
      ...prev,
      marks: [...prev.marks, { name: '', minutes: 1, seconds: 0, description: '' }]
    }));
  };

  const updateMark = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      marks: prev.marks.map((mark, i) => 
        i === index ? { ...mark, [field]: value } : mark
      )
    }));
  };

  const removeMark = (index: number) => {
    setFormData(prev => ({
      ...prev,
      marks: prev.marks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onCreate(formData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Create New Timer</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Timer Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter timer name..."
              required
            />
          </div>

          <div className="form-group">
            <label>Duration</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.minutes}
                onChange={e => setFormData(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                style={{ width: '80px' }}
              />
              <span>minutes</span>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.seconds}
                onChange={e => setFormData(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                style={{ width: '80px' }}
              />
              <span>seconds</span>
            </div>
          </div>

          <div className="form-group">
            <label>Interval Marks</label>
            {formData.marks.map((mark, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                gap: '8px', 
                alignItems: 'center',
                marginBottom: '8px',
                padding: '8px',
                background: '#f8f9fa',
                borderRadius: '4px'
              }}>
                <input
                  type="text"
                  placeholder="Mark name"
                  value={mark.name}
                  onChange={e => updateMark(index, 'name', e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  min="0"
                  value={mark.minutes}
                  onChange={e => updateMark(index, 'minutes', parseInt(e.target.value) || 0)}
                  style={{ width: '60px' }}
                />
                <span>:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={mark.seconds}
                  onChange={e => updateMark(index, 'seconds', parseInt(e.target.value) || 0)}
                  style={{ width: '60px' }}
                />
                <button
                  type="button"
                  onClick={() => removeMark(index)}
                  style={{ 
                    background: '#ff4757', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    width: '24px',
                    height: '24px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addMark}
              style={{
                background: '#4facfe',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              + Add Mark
            </button>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Timer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Declare global electronAPI for TypeScript
declare global {
  interface Window {
    electronAPI?: {
      showNotification: (options: any) => Promise<boolean>;
      timerMarkTriggered: (data: any) => Promise<boolean>;
      focusWindow: () => Promise<boolean>;
      onCreateQuickTimer: (callback: any) => void;
      platform: string;
    };
  }
}

export default App;