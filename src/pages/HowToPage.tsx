import { useRef, useState } from 'react';
import { BookOpenCheck, NotebookPen, Keyboard, ChevronDown } from 'lucide-react';

type SkillCard = {
  title: string;
  why: string;
  drill: string;
  howTo: string[];
  tips: string[];
  avoid: string;
};

const SKILLS: SkillCard[] = [
  {
    title: 'Search with intent, not impulse',
    why: 'Most people type broad queries and accept the first result. Better queries produce better thinking.',
    drill:
      '2-minute drill: Write your question in one sentence, then run 3 focused queries with different keywords. Keep only the result that answers your exact question.',
    howTo: [
      'Define the exact outcome first (fact, tutorial, comparison, or decision).',
      'Write one precise query with key nouns and constraints (time, region, version).',
      'Run at least two alternative queries with different keywords.',
      'Compare the top sources and keep only pages that answer your exact question.',
    ],
    tips: [
      'Use quotes for exact phrases when the wording matters.',
      'Add a year or recency filter for fast-changing topics.',
      'If results feel noisy, simplify the question and search in smaller steps.',
    ],
    avoid: 'Opening many tabs before defining what counts as a valid answer.',
  },
  {
    title: 'Verify sources before sharing (SIFT)',
    why: 'Fast credibility checks prevent misinformation loops and improve judgment quality.',
    drill:
      'Use SIFT: Stop, Investigate the source, Find better coverage, Trace the claim to original context. Do this for one post before you react to it.',
    howTo: [
      'Stop before reacting, especially if the post triggers anger or excitement.',
      'Investigate who published the claim and what their track record is.',
      'Find better coverage from trusted outlets and compare consensus.',
      'Trace quotes, images, and numbers back to the original source/context.',
    ],
    tips: [
      'Emotional intensity is a cue to verify, not to share faster.',
      'When in doubt, do not share yet. Delay beats regret.',
      'For images or clips, context usually changes interpretation.',
    ],
    avoid: 'Fact-checking only inside the same post/thread where the claim appeared.',
  },
  {
    title: 'Read deeply without constant switching',
    why: 'Attention switching increases errors and weakens memory of what you read.',
    drill:
      '10-minute drill: Open one article, turn off notifications, and read in one pass. After reading, write 3 key points from memory.',
    howTo: [
      'Set a short timer (10-15 minutes) and commit to one text only.',
      'Silence notifications and close unrelated tabs before starting.',
      'Read one full pass without stopping for links or side quests.',
      'Summarize from memory in 3 bullet points.',
    ],
    tips: [
      'If your mind drifts, place a tiny mark and continue. Do not restart.',
      'Use one sticky note for questions; answer them after the full pass.',
      'Short daily deep-reading sessions beat rare long sessions.',
    ],
    avoid: 'Jumping to references mid-paragraph and never finishing the main piece.',
  },
  {
    title: 'Use structured web reading',
    why: 'People scan online content by default. Structure helps you extract signal from noise faster.',
    drill:
      'Before reading the full text, scan headings and first lines, then decide: read now, save for later, or discard.',
    howTo: [
      'Scan the title, headings, and first sentence of each section.',
      'Identify the core claim and the evidence type (data, expert, anecdote).',
      'Decide quickly: read now, park for later, or discard.',
      'If reading now, switch from scan mode to focused mode for the key section.',
    ],
    tips: [
      'Use the first two paragraphs to decide if the page is worth full attention.',
      'Look for concrete numbers, methods, and source links.',
      'If headings are vague, credibility is often weaker.',
    ],
    avoid: 'Treating every page as equally important and reading everything fully.',
  },
  {
    title: 'Single-task in short focus blocks',
    why: 'Monotasking is usually more accurate and efficient than multitasking for demanding work.',
    drill:
      'Start a 15-minute focus block on one task only. If a new idea appears, park it in a note instead of switching tasks.',
    howTo: [
      'Choose one concrete output for the block (one paragraph, one section, one bug fix).',
      'Set a timer and remove switching triggers (chat popups, extra tabs).',
      'Work only on that output until the timer ends.',
      'Take a short break, then run another block if needed.',
    ],
    tips: [
      'Define done before starting: what will exist at the end of this block?',
      'Keep a parking list for unrelated thoughts.',
      'Start with 15 minutes; increase only after consistency.',
    ],
    avoid: 'Calling it focus time while still checking messages every few minutes.',
  },
  {
    title: 'Think before asking AI',
    why: 'If AI is always step one, your own reasoning muscles weaken over time.',
    drill:
      'Try this order: 1) your draft answer, 2) AI critique, 3) your final revision. Keep your first attempt visible.',
    howTo: [
      'Write your own first answer, even if rough.',
      'Ask AI to critique gaps, assumptions, and missing counterpoints.',
      'Revise with your judgment, not blind copy-paste.',
      'Save both versions to see your reasoning progress over time.',
    ],
    tips: [
      'Prompt AI to challenge you, not just agree with you.',
      'Ask for edge cases and failure modes.',
      'Use AI to compress feedback loops, not to skip thinking.',
    ],
    avoid: 'Outsourcing first-pass thinking for tasks you should practice yourself.',
  },
  {
    title: 'Use active recall, not passive re-reading',
    why: 'Recalling from memory strengthens learning more than repeatedly re-consuming content.',
    drill:
      'After any video/article, close it and answer: What was the main claim? What evidence supported it? What would I apply today?',
    howTo: [
      'Consume one piece of content once (article/video/chapter).',
      'Close it completely and recall key ideas from memory.',
      'Check what you missed and correct only the gaps.',
      'Repeat recall later the same day in 60 seconds.',
    ],
    tips: [
      'Retrieval should feel effortful. That is the point.',
      'Use question prompts instead of re-highlighting text.',
      'One short retrieval round daily is enough to compound gains.',
    ],
    avoid: 'Mistaking familiarity ("I have seen this") for true understanding.',
  },
  {
    title: 'Build a weekly skill loop',
    why: 'Skills return through repetition, not motivation spikes.',
    drill:
      'Once per week, score yourself 1-5 on Search, Verification, Reading, and Focus. Improve only the lowest score next week.',
    howTo: [
      'Set one fixed weekly review slot (same day/time).',
      'Score Search, Verify, Reading, and Focus from 1 to 5.',
      'Choose only one weak area for next week.',
      'Attach one tiny daily action to that area and track completion.',
    ],
    tips: [
      'Keep scoring simple and consistent; perfection is not required.',
      'Improve one bottleneck at a time for faster visible progress.',
      'Use checkboxes, not long journaling, to reduce friction.',
    ],
    avoid: 'Trying to optimize every skill at once and quitting after a few days.',
  },
];

