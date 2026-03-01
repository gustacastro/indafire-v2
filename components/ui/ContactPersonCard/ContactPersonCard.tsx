'use client';

import { IconX } from '@/components/icons';
import { MiniSwitch } from '@/components/ui/MiniSwitch/MiniSwitch';
import { ContactPersonCardProps } from '@/types/ui/contact-person-card.types';
import { formatPhone } from '@/utils/document';

export function ContactPersonCard({ person, onChange, onRemove, canRemove }: ContactPersonCardProps) {
  function handleChange(field: keyof typeof person, value: string | boolean) {
    onChange({ ...person, [field]: value });
  }

  return (
    <div className="flex flex-col sm:flex-row items-start gap-3 bg-secondary p-4 rounded-(--radius-lg) border border-border">
      <div className="w-full sm:w-1/3">
        <label className="text-sm font-medium text-foreground mb-2 block">
          Nome do Contato <span className="text-brand ml-0.5">*</span>
        </label>
        <input
          type="text"
          placeholder="Ex: João Silva"
          value={person.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        />
      </div>

      <div className="w-full sm:w-1/3">
        <label className="text-sm font-medium text-foreground mb-2 block">
          Telefone / Ramal
        </label>
        <div className="relative flex items-center bg-input border border-border rounded-lg focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all pr-2">
          <input
            type="text"
            placeholder="(00) 00000-0000"
            value={person.phone}
            onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
            className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
          <MiniSwitch
            checked={person.isExtension}
            onChange={(v) => handleChange('isExtension', v)}
            label="Ramal"
          />
        </div>
      </div>

      <div className="w-full sm:w-1/3 flex items-end gap-2">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Setor
          </label>
          <input
            type="text"
            placeholder="Ex: Diretoria"
            value={person.department}
            onChange={(e) => handleChange('department', e.target.value)}
            className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
        </div>
        {canRemove && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="h-[42px] px-3 text-muted hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 rounded-lg transition-colors flex items-center justify-center"
          >
            <IconX size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
