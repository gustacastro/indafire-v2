'use client';
import { IconSearch } from '@/components/icons';
import { SearchInputProps } from '@/types/ui/search-input.types';

export function SearchInput({ value, onChange, placeholder = 'Pesquisar...', className = '' }: SearchInputProps) {
  return (
    <div className={`relative group ${className}`}>
      <IconSearch
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
    </div>
  );
}
