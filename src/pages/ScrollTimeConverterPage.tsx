import { useMemo, useState } from 'react';

const PRESETS = [10, 15, 30, 45, 60, 90, 120] as const;

interface EquivalentItem {
  category: string;
  label: string;
  text: string;
}

// Estimation assumptions (public averages):
// - Brisk walking: >= 2.5 mph (~4.0 km/h), CDC examples.
// - Moderate cadence: ~100 steps/min.
// - Adult reading speed: ~200-250 wpm; we use 225 wpm midpoint.
// - Typical non-fiction page: ~300 words.
const BRISK_WALK_KMH = 4.0;
const STEPS_PER_MIN = 100;
const READING_WPM = 225;
const WORDS_PER_PAGE = 300;

function buildEquivalents(minutes: number): EquivalentItem[] {
  if (minutes <= 0) return [];

  const walkKm = (minutes / 60) * BRISK_WALK_KMH;
  const steps = Math.round(minutes * STEPS_PER_MIN);
  const readPages = (minutes * READING_WPM) / WORDS_PER_PAGE;
  const pomodoroBlocks = Math.max(1, Math.floor(minutes / 25));
  const tenMinSprints = Math.max(1, Math.floor(minutes / 10));
  const reviewCards = Math.max(5, Math.round(minutes * 2.2));

  return [
    {
      category: 'Study',
      label: 'Focused reading',
      text: `${minutes} min is about ${readPages.toFixed(1)} pages read (using ~225 words/min and ~300 words/page).`,
    },
    {
      category: 'Body',
      label: 'Brisk walk distance',
      text: `${minutes} min is about ${walkKm.toFixed(2)} km of brisk walking at ~4.0 km/h.`,
    },
    {
      category: 'Body',
      label: 'Movement volume',
      text: `${minutes} min is about ${steps.toLocaleString('en')} steps at ~100 steps/min cadence.`,
    },
    {
      category: 'Study',
      label: 'Deep focus blocks',
      text: `${minutes} min can fit ${pomodoroBlocks} Pomodoro block${pomodoroBlocks > 1 ? 's' : ''} (25 min focus).`,
    },
    {
      category: 'Life admin',
      label: 'Micro-sprints',
      text: `${minutes} min equals ${tenMinSprints} clear 10-minute sprint${tenMinSprints > 1 ? 's' : ''} for inbox, planning, or small tasks.`,
    },
    {
      category: 'Study',
      label: 'Flashcard review',
      text: `${minutes} min can cover about ${reviewCards} flashcards (quick 20-30 sec/card pace).`,
    },
  ];
}

export default function ScrollTimeConverterPage() {
  const [minutes, setMinutes] = useState<number>(30);

  const equivalents = useMemo(() => buildEquivalents(minutes), [minutes]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Scroll Time Converter</h1>
          <p className="text-sm text-gray-600">
            Quick mindset shift: convert scrolling time into practical alternatives.
          </p>
        </header>

        <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <label htmlFor="minutes-input" className="text-sm font-medium text-gray-700 block">
            Roughly how many minutes did you spend scrolling?
          </label>
          <input
            id="minutes-input"
            type="number"
            min={0}
            value={minutes}
            onChange={(event) => setMinutes(Math.max(0, Number(event.target.value) || 0))}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMinutes(preset)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
              >
                {preset} min
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Useful equivalents</h2>
          {equivalents.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-6 text-center text-sm text-gray-500">
              Enter a minute value to see alternatives.
            </div>
          ) : (
            equivalents.map((item) => (
              <article key={`${item.category}-${item.label}`} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-brand-600 font-semibold mb-1">{item.category}</p>
                <p className="text-sm font-semibold text-gray-900 mb-1">{item.label}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
              </article>
            ))
          )}
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-1">
          <p className="font-semibold">How these estimates are built</p>
          <p>They are approximate and intentionally simple, based on public averages.</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>CDC examples for moderate activity include brisk walking at 2.5 mph or faster.</li>
            <li>Common moderate cadence estimate: around 100 steps per minute.</li>
            <li>Reading estimate uses an adult average range of 200-250 words/min (midpoint 225).</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
