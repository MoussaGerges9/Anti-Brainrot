interface ProgressBarProps {
  value: number;  // 0–100
  label?: string;
  className?: string;
  color?: string;
}

export default function ProgressBar({ value, label, className = '', color = 'bg-brand-500' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      {label && (
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">{label}</span>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400 tabular-nums">
            {Math.round(pct)}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-3 sm:h-4 overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
