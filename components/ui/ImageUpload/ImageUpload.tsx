'use client';
import { useRef, useState } from 'react';
import { IconUploadCloud, IconX, IconImage } from '@/components/icons';
import { ImageUploadProps } from '@/types/ui/image-upload.types';

export function ImageUpload({
  existingImages = [],
  localImages = [],
  onAddFiles,
  onRemoveExisting,
  onRemoveLocal,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function processFiles(files: FileList) {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length > 0) onAddFiles(imageFiles);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) processFiles(e.target.files);
    e.target.value = '';
  }

  const totalCount = existingImages.length + localImages.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <IconImage size={16} className="text-primary" />
            Imagens do produto
          </p>
          <p className="text-xs text-muted mt-0.5">Adicione fotos em alta resolução (PNG, JPG, WebP)</p>
        </div>
        <span className="text-xs font-medium bg-secondary text-muted border border-border px-2.5 py-1 rounded-(--radius-md) flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${totalCount > 0 ? 'bg-primary' : 'bg-border'}`} />
          {totalCount} arquivo(s)
        </span>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={[
          'group relative overflow-hidden rounded-(--radius-lg) border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-8',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-input hover:border-primary/40 hover:bg-secondary',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple
          accept="image/*"
          className="hidden"
          disabled={disabled}
        />
        <div
          className={[
            'w-11 h-11 rounded-full flex items-center justify-center mb-3 transition-colors duration-200',
            isDragging
              ? 'bg-primary text-primary-fg shadow-lg'
              : 'bg-secondary text-muted group-hover:text-primary group-hover:bg-primary/10',
          ].join(' ')}
        >
          <IconUploadCloud size={22} />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">Clique para selecionar ou arraste até aqui</p>
        <p className="text-xs text-muted">Tamanho máximo: 5MB por imagem</p>
      </div>

      {totalCount > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {existingImages.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-(--radius-md) overflow-hidden bg-secondary border border-border"
            >
              <img src={img.url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              {onRemoveExisting && !disabled && (
                <div className="absolute inset-0 bg-overlay/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemoveExisting(img.id); }}
                    className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-destructive-fg shadow-md transition-transform scale-75 group-hover:scale-100"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {localImages.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-(--radius-md) overflow-hidden bg-secondary border border-primary/30"
            >
              <img src={img.previewUrl} alt={img.file.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute top-1 left-1">
                <span className="text-[9px] font-bold bg-primary text-primary-fg px-1 py-0.5 rounded-(--radius-sm)">NOVO</span>
              </div>
              {onRemoveLocal && !disabled && (
                <div className="absolute inset-0 bg-overlay/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemoveLocal(img.id); }}
                    className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-destructive-fg shadow-md transition-transform scale-75 group-hover:scale-100"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
