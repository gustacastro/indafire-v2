export interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  pdfUrl: string | null;
  isLoading: boolean;
}
