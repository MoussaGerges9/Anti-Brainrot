import { useNavigate } from 'react-router-dom';
import { Brain, Shield, TrendingUp, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-900 via-brand-800 to-brand-700 text-white flex flex-col">

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 text-brand-200 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
            <Shield size={12} />
            Not a medical device · Science-based self-monitoring
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            Anti Brainrot
            <span className="block text-brand-300 text-2xl sm:text-3xl mt-2">Train your attention</span>
          </h1>

          <p className="text-xl text-brand-200 max-w-lg mx-auto leading-relaxed">
            Measure and practice the four core dimensions of attention — using paradigms from
            experimental cognitive psychology, with radical transparency about what the data means.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => navigate('/assessment')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-700 rounded-xl font-semibold text-lg hover:bg-brand-50 active:scale-95 transition shadow-lg"
            >
              Take Assessment <ChevronRight size={18} />
            </button>
            <button
              onClick={() => navigate('/training')}
              className="px-8 py-4 border border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/10 active:scale-95 transition"
            >
              Practice Tasks
            </button>
          </div>
        </div>
      </main>

      {/* Feature cards */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <FeatureCard
              icon={<Brain className="text-brand-600" size={24} />}
              title="4 Validated Tasks"
              description="Flanker · Go/No-Go · N-back · Vigilance — paradigms from published cognitive research"
            />
            <FeatureCard
              icon={<TrendingUp className="text-violet-600" size={24} />}
              title="Personal Progress"
              description="Track your own trends over time. Scores are compared to your baseline, not population norms"
            />
            <FeatureCard
              icon={<Shield className="text-green-600" size={24} />}
              title="Radically Transparent"
              description="No diagnostic claims. Every metric is explained. Science limitations are disclosed upfront"
            />
          </div>

          {/* What this is / isn't */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <p className="font-semibold text-green-800 mb-3">✓ What this app does</p>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Measures your task performance with validated paradigms</li>
                <li>• Tracks your personal trends longitudinally</li>
                <li>• Provides evidence-based attention exercises</li>
                <li>• Keeps all data private, stored locally only</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <p className="font-semibold text-red-800 mb-3">✗ What this app does NOT do</p>
              <ul className="space-y-2 text-sm text-red-700">
                <li>• Diagnose ADHD, cognitive disorders, or any condition</li>
                <li>• Guarantee real-world performance improvement</li>
                <li>• Replace professional clinical assessment</li>
                <li>• Provide medical or psychological advice</li>
              </ul>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Based on: Eriksen & Eriksen (1974) · Kirchner (1958) · Dinges & Powell (1985) ·
            Simons et al. (2016) · See PRODUCT_SPEC.md for full references
          </p>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
      <div>{icon}</div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
