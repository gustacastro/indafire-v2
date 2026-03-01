import { Metadata } from 'next';
import { TaxForm } from '../../TaxForm';

export const metadata: Metadata = {
  title: 'IndaFire - Editar Categoria de Imposto',
};

export default async function EditTaxPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaxForm mode="edit" taxId={id} />;
}
