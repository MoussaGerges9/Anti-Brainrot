import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import FlankerTask from '../tasks/flanker/FlankerTask';
import GoNoGoTask  from '../tasks/gonogo/GoNoGoTask';
import NBackTask   from '../tasks/nback/NBackTask';
import PVTTask     from '../tasks/pvt/PVTTask';
import { scoreFlanker, flankerDisplayScore }  from '../tasks/flanker/flankerScoring';
import { scoreGoNoGo, goNoGoDisplayScore }    from '../tasks/gonogo/goNoGoScoring';
import { scoreNBack, nBackDisplayScore }      from '../tasks/nback/nBackScoring';
import { scorePVT, pvtDisplayScore }          from '../tasks/pvt/pvtScoring';
import { useAppStore }   from '../store/appStore';
import Disclaimer        from '../shared/components/Disclaimer';
import type { TrialData, StoredSession, CompositeScores, FlankerScore, GoNoGoScore, NBackScore, PVTScore } from '../shared/types';

type AssessmentStep =
  | 'intro'
  | 'flanker'
  | 'gonogo'
  | 'nback'
  | 'pvt'
  | 'complete';

const STEPS: { step: AssessmentStep; label: string; description: string; emoji: string }[] = [
  { step: 'flanker', label: 'Selective Attention',  description: 'Flanker Task (~5 min)',    emoji: '🎯' },
  { step: 'gonogo',  label: 'Inhibitory Control',   description: 'Go / No-Go (~7 min)',      emoji: '🛑' },
  { step: 'nback',   label: 'Working Memory',        description: 'Remember if the letter matches 2 trials back (~5 min)',     emoji: '🧠' },
  { step: 'pvt',     label: 'Sustained Attention',   description: 'Vigilance Task (~3 min)',  emoji: '⚡' },
];

interface TaskResult {
  step: AssessmentStep;
  displayScore: number;
  flankerScore?: FlankerScore;
  goNoGoScore?: GoNoGoScore;
  nBackScore?: NBackScore;
  pvtScore?: PVTScore;
}

