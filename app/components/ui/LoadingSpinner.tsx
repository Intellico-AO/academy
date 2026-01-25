'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-3 border-slate-200 border-t-emerald-500 rounded-full animate-spin`}
      />
      {message && (
        <p className="text-sm text-slate-500 animate-pulse">{message}</p>
      )}
    </div>
  );
}

export function FullPageLoader({ message = 'A carregar...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-lg font-medium text-slate-700">{message}</p>
      </div>
    </div>
  );
}
