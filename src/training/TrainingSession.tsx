import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import FlankerTask from '../tasks/flanker/FlankerTask';
import GoNoGoTask  from '../tasks/gonogo/GoNoGoTask';
import NBackTask   from '../tasks/nback/NBackTask';
import PVTTask     from '../tasks/pvt/PVTTask';
import { scoreFlanker }   from '../tasks/flanker/flankerScoring';
import { scoreGoNoGo }    from '../tasks/gonogo/goNoGoScoring';
import { scoreNBack }     from '../tasks/nback/nBackScoring';
import { scorePVT }       from '../tasks/pvt/pvtScoring';
import { updateDifficulty } from './adaptiveDifficulty';
import { useAppStore }    from '../store/appStore';
import type { TrialData, StoredSession, TaskType } from '../shared/types';

const TASK_META: Record<TaskType, { label: string; dimension: string; emoji: string }> = {
  flanker: { label: 'Flanker Task',    dimension: 'Selective Attention',  emoji: '←→' },
  gonogo:  { label: 'Go / No-Go',      dimension: 'Inhibitory Control',   emoji: '🛑' },
  nback:   { label: '2-back',          dimension: 'Working Memory',        emoji: '🔠' },
  pvt:     { label: 'Vigilance Task',  dimension: 'Sustained Attention',   emoji: '⏱' },
};

export default function TrainingSession() {
  const { taskType } = useParams<{ taskType: string }>();
  const navigate      = useNavigate();
  const [phase, setPhase] = useState<'active' | 'complete'>('active');
  const [summary, setSummary] = useState<string>('');
  const startedAt = useState(new Date().toISOString())[0];

  const { difficulty, updateDifficulty: storeDifficulty, saveSession } = useAppStore((s) => ({
    difficulty:       s.difficulty,
    updateDifficulty: s.updateDifficulty,
    saveSession:      s.saveSession,
  }));

  const task  = taskType as TaskType;
  const meta  = TASK_META[task];
  const level = difficulty[task]?.level ?? 1;

  if (!meta) {
    return <Navigate to="/training" replace />;
  }

  function handleComplete(trials: TrialData[]) {
    // Compute scores
    let scoreStr = '';
    let currentDiff = difficulty[task];

    if (task === 'flanker') {
      const s = scoreFlanker(trials);
      scoreStr = s.valid ? `FIE: ${s.FIE_ms?.toFixed(0)} ms · Accuracy: ${s.accuracy_pct?.toFixed(0)}%` : 'Session incomplete';
      if (s.valid && s.accuracy_pct !== undefined) {
        currentDiff = updateDifficulty(currentDiff, s.accuracy_pct > 75);
      }
    } else if (task === 'gonogo') {
      const s = scoreGoNoGo(trials);
      scoreStr = s.valid ? `False alarms: ${((s.false_alarm_rate ?? 0) * 100).toFixed(0)}% · d′: ${s.d_prime?.toFixed(2)}` : 'Session incomplete';
      if (s.valid && s.d_prime !== undefined) {
        currentDiff = updateDifficulty(currentDiff, s.d_prime > 1.5);
      }
    } else if (task === 'nback') {
      const s = scoreNBack(trials);
      scoreStr = s.valid ? `d′: ${s.d_prime?.toFixed(2)} · Accuracy: ${s.accuracy_pct?.toFixed(0)}%` : 'Session incomplete';
      if (s.valid && s.accuracy_pct !== undefined) {
        currentDiff = updateDifficulty(currentDiff, s.accuracy_pct > 70);
      }
    } else {
      const s = scorePVT(trials);
      scoreStr = s.valid ? `Median RT: ${s.median_rt?.toFixed(0)} ms · Lapses: ${((s.lapse_rate ?? 0) * 100).toFixed(0)}%` : 'Session incomplete';
      if (s.valid && s.lapse_rate !== undefined) {
        currentDiff = updateDifficulty(currentDiff, s.lapse_rate < 0.10);
      }
    }

    // Save updated difficulty
    storeDifficulty(task, currentDiff);

    // Save session
    const scores = {
      flanker: task === 'flanker' ? scoreFlanker(trials) : undefined,
      gonogo:  task === 'gonogo'  ? scoreGoNoGo(trials)  : undefined,
      nback:   task === 'nback'   ? scoreNBack(trials)   : undefined,
      pvt:     task === 'pvt'     ? scorePVT(trials)     : undefined,
    };

    const session: StoredSession = {
      id:          uuidv4(),
      sessionType: 'training',
      taskType:    task,
      startedAt,
      completedAt: new Date().toISOString(),
      trialCount:  trials.length,
      scores,
      deviceType:  /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    };

    saveSession(session);
    setSummary(scoreStr);
    setPhase('complete');
  }

  if (phase === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="text-5xl">✓</div>
          <h2 className="text-2xl font-bold text-gray-900">Session Complete</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-2">
            <p className="text-sm text-brand-600 font-medium uppercase tracking-wide">{meta.dimension}</p>
            <p className="font-mono text-gray-700">{summary}</p>
            <p className="text-xs text-gray-400 mt-2">
              Level {level} · {new Date().toLocaleDateString()}
            </p>
          </div>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            These scores reflect your performance on this task. Variation session-to-session is normal.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { setPhase('active'); setSummary(''); }}
              className="flex-1 py-3 border border-brand-200 text-brand-600 rounded-xl font-medium hover:bg-brand-50 transition"
            >
              Train Again
            </button>
            <button
              onClick={() => navigate('/training')}
              className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition"
            >
              Back to Training
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => navigate('/')}
        className="fixed right-4 top-16 sm:top-4 safe-top-16 sm:safe-top-4 z-30 rounded-lg border border-gray-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur hover:bg-white"
      >
        Exit to Home
      </button>
      {task === 'flanker' && <FlankerTask level={level} onComplete={handleComplete} />}
      {task === 'gonogo'  && <GoNoGoTask  level={level} onComplete={handleComplete} />}
      {task === 'nback'   && <NBackTask   level={level} onComplete={handleComplete} />}
      {task === 'pvt'     && <PVTTask     level={level} onComplete={handleComplete} />}
    </div>
  );
}
