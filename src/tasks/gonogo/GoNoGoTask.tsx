import { useEffect, useReducer, useRef, useCallback } from 'react';
import ProgressBar from '../../shared/components/ProgressBar';
import {
  generateGoNoGoSequence,
  recordGoNoGoTrial,
  randomITI,
  GONOGO_CONFIGS,
  GONOGO_PRACTICE_CONFIG,
  type GoNoGoStimulus,
} from './goNoGoLogic';
import type { TrialData } from '../../shared/types';

type Phase = 'instructions' | 'practice_intro' | 'fixation' | 'stimulus' | 'iti' | 'rest' | 'done';

interface State {
  phase: Phase;
  trialIndex: number;
  blockIndex: number;
  stimuli: GoNoGoStimulus[];
  trials: TrialData[];
  stimulusOnset: number;
  responded: boolean;
  responseTime: number | null;
}

type Action =
  | { type: 'START_PRACTICE' }
  | { type: 'START_MAIN'; level: number }
  | { type: 'SET_PHASE'; phase: Phase; extra?: Partial<State> }
  | { type: 'RESPOND'; now: number; sessionStart: number }
  | { type: 'STIMULUS_END'; sessionStart: number }
  | { type: 'ADVANCE_TRIAL' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_PRACTICE':
      return { ...state, phase: 'fixation', blockIndex: 0, trialIndex: 0, stimuli: generateGoNoGoSequence(GONOGO_PRACTICE_CONFIG), trials: [], responded: false, responseTime: null };
    case 'START_MAIN':
      return { ...state, phase: 'fixation', blockIndex: 1, trialIndex: 0, stimuli: generateGoNoGoSequence(GONOGO_CONFIGS[action.level]), trials: state.trials, responded: false, responseTime: null };
    case 'SET_PHASE':
      return { ...state, phase: action.phase, responded: false, responseTime: null, ...(action.extra ?? {}) };
    case 'RESPOND':
      if (state.phase !== 'stimulus' || state.responded) return state;
      return { ...state, responded: true, responseTime: action.now - state.stimulusOnset };
    case 'STIMULUS_END': {
      const stimulus = state.stimuli[state.trialIndex];
      if (!stimulus) return state;
      const rt     = state.responded ? state.responseTime : null;
      const trial  = recordGoNoGoTrial(stimulus, state.responded, rt, action.sessionStart, state.trialIndex, state.blockIndex);
      const next   = state.trialIndex + 1;
      const isEnd  = next >= state.stimuli.length;
      const isPrac = state.blockIndex === 0;
      return { ...state, trials: [...state.trials, trial], trialIndex: next, phase: isEnd ? (isPrac ? 'practice_intro' : 'done') : 'iti', responded: false, responseTime: null };
    }
    case 'ADVANCE_TRIAL':
      return { ...state, phase: 'fixation', responded: false, responseTime: null };
    default:
      return state;
  }
}

interface GoNoGoTaskProps {
  level?: number;
  onComplete: (trials: TrialData[]) => void;
}

