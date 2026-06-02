import { useEffect, useReducer, useRef, useCallback } from 'react';
import ProgressBar from '../../shared/components/ProgressBar';
import {
  generateFlankerSequence,
  recordFlankerTrial,
  flankerArrows,
  FLANKER_CONFIGS,
  FLANKER_PRACTICE_CONFIG,
  type FlankerStimulus,
  type FlankerDirection,
} from './flankerLogic';
import type { TrialData } from '../../shared/types';

type Phase = 'instructions' | 'practice_intro' | 'fixation' | 'stimulus' | 'iti' | 'rest' | 'done';

interface State {
  phase: Phase;
  trialIndex: number;
  blockIndex: number;          // 0 = practice, 1 = main
  stimuli: FlankerStimulus[];
  trials: TrialData[];
  stimulusOnset: number;
  feedback: 'correct' | 'incorrect' | null;
}

type Action =
  | { type: 'START_PRACTICE' }
  | { type: 'START_MAIN' }
  | { type: 'NEXT_PHASE'; phase: Phase; extra?: Partial<State> }
  | { type: 'RESPOND'; direction: FlankerDirection; now: number; sessionStart: number }
  | { type: 'TIMEOUT'; sessionStart: number }
  | { type: 'CLEAR_FEEDBACK' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_PRACTICE':
      return {
        ...state,
        phase: 'fixation',
        blockIndex: 0,
        trialIndex: 0,
        stimuli: generateFlankerSequence(FLANKER_PRACTICE_CONFIG),
        trials: [],
        feedback: null,
      };
    case 'START_MAIN':
      return {
        ...state,
        phase: 'fixation',
        blockIndex: 1,
        trialIndex: 0,
        stimuli: generateFlankerSequence(FLANKER_CONFIGS[1]), // level 1 for assessment
        trials: state.trials, // keep practice trials? No — clear them for main
        feedback: null,
      };
    case 'NEXT_PHASE':
      return { ...state, phase: action.phase, feedback: null, ...(action.extra ?? {}) };
    case 'RESPOND': {
      const stimulus = state.stimuli[state.trialIndex];
      if (!stimulus || state.phase !== 'stimulus') return state;
      const rt   = action.now - state.stimulusOnset;
      const trial = recordFlankerTrial(stimulus, action.direction, rt, action.sessionStart, state.trialIndex, state.blockIndex);
      const nextIndex = state.trialIndex + 1;
      const isEnd     = nextIndex >= state.stimuli.length;
      const isPractice = state.blockIndex === 0;
      return {
        ...state,
        trials: [...state.trials, trial],
        trialIndex: nextIndex,
        phase: isEnd ? (isPractice ? 'practice_intro' : 'done') : 'iti',
        feedback: trial.isCorrect ? 'correct' : 'incorrect',
      };
    }
    case 'TIMEOUT': {
      const stimulus = state.stimuli[state.trialIndex];
      if (!stimulus || state.phase !== 'stimulus') return state;
      const trial = recordFlankerTrial(stimulus, null, null, action.sessionStart, state.trialIndex, state.blockIndex);
      const nextIndex = state.trialIndex + 1;
      const isEnd     = nextIndex >= state.stimuli.length;
      const isPractice = state.blockIndex === 0;
      return {
        ...state,
        trials: [...state.trials, trial],
        trialIndex: nextIndex,
        phase: isEnd ? (isPractice ? 'practice_intro' : 'done') : 'iti',
        feedback: 'incorrect',
      };
    }
    case 'CLEAR_FEEDBACK':
      return { ...state, feedback: null };
    default:
      return state;
  }
}

interface FlankerTaskProps {
  level?: number;
  onComplete: (trials: TrialData[]) => void;
}

