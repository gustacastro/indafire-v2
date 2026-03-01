import { SideModalButton } from '@/types/ui/side-modal.types';

export interface UserViewPanelProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  footerButtons?: SideModalButton[];
}
