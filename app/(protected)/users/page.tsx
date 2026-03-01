import { Metadata } from 'next';
import { Users } from './Users';

export const metadata: Metadata = {
  title: 'IndaFire - Usuários',
};

export default function UsersPage() {
  return <Users />;
}
