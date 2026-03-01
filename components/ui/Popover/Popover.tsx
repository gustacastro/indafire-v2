'use client';

import { useEffect, useRef } from 'react';
import { PopoverProps } from '@/types/ui/popover.types';

export function Popover({
  isOpen,
  onClose,
  children,
  className = '',
  position = 'top',
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const positionClasses = {
    top: 'bottom-full left-0 mb-2',
    bottom: 'top-full left-0 mt-2',
    left: 'right-full top-0 mr-2',
    right: 'left-full top-0 ml-2',
  };

  return (
    <div ref={ref} className="relative">
      <div
        className={`absolute z-50 ${positionClasses[position]} bg-card rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-black/50 border border-border transition-all duration-300 ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
