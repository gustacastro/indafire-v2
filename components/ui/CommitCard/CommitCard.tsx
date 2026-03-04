'use client';

import { useState } from 'react';
import { CommitCardProps } from '@/types/ui/commit-card.types';
import { IconChevronDown, IconChevronUp } from '@/components/icons';
import { formatDateTimeBR } from '@/utils/datetime';
import { CONVENTIONAL_PREFIX_LABELS } from '@/utils/conventional-commits';
import { getInitials } from '@/utils/initials';

export function CommitCard({ sha, authorName, authorAvatar, date, titlePt, bulletsPt, conventionalPrefix }: CommitCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const prefixLabel = conventionalPrefix ? CONVENTIONAL_PREFIX_LABELS[conventionalPrefix] : null;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="shrink-0 mt-0.5">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-brand">
                  {getInitials(authorName)}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted">{authorName}</span>
              <span className="text-xs text-muted/50">·</span>
              <span className="text-xs text-muted">{formatDateTimeBR(date)}</span>
              <code className="text-[10px] font-mono bg-secondary text-muted px-1.5 py-0.5 rounded">
                {sha}
              </code>
              {prefixLabel && (
                <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand/10 text-brand">
                  {prefixLabel}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-heading leading-snug">{titlePt}</p>
          </div>
        </div>

        {bulletsPt.length > 0 && (
          <span className="shrink-0 text-muted mt-1">
            {isOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </span>
        )}
      </button>

      {isOpen && bulletsPt.length > 0 && (
        <div className="px-5 pb-4 pt-0 border-t border-border/50 bg-secondary/30">
          <ul className="mt-3 space-y-1.5">
            {bulletsPt.map((bullet, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-body">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
