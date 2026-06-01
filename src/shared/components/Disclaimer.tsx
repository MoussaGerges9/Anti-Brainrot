import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  compact?: boolean;
  className?: string;
}

export default function Disclaimer({ compact = false, className = '' }: DisclaimerProps) {
  if (compact) {
    return (
      <p className={`text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 ${className}`}>
        ⚠ Scores reflect performance on these tasks only — not a diagnostic measure.
      </p>
    );
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-xl p-4 ${className}`}>
      <div className="flex gap-3">
        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-amber-800 space-y-1">
          <p className="font-semibold">Important — please read</p>
          <p>
            This app is <strong>not a medical device</strong> and does not diagnose, predict, treat,
            or assess any medical or psychological condition. All scores reflect your performance
            on <em>these specific tasks</em> only.
          </p>
          <p>
            Performance naturally varies with sleep, stress, caffeine, and time of day.
            Improvement in scores does not imply real-world cognitive change.
          </p>
          <p>
            If you have concerns about your cognitive health, consult a qualified healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
}
