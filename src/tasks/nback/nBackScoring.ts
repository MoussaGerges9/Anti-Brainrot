import { dPrime, mapRange } from '../../shared/utils/stats';
import type { TrialData, NBackScore } from '../../shared/types';

export function scoreNBack(trials: TrialData[]): NBackScore {
  const nbackTrials = trials.filter((t) => t.taskType === 'nback');
  const targets     = nbackTrials.filter((t) => t.stimulusType === 'target');
  const lures       = nbackTrials.filter((t) => t.stimulusType === 'lure');

  if (nbackTrials.length < 20 || targets.length < 5 || lures.length < 5) {
    return { valid: false, reason: 'Insufficient trials', trials_completed: nbackTrials.length };
  }

  const hits        = targets.filter((t) => t.isCorrect).length;
  const falseAlarms = lures.filter((t) => !t.isCorrect).length;

  const hitRate        = hits / targets.length;
  const falseAlarmRate = falseAlarms / lures.length;
  const dp             = dPrime(hits, targets.length, falseAlarms, lures.length);

  const accuracy = nbackTrials.filter((t) => t.isCorrect).length / nbackTrials.length;

  // nLevel stored in blockIndex
  const nLevel = nbackTrials[0]?.blockIndex ?? 2;

  return {
    valid: true,
    hit_rate:          hitRate,
    false_alarm_rate:  falseAlarmRate,
    d_prime:           dp,
    accuracy_pct:      accuracy * 100,
    n_level:           nLevel,
    trials_completed:  nbackTrials.length,
  };
}

/** d' for n-back: typically 0–3.5. Maps to 0–100. */
export function nBackDisplayScore(score: NBackScore, isBaseline: boolean): number {
  if (!score.valid) return 50;
  if (isBaseline) return 50;
  return Math.round(mapRange(score.d_prime ?? 1, 0, 3.5, 10, 100));
}
