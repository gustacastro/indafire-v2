import axios from 'axios';
import { ParsedCommit } from '@/types/entities/changelog/commit.types';
import { CommitCardProps } from '@/types/ui/commit-card.types';

export async function fetchCommits(page: number): Promise<(ParsedCommit & { conventionalPrefix?: string })[]> {
  const response = await axios.get(`/api/github/commits?page=${page}`);
  return response.data;
}

export async function translateCommits(
  commits: (ParsedCommit & { conventionalPrefix?: string })[]
): Promise<CommitCardProps[]> {
  const texts: string[] = [];

  for (const commit of commits) {
    texts.push(commit.rawTitle);
    for (const bullet of commit.rawBullets) {
      texts.push(bullet);
    }
  }

  let translations: string[] = texts;

  if (texts.length > 0) {
    try {
      const response = await axios.post('/api/translate', { texts });
      translations = response.data.translations ?? texts;
    } catch {
      translations = texts;
    }
  }

  const result: CommitCardProps[] = [];
  let cursor = 0;

  for (const commit of commits) {
    const titlePt = translations[cursor++] ?? commit.rawTitle;
    const bulletsPt = commit.rawBullets.map(() => translations[cursor++] ?? '');
    result.push({
      sha: commit.sha,
      authorName: commit.authorName,
      authorAvatar: commit.authorAvatar,
      date: commit.date,
      titlePt,
      bulletsPt: bulletsPt.filter(Boolean),
      conventionalPrefix: commit.conventionalPrefix,
    });
  }

  return result;
}
