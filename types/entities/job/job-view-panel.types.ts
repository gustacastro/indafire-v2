import { SideModalButton } from '@/types/ui/side-modal.types';

export interface JobViewPanelProps {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
  footerButtons?: SideModalButton[];
}
