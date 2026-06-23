import { mean, median, mapRange } from '../../shared/utils/stats';
import type { TrialData, PVTScore } from '../../shared/types';

const LAPSE_THRESHOLD_MS = 500;
const FALSE_START_MS     = 100; // RT < 100ms = anticipation error, exclude

export function scorePVT(trials: TrialData[]): PVTScore {
  const pvtTrials = trials.filter((t) => t.taskType === 'pvt');

  if (pvtTrials.length < 5) {
    return { valid: false, reason: 'Fewer than 5 trials', trials_completed: pvtTrials.length };
  }

  const responded = pvtTrials.filter(
    (t) => t.reactionTimeMs !== null && t.reactionTimeMs > FALSE_START_MS,
  );

  const lapses       = pvtTrials.filter(
    (t) => t.reactionTimeMs === null || t.reactionTimeMs >= LAPSE_THRESHOLD_MS,
  );
  const lapse_rate   = lapses.length / pvtTrials.length;

  const validRTs     = responded
    .filter((t) => t.reactionTimeMs! < LAPSE_THRESHOLD_MS)
    .map((t) => t.reactionTimeMs!);

  if (validRTs.length < 3) {
    return { valid: false, reason: 'Too many lapses to compute RT', trials_completed: pvtTrials.length };
  }

  const allRTs          = responded.map((t) => t.reactionTimeMs!);
  const slowest10pctIdx = Math.max(1, Math.ceil(allRTs.length * 0.1));
  const sortedRTs       = [...allRTs].sort((a, b) => b - a);
  const slowest10pct    = mean(sortedRTs.slice(0, slowest10pctIdx));

  return {
    valid:            true,
    median_rt:        median(validRTs),
    mean_rt:          mean(validRTs),
    lapse_rate,
    slowest_10pct_rt: slowest10pct,
    trials_completed: pvtTrials.length,
  };
}

/**
 * Map lapse rate to 0–100 display score.
 * 0% lapses = 100, 20%+ lapses = 10.
 */
export function pvtDisplayScore(score: PVTScore, isBaseline: boolean): number {
  if (!score.valid) return 50;
  if (isBaseline) return 50;
  return Math.round(mapRange(score.lapse_rate ?? 0.05, 0.3, 0, 10, 100));
}
