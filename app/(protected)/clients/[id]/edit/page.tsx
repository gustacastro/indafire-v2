import type { Metadata } from 'next';
import { ClientForm } from '../../ClientForm';

export const metadata: Metadata = {
  title: 'IndaFire - Editar Cliente',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: Props) {
  const { id } = await params;
  return <ClientForm mode="edit" clientId={id} isSupplier={false} />;
}