function getRating(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: 'Excellent',      color: 'text-green-700',  bg: 'bg-green-50 border-green-200'   };
  if (score >= 65) return { label: 'Good',           color: 'text-brand-700',  bg: 'bg-brand-50 border-brand-200'   };
  if (score >= 45) return { label: 'Average',        color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' };
  if (score >= 25) return { label: 'Below Average',  color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' };
  return              { label: 'Needs Work',       color: 'text-red-700',    bg: 'bg-red-50 border-red-200'       };
}

function StepIndicator({ steps, currentIndex }: { steps: typeof STEPS; currentIndex: number }) {
  if (currentIndex < 0) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-2">
      <div className="max-w-xl mx-auto flex items-center gap-3">
        {steps.map((s, i) => (
          <div
            key={s.step}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < currentIndex  ? 'bg-brand-500' :
              i === currentIndex ? 'bg-brand-300' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-center text-xs text-gray-500 mt-1">
        Task {currentIndex + 1} of {steps.length} — {steps[currentIndex]?.label}
      </p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-4 py-3">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className="font-semibold text-gray-900 tabular-nums">{value}</span>
    </div>
  );
}

export default function AssessmentFlow() {
  const [step, setStep]           = useState<AssessmentStep>('intro');
  const [allTrials, setAllTrials] = useState<TrialData[]>([]);
  const [startedAt]               = useState(new Date().toISOString());
  const [taskResults, setTaskResults] = useState<TaskResult[]>([]);
  const [pendingResult, setPendingResult] = useState<TaskResult | null>(null);
  const saveSession = useAppStore((s) => s.saveSession);
  const navigate    = useNavigate();

  const currentStepIndex = STEPS.findIndex((s) => s.step === step);
  const isActiveTask = step === 'flanker' || step === 'gonogo' || step === 'nback' || step === 'pvt';

  useEffect(() => {
    if (isActiveTask) {
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      return () => {
        document.body.style.overflow = '';
        document.body.style.overscrollBehavior = '';
      };
    }

    document.body.style.overflow = '';
    document.body.style.overscrollBehavior = '';
  }, [isActiveTask]);

  function handleTaskComplete(trials: TrialData[]) {
    const merged = [...allTrials, ...trials];
    setAllTrials(merged);

    // Compute score for the just-finished task
    let result: TaskResult;
    if (step === 'flanker') {
      const sc = scoreFlanker(trials);
      result = { step, displayScore: flankerDisplayScore(sc, false), flankerScore: sc };
    } else if (step === 'gonogo') {
      const sc = scoreGoNoGo(trials);
      result = { step, displayScore: goNoGoDisplayScore(sc, false), goNoGoScore: sc };
    } else if (step === 'nback') {
      const sc = scoreNBack(trials);
      result = { step, displayScore: nBackDisplayScore(sc, false), nBackScore: sc };
    } else {
      const sc = scorePVT(trials);
      result = { step: 'pvt', displayScore: pvtDisplayScore(sc, false), pvtScore: sc };
    }

    const updatedResults = [...taskResults, result];
    setTaskResults(updatedResults);
    setPendingResult(result);

    // On the last task, save the session
    if (step === 'pvt') {
      const scores: CompositeScores = {
        flanker: scoreFlanker(merged.filter((t) => t.taskType === 'flanker')),
        gonogo:  scoreGoNoGo(merged.filter((t) => t.taskType === 'gonogo')),
        nback:   scoreNBack(merged.filter((t) => t.taskType === 'nback')),
        pvt:     result.pvtScore,
      };
      const session: StoredSession = {
        id:          uuidv4(),
        sessionType: 'assessment',
        taskType:    'composite',
        startedAt,
        completedAt: new Date().toISOString(),
        trialCount:  merged.length,
        scores,
        deviceType:  isMobile() ? 'mobile' : 'desktop',
      };
      saveSession(session);
    }
  }

  function advanceFromResult() {
    setPendingResult(null);
    const order: AssessmentStep[] = ['flanker', 'gonogo', 'nback', 'pvt', 'complete'];
    const next = order[order.indexOf(step) + 1];
    setStep(next ?? 'complete');
  }

  // ─── Per-task result screen ────────────────────────────────────────────────
  if (pendingResult !== null) {
    const stepInfo = STEPS.find((s) => s.step === pendingResult.step)!;
    const rating   = getRating(pendingResult.displayScore);
    const isLast   = pendingResult.step === 'pvt';

    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex flex-col items-center justify-center p-6">
        <StepIndicator steps={STEPS} currentIndex={currentStepIndex} />
        <div className="max-w-md w-full space-y-6 pt-12">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="text-5xl">{stepInfo.emoji}</div>
            <p className="text-sm font-medium text-brand-500 uppercase tracking-wider">Task Complete</p>
            <h2 className="text-2xl font-bold text-gray-900">{stepInfo.label}</h2>
          </div>

          {/* Score */}
          <div className={`rounded-2xl border-2 p-6 text-center ${rating.bg}`}>
            <div className={`text-7xl font-extrabold tabular-nums ${rating.color}`}>
              {pendingResult.displayScore}
            </div>
            <div className="text-gray-500 text-sm mt-1">out of 100</div>
            <div className={`font-bold text-xl mt-2 ${rating.color}`}>{rating.label}</div>
          </div>

          {/* Metrics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {pendingResult.flankerScore?.valid && <>
              <MetricRow label="Accuracy"              value={`${pendingResult.flankerScore.accuracy_pct?.toFixed(1)}%`} />
              <MetricRow label="Interference Effect"   value={`${pendingResult.flankerScore.FIE_ms?.toFixed(0)} ms`} />
              <MetricRow label="Mean RT (congruent)"   value={`${pendingResult.flankerScore.mean_rt_congruent?.toFixed(0)} ms`} />
            </>}
            {pendingResult.goNoGoScore?.valid && <>
              <MetricRow label="Hit Rate"              value={`${((pendingResult.goNoGoScore.hit_rate ?? 0) * 100).toFixed(1)}%`} />
              <MetricRow label="False Alarm Rate"      value={`${((pendingResult.goNoGoScore.false_alarm_rate ?? 0) * 100).toFixed(1)}%`} />
              <MetricRow label="Sensitivity (d′)"      value={pendingResult.goNoGoScore.d_prime?.toFixed(2) ?? '–'} />
            </>}
            {pendingResult.nBackScore?.valid && <>
              <MetricRow label="Accuracy"              value={`${pendingResult.nBackScore.accuracy_pct?.toFixed(1)}%`} />
              <MetricRow label="Hit Rate"              value={`${((pendingResult.nBackScore.hit_rate ?? 0) * 100).toFixed(1)}%`} />
              <MetricRow label="Sensitivity (d′)"      value={pendingResult.nBackScore.d_prime?.toFixed(2) ?? '–'} />
            </>}
            {pendingResult.pvtScore?.valid && <>
              <MetricRow label="Median RT"             value={`${pendingResult.pvtScore.median_rt?.toFixed(0)} ms`} />
              <MetricRow label="Lapse Rate (>500 ms)"  value={`${((pendingResult.pvtScore.lapse_rate ?? 0) * 100).toFixed(1)}%`} />
              <MetricRow label="Trials completed"      value={`${pendingResult.pvtScore.trials_completed}`} />
            </>}
          </div>

          <button
            onClick={advanceFromResult}
            className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 active:scale-95 transition"
          >
            {isLast ? 'See Final Score →' : 'Continue to Next Task →'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Intro screen ──────────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-brand-50 to-white flex flex-col items-center justify-start sm:justify-center px-4 py-5 sm:p-6">
        <div className="max-w-xl w-full space-y-5 sm:space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-brand-500 uppercase tracking-wider">Baseline Assessment</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attention Profile</h1>
            <p className="text-gray-500">4 tasks · ~20 minutes total</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {STEPS.map((s, i) => (
              <div key={s.step} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{s.emoji} {s.label}</p>
                  <p className="text-sm text-gray-500">{s.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Disclaimer />

          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center">
              Find a quiet space · close other tabs · use a keyboard for best results
            </p>
            <button
              onClick={() => setStep('flanker')}
              className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 active:scale-95 transition"
            >
              Begin Assessment →
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 text-gray-500 hover:text-gray-700 text-sm transition"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Final score screen ────────────────────────────────────────────────────
  if (step === 'complete') {
    const overallScore = taskResults.length > 0
      ? Math.round(taskResults.reduce((sum, r) => sum + r.displayScore, 0) / taskResults.length)
      : 0;
    const overallRating = getRating(overallScore);

    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex flex-col items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="text-5xl">🎉</div>
            <p className="text-sm font-medium text-brand-500 uppercase tracking-wider">Assessment Complete</p>
            <h2 className="text-3xl font-bold text-gray-900">Your Attention Profile</h2>
          </div>

          {/* Overall score */}
          <div className={`rounded-2xl border-2 p-6 text-center ${overallRating.bg}`}>
            <div className={`text-8xl font-extrabold tabular-nums ${overallRating.color}`}>
              {overallScore}
            </div>
            <div className="text-gray-500 text-sm mt-1">Overall Score · out of 100</div>
            <div className={`font-bold text-xl mt-2 ${overallRating.color}`}>{overallRating.label}</div>
          </div>

          {/* Per-task breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {taskResults.map((r) => {
              const info   = STEPS.find((s) => s.step === r.step)!;
              const rating = getRating(r.displayScore);
              const bar    = Math.round((r.displayScore / 100) * 100);
              return (
                <div key={r.step} className="px-5 py-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{info.label}</p>
                    </div>
                    <span className={`text-2xl font-extrabold tabular-nums ${rating.color}`}>{r.displayScore}</span>
                    <span className={`text-xs font-medium ${rating.color} w-20 text-right`}>{rating.label}</span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-brand-500 transition-all"
                      style={{ width: `${bar}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/training')}
              className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 active:scale-95 transition"
            >
              Start Training →
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 text-gray-500 hover:text-gray-700 text-sm transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Active task ───────────────────────────────────────────────────────────
  return (
    <div className="relative">
      <StepIndicator steps={STEPS} currentIndex={currentStepIndex} />
      <button
        onClick={() => navigate('/')}
        className="fixed right-4 top-12 z-30 rounded-lg border border-gray-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur hover:bg-white"
      >
        Exit to Home
      </button>
      <div className="pt-12">
        {step === 'flanker' && <FlankerTask level={1} onComplete={handleTaskComplete} />}
        {step === 'gonogo'  && <GoNoGoTask  level={1} onComplete={handleTaskComplete} />}
        {step === 'nback'   && <NBackTask   level={2} onComplete={handleTaskComplete} />}
        {step === 'pvt'     && <PVTTask     level={1} onComplete={handleTaskComplete} />}
      </div>
    </div>
  );
}

function isMobile() {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}
