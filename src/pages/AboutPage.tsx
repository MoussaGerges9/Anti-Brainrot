import { Brain, Github, BookOpen, Shield, Linkedin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-900 via-brand-800 to-brand-700 text-white">
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-12">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 border border-white/20 mb-2">
            <Brain size={40} className="text-brand-300" />
          </div>
          <h1 className="text-4xl font-bold">Anti Brainrot</h1>
          <p className="text-brand-200 text-lg leading-relaxed max-w-lg mx-auto">
            A science-based attention training tool built to fight the cognitive costs of
            constant digital distraction.
          </p>
        </div>

        {/* About the project */}
        <section className="bg-white/10 border border-white/20 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={20} className="text-brand-300" />
            About the project
          </h2>
          <p className="text-brand-100 leading-relaxed">
            Anti Brainrot is built to reduce doomscrolling friction with simple tools that move
            you from passive refresh loops to intentional action in seconds.
          </p>
          <p className="text-brand-100 leading-relaxed">
            The app currently combines two tracks:
          </p>
          <ul className="space-y-2 text-brand-100">
            <li className="flex items-start gap-2">
              <span className="text-brand-300 mt-0.5">🎯</span>
              <span><strong className="text-white">Attention assessment & training</strong> — Flanker, Go/No-Go, N-back, and PVT tasks based on cognitive psychology paradigms.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-300 mt-0.5">🚀</span>
              <span><strong className="text-white">2 Minute Task Launcher</strong> — start immediately, reduce inertia, and lock into a short sprint.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-300 mt-0.5">⏱</span>
              <span><strong className="text-white">Scroll Time Converter</strong> — turn social media time into concrete equivalents (walking distance, reading pages, focus blocks).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-300 mt-0.5">🧩</span>
              <span><strong className="text-white">Boredom Replacer + Random Learning</strong> — instant alternatives and one useful insight instead of another mindless refresh.</span>
            </li>
          </ul>
          <p className="text-brand-200 text-sm leading-relaxed">
            No accounts, no databases, no personal history: interactions are intentionally lightweight and in-memory only.
          </p>
        </section>

        {/* About me */}
        <section className="bg-white/10 border border-white/20 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold">About me - Moussa Gerges</h2>
          <p className="text-brand-100 leading-relaxed">
            I'm a developer and frustrated by how social media and infinite
            scroll quietly erode the ability to focus deeply. This project is my attempt to
            understand and reclaim attention — for myself first, and for anyone else who finds
            it useful.
          </p>
          <p className="text-brand-100 leading-relaxed">
            The tasks are built to match published research protocols as closely as a browser
            environment allows. All processing happens locally in your browser — no data is
            sent anywhere, no account required.
          </p>
          <div className="flex gap-4 pt-2">
            <a
              href="https://github.com/MoussaGerges9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-medium transition"
            >
              <Github size={16} />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/moussa-gerges/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-medium transition"
            >
              <Linkedin size={16} />
              LinkedIn
            </a>
          </div>
        </section>

        {/* Privacy / disclaimer */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield size={18} className="text-brand-300" />
            Privacy & disclaimer
          </h2>
          <ul className="text-brand-200 text-sm space-y-1.5">
            <li>• All computation runs entirely in your browser — nothing is stored on a server.</li>
            <li>• Session data exists only in memory and is lost when you close or refresh the tab.</li>
            <li>• This tool is for self-monitoring and personal exploration, not medical diagnosis.</li>
            <li>• Scores depend heavily on environment, device, fatigue, and practice effects.</li>
          </ul>
        </section>

        {/* Tech stack */}
        <section className="text-center text-brand-300 text-sm space-y-1">
          <p>Built with React · TypeScript · Vite · Tailwind CSS</p>
          <p className="text-brand-400">Cognitive tasks based on published experimental psychology protocols.</p>
        </section>

      </div>
    </div>
  );
}
