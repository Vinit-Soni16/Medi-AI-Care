import { forwardRef, ReactNode, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97] whitespace-nowrap';

const variants: Record<Variant, string> = {
  primary:
    'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white focus-visible:ring-blue-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30',
  secondary:
    'bg-teal-500 hover:bg-teal-600 text-white focus-visible:ring-teal-500 shadow-lg shadow-teal-500/20',
  ghost:
    'bg-transparent hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 border border-slate-700/50 hover:border-slate-600 focus-visible:ring-slate-500',
  danger:
    'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 focus-visible:ring-red-500',
  outline:
    'bg-transparent border border-slate-600 hover:border-blue-500/60 text-slate-300 hover:text-white focus-visible:ring-blue-500',
  success:
    'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 focus-visible:ring-emerald-500',
};

const sizes: Record<Size, string> = {
  xs: 'text-xs px-2.5 py-1.5 h-7 rounded-lg',
  sm: 'text-xs px-3.5 py-2 h-8',
  md: 'text-sm px-5 py-2.5 h-10',
  lg: 'text-base px-7 py-3 h-12',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, fullWidth, leftIcon, rightIcon, children, className = '', disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
);
Button.displayName = 'Button';
export default Button;
