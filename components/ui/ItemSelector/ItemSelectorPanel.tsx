'use client';
import { SideModal } from '@/components/ui/SideModal/SideModal';
import { SearchInput } from '@/components/ui/SearchInput/SearchInput';
import { IconCheck, IconPlus, IconX } from '@/components/icons';
import { ItemSelectorPanelProps } from '@/types/ui/item-selector-panel.types';

export function ItemSelectorPanel<T>({
  isOpen,
  onClose,
  title,
  items,
  selectedIds,
  onToggle,
  getId,
  renderItem,
  searchValue,
  onSearchChange,
  isLoading = false,
  mode = 'multi',
  closeOnSelect,
  footerButtons,
  noResultsContent,
}: ItemSelectorPanelProps<T>) {
  const shouldCloseOnSelect = closeOnSelect ?? (mode === 'single');

  function handleItemClick(item: T) {
    onToggle(item);
    if (shouldCloseOnSelect) {
      onClose();
    }
  }

  return (
    <SideModal isOpen={isOpen} onClose={onClose} title={title} footerButtons={footerButtons}>
      <div className="flex flex-col gap-4 -mt-4">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Pesquisar pelo nome ou código..."
        />

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <span className="text-sm text-muted">Carregando...</span>
          </div>
        )}

        {!isLoading && items.length === 0 && noResultsContent && (
          <div className="py-8">
            {noResultsContent}
          </div>
        )}

        {!isLoading && items.length === 0 && !noResultsContent && (
          <div className="flex items-center justify-center py-16">
            <span className="text-sm text-muted">Nenhum resultado encontrado.</span>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const id = getId(item);
              const isSelected = selectedIds.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={[
                    'w-full bg-secondary border rounded-(--radius-lg) p-4 transition-all flex items-center justify-between text-left group',
                    isSelected
                      ? 'border-success/30 hover:border-destructive/50'
                      : 'border-border hover:border-primary',
                  ].join(' ')}
                >
                  <div className="flex-1 min-w-0">
                    {renderItem(item, isSelected)}
                  </div>
                  {isSelected ? (
                    <div className="flex items-center justify-center px-2 py-1 rounded-(--radius-md) transition-colors bg-success/10 text-success group-hover:bg-destructive/10 group-hover:text-destructive shrink-0 ml-3">
                      <span className="group-hover:hidden"><IconCheck size={16} /></span>
                      <span className="hidden group-hover:block"><IconX size={16} /></span>
                    </div>
                  ) : (
                    <IconPlus size={18} className="text-muted group-hover:text-primary shrink-0 ml-3" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </SideModal>
  );
}
