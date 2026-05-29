import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'blue' | 'red' | 'green' | 'amber' | 'violet' | 'cyan';
  onClick?: () => void;
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',    value: 'text-blue-700',   border: 'border-blue-100',  ring: 'hover:ring-blue-200' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-600',     value: 'text-red-700',    border: 'border-red-100',   ring: 'hover:ring-red-200' },
  green:  { bg: 'bg-emerald-50',icon: 'text-emerald-600', value: 'text-emerald-700',border: 'border-emerald-100',ring: 'hover:ring-emerald-200' },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',   value: 'text-amber-700',  border: 'border-amber-100', ring: 'hover:ring-amber-200' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600',  value: 'text-violet-700', border: 'border-violet-100',ring: 'hover:ring-violet-200' },
  cyan:   { bg: 'bg-cyan-50',   icon: 'text-cyan-600',    value: 'text-cyan-700',   border: 'border-cyan-100',  ring: 'hover:ring-cyan-200' },
};

export const StatCard: React.FC<StatCardProps> = ({
  label, value, icon, trend, color = 'blue', onClick,
}) => {
  const c = colorMap[color];
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border p-4 transition-all duration-200',
        'hover:shadow-md hover:ring-2 hover:ring-offset-1',
        c.border, c.ring,
        onClick && 'cursor-pointer'
      )}
    >
      <div className={cn('inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3', c.bg)}>
        <span className={c.icon}>{icon}</span>
      </div>
      <p className={cn('text-3xl font-bold tracking-tight', c.value)}>{value ?? 0}</p>
      <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span className={cn('text-xs font-semibold', trend.value >= 0 ? 'text-emerald-600' : 'text-red-500')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-gray-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
};
