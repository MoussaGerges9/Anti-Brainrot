import { mean, mapRange } from '../../shared/utils/stats';
import type { TrialData, FlankerScore } from '../../shared/types';

export function scoreFlanker(trials: TrialData[]): FlankerScore {
  const validTrials = trials.filter(
    (t) => t.taskType === 'flanker' && t.reactionTimeMs !== null && t.reactionTimeMs > 100,
  );

  if (validTrials.length < 20) {
    return { valid: false, reason: 'Fewer than 20 valid trials', trials_completed: trials.length };
  }

  const congruentCorrect   = validTrials.filter((t) => t.stimulusType === 'congruent'   && t.isCorrect);
  const incongruentCorrect = validTrials.filter((t) => t.stimulusType === 'incongruent' && t.isCorrect);

  if (congruentCorrect.length < 5 || incongruentCorrect.length < 5) {
    return { valid: false, reason: 'Insufficient correct trials per condition', trials_completed: trials.length };
  }

  const rtCon  = congruentCorrect.map((t) => t.reactionTimeMs!);
  const rtInc  = incongruentCorrect.map((t) => t.reactionTimeMs!);

  const meanCon  = mean(rtCon);
  const meanInc  = mean(rtInc);
  const FIE_ms   = meanInc - meanCon;

  const accuracy = validTrials.filter((t) => t.isCorrect).length / validTrials.length;
  const inverse_efficiency = accuracy > 0 ? meanInc / accuracy : null;

  return {
    valid: true,
    FIE_ms,
    mean_rt_congruent:    meanCon,
    mean_rt_incongruent:  meanInc,
    accuracy_pct:         accuracy * 100,
    inverse_efficiency:   inverse_efficiency ?? undefined,
    trials_completed:     trials.length,
  };
}

/**
 * Maps a FlankerScore to a 0–100 display score for the radar chart.
 * 50 = approximate population baseline (FIE ~50ms, accuracy ~90%).
 * Direction: higher score = better performance.
 * Metric: inverse efficiency (lower raw = better display).
 */
export function flankerDisplayScore(score: FlankerScore, isBaseline: boolean): number {
  if (!score.valid) return 50;
  if (isBaseline) return 50;

  // Map accuracy: 60%→30, 75%→50, 95%→80, 100%→100
  const accScore = mapRange(score.accuracy_pct ?? 75, 50, 100, 10, 100);

  // Map FIE: 150ms→20, 60ms→50, 10ms→90 (lower FIE = better)
  const fieScore = mapRange(score.FIE_ms ?? 60, 150, 0, 10, 100);

  return Math.round((accScore + fieScore) / 2);
}
