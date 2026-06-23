import { shuffle } from '../../shared/utils/stats';
import type { TrialData } from '../../shared/types';

export type FlankerDirection = 'left' | 'right';

export interface FlankerStimulus {
  target: FlankerDirection;
  flankers: FlankerDirection;
  isCongruent: boolean;
}

export interface FlankerConfig {
  totalTrials: number;
  congruentRatio: number;      // 0–1, proportion congruent
  maxResponseMs: number;
  fixationMs: number;
  itiMs: number;
}

export const FLANKER_CONFIGS: Record<number, FlankerConfig> = {
  1: { totalTrials: 80, congruentRatio: 0.70, maxResponseMs: 2000, fixationMs: 500, itiMs: 800 },
  2: { totalTrials: 80, congruentRatio: 0.55, maxResponseMs: 1800, fixationMs: 450, itiMs: 700 },
  3: { totalTrials: 80, congruentRatio: 0.50, maxResponseMs: 1500, fixationMs: 400, itiMs: 600 },
  4: { totalTrials: 80, congruentRatio: 0.40, maxResponseMs: 1200, fixationMs: 350, itiMs: 500 },
};

export const FLANKER_PRACTICE_CONFIG: FlankerConfig = {
  totalTrials: 3,
  congruentRatio: 0.60,
  maxResponseMs: 3000,
  fixationMs: 600,
  itiMs: 1000,
};

export function generateFlankerSequence(config: FlankerConfig): FlankerStimulus[] {
  const total = config.totalTrials;
  const nCong = Math.round(total * config.congruentRatio);
  const nInc  = total - nCong;

  const stimuli: FlankerStimulus[] = [];

  for (let i = 0; i < Math.ceil(nCong / 2); i++)
    stimuli.push({ target: 'left',  flankers: 'left',  isCongruent: true  });
  for (let i = 0; i < Math.floor(nCong / 2); i++)
    stimuli.push({ target: 'right', flankers: 'right', isCongruent: true  });
  for (let i = 0; i < Math.ceil(nInc / 2); i++)
    stimuli.push({ target: 'left',  flankers: 'right', isCongruent: false });
  for (let i = 0; i < Math.floor(nInc / 2); i++)
    stimuli.push({ target: 'right', flankers: 'left',  isCongruent: false });

  return shuffle(stimuli).slice(0, total);
}

export function flankerArrows(stimulus: FlankerStimulus): string {
  const f = stimulus.flankers === 'left' ? '←' : '→';
  const t = stimulus.target   === 'left' ? '←' : '→';
  return `${f} ${f} ${t} ${f} ${f}`;
}

export function recordFlankerTrial(
  stimulus: FlankerStimulus,
  response: FlankerDirection | null,
  reactionTimeMs: number | null,
  sessionStartMs: number,
  trialIndex: number,
  blockIndex: number,
): TrialData {
  return {
    trialId:          crypto.randomUUID(),
    taskType:         'flanker',
    stimulusOnsetMs:  performance.now() - sessionStartMs,
    stimulusType:     stimulus.isCongruent ? 'congruent' : 'incongruent',
    expectedResponse: stimulus.target,
    responseGiven:    response,
    isCorrect:        response === stimulus.target,
    reactionTimeMs,
    blockIndex,
    trialIndex,
  };
}