const SOURCES = [
  {
    label: 'UNESCO - Media and Information Literacy',
    href: 'https://www.unesco.org/en/media-information-literacy',
  },
  {
    label: 'Common Sense - Digital Citizenship',
    href: 'https://www.commonsense.org/education/digital-citizenship',
  },
  {
    label: 'Nielsen Norman Group - How Users Read on the Web',
    href: 'https://www.nngroup.com/articles/how-users-read-on-the-web/',
  },
  {
    label: 'Mike Caulfield - SIFT (The Four Moves)',
    href: 'https://hapgood.us/2019/06/19/sift-the-four-moves/',
  },
  {
    label: 'Cleveland Clinic - Why Multitasking Does Not Work',
    href: 'https://health.clevelandclinic.org/science-clear-multitasking-doesnt-work',
  },
];

const GOOGLE_SEARCH_TIPS = [
  {
    rule: 'Start from a clear question',
    detail: 'Write the exact question first, then search. Specific questions produce specific results.',
    example: 'Weak: sleep\nBetter: how to improve deep sleep routine for students',
  },
  {
    rule: 'Use operators intentionally',
    detail: 'Operators reduce noise and help you reach higher-signal sources faster.',
    example: '"exact phrase" | site:who.int | filetype:pdf | topic -noise | A OR B',
  },
  {
    rule: 'Search by source quality',
    detail: 'If the topic is medical, legal, or technical, start from trusted domains first.',
    example: 'site:nih.gov attention research\nsite:gov cybersecurity checklist',
  },
  {
    rule: 'Use recency when needed',
    detail: 'For rapidly changing topics, include a year or use time filters.',
    example: 'browser privacy settings 2026',
  },
  {
    rule: 'Cross-check before you trust',
    detail: 'Do not stop at one source. Compare at least 2 to 3 credible sources.',
    example: 'Find claim -> verify with independent coverage -> trace original source',
  },
];

