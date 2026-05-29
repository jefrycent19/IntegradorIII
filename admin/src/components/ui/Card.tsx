import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, padding = true }) => (
  <div className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm', padding && 'p-5', className)}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ title: string; icon?: React.ReactNode; action?: React.ReactNode }> = ({
  title, icon, action,
}) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
    <div className="flex items-center gap-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
    </div>
    {action}
  </div>
);
