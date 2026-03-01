import { EnrichedRejection } from '@/app/(protected)/quotes/quotes.facade';

export interface QuoteHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  rejections: EnrichedRejection[];
}
