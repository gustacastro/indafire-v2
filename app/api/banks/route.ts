import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Banco {
  COMPE: string;
  ISPB: string;
  LongName: string;
  ShortName: string;
}

function getBancos(): Banco[] {
  const filePath = path.join(process.cwd(), 'Data', 'bancos.json');
  const raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  return JSON.parse(raw) as Banco[];
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Parâmetro code é obrigatório.' }, { status: 400 });
  }

  const padded = code.padStart(3, '0');
  const bank = getBancos().find((b) => b.COMPE === padded);

  if (!bank) {
    return NextResponse.json({ error: 'Banco não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({
    code: bank.COMPE,
    ispb: bank.ISPB,
    name: bank.LongName,
    shortName: bank.ShortName,
  });
}
