export interface ExistingImageItem {
  id: string;
  url: string;
}

export interface LocalImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export interface ImageUploadProps {
  existingImages?: ExistingImageItem[];
  localImages?: LocalImageItem[];
  onAddFiles: (files: File[]) => void;
  onRemoveExisting?: (id: string) => void;
  onRemoveLocal?: (id: string) => void;
  disabled?: boolean;
}
