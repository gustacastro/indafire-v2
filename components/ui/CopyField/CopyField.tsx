'use client';
import toast from 'react-hot-toast';
import { Tooltip } from '@/components/ui/Tooltip/Tooltip';
import { CopyFieldProps } from '@/types/ui/copy-field.types';

export function CopyField({ value, children, className = '' }: CopyFieldProps) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copiado para a área de transferência.');
    } catch {
      toast.error('Não foi possível copiar.');
    }
  }

  return (
    <Tooltip content="Clique para copiar" side="top">
      <button
        type="button"
        onClick={handleCopy}
        className={`text-left cursor-copy hover:opacity-70 transition-opacity focus:outline-none ${className}`}
      >
        {children}
      </button>
    </Tooltip>
  );
}
