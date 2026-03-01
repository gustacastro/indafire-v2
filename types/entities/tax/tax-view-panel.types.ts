import { SideModalButton } from'@/types/ui/side-modal.types';

export interface TaxViewPanelProps {
  taxId: string | null;
  isOpen: boolean;
  onClose: () => void;
  footerButtons?: SideModalButton[];
}
