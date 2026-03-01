'use client';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal/Modal';
import { TabSelector } from '@/components/ui/TabSelector/TabSelector';
import { IconX } from '@/components/icons';
import { HistoryModalProps } from '@/types/ui/history-modal.types';

export function HistoryModal({ isOpen, onClose, tabs }: HistoryModalProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? '');

  useEffect(() => {
    if (isOpen) setActiveTab(tabs[0]?.key ?? '');
  }, [isOpen]);

  const activeContent = tabs.find((t) => t.key === activeTab)?.content;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="px-(--spacing-lg) py-(--spacing-md) border-b border-border flex items-center justify-between bg-secondary shrink-0">
        <h2 className="text-base font-semibold text-heading">Históricos</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-muted hover:text-foreground hover:bg-ghost-hover rounded-(--radius-md) transition-colors"
          aria-label="Fechar"
        >
          <IconX size={18} />
        </button>
      </div>

      <div className="px-(--spacing-lg) pt-(--spacing-md) shrink-0">
        {tabs.length > 1 ? (
          <TabSelector
            tabs={tabs.map((t) => ({ key: t.key, label: t.label }))}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        ) : (
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">{tabs[0]?.label}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-(--spacing-lg) space-y-(--spacing-sm)">
        {activeContent}
      </div>
    </Modal>
  );
}
