import { useState } from 'react';
import Button from '../shared/components/Button';
import {
  LEARNING_FALLBACK_CARDS,
  type LearningCard,
  type LearningCategory,
} from '../shared/data/learningCards';

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function inferCategoryFromTitle(title: string): LearningCategory {
  const normalized = title.toLowerCase();
  if (normalized.includes('algorithm') || normalized.includes('computer')) return 'computer science';
  if (normalized.includes('number') || normalized.includes('equation')) return 'math';
  if (normalized.includes('language') || normalized.includes('word')) return 'language';
  if (normalized.includes('history') || normalized.includes('war')) return 'history';
  return 'science';
}

function shortenContent(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= 260) return clean;

  const firstTwoSentences = clean.match(/[^.!?]+[.!?]+\s*[^.!?]+[.!?]+/);
  if (firstTwoSentences?.[0] && firstTwoSentences[0].length <= 260) {
    return firstTwoSentences[0].trim();
  }

  return `${clean.slice(0, 257).trimEnd()}...`;
}

async function fetchLearningFromNasa(): Promise<LearningCard | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', {
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      title?: string;
      explanation?: string;
      url?: string;
    };

    if (!payload.title || !payload.explanation) return null;

    return {
      title: payload.title,
      content: shortenContent(payload.explanation),
      category: 'science',
      sourceUrl: payload.url,
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function fetchLearningFromSpaceflightNews(): Promise<LearningCard | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=15', {
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      results?: Array<{
        title?: string;
        summary?: string;
        url?: string;
      }>;
    };

    const options = payload.results?.filter((item) => item.title && item.summary) ?? [];
    if (options.length === 0) return null;

    const picked = options[Math.floor(Math.random() * options.length)];
    if (!picked.title || !picked.summary) return null;

    return {
      title: picked.title,
      content: shortenContent(picked.summary),
      category: 'science',
      sourceUrl: picked.url,
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function fetchLearningFromUselessFacts(): Promise<LearningCard | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en', {
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      text?: string;
      source_url?: string;
      permalink?: string;
    };

    if (!payload.text) return null;

    return {
      title: 'Quick Fact',
      content: shortenContent(payload.text),
      category: 'useful trivia',
      sourceUrl: payload.source_url || payload.permalink,
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function fetchLearningFromWikipedia(): Promise<LearningCard | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary', {
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      title?: string;
      extract?: string;
      description?: string;
      content_urls?: {
        desktop?: {
          page?: string;
        };
      };
    };

    if (!payload.title || !payload.extract) return null;

    return {
      title: payload.title,
      content: shortenContent(payload.extract),
      category: inferCategoryFromTitle(payload.description ?? payload.title),
      sourceUrl: payload.content_urls?.desktop?.page,
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

export default function RandomLearningPage() {
  const [card, setCard] = useState<LearningCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCard() {
    setIsLoading(true);
    setError(null);

    const providers = [
      fetchLearningFromNasa,
      fetchLearningFromSpaceflightNews,
      fetchLearningFromUselessFacts,
      fetchLearningFromWikipedia,
    ];

    const randomizedProviders = [...providers].sort(() => Math.random() - 0.5);
    for (const provider of randomizedProviders) {
      const external = await provider();
      if (external) {
        setCard(external);
        setIsLoading(false);
        return;
      }
    }

    const fallback = randomItem(LEARNING_FALLBACK_CARDS);
    setCard(fallback);
    setError('External sources were unavailable, showing a local learning card.');
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Random Learning Button</h1>
          <p className="text-sm text-gray-600">
            Replace one refresh with one useful insight you can read in under a minute.
          </p>
        </header>

        <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <Button onClick={() => void loadCard()} size="lg" className="w-full sm:w-auto">
            Learn something random
          </Button>

          {isLoading && (
            <div className="rounded-xl border border-dashed border-gray-300 p-5 text-sm text-gray-500 text-center">
              Loading a learning card...
            </div>
          )}

          {!isLoading && card && (
            <article className="rounded-2xl border border-brand-100 bg-brand-50 p-5 space-y-2">
              <p className="text-xs uppercase tracking-wide text-brand-600 font-semibold">{card.category}</p>
              <h2 className="text-lg font-semibold text-gray-900">{card.title}</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{card.content}</p>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={() => void loadCard()} variant="secondary">Another one</Button>
                <a
                  href={card.sourceUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center font-medium rounded-xl px-5 py-2.5 text-base transition ${
                    card.sourceUrl
                      ? 'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 pointer-events-none'
                  }`}
                >
                  Open source
                </a>
              </div>
            </article>
          )}

          {!isLoading && !card && (
            <div className="rounded-xl border border-dashed border-gray-300 p-5 text-sm text-gray-500 text-center">
              Tap the button to get your first quick learning card.
            </div>
          )}

          {error && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
