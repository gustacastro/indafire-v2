import { ReactNode } from 'react';

export interface HistoryTab {
  key: string;
  label: string;
  content: ReactNode;
}

export interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: HistoryTab[];
}
