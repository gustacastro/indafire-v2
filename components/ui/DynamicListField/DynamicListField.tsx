'use client';

import { IconPlus, IconX } from '@/components/icons';
import { Button } from '@/components/ui/Button/Button';
import { DynamicListFieldProps } from '@/types/ui/dynamic-list-field.types';

export function DynamicListField({
  label,
  icon,
  items,
  onChange,
  valuePlaceholder,
  departmentPlaceholder,
  valueFormatter,
  addLabel = 'Adicionar',
}: DynamicListFieldProps) {
  function handleAdd() {
    onChange([...items, { value: '', department: '' }]);
  }

  function handleRemove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function handleUpdate(index: number, field: 'value' | 'department', val: string) {
    const updated = [...items];
    if (field === 'value' && valueFormatter) {
      updated[index] = { ...updated[index], [field]: valueFormatter(val) };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    onChange(updated);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
          {label}
        </h3>
        <Button
          type="button"
          variant="brand-outline"
          size="sm"
          iconLeft={<IconPlus size={13} />}
          onClick={handleAdd}
        >
          {addLabel}
        </Button>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={valuePlaceholder}
                value={item.value}
                onChange={(e) => handleUpdate(idx, 'value', e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              <input
                type="text"
                placeholder={departmentPlaceholder}
                value={item.department}
                onChange={(e) => handleUpdate(idx, 'department', e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-2.5 text-muted hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors mt-0.5"
              >
                <IconX size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
