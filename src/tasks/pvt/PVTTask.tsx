import { useEffect, useReducer, useRef, useCallback } from 'react';
import TaskShell from '../../shared/components/TaskShell';
import { randomPVTIti, recordPVTTrial, PVT_CONFIGS, PVT_PRACTICE_CONFIG } from './pvtLogic';
import type { TrialData } from '../../shared/types';

type Phase = 'instructions' | 'practice_intro' | 'waiting' | 'active' | 'done';

interface State {
  phase: Phase;
  isPractice: boolean;
  trialIndex: number;
  trials: TrialData[];
  sessionStartMs: number;
  stimulusOnsetMs: number;
  elapsed: number;       // ms elapsed in session
  counterMs: number;     // displayed counter
  responded: boolean;
}

type Action =
  | { type: 'START_PRACTICE' }
  | { type: 'START_MAIN' }
  | { type: 'PRACTICE_COMPLETE' }
  | { type: 'SHOW_STIMULUS'; now: number }
  | { type: 'RESPOND'; now: number }
  | { type: 'MISS'; now: number }
  | { type: 'TICK'; now: number }
  | { type: 'DONE' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_PRACTICE':
      return { ...state, phase: 'waiting', isPractice: true, sessionStartMs: performance.now(), trialIndex: 0, trials: [], elapsed: 0, counterMs: 0 };
    case 'START_MAIN':
      return { ...state, phase: 'waiting', isPractice: false, sessionStartMs: performance.now(), trialIndex: 0, trials: [], elapsed: 0, counterMs: 0 };
    case 'PRACTICE_COMPLETE':
      return { ...state, phase: 'practice_intro', elapsed: 0, counterMs: 0 };
    case 'SHOW_STIMULUS':
      return { ...state, phase: 'active', stimulusOnsetMs: action.now, counterMs: 0, responded: false };
    case 'TICK':
      return { ...state, counterMs: Math.round(action.now - state.stimulusOnsetMs), elapsed: action.now - state.sessionStartMs };
    case 'RESPOND': {
      if (state.responded || state.phase !== 'active') return state;
      const rt    = action.now - state.stimulusOnsetMs;
      const trial = recordPVTTrial(rt, state.sessionStartMs, state.trialIndex);
      return { ...state, responded: true, trials: [...state.trials, trial], trialIndex: state.trialIndex + 1, phase: 'waiting' };
    }
    case 'MISS': {
      const trial = recordPVTTrial(null, state.sessionStartMs, state.trialIndex);
      return { ...state, trials: [...state.trials, trial], trialIndex: state.trialIndex + 1, phase: 'waiting', responded: false };
    }
    case 'DONE':
      return { ...state, phase: 'done' };
    default:
      return state;
  }
}

interface PVTTaskProps {
  level?: number;
  onComplete: (trials: TrialData[]) => void;
}