const RESEARCH_PROMPT_TIPS = [
  {
    rule: 'State your output first',
    detail: 'Ask for the format you need: checklist, comparison table, plan, or summary.',
    example: 'Return as: 7-step checklist with examples and common mistakes.',
  },
  {
    rule: 'Add context and constraints',
    detail: 'Specify level, audience, budget/time limits, and tools available.',
    example: 'Context: beginner student. Constraint: 30 minutes/day. Tool: Chrome + Notion only.',
  },
  {
    rule: 'Request evidence and limits',
    detail: 'Ask for sources, confidence level, and what the model is uncertain about.',
    example: 'Include sources, confidence by point, and a section called "What might be wrong".',
  },
  {
    rule: 'Ask for alternatives, not one answer',
    detail: 'Better decisions come from options with tradeoffs.',
    example: 'Give 3 options: fastest, cheapest, and most robust. Explain tradeoffs.',
  },
  {
    rule: 'Use a reusable template',
    detail: 'Keep one standard prompt frame and adapt only the variables.',
    example:
      'I need [output]. Context: [topic]. Constraints: [time, level, tools]. Return format: [table/checklist/plan]. Include sources, limitations, and best next action.',
  },
];

const SHORTCUTS = [
  { action: 'Reopen closed tab', windows: 'Ctrl + Shift + T', mac: 'Cmd + Shift + T' },
  { action: 'Find in page', windows: 'Ctrl + F', mac: 'Cmd + F' },
  { action: 'Focus address bar', windows: 'Ctrl + L', mac: 'Cmd + L' },
  { action: 'New tab / close tab', windows: 'Ctrl + T / Ctrl + W', mac: 'Cmd + T / Cmd + W' },
  { action: 'New window / close window', windows: 'Ctrl + N / Ctrl + Shift + W', mac: 'Cmd + N / Cmd + Shift + W' },
  { action: 'Private window', windows: 'Ctrl + Shift + N', mac: 'Cmd + Shift + N' },
  { action: 'Switch tabs (next/prev)', windows: 'Ctrl + Tab / Ctrl + Shift + Tab', mac: 'Control + Tab / Control + Shift + Tab' },
  { action: 'Jump to tab 1-8 / last tab', windows: 'Ctrl + 1..8 / Ctrl + 9', mac: 'Cmd + 1..8 / Cmd + 9' },
  { action: 'Refresh page', windows: 'Ctrl + R', mac: 'Cmd + R' },
  { action: 'Hard refresh', windows: 'Ctrl + F5', mac: 'Cmd + Shift + R' },
  { action: 'Open history', windows: 'Ctrl + H', mac: 'Cmd + Y' },
  { action: 'Open downloads', windows: 'Ctrl + J', mac: 'Cmd + Option + L' },
  { action: 'Bookmark page', windows: 'Ctrl + D', mac: 'Cmd + D' },
  { action: 'Open bookmarks manager', windows: 'Ctrl + Shift + O', mac: 'Cmd + Option + B' },
  { action: 'Zoom in / out / reset', windows: 'Ctrl + + / Ctrl + - / Ctrl + 0', mac: 'Cmd + + / Cmd + - / Cmd + 0' },
  { action: 'Open dev tools', windows: 'F12 or Ctrl + Shift + I', mac: 'Cmd + Option + I' },
  { action: 'View page source', windows: 'Ctrl + U', mac: 'Cmd + Option + U' },
  { action: 'Open task manager (browser)', windows: 'Shift + Esc', mac: 'Search in browser menu' },
  { action: 'Screenshot selection', windows: 'Win + Shift + S', mac: 'Cmd + Shift + 4' },
  { action: 'Screenshot full screen', windows: 'Win + PrtScn', mac: 'Cmd + Shift + 3' },
  { action: 'Task switcher', windows: 'Alt + Tab', mac: 'Cmd + Tab' },
  { action: 'Lock screen', windows: 'Win + L', mac: 'Control + Cmd + Q' },
  { action: 'Copy / paste / cut', windows: 'Ctrl + C / V / X', mac: 'Cmd + C / V / X' },
  { action: 'Undo / redo', windows: 'Ctrl + Z / Ctrl + Y', mac: 'Cmd + Z / Cmd + Shift + Z' },
  { action: 'Select all', windows: 'Ctrl + A', mac: 'Cmd + A' },
  { action: 'Save page/document', windows: 'Ctrl + S', mac: 'Cmd + S' },
  { action: 'Print page', windows: 'Ctrl + P', mac: 'Cmd + P' },
];

