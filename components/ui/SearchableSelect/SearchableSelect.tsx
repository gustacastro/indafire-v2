'use client';
import { useEffect, useRef, useState, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { IconCheck, IconChevronDown, IconSearch } from '@/components/icons';
import { SearchableSelectProps } from '@/types/ui/searchable-select.types';

export function SearchableSelect({
  label,
  required,
  error,
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  disabled = false,
  className = '',
  renderOption,
  renderSelected,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleToggle() {
    if (disabled) return;
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setIsOpen((prev) => !prev);
  }

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setIsOpen(false);
    setSearch('');
  }

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedOption = options.find((opt) => opt.value === value);

  const dropdownPanel = isOpen ? (
    <div
      ref={panelRef}
      style={panelStyle}
      className="bg-card border border-border rounded-(--radius-lg) shadow-xl overflow-hidden"
    >
      <div className="p-2 border-b border-border bg-secondary">
        <div className="relative">
          <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            autoFocus
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-input border border-border rounded-(--radius-md) pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>
      <div className="max-h-52 overflow-y-auto">
        {filtered.length > 0 ? (
          <div className="p-1">
            {filtered.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={[
                    'w-full flex items-center justify-between px-3 py-2 rounded-(--radius-md) text-sm transition-colors text-left',
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-secondary',
                  ].join(' ')}
                >
                  <div className="flex-1 min-w-0">
                    {renderOption ? renderOption(option) : (
                      <div>
                        <span className="font-medium block">{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-muted">{option.description}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {isSelected && <IconCheck size={15} className="text-primary shrink-0 ml-2" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-4">Nenhum resultado encontrado.</p>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-brand ml-0.5">*</span>}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={[
          'w-full flex items-center justify-between px-3 py-3 rounded-(--radius-md) border bg-input text-sm transition-all text-left',
          isOpen
            ? 'border-primary ring-1 ring-primary'
            : 'border-border hover:border-primary/50',
          error ? 'border-destructive' : '',
          disabled ? 'opacity-60 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <span className={selectedOption ? 'text-foreground font-medium truncate' : 'text-muted'}>
          {selectedOption
            ? (renderSelected ? renderSelected(selectedOption) : selectedOption.label)
            : placeholder}
        </span>
        <IconChevronDown
          size={16}
          className={`text-muted transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {typeof document !== 'undefined' && createPortal(dropdownPanel, document.body)}

      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
    </div>
  );
}
