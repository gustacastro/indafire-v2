import { Metadata } from 'next';
import { Taxes } from './Taxes';

export const metadata: Metadata = {
  title: 'IndaFire - Impostos',
};

export default function TaxesPage() {
  return <Taxes />;
}