export default function HowToPage() {
  const detailsContainerRef = useRef<HTMLDivElement | null>(null);
  const [skillOpenState, setSkillOpenState] = useState<Record<string, boolean>>({});

  function setAllSkills(open: boolean) {
    const details = detailsContainerRef.current?.querySelectorAll('details[data-group="skills"]');
    details?.forEach((detail) => {
      (detail as HTMLDetailsElement).open = open;
    });
    setSkillOpenState(Object.fromEntries(SKILLS.map((skill) => [skill.title, open])));
  }

  function setAllCheats(open: boolean) {
    const details = detailsContainerRef.current?.querySelectorAll('details[data-group="cheats"]');
    details?.forEach((detail) => {
      (detail as HTMLDetailsElement).open = open;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div ref={detailsContainerRef} className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <header className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="inline-flex items-center gap-2 text-xs tracking-wide text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-3 py-1">
            <BookOpenCheck size={14} />
            How To
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Rebuild Essential Skills in the AI Era</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            This page focuses on practical habits many people are losing: searching well, checking credibility,
            reading deeply, and sustaining attention. Pick one drill, do it today, and repeat.
          </p>
        </header>

        <details className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 group" open data-group="skills">
          <summary className="list-none cursor-pointer">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <NotebookPen size={18} className="text-brand-700" />
                Essential Skills, Detailed Guide, and Micro-Exercises
              </h2>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-gray-50 transition group-open:rotate-180">
                <ChevronDown size={16} className="text-gray-600" />
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Use this section to expand only the skill you want to work on.
            </p>
          </summary>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAllSkills(true)}
              className="px-3 py-1.5 text-sm rounded-lg border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={() => setAllSkills(false)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
            >
              Collapse all
            </button>
          </div>

          <div className="space-y-3">
            {SKILLS.map((skill) => (
              <details
                key={skill.title}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm group"
                data-group="skills"
                onToggle={(e) => {
                  const isOpen = (e.currentTarget as HTMLDetailsElement).open;
                  setSkillOpenState((prev) => ({ ...prev, [skill.title]: isOpen }));
                }}
              >
                <summary className="list-none cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{skill.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">Tap to expand details</p>
                    </div>
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-gray-50 transition ${
                        skillOpenState[skill.title] ? 'rotate-180' : ''
                      }`}
                    >
                      <ChevronDown size={16} className="text-gray-600" />
                    </span>
                  </div>
                </summary>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600">{skill.why}</p>

                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900">How to improve it</p>
                    <ol className="text-sm text-gray-700 mt-1 space-y-1 list-decimal list-inside">
                      {skill.howTo.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900">Tips and tricks</p>
                    <ul className="text-sm text-gray-700 mt-1 space-y-1 list-disc list-inside">
                      {skill.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-sm text-rose-800 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mt-3">
                    <strong>Avoid:</strong> {skill.avoid}
                  </p>

                  <p className="text-sm text-brand-800 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2 mt-3">
                    <strong>Exercise:</strong> {skill.drill}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </details>

        <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Keyboard size={18} className="text-brand-700" />
            Tips and Tricks Cheat Sheets
          </h2>

          <p className="text-sm text-gray-600 leading-relaxed">
            Use this section as a practical reference. These are not theory notes: they are compact workflows
            you can apply immediately while searching, researching, and working on your browser.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAllCheats(true)}
              className="px-3 py-1.5 text-sm rounded-lg border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={() => setAllCheats(false)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
            >
              Collapse all
            </button>
          </div>

          <details className="rounded-xl border border-gray-100 bg-gray-50 p-4 group" open data-group="cheats">
            <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900">Google Search Better</h3>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-white transition group-open:rotate-180">
                <ChevronDown size={16} className="text-gray-600" />
              </span>
            </summary>

            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              Most weak searches fail because they are too broad. Use a clear question, then constrain the
              search with operators and source quality. Keep results only if they answer your exact goal.
            </p>

            <div className="mt-3 space-y-2">
              {GOOGLE_SEARCH_TIPS.map((item) => (
                <div key={item.rule} className="rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-sm font-medium text-gray-900">{item.rule}</p>
                  <p className="text-sm text-gray-700 mt-1">{item.detail}</p>
                  <p className="text-xs text-brand-800 bg-brand-50 border border-brand-100 rounded-md px-2 py-1 mt-2">
                    Example: {item.example}
                  </p>
                </div>
              ))}
            </div>
          </details>

          <details className="rounded-xl border border-gray-100 bg-gray-50 p-4 group" open data-group="cheats">
            <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900">Write Better Research Prompts</h3>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-white transition group-open:rotate-180">
                <ChevronDown size={16} className="text-gray-600" />
              </span>
            </summary>

            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              Better prompts are structured requests, not long paragraphs. Define output, context,
              constraints, and evidence expectations so the response is useful on first pass.
            </p>

            <div className="mt-3 space-y-2">
              {RESEARCH_PROMPT_TIPS.map((item) => (
                <div key={item.rule} className="rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-sm font-medium text-gray-900">{item.rule}</p>
                  <p className="text-sm text-gray-700 mt-1">{item.detail}</p>
                  <p className="text-xs text-brand-800 bg-brand-50 border border-brand-100 rounded-md px-2 py-1 mt-2">
                    Example: {item.example}
                  </p>
                </div>
              ))}
            </div>
          </details>

          <details className="rounded-xl border border-gray-100 bg-gray-50 p-4 group" data-group="cheats">
            <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900">PC and Browser Shortcuts</h3>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-white transition group-open:rotate-180">
                <ChevronDown size={16} className="text-gray-600" />
              </span>
            </summary>

            <div className="overflow-x-auto mt-2">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4">Action</th>
                    <th className="py-2 pr-4">Windows</th>
                    <th className="py-2">macOS</th>
                  </tr>
                </thead>
                <tbody>
                  {SHORTCUTS.map((row) => (
                    <tr key={row.action} className="border-t border-gray-200 text-gray-800">
                      <td className="py-2 pr-4">{row.action}</td>
                      <td className="py-2 pr-4">{row.windows}</td>
                      <td className="py-2">{row.mac}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>

        <section className="bg-gray-900 text-gray-100 rounded-2xl p-5 space-y-2">
          <h2 className="text-sm uppercase tracking-wide text-gray-300">Research basis</h2>
          <ul className="space-y-1 text-sm">
            {SOURCES.map((source) => (
              <li key={source.href}>
                <a className="text-brand-300 hover:text-brand-200 underline" href={source.href} target="_blank" rel="noreferrer">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
