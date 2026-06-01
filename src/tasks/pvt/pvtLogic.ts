import { v4 as uuidv4 } from 'uuid';
import type { TrialData } from '../../shared/types';

export interface PVTConfig {
  durationMs: number;   // total session duration
  itiMinMs: number;     // minimum inter-stimulus interval (blank wait)
  itiMaxMs: number;     // maximum inter-stimulus interval
}

export const PVT_CONFIGS: Record<number, PVTConfig> = {
  1: { durationMs: 3 * 60_000, itiMinMs: 2000, itiMaxMs:  8000 },
  2: { durationMs: 4 * 60_000, itiMinMs: 2000, itiMaxMs:  8000 },
  3: { durationMs: 5 * 60_000, itiMinMs: 2000, itiMaxMs: 10000 },
  4: { durationMs: 5 * 60_000, itiMinMs: 1500, itiMaxMs: 10000 },
};

export const PVT_PRACTICE_CONFIG: PVTConfig = {
  durationMs: 30_000, // 30 seconds practice
  itiMinMs: 2000,
  itiMaxMs: 6000,
};

/** Generate random ISI within config bounds */
export function randomPVTIti(config: PVTConfig): number {
  return config.itiMinMs + Math.random() * (config.itiMaxMs - config.itiMinMs);
}

/** Record a PVT trial */
export function recordPVTTrial(
  reactionTimeMs: number | null,  // null = missed (no response in time)
  sessionStartMs: number,
  trialIndex: number,
): TrialData {
  const LAPSE_THRESHOLD = 500;

  return {
    trialId:          uuidv4(),
    taskType:         'pvt',
    stimulusOnsetMs:  performance.now() - sessionStartMs,
    stimulusType:     'vigilance',
    expectedResponse: 'go',
    responseGiven:    reactionTimeMs !== null ? 'go' : null,
    isCorrect:        reactionTimeMs !== null && reactionTimeMs < LAPSE_THRESHOLD,
    reactionTimeMs,
    blockIndex:       0,
    trialIndex,
  };
}
