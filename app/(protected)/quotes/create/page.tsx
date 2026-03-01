import { Suspense } from 'react';
import { Metadata } from 'next';
import { QuoteForm } from '../QuoteForm';

export const metadata: Metadata = {
  title: 'IndaFire - Criar Orçamento',
};

export default function CreateQuotePage() {
  return (
    <Suspense>
      <QuoteForm mode="create" />
    </Suspense>
  );
}