export default function PVTTask({ level = 1, onComplete }: PVTTaskProps) {
  const config         = PVT_CONFIGS[level] ?? PVT_CONFIGS[1];
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef          = useRef<number | null>(null);

  const [state, dispatch] = useReducer(reducer, {
    phase: 'instructions',
    isPractice: true,
    trialIndex: 0,
    trials: [],
    sessionStartMs: 0,
    stimulusOnsetMs: 0,
    elapsed: 0,
    counterMs: 0,
    responded: false,
  });

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (rafRef.current)   { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  // Session timer: check if duration exceeded
  useEffect(() => {
    if (state.phase === 'done') { onComplete(state.trials); }
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Waiting phase: schedule next stimulus after random ISI
  useEffect(() => {
    clearTimer();
    if (state.phase === 'waiting') {
      const activeConfig = state.isPractice ? PVT_PRACTICE_CONFIG : config;
      const elapsed = performance.now() - state.sessionStartMs;
      if (elapsed >= activeConfig.durationMs) {
        dispatch(state.isPractice ? { type: 'PRACTICE_COMPLETE' } : { type: 'DONE' });
        return;
      }
      const iti = randomPVTIti(activeConfig);
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'SHOW_STIMULUS', now: performance.now() });
      }, iti);
    }
    return clearTimer;
  }, [state.phase, state.trialIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Active phase: tick RAF for counter, auto-miss after 3s
  useEffect(() => {
    if (state.phase !== 'active') return;
    const tick = () => {
      const now = performance.now();
      dispatch({ type: 'TICK', now });
      if (now - state.stimulusOnsetMs > 3000) {
        dispatch({ type: 'MISS', now });
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [state.phase, state.stimulusOnsetMs]);

  // Keyboard handler
  useEffect(() => {
    if (state.phase !== 'active') return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); dispatch({ type: 'RESPOND', now: performance.now() }); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.phase]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const activeConfig = state.isPractice ? PVT_PRACTICE_CONFIG : config;
  const totalSecs    = activeConfig.durationMs / 1000;
  const elapsedSecs  = Math.floor(state.elapsed / 1000);
  const remainingSec = Math.max(0, totalSecs - elapsedSecs);
  const progressPct  = (state.elapsed / activeConfig.durationMs) * 100;

  if (state.phase === 'instructions') {
    return (
      <TaskShell title="Sustained Attention Task" subtitle="Psychomotor Vigilance Task">
        <div className="space-y-4 text-gray-700 max-w-md">
          <p>A red counter will appear at random intervals ({config.durationMs / 60000} minutes total). Press <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Space</kbd> (or tap) as soon as you see it.</p>
          <p>The counter measures how quickly you respond — it starts counting up in milliseconds the moment it appears.</p>
          <p className="text-sm text-gray-500">Try to stay alert. Slow responses (over 500 ms) are counted as lapses.</p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <div className="font-mono text-4xl font-bold text-red-600">247</div>
            <p className="text-xs text-gray-500 mt-1">Example counter — press Space immediately</p>
          </div>
          <p className="text-sm text-brand-600 font-medium bg-brand-50 p-2 rounded">First, a short practice round ({Math.round(PVT_PRACTICE_CONFIG.durationMs / 1000)} seconds).</p>
        </div>
        <button onClick={() => dispatch({ type: 'START_PRACTICE' })} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 active:scale-95 transition">
          Start Practice →
        </button>
      </TaskShell>
    );
  }

  if (state.phase === 'practice_intro') {
    return (
      <TaskShell title="Practice Complete">
        <p className="text-gray-600 max-w-sm text-center">
          Great. Now start the full vigilance task — <strong>{Math.round(config.durationMs / 60000)} minutes</strong>.
        </p>
        <button onClick={() => dispatch({ type: 'START_MAIN' })} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 active:scale-95 transition">
          Start Task →
        </button>
      </TaskShell>
    );
  }

  return (
    <div className="h-dvh overflow-hidden bg-white flex flex-col select-none">
      {/* Header */}
      <div className="p-4 bg-white/95 backdrop-blur shadow-sm z-10 border-b border-gray-100">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col">
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">{state.isPractice ? 'Practice' : 'Task Progress'}</span>
              <span className="text-xs text-gray-400">Remaining: {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, '0')}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400 tabular-nums">{Math.round(progressPct)}%</span>
              <span className="text-xs text-gray-400">Trials: {state.trialIndex}</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 sm:h-4 overflow-hidden shadow-inner">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Main area */}
      <div
        className="flex-1 flex items-center justify-center cursor-pointer"
        onPointerDown={() => { if (state.phase === 'active') dispatch({ type: 'RESPOND', now: performance.now() }); }}
      >
        {state.phase === 'waiting' && (
          <div className="text-gray-200 text-5xl select-none">+</div>
        )}
        {state.phase === 'active' && (
          <div className="flex flex-col items-center gap-4">
            <div className="font-mono text-6xl sm:text-8xl font-bold text-red-600 tabular-nums">
              {state.counterMs}
            </div>
            <p className="text-gray-400 text-sm">Press Space now!</p>
          </div>
        )}
      </div>
      <p className="text-center text-xs text-gray-400 pb-4 hidden sm:block">Press Space when the counter appears</p>
    </div>
  );
}
