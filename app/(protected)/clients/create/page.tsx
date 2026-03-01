import type { Metadata } from 'next';
import { ClientForm } from '../ClientForm';

export const metadata: Metadata = {
  title: 'IndaFire - Criar Cliente',
};

export default function CreateClientPage() {
  return <ClientForm mode="create" isSupplier={false} />;
}
