'use client';
import { ModalProps, ModalSize } from '@/types/ui/modal.types';

const sizeClass: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
};

export function Modal({
  isOpen,
  onClose,
  size = 'md',
  children,
  className = '',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-[1px] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div
        className={[
          `relative bg-card rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full ${sizeClass[size]} overflow-hidden border border-white/20`,
          'flex flex-col max-h-[calc(100vh-2rem)]',
          'animate-in fade-in zoom-in-[0.98] slide-in-from-bottom-4 duration-300',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </div>
  );
}
