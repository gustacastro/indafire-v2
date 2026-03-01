'use client';
import { TabSelectorProps } from '@/types/ui/tab-selector.types';

export function TabSelector({ tabs, activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="flex items-stretch bg-secondary rounded-(--radius-lg) p-1 gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={[
            'px-4 py-1.5 rounded-(--radius-md) text-sm font-semibold transition-colors whitespace-nowrap',
            activeTab === tab.key
              ? 'bg-primary text-primary-fg shadow-sm'
              : 'text-muted hover:text-heading hover:bg-secondary',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
