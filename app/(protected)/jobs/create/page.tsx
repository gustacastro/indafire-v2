import { Metadata } from 'next';
import { JobForm } from '../JobForm';

export const metadata: Metadata = {
  title: 'IndaFire - Criar Serviço',
};

export default function CreateJobPage() {
  return <JobForm mode="create" />;
}
