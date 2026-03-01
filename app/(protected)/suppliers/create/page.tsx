import type { Metadata } from 'next';
import { ClientForm } from '../../clients/ClientForm';

export const metadata: Metadata = {
  title: 'IndaFire - Criar Fornecedor',
};

export default function CreateSupplierPage() {
  return <ClientForm mode="create" isSupplier={true} />;
}
