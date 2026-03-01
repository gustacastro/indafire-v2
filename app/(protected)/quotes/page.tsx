import type { Metadata } from 'next';
import { Quotes } from './Quotes';

export const metadata: Metadata = {
  title: 'IndaFire - Orçamentos',
};

export default function QuotesPage() {
  return <Quotes />;
}
