import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../shared/components/Button';

type SprintState = 'idle' | 'running' | 'paused' | 'done' | 'completed';

const TWO_MINUTES = 120;
const QUICK_PRESETS = ['Study', 'Read', 'Clean inbox', 'Write notes'] as const;

function formatClock(seconds: number): string {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

type ChimeKind = 'done' | 'early';

function ensureAudioContext(
  ref: React.MutableRefObject<AudioContext | null>,
): AudioContext | null {
  try {
    if (ref.current) return ref.current;

    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    ref.current = new AudioCtx();
    return ref.current;
  } catch {
    return null;
  }
}

function playDoneChime(
  context: AudioContext,
  kind: ChimeKind,
) {
  try {
    if (context.state === 'suspended') {
      void context.resume();
    }

    const baseTime = context.currentTime + 0.02;
    const notes =
      kind === 'done'
        ? [659.25, 783.99, 1046.5]
        : [659.25, 880.0];

    notes.forEach((note, index) => {
      const start = baseTime + index * 0.14;
      const duration = 0.16;

      const osc = context.createOscillator();
      const harmonic = context.createOscillator();
      const gain = context.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, start);

      harmonic.type = 'sine';
      harmonic.frequency.setValueAtTime(note * 2, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(kind === 'done' ? 0.28 : 0.24, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      harmonic.connect(gain);
      gain.connect(context.destination);

      osc.start(start);
      harmonic.start(start);
      osc.stop(start + duration);
      harmonic.stop(start + duration);
    });
  } catch {
    // Keep timer flow stable even if audio fails on a device/browser.
  }
}

export default function TwoMinuteTaskPage() {
  const [taskText, setTaskText] = useState('');
  const [activeTask, setActiveTask] = useState('');
  const [secondsLeft, setSecondsLeft] = useState<number>(TWO_MINUTES);
  const [state, setState] = useState<SprintState>('idle');
  const previousState = useRef<SprintState>('idle');
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (state !== 'running') return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setState('done');
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (state === 'done' && previousState.current !== 'done') {
      const context = ensureAudioContext(audioContextRef);
      if (context) playDoneChime(context, 'done');
    }
    previousState.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const progress = useMemo(() => {
    const total = state === 'done' ? TWO_MINUTES : Math.max(TWO_MINUTES, secondsLeft);
    const elapsed = Math.max(0, total - secondsLeft);
    return Math.min(100, (elapsed / total) * 100);
  }, [secondsLeft, state]);

  const canStart = taskText.trim().length > 0;

  function startSprint() {
    if (!canStart) return;
    const context = ensureAudioContext(audioContextRef);
    if (context && context.state === 'suspended') {
      void context.resume();
    }
    setActiveTask(taskText.trim());
    setSecondsLeft(TWO_MINUTES);
    setState('running');
  }

  function pauseSprint() {
    if (state === 'running') setState('paused');
  }

  function resumeSprint() {
    if (state === 'paused') {
      const context = ensureAudioContext(audioContextRef);
      if (context && context.state === 'suspended') {
        void context.resume();
      }
      setState('running');
    }
  }

  function resetSprint() {
    setSecondsLeft(TWO_MINUTES);
    setActiveTask('');
    setState('idle');
  }

  function completeEarly() {
    const context = ensureAudioContext(audioContextRef);
    if (context) playDoneChime(context, 'early');
    setState('completed');
  }

  function continueForFiveMore() {
    setSecondsLeft(300);
    setState('running');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">2 Minute Task Launcher</h1>
          <p className="text-sm text-gray-600">
            Pick one task and start immediately. Small action beats perfect planning.
          </p>
        </header>

        <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="task-input">
            What do you want to start right now?
          </label>
          <input
            id="task-input"
            value={taskText}
            onChange={(event) => setTaskText(event.target.value)}
            placeholder="Example: Read 2 pages of chapter 3"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />

          <div className="flex flex-wrap gap-2">
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTaskText(preset)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
              >
                {preset}
              </button>
            ))}
          </div>

          <Button onClick={startSprint} disabled={!canStart || state === 'running'} className="w-full">
            Start 2-minute sprint
          </Button>
        </section>

        {(state !== 'idle' || activeTask) && (
          <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Current task</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">{activeTask || taskText || 'Quick sprint'}</p>
              </div>
              <p className="text-3xl font-bold text-brand-700 tabular-nums">{formatClock(secondsLeft)}</p>
            </div>

            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {state === 'running' && (
                <Button variant="secondary" onClick={pauseSprint}>Pause</Button>
              )}
              {state === 'paused' && (
                <Button variant="secondary" onClick={resumeSprint}>Resume</Button>
              )}
              {(state === 'running' || state === 'paused') && (
                <Button variant="ghost" onClick={completeEarly}>Complete early</Button>
              )}
              <Button variant="ghost" onClick={resetSprint}>Reset</Button>
            </div>

            {state === 'done' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm space-y-2">
                <p className="font-medium">Good, you started.</p>
                <p>Do you want to continue for 5 more minutes?</p>
                <Button size="sm" onClick={continueForFiveMore}>Continue 5 minutes</Button>
              </div>
            )}

            {state === 'completed' && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-brand-800 text-sm">
                Nice. You took action instead of scrolling.
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
