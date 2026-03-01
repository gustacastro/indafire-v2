import { Metadata } from 'next';
import { UserForm } from '../UserForm';

export const metadata: Metadata = {
  title: 'IndaFire - Criar Usuário',
};

export default function NewUserPage() {
  return <UserForm mode="create" />;
}
