import type { Metadata } from 'next';
import { CommercialPanel } from './CommercialPanel';

export const metadata: Metadata = {
  title: 'IndaFire - Painel Comercial',
};

export default function CommercialPanelPage() {
  return <CommercialPanel />;
}
