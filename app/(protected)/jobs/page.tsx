import { Metadata } from 'next';
import { Jobs } from './Jobs';

export const metadata: Metadata = {
  title: 'IndaFire - Serviços',
};

export default function JobsPage() {
  return <Jobs />;
}
