'use client';

import { useState, useEffect } from 'react';
import { EnvironmentBadgeProps } from '@/types/ui/environment-badge.types';
import { formatDateTime } from '@/utils/datetime';

const LABELS: Record<string, string> = {
  development: 'Ambiente de desenvolvimento',
  internal: 'Ambiente interno',
};

export function EnvironmentBadge({ environment }: EnvironmentBadgeProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!environment || !LABELS[environment]) return null;

  return (
    <div
      style={{ zIndex: 99999 }}
      className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none pb-[var(--spacing-sm)]"
    >
      <span
        style={{ opacity: 0.3, fontFamily: 'var(--font-geist-mono)' }}
        className="text-[var(--c-muted)] text-xs select-none tracking-wide text-center"
      >
        {LABELS[environment]}
        {now && ` · ${formatDateTime(now)}`}
      </span>
    </div>
  );
}