export default function FlankerTask({ level = 1, onComplete }: FlankerTaskProps) {
  const config         = FLANKER_CONFIGS[level] ?? FLANKER_CONFIGS[1];
  const sessionStartRef = useRef(performance.now());
  const timerRef       = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, dispatch] = useReducer(reducer, {
    phase: 'instructions',
    trialIndex: 0,
    blockIndex: 0,
    stimuli: [],
    trials: [],
    stimulusOnset: 0,
    feedback: null,
  });

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  // Phase machine: advance through fixation → stimulus → iti automatically
  useEffect(() => {
    clearTimer();

    if (state.phase === 'fixation') {
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'NEXT_PHASE', phase: 'stimulus', extra: { stimulusOnset: performance.now() } });
      }, config.fixationMs);
    }

    if (state.phase === 'stimulus') {
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'TIMEOUT', sessionStart: sessionStartRef.current });
      }, config.maxResponseMs);
    }

    if (state.phase === 'iti') {
      timerRef.current = setTimeout(() => {
        // Check if rest needed (halfway through main block)
        const half = Math.floor((state.blockIndex === 0 ? FLANKER_PRACTICE_CONFIG.totalTrials : config.totalTrials) / 2);
        if (state.blockIndex === 1 && state.trialIndex === half) {
          dispatch({ type: 'NEXT_PHASE', phase: 'rest' });
        } else {
          dispatch({ type: 'NEXT_PHASE', phase: 'fixation' });
        }
      }, config.itiMs);
    }

    if (state.phase === 'done') {
      // Only hand off main-block trials
      const mainTrials = state.trials.filter((t) => t.blockIndex === 1);
      onComplete(mainTrials);
    }

    return clearTimer;
  }, [state.phase, state.trialIndex, state.blockIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard handler
  useEffect(() => {
    if (state.phase !== 'stimulus') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); dispatch({ type: 'RESPOND', direction: 'left',  now: performance.now(), sessionStart: sessionStartRef.current }); }
      if (e.key === 'ArrowRight') { e.preventDefault(); dispatch({ type: 'RESPOND', direction: 'right', now: performance.now(), sessionStart: sessionStartRef.current }); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.phase]);

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), [clearTimer]);

  const stimulus = state.stimuli[state.trialIndex];
  const totalMain = config.totalTrials;
  const mainTrialsCompleted = state.blockIndex === 1 ? state.trialIndex : 0;
  const progress = totalMain > 0 ? (mainTrialsCompleted / totalMain) * 100 : 0;

  // ─── Screens ───────────────────────────────────────────────────────────────

  if (state.phase === 'instructions') {
    return (
      <TaskShell title="Selective Attention Task" subtitle="Flanker Task">
        <div className="space-y-4 text-gray-700 max-w-md">
          <p>You will see a row of five arrows. Your job is to respond to the <strong>center arrow</strong> only.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-center space-y-3">
            <p className="text-sm text-gray-500">Example — press ← for left, → for right:</p>
            <div className="text-3xl sm:text-4xl font-mono tracking-[0.2em] sm:tracking-widest text-brand-700 whitespace-nowrap">← ← ← ← ←</div>
            <p className="text-sm text-gray-500">Center arrow points left: press ←</p>
            <div className="text-3xl sm:text-4xl font-mono tracking-[0.2em] sm:tracking-widest text-brand-700 whitespace-nowrap">→ → → → →</div>
            <p className="text-sm text-gray-500">Center arrow points right: press →</p>
            <div className="text-2xl sm:text-3xl font-mono tracking-[0.2em] sm:tracking-widest text-gray-500 whitespace-nowrap">← ← <span className="text-brand-700 font-bold">→</span> ← ←</div>
            <p className="text-xs text-gray-500">Even with opposite side arrows, always answer based on the center one.</p>
          </div>
          <p>Respond as <strong>quickly and accurately</strong> as possible. Use the ← → arrow keys on your keyboard.</p>
          <p className="text-sm text-brand-600 font-medium bg-brand-50 p-2 rounded">First, a short practice round ({FLANKER_PRACTICE_CONFIG.totalTrials} trials).</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'START_PRACTICE' })}
          className="mt-6 px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 active:scale-95 transition"
        >
          Start Practice →
        </button>
      </TaskShell>
    );
  }

  if (state.phase === 'practice_intro') {
    return (
      <TaskShell title="Practice Complete">
        <p className="text-gray-600 max-w-sm text-center">
          Good. The real task will now begin — <strong>{totalMain} trials</strong> with a rest break halfway through.
        </p>
        <button
          onClick={() => dispatch({ type: 'START_MAIN' })}
          className="mt-6 px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 active:scale-95 transition"
        >
          Begin Task →
        </button>
      </TaskShell>
    );
  }

  if (state.phase === 'rest') {
    return (
      <TaskShell title="Rest Break" subtitle="Take a moment">
        <p className="text-gray-600">You're halfway through. Take a short break, then continue when ready.</p>
        <button
          onClick={() => dispatch({ type: 'NEXT_PHASE', phase: 'fixation' })}
          className="mt-6 px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 active:scale-95 transition"
        >
          Continue →
        </button>
      </TaskShell>
    );
  }

  // Active trial phases
  return (
    <div className="h-dvh overflow-hidden bg-white flex flex-col items-center justify-center select-none">
      {state.blockIndex === 1 && (
        <div className="fixed top-0 left-0 right-0 p-4 safe-top-pad bg-white/95 backdrop-blur shadow-sm z-10 border-b border-gray-100">
          <ProgressBar value={progress} label="Task Progress" />
        </div>
      )}

      <div className="flex flex-col items-center justify-center gap-8 mt-8">
        {/* Fixation */}
        {state.phase === 'fixation' && (
          <div className="text-5xl text-gray-400 font-light">+</div>
        )}

        {/* Stimulus */}
        {state.phase === 'stimulus' && stimulus && (
          <div
            className={`text-4xl sm:text-6xl font-mono tracking-[0.2em] sm:tracking-widest whitespace-nowrap transition-colors ${
              state.feedback === 'incorrect' ? 'text-red-500' :
              state.feedback === 'correct'   ? 'text-green-600' : 'text-gray-900'
            }`}
          >
            {flankerArrows(stimulus)}
          </div>
        )}

        {/* ITI */}
        {state.phase === 'iti' && <div className="text-5xl text-transparent">+</div>}

        {/* Mobile buttons */}
        {state.phase === 'stimulus' && (
          <div className="flex gap-8 mt-4 sm:hidden">
            <button
              onPointerDown={() => dispatch({ type: 'RESPOND', direction: 'left', now: performance.now(), sessionStart: sessionStartRef.current })}
              className="w-20 h-20 rounded-full bg-brand-100 text-brand-700 text-3xl font-bold active:bg-brand-200"
            >←</button>
            <button
              onPointerDown={() => dispatch({ type: 'RESPOND', direction: 'right', now: performance.now(), sessionStart: sessionStartRef.current })}
              className="w-20 h-20 rounded-full bg-brand-100 text-brand-700 text-3xl font-bold active:bg-brand-200"
            >→</button>
          </div>
        )}

        <p className="text-sm text-gray-400 mt-4 hidden sm:block">Use ← → arrow keys</p>
      </div>
    </div>
  );
}

function TaskShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-2 mb-8">
        {subtitle && <p className="text-sm font-medium text-brand-500 uppercase tracking-wider">{subtitle}</p>}
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="flex flex-col items-center gap-4">{children}</div>
    </div>
  );
}
