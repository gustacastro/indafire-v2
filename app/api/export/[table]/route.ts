import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { filename, columns, rows } = body as {
    filename: string;
    columns: { key: string; label: string }[];
    rows: Record<string, unknown>[];
  };

  const escape = (value: unknown): string => {
    if (value === true) return 'Sim';
    if (value === false) return 'Não';
    const str = String(value ?? '');
    if (str.toLowerCase() === 'true') return 'Sim';
    if (str.toLowerCase() === 'false') return 'Não';
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escape(c.label)).join(';');
  const dataRows = rows.map((row) =>
    columns.map((c) => escape(row[c.key])).join(';'),
  );

  const csv = [header, ...dataRows].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    },
  });
}
