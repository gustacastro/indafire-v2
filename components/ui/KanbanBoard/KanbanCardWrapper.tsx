'use client';
import { useDraggable } from '@dnd-kit/core';
import { KanbanCardWrapperProps } from '@/types/ui/kanban.types';
import { IconLoader } from '@/components/icons';

export function KanbanCardWrapper({
  id,
  children,
  isMoving,
  disabled = false,
}: KanbanCardWrapperProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled: disabled || isMoving,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={[
        'relative rounded-lg transition-all',
        isDragging ? 'opacity-30 scale-95' : '',
        isMoving ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      {isMoving && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-card/80 backdrop-blur-[1px] rounded-lg">
          <IconLoader size={20} className="animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
