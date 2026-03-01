'use client';
import { useEffect, useRef, useState, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { IconCheck, IconChevronDown, IconSearch } from '@/components/icons';
import { TaxDropdownProps } from '@/types/entities/tax/tax-dropdown.types';
import { TaxCard } from '@/components/ui/TaxCard/TaxCard';

const APPLIES_TO_LABELS: Record<string, string> = {
  product: 'Produto',
  service: 'Serviço',
  commerce: 'Comércio',
};
function formatAppliesTo(v: string) {
  return APPLIES_TO_LABELS[v?.toLowerCase()] ?? v;
}

export function TaxDropdown({ label, required, value, onChange, taxes, error }: TaxDropdownProps) {
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

  const filtered = taxes.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedTaxes = taxes.filter((t) => value.includes(t.category_id));

  function toggleTax(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

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
            placeholder="Pesquisar imposto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-input border border-border rounded-(--radius-md) pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>
      <div className="max-h-52 overflow-y-auto">
        {filtered.length > 0 ? (
          <div className="p-1">
            {filtered.map((tax) => {
              const isSelected = value.includes(tax.category_id);
              return (
                <button
                  key={tax.category_id}
                  type="button"
                  onClick={() => toggleTax(tax.category_id)}
                  className={[
                    'w-full flex items-center justify-between px-3 py-2 rounded-(--radius-md) text-sm transition-colors text-left',
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-secondary',
                  ].join(' ')}
                >
                  <div>
                    <span className="font-medium block">{tax.name}</span>
                    <span className="text-xs text-muted capitalize">{formatAppliesTo(tax.applies_to)}</span>
                  </div>
                  {isSelected && <IconCheck size={15} className="text-primary shrink-0" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-4">Nenhum imposto encontrado.</p>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="flex flex-col gap-1.5">
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
          'w-full flex items-center justify-between px-3 py-2.5 rounded-(--radius-md) border bg-input text-sm transition-all text-left',
          isOpen
            ? 'border-primary ring-1 ring-primary'
            : 'border-border hover:border-primary/50',
          error ? 'border-destructive' : '',
        ].join(' ')}
      >
        <span className={value.length > 0 ? 'text-foreground font-medium' : 'text-muted'}>
          {value.length === 0
            ? 'Selecione os impostos aplicáveis...'
            : `${value.length} imposto(s) selecionado(s)`}
        </span>
        <IconChevronDown
          size={16}
          className={`text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {typeof document !== 'undefined' && createPortal(dropdownPanel, document.body)}

      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}

      {selectedTaxes.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {selectedTaxes.map((tax) => (
            <TaxCard
              key={tax.category_id}
              tax={tax}
              variant="full"
              onRemove={() => toggleTax(tax.category_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
