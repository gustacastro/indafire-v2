'use client';
import { useState, useRef, useEffect } from 'react';
import { RowActionsProps } from '@/types/ui/row-actions.types';
import { MenuButton } from '@/components/ui/MenuButton/MenuButton';
import { IconMoreHorizontal } from '@/components/icons';

export function RowActions({ actions }: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [openUpward, setOpenUpward] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function handleOpen() {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownW = dropdownRef.current?.offsetWidth || 176;
    const dropdownH = dropdownRef.current?.offsetHeight || 120;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const upward = spaceBelow < dropdownH;

    let left = rect.right - dropdownW;
    left = Math.max(8, Math.min(left, window.innerWidth - dropdownW - 8));
    const top = upward ? rect.top - dropdownH - 4 : rect.bottom + 4;

    setOpenUpward(upward);
    setCoords({ top, left });
    setOpen((v) => !v);
  }

  return (
    <div className="inline-flex justify-end">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="p-2 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
        aria-label="Ações"
      >
        <IconMoreHorizontal size={18} />
      </button>

      <div
        ref={dropdownRef}
        className={[
          'overflow-hidden fixed min-w-44 rounded-xl bg-card border border-border shadow-[0_0_20px_rgba(0,0,0,0.12)] dark:shadow-black/40 z-9999 transition-[opacity,transform] duration-150',
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none',
        ].join(' ')}
        style={{ top: coords.top, left: coords.left, transformOrigin: openUpward ? 'bottom right' : 'top right' }}
      >
        {actions.map((action, i) => (
          <div key={i}>
            {action.separator && i > 0 && (
              <div className="h-px bg-border" />
            )}
            <MenuButton
              variant={action.variant ?? 'default'}
              icon={action.icon}
              label={action.label}
              onMouseUp={() => {
                action.onClick();
                setOpen(false);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

