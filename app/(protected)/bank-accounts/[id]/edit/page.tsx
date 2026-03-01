import { Metadata } from 'next';
import { BankAccountForm } from '../../BankAccountForm';

export const metadata: Metadata = {
  title: 'IndaFire - Editar Conta Bancária',
};

export default async function EditBankAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BankAccountForm mode="edit" bankAccountId={id} />;
}
