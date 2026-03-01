import { Metadata } from 'next';
import { UserForm } from '../../UserForm';

export const metadata: Metadata = {
  title: 'IndaFire - Editar Usuário',
};

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserForm mode="edit" userId={id} />;
}
