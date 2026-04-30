import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'elevated';
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export default function Card({
  children,
  glow,
  hover,
  padding = 'md',
  variant = 'default',
  className = '',
  ...props
}: CardProps) {
  const base = 'rounded-2xl border backdrop-blur-sm transition-all duration-200';
  const variants = {
    default: 'bg-slate-800/50 border-slate-700/50',
    bordered: 'bg-slate-800/30 border-slate-600/50',
    elevated: 'bg-slate-800/70 border-slate-700/30 shadow-xl',
  };

  return (
    <div
      className={`
        ${base}
        ${variants[variant]}
        ${paddings[padding]}
        ${hover ? 'card-hover cursor-pointer hover:border-blue-500/25' : ''}
        ${glow ? 'shadow-[0_0_30px_rgba(59,130,246,0.08)] border-blue-500/15' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between mb-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-sm font-semibold text-slate-100 ${className}`}>
      {children}
    </h3>
  );
}

export function CardEmpty({ icon: Icon, title, description, action }: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      {Icon && <Icon size={36} className="text-slate-600 mb-3" />}
      <p className="text-sm font-medium text-slate-400">{title}</p>
      {description && <p className="text-xs text-slate-600 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
