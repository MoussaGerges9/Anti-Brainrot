import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { difficultyLabel } from '../training/adaptiveDifficulty';
import type { TaskType } from '../shared/types';

const TASKS: { taskType: TaskType; label: string; dimension: string; description: string; emoji: string }[] = [
  { taskType: 'flanker', label: 'Flanker Task',   dimension: 'Selective Attention',  description: 'Filter distractors and respond to targets', emoji: '↔' },
  { taskType: 'gonogo',  label: 'Go / No-Go',     dimension: 'Inhibitory Control',   description: 'Respond quickly while suppressing impulses',  emoji: '🛑' },
  { taskType: 'nback',   label: '2-back Task',    dimension: 'Working Memory',        description: 'Press when the current letter matches the one from 2 trials ago', emoji: '🔠' },
  { taskType: 'pvt',     label: 'Vigilance Task', dimension: 'Sustained Attention',  description: 'Stay alert and respond at unpredictable intervals', emoji: '⏱' },
];

export default function TrainingPage() {
  const navigate   = useNavigate();
  const difficulty = useAppStore((s) => s.difficulty);
  const sessions   = useAppStore((s) => s.sessions);

  // Find last trained date per task
  const lastTrained: Record<string, string | null> = {};
  for (const task of TASKS) {
    const s = sessions
      .filter((sess) => sess.taskType === task.taskType && sess.sessionType === 'training')
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
    lastTrained[task.taskType] = s ? s.startedAt : null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training</h1>
          <p className="text-sm text-gray-500">Choose a task to practice. Difficulty adapts automatically.</p>
        </div>

        <div className="space-y-3">
          {TASKS.map((task) => {
            const level = difficulty[task.taskType]?.level ?? 1;
            const last  = lastTrained[task.taskType];
            return (
              <button
                key={task.taskType}
                onClick={() => navigate(`/training/${task.taskType}`)}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:border-brand-300 hover:shadow transition flex items-center gap-4"
              >
                <div className="text-3xl w-12 h-12 flex items-center justify-center bg-brand-50 rounded-xl shrink-0">
                  {task.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{task.label}</p>
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full shrink-0">
                      {difficultyLabel(level)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{task.dimension}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
                </div>
                <div className="text-xs text-gray-400 text-right shrink-0">
                  {last
                    ? new Date(last).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                    : 'Not yet trained'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
          <strong>Note:</strong> Improvement in training scores reflects improvement on these specific tasks.
          Evidence for transfer to everyday attention is limited (Simons et al., 2016). Practice for the
          sake of deliberate engagement, not as a health intervention.
        </div>
      </div>
    </div>
  );
}
