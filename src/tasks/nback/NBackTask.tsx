import { useEffect, useReducer, useRef, useCallback } from 'react';
import ProgressBar from '../../shared/components/ProgressBar';
import TaskShell from '../../shared/components/TaskShell';
import {
  generateNBackSequence,
  recordNBackTrial,
  NBACK_CONFIGS,
  NBACK_PRACTICE_CONFIG,
  type NBackSequenceItem,
} from './nBackLogic';
import type { TrialData } from '../../shared/types';

type Phase = 'instructions' | 'practice_intro' | 'stimulus' | 'blank' | 'rest' | 'done';

interface State {
  phase: Phase;
  trialIndex: number;
  sequence: NBackSequenceItem[];
  trials: TrialData[];
  stimulusOnset: number;
  responded: boolean;
  isPractice: boolean;
  showFeedback: 'correct' | 'incorrect' | null;
}

type Action =
  | { type: 'START_PRACTICE' }
  | { type: 'START_MAIN'; level: number }
  | { type: 'SHOW_STIMULUS' }
  | { type: 'END_STIMULUS'; sessionStart: number }
  | { type: 'ADVANCE' }
  | { type: 'RESPOND'; now: number; sessionStart: number }
  | { type: 'CLEAR_FEEDBACK' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_PRACTICE':
      return { ...state, phase: 'stimulus', isPractice: true, trialIndex: 0, sequence: generateNBackSequence(NBACK_PRACTICE_CONFIG), trials: [], responded: false, stimulusOnset: performance.now(), showFeedback: null };
    case 'START_MAIN':
      return { ...state, phase: 'stimulus', isPractice: false, trialIndex: 0, sequence: generateNBackSequence(NBACK_CONFIGS[action.level]), trials: state.trials, responded: false, stimulusOnset: performance.now(), showFeedback: null };
    case 'SHOW_STIMULUS':
      return { ...state, phase: 'stimulus', responded: false, stimulusOnset: performance.now(), showFeedback: null };
    case 'RESPOND': {
      if (state.responded || state.phase !== 'stimulus') return state;
      const item   = state.sequence[state.trialIndex];
      const rt     = action.now - state.stimulusOnset;
      const nLevel = state.isPractice ? NBACK_PRACTICE_CONFIG.nLevel : 2;
      const trial  = recordNBackTrial(item, true, rt, action.sessionStart, state.trialIndex, nLevel);
      const feedback = trial.isCorrect ? 'correct' : 'incorrect';
      return { ...state, responded: true, showFeedback: feedback, trials: [...state.trials, trial] };
    }
    case 'END_STIMULUS': {
      if (state.responded) return { ...state, phase: 'blank' };
      const item   = state.sequence[state.trialIndex];
      const nLevel = state.isPractice ? NBACK_PRACTICE_CONFIG.nLevel : 2;
      const trial  = recordNBackTrial(item, false, null, action.sessionStart, state.trialIndex, nLevel);
      return { ...state, phase: 'blank', trials: [...state.trials, trial], showFeedback: null };
    }
    case 'ADVANCE': {
      const nextIndex = state.trialIndex + 1;
      const isEnd     = nextIndex >= state.sequence.length;
      if (isEnd) return { ...state, phase: state.isPractice ? 'practice_intro' : 'done' };
      const half = Math.floor(state.sequence.length / 2);
      if (!state.isPractice && nextIndex === half) return { ...state, trialIndex: nextIndex, phase: 'rest' };
      return { ...state, trialIndex: nextIndex, phase: 'stimulus', responded: false, stimulusOnset: performance.now(), showFeedback: null };
    }
    case 'CLEAR_FEEDBACK':
      return { ...state, showFeedback: null };
    default:
      return state;
  }
}

interface NBackTaskProps {
  level?: number;
  onComplete: (trials: TrialData[]) => void;
}

