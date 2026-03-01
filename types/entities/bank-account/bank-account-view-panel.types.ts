import { SideModalButton } from '@/types/ui/side-modal.types';

export interface BankAccountViewPanelProps {
  bankAccountId: string | null;
  isOpen: boolean;
  onClose: () => void;
  footerButtons?: SideModalButton[];
}
