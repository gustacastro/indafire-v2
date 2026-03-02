import { EnrichedRejection } from '@/app/(protected)/quotes/quotes.facade';
import { EnrichedDivergency } from '@/types/entities/quote/divergency.types';

export interface QuoteHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  rejections: EnrichedRejection[];
  divergencies: EnrichedDivergency[];
  onResolveRequest?: (divergencyId: string) => void;
  showRejections?: boolean;
  showDivergencies?: boolean;
}
