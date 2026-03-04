import { NextRequest, NextResponse } from 'next/server';

async function translateWithGoogle(text: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  if (!response.ok) return text;

  const data = await response.json().catch(() => null);
  if (!Array.isArray(data?.[0])) return text;

  return (data[0] as [string][]).map((chunk) => chunk[0]).join('');
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || !Array.isArray(body.texts) || body.texts.length === 0) {
    return NextResponse.json({ translations: [] });
  }

  const texts: string[] = body.texts;

  const results = await Promise.all(
    texts.map(async (text) => {
      if (!text || text.trim() === '') return text;
      try {
        return await translateWithGoogle(text);
      } catch {
        return text;
      }
    })
  );

  return NextResponse.json({ translations: results });
}
