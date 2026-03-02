import { SideModalButton } from '@/types/ui/side-modal.types';

export interface QuoteViewPanelProps {
  isOpen: boolean;
  quoteId: string | null;
  onClose: () => void;
  footerButtons?: SideModalButton[];
  hideFinancials?: boolean;
  onDataChanged?: () => void;
}
