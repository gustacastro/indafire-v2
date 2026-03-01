import { Suspense } from 'react';
import { Metadata } from 'next';
import { QuoteForm } from '../../QuoteForm';

export const metadata: Metadata = {
  title: 'IndaFire - Editar Orçamento',
};

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <QuoteForm mode="edit" quoteId={id} />
    </Suspense>
  );
}
