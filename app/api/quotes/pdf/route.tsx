import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { QuotePdfTemplate } from './QuotePdfTemplate';
import { QuotePdfData } from './quote-pdf.types';

export async function POST(req: NextRequest) {
  try {
    const data: QuotePdfData = await req.json();
    const buffer = await renderToBuffer(<QuotePdfTemplate data={data} />);
    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="orcamento-${data.quoteCode}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { detail: { message: 'Erro ao gerar PDF do orçamento.' } },
      { status: 500 },
    );
  }
}
