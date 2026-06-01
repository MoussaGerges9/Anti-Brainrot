// ─── Task Types ────────────────────────────────────────────────────────────────

export type TaskType = 'flanker' | 'gonogo' | 'nback' | 'pvt';

export interface TrialData {
  trialId: string;
  taskType: TaskType;
  stimulusOnsetMs: number;   // ms since session start (performance.now delta)
  stimulusType: string;      // e.g. 'congruent', 'incongruent', 'go', 'nogo', 'target', 'lure'
  expectedResponse: string;  // 'left' | 'right' | 'go' | 'nogo' | 'match' | 'nomatch'
  responseGiven: string | null;
  isCorrect: boolean;
  reactionTimeMs: number | null; // null for misses and correct rejections
  blockIndex: number;
  trialIndex: number;
}

// ─── Scoring Types ─────────────────────────────────────────────────────────────

export interface FlankerScore {
  valid: boolean;
  FIE_ms?: number;              // Flanker Interference Effect (lower = better)
  mean_rt_congruent?: number;
  mean_rt_incongruent?: number;
  accuracy_pct?: number;
  inverse_efficiency?: number;  // mean_RT_incongruent / accuracy (lower = better)
  trials_completed?: number;
  reason?: string;
}

export interface GoNoGoScore {
  valid: boolean;
  false_alarm_rate?: number; // FAR: false_alarms / total_nogo (lower = better)
  hit_rate?: number;         // HR: hits / total_go (higher = better)
  d_prime?: number;          // SDT sensitivity (higher = better)
  go_accuracy?: number;
  trials_completed?: number;
  reason?: string;
}

export interface NBackScore {
  valid: boolean;
  hit_rate?: number;
  false_alarm_rate?: number;
  d_prime?: number;          // SDT sensitivity (higher = better)
  accuracy_pct?: number;
  n_level?: number;
  trials_completed?: number;
  reason?: string;
}

export interface PVTScore {
  valid: boolean;
  median_rt?: number;     // Median RT on non-lapse trials (lower = better)
  lapse_rate?: number;    // Proportion RT > 500ms (lower = better)
  mean_rt?: number;
  slowest_10pct_rt?: number;
  trials_completed?: number;
  reason?: string;
}

export interface CompositeScores {
  flanker?: FlankerScore;
  gonogo?: GoNoGoScore;
  nback?: NBackScore;
  pvt?: PVTScore;
}

// ─── Session Types ─────────────────────────────────────────────────────────────

export interface StoredSession {
  id: string;
  sessionType: 'assessment' | 'training';
  taskType: TaskType | 'composite';
  startedAt: string;   // ISO string
  completedAt: string; // ISO string
  trialCount: number;
  scores: CompositeScores;
  deviceType: 'desktop' | 'mobile' | 'unknown';
}

// ─── User Types ────────────────────────────────────────────────────────────────

export interface UserProfile {
  ageGroup?: '16-24' | '25-34' | '35-44' | '45-54' | '55+';
  sleepHoursAvg?: number;
  exerciseFreq?: 'never' | 'sometimes' | 'often';
  screenTimeHours?: number;
}

// ─── Difficulty Types ──────────────────────────────────────────────────────────

export interface DifficultyState {
  level: number;           // 1–4
  consecutiveCorrect: number;
  recentAccuracy: number[]; // last 20 trial correctness values (0 or 1)
}

export type DifficultyMap = Record<TaskType, DifficultyState>;

// ─── Dimension Profile ─────────────────────────────────────────────────────────

export type AttentionDimension =
  | 'selective_attention'
  | 'inhibitory_control'
  | 'working_memory'
  | 'sustained_attention';

export interface DimensionScore {
  dimension: AttentionDimension;
  label: string;
  score: number;      // 0–100, where first session anchors at 50
  rawLabel: string;   // e.g. "FIE: 48 ms" — shown in tooltip
  deltaFromBaseline: number | null; // null if < 2 sessions
  sessionCount: number;
}

export interface TrendPoint {
  sessionIndex: number;
  date: string;         // formatted date
  value: number;        // raw metric value
  score: number;        // 0–100 display score
}
