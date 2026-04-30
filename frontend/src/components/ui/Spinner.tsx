type Size = 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<Size, string> = {
  sm: 'w-4 h-4',
  md: 'w-7 h-7',
  lg: 'w-10 h-10',
  xl: 'w-14 h-14',
};

interface SpinnerProps {
  size?: Size;
  className?: string;
  color?: string;
}

export default function Spinner({ size = 'md', className = '', color = '#3b82f6' }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg className={`animate-spin ${sizes[size]}`} viewBox="0 0 24 24" fill="none" aria-label="Loading">
        <circle className="opacity-15" cx="12" cy="12" r="10" stroke={color} strokeWidth="3" />
        <path
          className="opacity-85"
          fill={color}
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  );
}

export function PageSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[20rem] gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-slate-500 animate-pulse">{message ?? 'Loading...'}</p>
    </div>
  );
}

export function InlineSpinner({ size = 'sm' }: { size?: Size }) {
  return <Spinner size={size} />;
}
