import { useEffect, useMemo, useState } from 'react';
import Button from '../shared/components/Button';
import {
  BOREDOM_FALLBACK_SUGGESTIONS,
  type BoredomCategory,
  type BoredomSuggestion,
} from '../shared/data/boredomSuggestions';

type DurationFilter = 'all' | 2 | 5 | 10;

const CATEGORY_OPTIONS: Array<'all' | BoredomCategory> = [
  'all',
  'study',
  'body',
  'life admin',
  'creativity',
  'mindfulness',
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickDifferentSuggestion(
  items: BoredomSuggestion[],
  previousTitle: string | null,
): BoredomSuggestion {
  if (items.length <= 1 || !previousTitle) return randomItem(items);

  const candidates = items.filter((item) => item.title !== previousTitle);
  if (candidates.length === 0) return randomItem(items);
  return randomItem(candidates);
}

function categoryFromApiType(type: string): BoredomCategory {
  if (type === 'education') return 'study';
  if (type === 'recreational') return 'creativity';
  if (type === 'relaxation') return 'mindfulness';
  if (type === 'diy' || type === 'cooking') return 'life admin';
  if (type === 'social' || type === 'busywork') return 'life admin';
  return 'mindfulness';
}

function durationFromCategory(category: BoredomCategory): 2 | 5 | 10 {
  if (category === 'body' || category === 'mindfulness') return 2;
  if (category === 'study' || category === 'life admin') return 5;
  return 10;
}

function durationFromApiDuration(durationText?: string): 2 | 5 | 10 {
  const normalized = (durationText ?? '').toLowerCase();
  if (normalized.includes('minute')) return 5;
  if (normalized.includes('hour')) return 10;
  if (normalized.includes('day') || normalized.includes('week')) return 10;
  return 5;
}

function apiTypeFromCategory(category: 'all' | BoredomCategory): string | null {
  if (category === 'all') return null;
  if (category === 'study') return 'education';
  if (category === 'creativity') return 'recreational';
  if (category === 'mindfulness') return 'relaxation';
  if (category === 'life admin') return 'busywork';
  if (category === 'body') return null;
  return null;
}

async function fetchFirstSuccessfulJson(
  urls: string[],
  signal: AbortSignal,
): Promise<unknown | null> {
  for (const url of urls) {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) continue;
      return (await response.json()) as unknown;
    } catch {
      // Try the next transport endpoint.
    }
  }
  return null;
}

async function fetchExternalSuggestion(
  category: 'all' | BoredomCategory,
  duration: DurationFilter,
  previousTitle: string | null,
): Promise<BoredomSuggestion | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 2500);

  try {
    const apiType = apiTypeFromCategory(category);
    const rawEndpoint = apiType
      ? `https://bored-api.appbrewery.com/filter?type=${encodeURIComponent(apiType)}&t=${Date.now()}`
      : `https://bored-api.appbrewery.com/random?t=${Date.now()}`;

    const payload = (await fetchFirstSuccessfulJson(
      [
        rawEndpoint,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(rawEndpoint)}`,
        `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(rawEndpoint)}`,
      ],
      controller.signal,
    )) as {
      activity?: string;
      type?: string;
      duration?: string;
      link?: string;
    } | Array<{
      activity?: string;
      type?: string;
      duration?: string;
      link?: string;
    }>;

    if (!payload) return null;

    const pickedPool = Array.isArray(payload) ? payload : [payload];
    if (pickedPool.length === 0) return null;

    const filteredPool = previousTitle
      ? pickedPool.filter((item) => item.activity && item.activity !== previousTitle)
      : pickedPool;
    const effectivePool = filteredPool.length > 0 ? filteredPool : pickedPool;
    const picked = effectivePool[Math.floor(Math.random() * effectivePool.length)];

    if (!picked?.activity) return null;

    const inferredCategoryRaw = categoryFromApiType(picked.type ?? '');
    const inferredCategory: BoredomCategory =
      category === 'body' ? 'body' : inferredCategoryRaw;
    const inferredDuration = durationFromApiDuration(picked.duration) || durationFromCategory(inferredCategory);

    if (category !== 'all' && category !== 'body' && inferredCategory !== category) return null;
    if (duration !== 'all' && inferredDuration !== duration) return null;

    const sourceHint = picked.link ? `Source link available: ${picked.link}` : 'External idea from the Bored API.';

    return {
      title: picked.activity,
      description: `${sourceHint} If this is not practical now, ask for another one.`,
      category: inferredCategory,
      durationMin: inferredDuration,
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

export default function BoredomReplacerPage() {
  const [category, setCategory] = useState<'all' | BoredomCategory>('all');
  const [duration, setDuration] = useState<DurationFilter>('all');
  const [current, setCurrent] = useState<BoredomSuggestion | null>(null);
  const [source, setSource] = useState<'api' | 'local' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneFeedback, setDoneFeedback] = useState(false);

  const localMatches = useMemo(() => {
    return BOREDOM_FALLBACK_SUGGESTIONS.filter((item) => {
      const categoryMatch = category === 'all' || item.category === category;
      const durationMatch = duration === 'all' || item.durationMin === duration;
      return categoryMatch && durationMatch;
    });
  }, [category, duration]);

  async function loadSuggestion() {
    setDoneFeedback(false);
    setIsLoading(true);
    setError(null);

    const previousTitle = current?.title ?? null;
    const fromApi = await fetchExternalSuggestion(category, duration, previousTitle);
    if (fromApi) {
      setCurrent(fromApi);
      setSource('api');
      setIsLoading(false);
      return;
    }

    if (localMatches.length > 0) {
      setCurrent(pickDifferentSuggestion(localMatches, previousTitle));
      setSource('local');
      setIsLoading(false);
      return;
    }

    setCurrent(null);
    setSource(null);
    setError('No suggestion matches your current filters. Try broader filters.');
    setIsLoading(false);
  }

  useEffect(() => {
    void loadSuggestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, duration]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Boredom Replacer</h1>
          <p className="text-sm text-gray-600">
            One better option at a time when your brain wants a scroll hit.
          </p>
        </header>

        <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm text-gray-700">
              <span className="block font-medium mb-1">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as 'all' | BoredomCategory)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-gray-700">
              <span className="block font-medium mb-1">Duration</span>
              <select
                value={duration}
                onChange={(event) => {
                  const next = event.target.value;
                  setDuration(next === 'all' ? 'all' : Number(next) as 2 | 5 | 10);
                }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">all</option>
                <option value="2">2 min</option>
                <option value="5">5 min</option>
                <option value="10">10 min</option>
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-5 text-sm text-gray-500 text-center">
              Finding a suggestion...
            </div>
          ) : current ? (
            <article className="rounded-2xl border border-brand-100 bg-brand-50 p-5 space-y-2">
              <p className="text-xs uppercase tracking-wide text-brand-600 font-semibold">{current.category}</p>
              <h2 className="text-lg font-semibold text-gray-900">{current.title}</h2>
              <p className="text-sm text-gray-700">{current.description}</p>
              <p className="text-xs text-gray-500">Estimated duration: {current.durationMin} min</p>
              {source && (
                <p className="text-xs text-gray-500">Source: {source === 'api' ? 'external API (live) + local fallback' : 'local fallback list'}</p>
              )}
            </article>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-5 text-sm text-gray-500 text-center">
              {error ?? 'No suggestion yet.'}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void loadSuggestion()} disabled={isLoading}>Give me another one</Button>
            <Button variant="ghost" onClick={() => setDoneFeedback(true)}>Done</Button>
          </div>

          {doneFeedback && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              Nice choice. Small alternatives compound over time.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
