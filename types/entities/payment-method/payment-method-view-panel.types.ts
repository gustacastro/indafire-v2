import { SideModalButton } from '@/types/ui/side-modal.types';

export interface PaymentMethodViewPanelProps {
  paymentMethodId: string | null;
  isOpen: boolean;
  onClose: () => void;
  footerButtons?: SideModalButton[];
}
