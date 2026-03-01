import type { Metadata } from 'next';
import { ProductForm } from '../../ProductForm';

export const metadata: Metadata = {
  title: 'IndaFire - Editar Produto',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  return <ProductForm mode="edit" productId={id} />;
}
