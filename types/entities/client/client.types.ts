import { SideModalButton } from '@/types/ui/side-modal.types';

export type ClientFormMode = 'create' | 'edit';

export interface ClientFormProps {
  mode: ClientFormMode;
  clientId?: string;
  isSupplier: boolean;
  showSupplierCheckbox?: boolean;
  prospection?: boolean;
  returnTo?: string;
}

export interface ClientListProps {
  isSupplier: boolean;
}

export interface ClientViewPanelProps {
  clientId: string | null;
  isOpen: boolean;
  onClose: () => void;
  footerButtons?: SideModalButton[];
  isSupplier: boolean;
  onStatusChange?: () => void;
}