export default function GoNoGoTask({ level = 1, onComplete }: GoNoGoTaskProps) {
  const config         = GONOGO_CONFIGS[level] ?? GONOGO_CONFIGS[1];
  const sessionStartRef = useRef(performance.now());
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, dispatch] = useReducer(reducer, {
    phase: 'instructions',
    trialIndex: 0,
    blockIndex: 0,
    stimuli: [],
    trials: [],
    stimulusOnset: 0,
    responded: false,
    responseTime: null,
  });

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    clearTimer();

    if (state.phase === 'fixation') {
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'SET_PHASE', phase: 'stimulus', extra: { stimulusOnset: performance.now() } });
      }, config.fixationMs);
    }

    if (state.phase === 'stimulus') {
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'STIMULUS_END', sessionStart: sessionStartRef.current });
      }, config.stimulusDurationMs);
    }

    if (state.phase === 'iti') {
      const iti = randomITI(config);
      const half = Math.floor(config.totalTrials / 2);
      timerRef.current = setTimeout(() => {
        if (state.blockIndex === 1 && state.trialIndex === half) {
          dispatch({ type: 'SET_PHASE', phase: 'rest' });
        } else {
          dispatch({ type: 'ADVANCE_TRIAL' });
        }
      }, iti);
    }

    if (state.phase === 'done') {
      const mainTrials = state.trials.filter((t) => t.blockIndex === 1);
      onComplete(mainTrials);
    }

    return clearTimer;
  }, [state.phase, state.trialIndex, state.blockIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state.phase !== 'stimulus') return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); dispatch({ type: 'RESPOND', now: performance.now(), sessionStart: sessionStartRef.current }); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.phase]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const stimulus = state.stimuli[state.trialIndex];
  const totalMain = config.totalTrials;
  const progress  = state.blockIndex === 1 ? (state.trialIndex / totalMain) * 100 : 0;

  if (state.phase === 'instructions') {
    return (
      <TaskShell title="Inhibitory Control Task" subtitle="Go / No-Go Task">
        <div className="space-y-4 text-gray-700 max-w-md">
          <p>A circle will appear on screen. Press <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Space</kbd> as fast as possible when you see a <strong className="text-green-600">green circle</strong> (Go).</p>
          <p>Do <strong>nothing</strong> when you see a <strong className="text-red-500">red X</strong> (No-Go). Suppressing your response is the key skill.</p>
          <div className="flex gap-8 justify-center py-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-green-400 border-4 border-green-500 shadow" />
              <span className="text-sm text-green-700 font-medium">PRESS Space</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-xl bg-red-100 border-4 border-red-400 flex items-center justify-center text-red-500 text-4xl font-bold">✕</div>
              <span className="text-sm text-red-700 font-medium">DON'T press</span>
            </div>
          </div>
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
          Now the main task — <strong>{totalMain} trials</strong>. Remember: green = press, red X = don't press.
        </p>
        <button onClick={() => dispatch({ type: 'START_MAIN', level })} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 active:scale-95 transition">
          Begin Task →
        </button>
      </TaskShell>
    );
  }

  if (state.phase === 'rest') {
    return (
      <TaskShell title="Rest Break">
        <p className="text-gray-600">Halfway done. Take a breath, then continue when ready.</p>
        <button onClick={() => dispatch({ type: 'ADVANCE_TRIAL' })} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 active:scale-95 transition">
          Continue →
        </button>
      </TaskShell>
    );
  }

  return (
    <div className="h-dvh overflow-hidden bg-white flex flex-col items-center justify-center select-none">
      {state.blockIndex === 1 && (
        <div className="fixed top-0 left-0 right-0 p-4 bg-white/95 backdrop-blur shadow-sm z-10 border-b border-gray-100">
          <ProgressBar value={progress} label="Task Progress" />
        </div>
      )}
      <div className="flex flex-col items-center gap-8 mt-8">
        {state.phase === 'fixation' && <div className="text-5xl text-gray-400 font-light">+</div>}
        {state.phase === 'stimulus' && stimulus === 'go' && (
          <div className="w-32 h-32 rounded-full bg-green-400 border-4 border-green-500 shadow-lg animate-pulse" />
        )}
        {state.phase === 'stimulus' && stimulus === 'nogo' && (
          <div className="w-32 h-32 rounded-xl bg-red-100 border-4 border-red-400 flex items-center justify-center text-red-500 text-6xl font-bold">✕</div>
        )}
        {state.phase === 'iti' && <div className="w-32 h-32 opacity-0">_</div>}

        {/* Mobile button */}
        {state.phase === 'stimulus' && (
          <button
            onPointerDown={() => dispatch({ type: 'RESPOND', now: performance.now(), sessionStart: sessionStartRef.current })}
            className="mt-4 sm:hidden w-28 h-28 rounded-full bg-brand-100 text-brand-700 text-xl font-bold active:bg-brand-300 transition"
          >TAP</button>
        )}
        <p className="text-sm text-gray-400 hidden sm:block">Press Space for green circles</p>
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
