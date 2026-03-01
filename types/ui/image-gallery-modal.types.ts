export interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title?: string;
  initialIndex?: number;
}
