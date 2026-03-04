'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CommitCardProps } from '@/types/ui/commit-card.types';
import { fetchCommits, translateCommits } from './changelog.facade';
import { CommitCard } from '@/components/ui/CommitCard/CommitCard';
import { IconLoader, IconCommit } from '@/components/icons';

export function Changelog() {
  const [commits, setCommits] = useState<CommitCardProps[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async (pageToLoad: number) => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const raw = await fetchCommits(pageToLoad);
      if (raw.length === 0) {
        setHasMore(false);
        return;
      }

      const translated = await translateCommits(raw);
      setCommits((prev) => [...prev, ...translated]);
      setPage(pageToLoad + 1);

      if (raw.length < 10) {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [hasMore]);

  useEffect(() => {
    loadMore(1);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current && hasMore) {
          loadMore(page);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, hasMore, loadMore]);

  return (
    <div className="space-y-3">
      {commits.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-muted gap-3">
          <IconCommit size={32} className="opacity-30" />
          <p className="text-sm">Nenhum commit encontrado.</p>
        </div>
      )}

      {commits.map((commit) => (
        <CommitCard key={`${commit.sha}-${commit.date}`} {...commit} />
      ))}

      <div ref={sentinelRef} className="h-1" />

      {loading && (
        <div className="flex justify-center py-6">
          <IconLoader size={20} className="text-muted animate-spin" />
        </div>
      )}

      {!hasMore && commits.length > 0 && (
        <div className="flex justify-center py-6">
          <p className="text-xs text-muted">Você chegou ao fim do histórico.</p>
        </div>
      )}
    </div>
  );
}
