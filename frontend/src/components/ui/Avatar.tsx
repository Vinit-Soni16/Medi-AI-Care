const COLORS = [
  'from-blue-500 to-indigo-600',
  'from-teal-500 to-cyan-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-green-600',
];

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<Size, { wrapper: string; text: string; ring: string; dot: string }> = {
  xs: { wrapper: 'w-6 h-6',   text: 'text-[9px]',  ring: 'ring-1',  dot: 'w-1.5 h-1.5 border' },
  sm: { wrapper: 'w-8 h-8',   text: 'text-[11px]', ring: 'ring-2',  dot: 'w-2 h-2 border-[1.5px]' },
  md: { wrapper: 'w-10 h-10', text: 'text-sm',     ring: 'ring-2',  dot: 'w-2.5 h-2.5 border-2' },
  lg: { wrapper: 'w-12 h-12', text: 'text-base',   ring: 'ring-2',  dot: 'w-3 h-3 border-2' },
  xl: { wrapper: 'w-16 h-16', text: 'text-xl',     ring: 'ring-2',  dot: 'w-3.5 h-3.5 border-2' },
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface AvatarProps {
  name: string;
  src?: string;
  size?: Size;
  online?: boolean;
  className?: string;
}

export default function Avatar({ name, src, size = 'md', online, className = '' }: AvatarProps) {
  const s = sizeMap[size];
  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${s.wrapper} rounded-full object-cover ${s.ring} ring-slate-700`}
          loading="lazy"
        />
      ) : (
        <div
          className={`${s.wrapper} rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${getColor(name)} ${s.ring} ring-slate-700 shrink-0`}
        >
          <span className={s.text}>{getInitials(name)}</span>
        </div>
      )}
      {online && (
        <span className={`absolute bottom-0 right-0 ${s.dot} bg-emerald-400 border-slate-900 rounded-full`} />
      )}
    </div>
  );
}
