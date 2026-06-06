export type LearningCategory =
  | 'computer science'
  | 'math'
  | 'science'
  | 'history'
  | 'language'
  | 'productivity'
  | 'useful trivia';

export interface LearningCard {
  title: string;
  content: string;
  category: LearningCategory;
  sourceUrl?: string;
}

export const LEARNING_FALLBACK_CARDS: LearningCard[] = [
  {
    title: 'Big O is about growth, not seconds',
    content:
      'Big O compares how runtime grows as input grows. O(n) can be faster than O(log n) for tiny inputs, but its growth is steeper on large inputs.',
    category: 'computer science',
    sourceUrl: 'https://en.wikipedia.org/wiki/Big_O_notation',
  },
  {
    title: 'Spaced repetition beats cramming',
    content:
      'Reviewing material right before you are about to forget it creates stronger long-term memory than one long review session.',
    category: 'productivity',
    sourceUrl: 'https://en.wikipedia.org/wiki/Spaced_repetition',
  },
  {
    title: 'Zero is a late invention in history',
    content:
      'Many ancient number systems had no symbol for zero. The concept matured in India and then spread through the Islamic world into Europe.',
    category: 'history',
    sourceUrl: 'https://en.wikipedia.org/wiki/0',
  },
  {
    title: 'Prime numbers are the atoms of arithmetic',
    content:
      'Every integer greater than 1 can be factored into primes in one unique way, ignoring order. This is the Fundamental Theorem of Arithmetic.',
    category: 'math',
    sourceUrl: 'https://en.wikipedia.org/wiki/Fundamental_theorem_of_arithmetic',
  },
  {
    title: 'Your brain predicts what you see',
    content:
      'Perception is not passive. Your brain combines incoming signals with prior expectations, which is why context can change what you notice.',
    category: 'science',
    sourceUrl: 'https://en.wikipedia.org/wiki/Predictive_coding',
  },
  {
    title: 'Use active voice for clearer writing',
    content:
      'Active voice usually makes sentences shorter and easier to parse. Compare "The test was completed" with "We completed the test."',
    category: 'language',
  },
  {
    title: 'TCP and UDP solve different problems',
    content:
      'TCP prioritizes ordered reliable delivery. UDP prioritizes low overhead and speed, which is useful for streaming and real-time communication.',
    category: 'computer science',
    sourceUrl: 'https://en.wikipedia.org/wiki/User_Datagram_Protocol',
  },
  {
    title: 'The Pomodoro idea is a pacing tool',
    content:
      'Short focused intervals with breaks can reduce avoidance. The exact timing is flexible; consistency matters more than strict rules.',
    category: 'productivity',
    sourceUrl: 'https://en.wikipedia.org/wiki/Pomodoro_Technique',
  },
];
