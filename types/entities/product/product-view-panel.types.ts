import { SideModalButton } from '@/types/ui/side-modal.types';

export interface ProductViewPanelProps {
  isOpen: boolean;
  productId: string | null;
  onClose: () => void;
  footerButtons?: SideModalButton[];
}
