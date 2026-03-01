'use client';
import { SearchInput } from '@/components/ui/SearchInput/SearchInput';
import { KanbanFilterBarProps } from '@/types/ui/kanban-filter-bar.types';

export function KanbanFilterBar({
  user,
  showAllActive,
  onToggleShowAll,
  userCardCount,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Pesquisar...',
  action,
}: KanbanFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-(--spacing-sm) mb-(--spacing-lg)">
      <div className="flex items-stretch bg-card border border-border rounded-lg p-1 gap-1 shrink-0">
        {user && (
          <button
            type="button"
            onClick={() => showAllActive && onToggleShowAll()}
            className={[
              'flex items-center gap-(--spacing-xs) px-3 py-[0.3rem] rounded-md text-sm font-bold transition-colors',
              !showAllActive
                ? 'bg-primary text-primary-fg shadow-sm'
                : 'text-muted hover:text-heading hover:bg-secondary',
            ].join(' ')}
          >
            <span>{user.name}</span>
            {userCardCount !== undefined && (
              <span className={[
                'px-1.5 py-0.5 rounded text-[10px] font-bold',
                !showAllActive ? 'bg-primary-fg/20' : 'bg-secondary text-muted',
              ].join(' ')}>
                {userCardCount}
              </span>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={() => !showAllActive && onToggleShowAll()}
          className={[
            'px-3 py-0.5 rounded-md text-sm font-semibold transition-colors whitespace-nowrap',
            showAllActive
              ? 'bg-primary text-primary-fg shadow-sm'
              : 'text-muted hover:text-heading hover:bg-secondary',
          ].join(' ')}
        >
          Ver todos
        </button>
      </div>

      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        className="flex-1 min-w-40 max-w-md h-10 [&_input]:h-full [&_input]:py-0"
      />

      {action && <div className="shrink-0 sm:ml-auto">{action}</div>}
    </div>
  );
}
