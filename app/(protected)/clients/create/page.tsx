import type { Metadata } from 'next';
import { ClientForm } from '../ClientForm';

export const metadata: Metadata = {
  title: 'IndaFire - Criar Cliente',
};

interface CreateClientPageProps {
  searchParams: Promise<{
    returnTo?: string;
    fromKanban?: string;
    prospection?: string;
  }>;
}

export default async function CreateClientPage({ searchParams }: CreateClientPageProps) {
  const params = await searchParams;
  const returnTo = params.returnTo;
  const fromKanban = params.fromKanban === 'true';
  const isProspection = params.prospection === 'true';

  return (
    <ClientForm
      mode="create"
      isSupplier={false}
      showSupplierCheckbox={fromKanban}
      prospection={isProspection}
      returnTo={returnTo}
    />
  );
}
