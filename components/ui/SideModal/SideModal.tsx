'use client';
import { useEffect } from 'react';
import { SideModalProps } from '@/types/ui/side-modal.types';
import { Button } from '@/components/ui/Button/Button';
import { IconX } from '@/components/icons';

export function SideModal({ isOpen, onClose, title, children, footerButtons }: SideModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-[1px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-card border-l border-border h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-secondary shrink-0">
          <h2 className="text-lg font-semibold text-heading">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground hover:bg-ghost-hover rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {children}
        </div>

        {footerButtons && footerButtons.length > 0 && (
          <div className="px-6 py-5 border-t border-border bg-secondary flex items-center gap-3 shrink-0">
            {footerButtons.map((btn, i) => (
              <Button
                key={i}
                type="button"
                variant={btn.variant}
                iconLeft={btn.icon}
                onClick={btn.onClick}
                disabled={btn.disabled}
                fullWidth
              >
                {btn.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
