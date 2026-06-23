import type { ReactNode } from 'react';

interface TaskShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function TaskShell({ title, subtitle, children }: TaskShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-2 mb-8">
        {subtitle && <p className="text-sm font-medium text-brand-500 uppercase tracking-wider">{subtitle}</p>}
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="flex flex-col items-center gap-4">{children}</div>
    </div>
  );
}