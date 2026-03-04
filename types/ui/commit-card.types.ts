export interface CommitCardProps {
  sha: string;
  authorName: string;
  authorAvatar: string | null;
  date: string;
  titlePt: string;
  bulletsPt: string[];
  conventionalPrefix?: string;
}
