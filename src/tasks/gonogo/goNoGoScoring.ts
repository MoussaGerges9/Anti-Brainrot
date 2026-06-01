import { mean, dPrime, mapRange } from '../../shared/utils/stats';
import type { TrialData, GoNoGoScore } from '../../shared/types';

export function scoreGoNoGo(trials: TrialData[]): GoNoGoScore {
  const goTrials    = trials.filter((t) => t.taskType === 'gonogo' && t.stimulusType === 'go');
  const nogoTrials  = trials.filter((t) => t.taskType === 'gonogo' && t.stimulusType === 'nogo');

  if (goTrials.length < 20 || nogoTrials.length < 5) {
    return { valid: false, reason: 'Insufficient trials', trials_completed: trials.length };
  }

  const hits         = goTrials.filter((t) => t.isCorrect).length;
  const falseAlarms  = nogoTrials.filter((t) => !t.isCorrect).length;

  const hitRate        = hits / goTrials.length;
  const falseAlarmRate = falseAlarms / nogoTrials.length;

  const dp = dPrime(hits, goTrials.length, falseAlarms, nogoTrials.length);

  const goRTs       = goTrials
    .filter((t) => t.isCorrect && t.reactionTimeMs !== null && t.reactionTimeMs > 80)
    .map((t) => t.reactionTimeMs!);

  return {
    valid: true,
    false_alarm_rate: falseAlarmRate,
    hit_rate:         hitRate,
    d_prime:          dp,
    go_accuracy:      hitRate * 100,
    trials_completed: trials.length,
  };
}

/** Maps d' to 0–100 display score. d' range typically 0–4 for this task. */
export function goNoGoDisplayScore(score: GoNoGoScore, isBaseline: boolean): number {
  if (!score.valid) return 50;
  if (isBaseline) return 50;
  return Math.round(mapRange(score.d_prime ?? 1.5, 0, 4, 10, 100));
}

export function goNoGoRelativeScore(current: GoNoGoScore, baseline: GoNoGoScore): number {
  if (!current.valid || !baseline.valid) return 50;
  const delta = (current.d_prime ?? 0) - (baseline.d_prime ?? 0);
  return clamp(Math.round(50 + delta * 12), 10, 100);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function goNoGoSummary(score: GoNoGoScore): string {
  if (!score.valid) return 'Incomplete session';
  const far = ((score.false_alarm_rate ?? 0) * 100).toFixed(0);
  const dp  = score.d_prime?.toFixed(2) ?? '–';
  return `False alarm rate: ${far}% · d′: ${dp}`;
}
