import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ListItemProps {
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  title, subtitle, meta, icon, badge, onClick, className,
}) => (
  <div
    onClick={onClick}
    className={cn(
      'flex items-center gap-3 px-4 py-3.5 transition-colors',
      onClick && 'cursor-pointer hover:bg-gray-50 active:bg-gray-100',
      className
    )}
  >
    {icon && (
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
        {icon}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>}
      {meta && <p className="text-xs text-gray-400 mt-0.5">{meta}</p>}
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      {badge}
      {onClick && <ChevronRight size={14} className="text-gray-300" />}
    </div>
  </div>
);
