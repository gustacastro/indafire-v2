import { HistoryModal } from '@/components/ui/HistoryModal/HistoryModal';
import { RejectionCard } from '@/components/ui/RejectionCard/RejectionCard';
import { QuoteHistoryModalProps } from '@/types/entities/quote/quote-history-modal.types';

export function QuoteHistoryModal({ isOpen, onClose, rejections }: QuoteHistoryModalProps) {
  const sortedRejections = [...rejections].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const tabs = [
    ...(sortedRejections.length > 0
      ? [
          {
            key: 'cancellations',
            label: 'Histórico de Cancelamentos',
            content: (
              <div className="space-y-(--spacing-sm)">
                {sortedRejections.map((r, i) => (
                  <RejectionCard
                    key={i}
                    reason={r.reason}
                    createdAt={r.created_at}
                    createdByName={r.created_by_name}
                  />
                ))}
              </div>
            ),
          },
        ]
      : []),
  ];

  if (tabs.length === 0) return null;

  return <HistoryModal isOpen={isOpen} onClose={onClose} tabs={tabs} />;
}
