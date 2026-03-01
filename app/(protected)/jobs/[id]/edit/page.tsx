import { Metadata } from 'next';
import { JobForm } from '../../JobForm';

export const metadata: Metadata = {
  title: 'IndaFire - Editar Serviço',
};

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  return <JobForm mode="edit" jobId={id} />;
}
