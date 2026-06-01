import { v4 as uuidv4 } from 'uuid';
import { shuffle } from '../../shared/utils/stats';
import type { TrialData } from '../../shared/types';

export type NBackStimulus = string; // single uppercase letter

export const LETTERS = ['B', 'C', 'D', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V'];

export interface NBackConfig {
  nLevel: number;          // 1, 2, or 3
  totalTrials: number;
  targetRatio: number;     // proportion of target (match) trials
  stimulusDurationMs: number;
  blankDurationMs: number; // ISI between stimuli
}

export const NBACK_CONFIGS: Record<number, NBackConfig> = {
  1: { nLevel: 1, totalTrials: 40,  targetRatio: 0.33, stimulusDurationMs: 500, blankDurationMs: 1500 },
  2: { nLevel: 2, totalTrials: 50,  targetRatio: 0.30, stimulusDurationMs: 500, blankDurationMs: 1500 },
  3: { nLevel: 2, totalTrials: 60,  targetRatio: 0.28, stimulusDurationMs: 450, blankDurationMs: 1500 },
  4: { nLevel: 3, totalTrials: 60,  targetRatio: 0.25, stimulusDurationMs: 400, blankDurationMs: 1500 },
};

export const NBACK_PRACTICE_CONFIG: NBackConfig = {
  nLevel: 1,
  totalTrials: 5,
  targetRatio: 0.40,
  stimulusDurationMs: 600,
  blankDurationMs: 1800,
};

export interface NBackSequenceItem {
  letter: string;
  isTarget: boolean; // matches letter N positions back
}

export function generateNBackSequence(config: NBackConfig): NBackSequenceItem[] {
  const { nLevel, totalTrials, targetRatio } = config;
  const sequence: NBackSequenceItem[] = [];
  const nTargets = Math.round(totalTrials * targetRatio);

  // Positions [nLevel .. totalTrials-1] can be targets
  const eligiblePositions = Array.from({ length: totalTrials - nLevel }, (_, i) => i + nLevel);
  const targetPositions = new Set(shuffle(eligiblePositions).slice(0, nTargets));

  for (let i = 0; i < totalTrials; i++) {
    if (targetPositions.has(i)) {
      sequence.push({ letter: sequence[i - nLevel].letter, isTarget: true });
    } else {
      // Pick a letter that does NOT match n-back (to avoid accidental targets)
      let letter: string;
      do {
        letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      } while (i >= nLevel && letter === sequence[i - nLevel].letter);
      sequence.push({ letter, isTarget: false });
    }
  }

  return sequence;
}

export function recordNBackTrial(
  item: NBackSequenceItem,
  responded: boolean,
  reactionTimeMs: number | null,
  sessionStartMs: number,
  trialIndex: number,
  nLevel: number,
): TrialData {
  const isCorrect =
    (item.isTarget && responded) ||
    (!item.isTarget && !responded);

  return {
    trialId:          uuidv4(),
    taskType:         'nback',
    stimulusOnsetMs:  performance.now() - sessionStartMs,
    stimulusType:     item.isTarget ? 'target' : 'lure',
    expectedResponse: item.isTarget ? 'match' : 'nomatch',
    responseGiven:    responded ? 'match' : null,
    isCorrect,
    reactionTimeMs:   responded ? reactionTimeMs : null,
    blockIndex:       nLevel,
    trialIndex,
  };
}
