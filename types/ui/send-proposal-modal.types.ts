export interface ContactItem {
  value: string;
  department: string;
}

export interface SendProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  quoteCode: number;
  clientName: string;
  clientId: string;
  onSkipAndMove: () => void;
  onSendAndMove: (
    selectedEmails: string[],
    selectedPhones: string[],
    includePhotos: boolean
  ) => void;
  sendLoading: boolean;
  isResend?: boolean;
}
