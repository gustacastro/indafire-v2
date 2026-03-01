import type { Metadata } from 'next';
import { ClientList } from '../clients/ClientList';

export const metadata: Metadata = {
  title: 'IndaFire - Fornecedores',
};

export default function SuppliersPage() {
  return <ClientList isSupplier={true} />;
}
