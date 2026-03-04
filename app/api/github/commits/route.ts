import { NextRequest, NextResponse } from 'next/server';
import { RawGitHubCommit, ParsedCommit } from '@/types/entities/changelog/commit.types';

const CONVENTIONAL_PREFIXES = ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'test', 'perf', 'ci', 'build', 'revert'];
const CONVENTIONAL_REGEX = new RegExp(`^(${CONVENTIONAL_PREFIXES.join('|')})(\\([^)]+\\))?!?:\\s*`, 'i');

function parseMessage(message: string): { title: string; bullets: string[] } {
  const lines = message.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const title = lines[0] ?? '';
  const bullets = lines
    .slice(1)
    .filter(l => l.startsWith('-') || l.startsWith('•') || l.startsWith('*'))
    .map(l => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
  return { title, bullets };
}

function extractPrefix(title: string): { prefix: string; cleanTitle: string } {
  const match = CONVENTIONAL_REGEX.exec(title);
  if (match) {
    return {
      prefix: match[1].toLowerCase(),
      cleanTitle: title.replace(CONVENTIONAL_REGEX, '').trim(),
    };
  }
  return { prefix: '', cleanTitle: title };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') ?? '1';

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) {
    return NextResponse.json(
      { detail: { message: 'GitHub token ou repositório não configurado.' } },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/commits?sha=main&per_page=10&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'indafire-app',
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { detail: { message: error.message ?? 'Erro ao buscar commits do GitHub.' } },
        { status: response.status }
      );
    }

    const data: RawGitHubCommit[] = await response.json();

    const commits: ParsedCommit[] = data.map((item) => {
      const { title, bullets } = parseMessage(item.commit.message);
      const { prefix, cleanTitle } = extractPrefix(title);
      return {
        sha: item.sha.substring(0, 7),
        authorName: item.author?.login ?? item.commit.author.name,
        authorAvatar: item.author?.avatar_url ?? null,
        date: item.commit.author.date,
        rawTitle: cleanTitle || title,
        rawBullets: bullets,
        conventionalPrefix: prefix,
      };
    });

    return NextResponse.json(commits);
  } catch {
    return NextResponse.json(
      { detail: { message: 'Erro interno ao buscar commits.' } },
      { status: 500 }
    );
  }
}
