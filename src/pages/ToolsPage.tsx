import { Link } from 'react-router-dom';
import { ArrowRight, Rocket, Timer, Shuffle, Lightbulb } from 'lucide-react';

const TOOLS = [
  {
    to: '/tools/2-minute',
    title: '2 Minute Task Launcher',
    description: 'Start one tiny sprint right now. Pause, resume, or complete early.',
    icon: Rocket,
  },
  {
    to: '/tools/time-converter',
    title: 'Scroll Time Converter',
    description: 'Turn scrolling minutes into useful real-world alternatives.',
    icon: Timer,
  },
  {
    to: '/tools/boredom-replacer',
    title: 'Boredom Replacer',
    description: 'Get an immediate alternative when you feel the urge to scroll.',
    icon: Shuffle,
  },
  {
    to: '/tools/random-learning',
    title: 'Random Learning Button',
    description: 'One useful thing to learn in under a minute.',
    icon: Lightbulb,
  },
] as const;

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Quick Anti-Brainrot Tools</h1>
          <p className="text-sm text-gray-600">
            Fast, low-friction utilities to break doomscroll loops and redirect your attention.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.to}
                to={tool.to}
                className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-brand-300 hover:shadow transition"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-3">
                  <Icon size={18} />
                </div>
                <h2 className="font-semibold text-gray-900 mb-1">{tool.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 mt-4">
                  Open tool
                  <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
