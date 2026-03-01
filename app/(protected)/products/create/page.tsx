import type { Metadata } from 'next';
import { ProductForm } from '../ProductForm';

export const metadata: Metadata = {
  title: 'IndaFire - Criar Produto',
};

export default function CreateProductPage() {
  return <ProductForm mode="create" />;
}