export default function NBackTask({ level = 2, onComplete }: NBackTaskProps) {
  const config         = NBACK_CONFIGS[level] ?? NBACK_CONFIGS[2];
  const sessionStartRef = useRef(performance.now());
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, dispatch] = useReducer(reducer, {
    phase: 'instructions',
    trialIndex: 0,
    sequence: [],
    trials: [],
    stimulusOnset: 0,
    responded: false,
    isPractice: true,
    showFeedback: null,
  });

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    clearTimer();
    if (state.phase === 'stimulus') {
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'END_STIMULUS', sessionStart: sessionStartRef.current });
      }, config.stimulusDurationMs);
    }
    if (state.phase === 'blank') {
      timerRef.current = setTimeout(() => dispatch({ type: 'ADVANCE' }), config.blankDurationMs);
    }
    if (state.phase === 'done') {
      onComplete(state.trials.filter((t) => t.taskType === 'nback' && t.blockIndex === config.nLevel));
    }
    return clearTimer;
  }, [state.phase, state.trialIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state.phase !== 'stimulus') return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); dispatch({ type: 'RESPOND', now: performance.now(), sessionStart: sessionStartRef.current }); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.phase]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const item     = state.sequence[state.trialIndex];
  const total    = config.totalTrials;
  const progress = !state.isPractice ? (state.trialIndex / total) * 100 : 0;
  const nLevel   = config.nLevel;

  if (state.phase === 'instructions') {
    return (
      <TaskShell title="Working Memory Task" subtitle={`${nLevel}-Back Task`}>
        <div className="space-y-4 text-gray-700 max-w-md">
          <p>A series of letters will appear one at a time. Press <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Space</kbd> whenever the current letter is the <strong>same as the one {nLevel} step{nLevel > 1 ? 's' : ''} back</strong>.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500 mb-3">Example ({nLevel}-back):</p>
            <div className="flex gap-3 justify-center items-end">
              {['K','B','K','M','K'].map((l, i) => (
                <div key={i} className={`flex flex-col items-center gap-1`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold border-2 ${i === 4 && nLevel === 2 ? 'bg-brand-100 border-brand-400 text-brand-700' : i === 2 && nLevel === 1 ? 'bg-brand-100 border-brand-400 text-brand-700' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>{l}</div>
                  <span className="text-xs text-gray-400">{i + 1}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-brand-600 mt-2 font-medium">Letter 5 = "K" = same as letter 3 → press Space</p>
          </div>
          <p className="text-sm text-brand-600 font-medium bg-brand-50 p-2 rounded">First, a short 1-back practice ({NBACK_PRACTICE_CONFIG.totalTrials} trials) to get familiar.</p>
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
          Now the real <strong>{nLevel}-back task</strong> — {total} trials. Press Space when you see a match.
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
        <p className="text-gray-600">Halfway done. Short break, then continue.</p>
        <button onClick={() => dispatch({ type: 'ADVANCE' })} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 active:scale-95 transition">
          Continue →
        </button>
      </TaskShell>
    );
  }

  return (
    <div className="h-dvh overflow-hidden bg-white flex flex-col items-center justify-center select-none">
      {!state.isPractice && (
        <div className="fixed top-0 left-0 right-0 p-4 safe-top-pad bg-white/95 backdrop-blur shadow-sm z-10 border-b border-gray-100">
          <ProgressBar value={progress} label="Task Progress" />
        </div>
      )}
      <div className="flex flex-col items-center gap-10 mt-8">
        <p className="text-sm text-gray-400 font-medium">{nLevel}-back · trial {state.trialIndex + 1}/{total}</p>
        <div className={`w-36 h-36 rounded-2xl flex items-center justify-center text-7xl font-bold border-4 transition-all duration-75 ${
          state.phase === 'stimulus'
            ? state.showFeedback === 'correct'   ? 'bg-green-50 border-green-400 text-green-700'
            : state.showFeedback === 'incorrect' ? 'bg-red-50 border-red-400 text-red-600'
            : state.responded                    ? 'bg-brand-100 border-brand-400 text-brand-700'
            : 'bg-gray-50 border-gray-200 text-gray-900'
            : 'bg-white border-transparent text-transparent'
        }`}>
          {state.phase === 'stimulus' && item ? item.letter : ' '}
        </div>
        {state.phase === 'stimulus' && (
          <button
            onPointerDown={() => dispatch({ type: 'RESPOND', now: performance.now(), sessionStart: sessionStartRef.current })}
            className="sm:hidden w-28 h-16 rounded-xl bg-brand-100 text-brand-700 font-bold text-lg active:bg-brand-300 transition"
          >MATCH</button>
        )}
        <p className="text-sm text-gray-400 hidden sm:block">Press Space for a {nLevel}-back match</p>
      </div>
    </div>
  );
}
