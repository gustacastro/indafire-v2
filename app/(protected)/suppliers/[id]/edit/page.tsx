import type { Metadata } from 'next';
import { ClientForm } from '../../../clients/ClientForm';

export const metadata: Metadata = {
  title: 'IndaFire - Editar Fornecedor',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSupplierPage({ params }: Props) {
  const { id } = await params;
  return <ClientForm mode="edit" clientId={id} isSupplier={true} />;
}
