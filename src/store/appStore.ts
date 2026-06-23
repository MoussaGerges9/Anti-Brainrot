import { create } from 'zustand';
import type {
  StoredSession,
  DifficultyMap,
  DifficultyState,
  TaskType,
} from '../shared/types';

const DEFAULT_DIFFICULTY: DifficultyState = {
  level: 1,
  consecutiveCorrect: 0,
  recentAccuracy: [],
};

const DEFAULT_DIFFICULTY_MAP: DifficultyMap = {
  flanker: { ...DEFAULT_DIFFICULTY },
  gonogo:  { ...DEFAULT_DIFFICULTY },
  nback:   { ...DEFAULT_DIFFICULTY },
  pvt:     { ...DEFAULT_DIFFICULTY },
};

// ─── Store Shape (in-memory only — resets on page refresh) ────────────────────

export interface AppState {
  sessions: StoredSession[];
  difficulty: DifficultyMap;
}

interface AppActions {
  saveSession: (session: StoredSession) => void;
  updateDifficulty: (taskType: TaskType, state: DifficultyState) => void;
  resetAll: () => void;
}

type AppStore = AppState & AppActions;

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()((set) => ({
  // ── State (resets when the page is refreshed) ──
  sessions: [],
  difficulty: DEFAULT_DIFFICULTY_MAP,

  // ── Actions ──
  saveSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),

  updateDifficulty: (taskType, diffState) =>
    set((state) => ({
      difficulty: { ...state.difficulty, [taskType]: diffState },
    })),

  resetAll: () =>
    set({ sessions: [], difficulty: DEFAULT_DIFFICULTY_MAP }),
}));
