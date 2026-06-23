import { shuffle } from '../../shared/utils/stats';
import type { TrialData } from '../../shared/types';

export type GoNoGoStimulus = 'go' | 'nogo';

export interface GoNoGoConfig {
  totalTrials: number;
  goRatio: number;          // proportion of Go trials (0–1)
  stimulusDurationMs: number;
  fixationMs: number;
  itiMinMs: number;
  itiMaxMs: number;
}

export const GONOGO_CONFIGS: Record<number, GoNoGoConfig> = {
  1: { totalTrials: 120, goRatio: 0.75, stimulusDurationMs: 800, fixationMs: 500, itiMinMs: 600, itiMaxMs: 1000 },
  2: { totalTrials: 140, goRatio: 0.67, stimulusDurationMs: 600, fixationMs: 450, itiMinMs: 500, itiMaxMs: 900  },
  3: { totalTrials: 160, goRatio: 0.60, stimulusDurationMs: 500, fixationMs: 400, itiMinMs: 400, itiMaxMs: 800  },
  4: { totalTrials: 160, goRatio: 0.50, stimulusDurationMs: 400, fixationMs: 350, itiMinMs: 400, itiMaxMs: 700  },
};

export const GONOGO_PRACTICE_CONFIG: GoNoGoConfig = {
  totalTrials: 3,
  goRatio: 0.75,
  stimulusDurationMs: 1000,
  fixationMs: 600,
  itiMinMs: 700,
  itiMaxMs: 1200,
};

export function generateGoNoGoSequence(config: GoNoGoConfig): GoNoGoStimulus[] {
  const total  = config.totalTrials;
  const nGo    = Math.round(total * config.goRatio);
  const nNoGo  = total - nGo;

  const seq: GoNoGoStimulus[] = [
    ...Array(nGo).fill('go'),
    ...Array(nNoGo).fill('nogo'),
  ];

  return shuffle(seq);
}

export function randomITI(config: GoNoGoConfig): number {
  return config.itiMinMs + Math.random() * (config.itiMaxMs - config.itiMinMs);
}

export function recordGoNoGoTrial(
  stimulus: GoNoGoStimulus,
  responded: boolean,
  reactionTimeMs: number | null,
  sessionStartMs: number,
  trialIndex: number,
  blockIndex: number,
): TrialData {
  const isCorrect =
    (stimulus === 'go'   && responded) ||
    (stimulus === 'nogo' && !responded);

  return {
    trialId:          crypto.randomUUID(),
    taskType:         'gonogo',
    stimulusOnsetMs:  performance.now() - sessionStartMs,
    stimulusType:     stimulus,
    expectedResponse: stimulus === 'go' ? 'go' : 'nogo',
    responseGiven:    responded ? 'go' : null,
    isCorrect,
    reactionTimeMs:   stimulus === 'go' ? reactionTimeMs : null,
    blockIndex,
    trialIndex,
  };
}
