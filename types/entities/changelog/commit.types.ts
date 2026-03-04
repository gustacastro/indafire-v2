export interface RawGitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface ParsedCommit {
  sha: string;
  authorName: string;
  authorAvatar: string | null;
  date: string;
  rawTitle: string;
  rawBullets: string[];
}
