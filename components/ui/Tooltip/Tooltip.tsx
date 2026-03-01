'use client';
import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { TooltipProps, TooltipSide } from '@/types/ui/tooltip.types';

const GAP = 8;

function getTransformOrigin(side: TooltipSide): string {
  const map: Record<TooltipSide, string> = {
    top: 'bottom center',
    bottom: 'top center',
    left: 'right center',
    right: 'left center',
  };
  return map[side];
}

export function Tooltip({ content, side = 'top', children, className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [resolvedSide, setResolvedSide] = useState<TooltipSide>(side);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const computePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const fits: Record<TooltipSide, boolean> = {
      top: trigger.top - tooltip.height - GAP >= 0,
      bottom: trigger.bottom + tooltip.height + GAP <= vh,
      left: trigger.left - tooltip.width - GAP >= 0,
      right: trigger.right + tooltip.width + GAP <= vw,
    };

    let preferred = side;
    if (!fits[preferred]) {
      const fallbacks: TooltipSide[] = ['top', 'bottom', 'right', 'left'];
      preferred = fallbacks.find((s) => fits[s]) ?? side;
    }

    setResolvedSide(preferred);

    let top = 0;
    let left = 0;

    if (preferred === 'top') {
      top = trigger.top - tooltip.height - GAP;
      left = trigger.left + trigger.width / 2 - tooltip.width / 2;
    } else if (preferred === 'bottom') {
      top = trigger.bottom + GAP;
      left = trigger.left + trigger.width / 2 - tooltip.width / 2;
    } else if (preferred === 'left') {
      top = trigger.top + trigger.height / 2 - tooltip.height / 2;
      left = trigger.left - tooltip.width - GAP;
    } else {
      top = trigger.top + trigger.height / 2 - tooltip.height / 2;
      left = trigger.right + GAP;
    }

    top = Math.max(GAP, Math.min(top, vh - tooltip.height - GAP));
    left = Math.max(GAP, Math.min(left, vw - tooltip.width - GAP));

    setCoords({ top, left });
  }, [side]);

  useLayoutEffect(() => {
    if (visible) {
      computePosition();
    }
  }, [visible, computePosition]);

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <div
        ref={tooltipRef}
        role="tooltip"
        style={{
          position: 'fixed',
          top: coords.top,
          left: coords.left,
          transformOrigin: getTransformOrigin(resolvedSide),
          zIndex: 9999,
          pointerEvents: 'none',
        }}
        className={[
          'px-3 py-1.5 text-xs font-medium rounded-md bg-heading text-background shadow-md whitespace-nowrap transition-[opacity,transform] duration-150',
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {content}
      </div>
    </div>
  );
}
