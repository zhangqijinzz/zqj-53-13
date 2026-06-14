import React from 'react';

interface Props {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  accent?: 'emerald' | 'indigo' | 'stone';
  className?: string;
  delay?: number;
}

const SectionCard: React.FC<Props> = ({
  title, icon, children, accent = 'stone', className = '', delay = 0,
}) => {
  const borderColor =
    accent === 'emerald' ? 'border-brand-200' :
    accent === 'indigo'  ? 'border-accent-200' :
                            'border-canvas-200';
  const badgeColor =
    accent === 'emerald' ? 'text-brand-700 bg-brand-50 border-brand-200' :
    accent === 'indigo'  ? 'text-accent-700 bg-accent-50 border-accent-200' :
                            'text-stone-700 bg-canvas-50 border-canvas-200';

  return (
    <section
      className={`bg-white rounded-2xl border ${borderColor} shadow-soft p-5 md:p-6 animate-float-in ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {icon && (
            <span className={`flex items-center justify-center w-8 h-8 rounded-lg border ${badgeColor}`}>
              {icon}
            </span>
          )}
          <h2 className="font-display font-semibold text-lg text-stone-800 tracking-tight">
            {title}
          </h2>
        </div>
      )}
      {children}
    </section>
  );
};

export default SectionCard;
