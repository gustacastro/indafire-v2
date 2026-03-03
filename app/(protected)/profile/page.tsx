import { Metadata } from 'next';
import { Profile } from './Profile';

export const metadata: Metadata = {
  title: 'IndaFire - Meu Perfil',
};

export default function ProfilePage() {
  return <Profile />;
}
