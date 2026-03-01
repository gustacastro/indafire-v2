'use client';
import { useCallback, useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal/Modal';
import { IconChevronLeft, IconChevronRight, IconX } from '@/components/icons';
import { ImageGalleryModalProps } from '@/types/ui/image-gallery-modal.types';

export function ImageGalleryModal({
  isOpen,
  onClose,
  images,
  title = 'Imagens',
  initialIndex = 0,
}: ImageGalleryModalProps) {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) setCurrent(initialIndex);
  }, [isOpen, initialIndex]);

  const prev = useCallback(() => {
    setCurrent((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, prev, next, onClose]);

  if (!isOpen || images.length === 0) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-base font-semibold text-heading">{title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted font-medium">
            {current + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-(--radius-md) text-muted hover:text-foreground hover:bg-secondary transition-all"
          >
            <IconX size={18} />
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center bg-secondary min-h-80 max-h-[70vh]">
        <img
          src={images[current]}
          alt={`Imagem ${current + 1}`}
          className="max-w-full max-h-[70vh] object-contain"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-card/90 border border-border rounded-full text-foreground hover:bg-secondary transition-all shadow-md"
            >
              <IconChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-card/90 border border-border rounded-full text-foreground hover:bg-secondary transition-all shadow-md"
            >
              <IconChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto px-5 py-3 border-t border-border">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={[
                'shrink-0 w-14 h-14 rounded-(--radius-md) overflow-hidden border-2 transition-all',
                i === current ? 'border-primary' : 'border-border opacity-60 hover:opacity-100',
              ].join(' ')}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
