export type BoredomCategory =
  | 'study'
  | 'body'
  | 'life admin'
  | 'creativity'
  | 'mindfulness';

export interface BoredomSuggestion {
  title: string;
  description: string;
  category: BoredomCategory;
  durationMin: 2 | 5 | 10;
}

export const BOREDOM_FALLBACK_SUGGESTIONS: BoredomSuggestion[] = [
  {
    title: 'Drink a full glass of water',
    description: 'Stand up, hydrate, and reset your attention baseline.',
    category: 'body',
    durationMin: 2,
  },
  {
    title: 'Do 10 squats and 10 calf raises',
    description: 'Quick movement breaks mental inertia and boosts alertness.',
    category: 'body',
    durationMin: 2,
  },
  {
    title: 'Read one page of a book',
    description: 'Replace passive scrolling with one intentional paragraph chunk.',
    category: 'study',
    durationMin: 5,
  },
  {
    title: 'Write 3 lines of notes',
    description: 'Capture one idea, one task, and one next action.',
    category: 'study',
    durationMin: 5,
  },
  {
    title: 'Clear your desktop',
    description: 'Delete clutter files and put active docs in one folder.',
    category: 'life admin',
    durationMin: 5,
  },
  {
    title: 'Reply to one important message',
    description: 'Pick the message you have been avoiding and send a concise reply.',
    category: 'life admin',
    durationMin: 5,
  },
  {
    title: 'Stretch neck, shoulders, and back',
    description: 'Slow stretches reduce tension from prolonged screen use.',
    category: 'body',
    durationMin: 10,
  },
  {
    title: 'Review one flashcard set',
    description: 'Five to ten focused minutes is enough for a useful review.',
    category: 'study',
    durationMin: 10,
  },
  {
    title: 'Sketch one tiny idea',
    description: 'Draw one rough concept with no pressure to finish.',
    category: 'creativity',
    durationMin: 10,
  },
  {
    title: 'Do a 2-minute breathing reset',
    description: 'Inhale for 4, hold for 4, exhale for 4, repeat slowly.',
    category: 'mindfulness',
    durationMin: 2,
  },
  {
    title: 'Tidy one visible surface',
    description: 'Pick one table or shelf and make it clean enough.',
    category: 'life admin',
    durationMin: 10,
  },
  {
    title: 'Write one paragraph journal check-in',
    description: 'Describe what you feel and the next small step to take.',
    category: 'mindfulness',
    durationMin: 5,
  },
];
