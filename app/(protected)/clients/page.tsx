import type { Metadata } from 'next';
import { ClientList } from './ClientList';

export const metadata: Metadata = {
  title: 'IndaFire - Clientes',
};

export default function ClientsPage() {
  return <ClientList isSupplier={false} />;
}
