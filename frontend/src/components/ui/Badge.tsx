import { ReactNode } from 'react';

type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'teal';

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const styles: Record<Variant, { text: string; dot: string }> = {
  default: { text: 'bg-slate-700/60 text-slate-300 border-slate-600/50',         dot: 'bg-slate-400' },
  success: { text: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',    dot: 'bg-emerald-400' },
  warning: { text: 'bg-amber-500/15 text-amber-400 border-amber-500/30',          dot: 'bg-amber-400' },
  error:   { text: 'bg-red-500/15 text-red-400 border-red-500/30',               dot: 'bg-red-400' },
  info:    { text: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',             dot: 'bg-cyan-400' },
  purple:  { text: 'bg-violet-500/15 text-violet-400 border-violet-500/30',       dot: 'bg-violet-400' },
  teal:    { text: 'bg-teal-500/15 text-teal-400 border-teal-500/30',             dot: 'bg-teal-400' },
};

export default function Badge({ children, variant = 'default', size = 'sm', dot, className = '' }: BadgeProps) {
  const s = styles[variant];
  return (
    <span
      className={`
        badge-base border
        ${s.text}
        ${size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />}
      {children}
    </span>
  );
}

const roleMap: Record<string, Variant> = {
  patient: 'info',
  doctor: 'success',
  admin: 'purple',
};

const statusMap: Record<string, { variant: Variant; label: string }> = {
  pending:   { variant: 'warning', label: 'Pending' },
  confirmed: { variant: 'success', label: 'Confirmed' },
  cancelled: { variant: 'error',   label: 'Cancelled' },
  completed: { variant: 'teal',    label: 'Completed' },
  patient:   { variant: 'info',    label: 'Patient' },
  doctor:    { variant: 'success', label: 'Doctor' },
  admin:     { variant: 'purple',  label: 'Admin' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusMap[status] ?? { variant: 'default' as Variant, label: status };
  return (
    <Badge variant={config.variant} dot size="sm">
      {config.label}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <Badge variant={roleMap[role] ?? 'default'} dot size="sm">
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}
