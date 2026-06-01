import type { DifficultyState } from '../shared/types';

/** 1-up / 2-down staircase: requires 2 consecutive correct to go up, 1 incorrect to go down */
export function updateDifficulty(
  current: DifficultyState,
  wasCorrect: boolean,
  maxLevel = 4,
): DifficultyState {
  const recentAccuracy = [...current.recentAccuracy.slice(-19), wasCorrect ? 1 : 0];
  const consecutiveCorrect = wasCorrect ? current.consecutiveCorrect + 1 : 0;

  // Only change level after at least 20 trials
  if (recentAccuracy.length < 20) {
    return { ...current, recentAccuracy, consecutiveCorrect };
  }

  const accuracy = recentAccuracy.reduce((s, v) => s + v, 0) / recentAccuracy.length;

  let level = current.level;

  if (accuracy > 0.85 && consecutiveCorrect >= 2 && level < maxLevel) {
    level++;
  } else if (accuracy < 0.65 && level > 1) {
    level--;
  }

  return {
    level,
    consecutiveCorrect: level !== current.level ? 0 : consecutiveCorrect,
    recentAccuracy: level !== current.level ? [] : recentAccuracy,
  };
}

export function difficultyLabel(level: number): string {
  return ['', 'Beginner', 'Foundation', 'Practitioner', 'Advanced'][level] ?? 'Advanced';
}
