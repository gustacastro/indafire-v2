import { HistoryModal } from '@/components/ui/HistoryModal/HistoryModal';
import { RejectionCard } from '@/components/ui/RejectionCard/RejectionCard';
import { DivergencyCard } from '@/components/ui/DivergencyCard/DivergencyCard';
import { QuoteHistoryModalProps } from '@/types/entities/quote/quote-history-modal.types';

export function QuoteHistoryModal({ isOpen, onClose, rejections, divergencies, onResolveRequest, showRejections = true, showDivergencies = true }: QuoteHistoryModalProps) {
  const sortedRejections = [...rejections].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const sortedDivergencies = [...divergencies].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const tabs = [
    ...(showRejections && sortedRejections.length > 0
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
    ...(showDivergencies && sortedDivergencies.length > 0
      ? [
          {
            key: 'divergencies',
            label: 'Histórico de Divergências',
            content: (
              <div className="space-y-(--spacing-sm)">
                {sortedDivergencies.map((d) => (
                  <DivergencyCard
                    key={d.divergency_id}
                    divergency={d}
                    onResolveRequest={onResolveRequest}
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
