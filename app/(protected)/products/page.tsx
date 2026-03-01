import type { Metadata } from 'next';
import { Products } from './Products';

export const metadata: Metadata = {
  title: 'IndaFire - Produtos',
};

export default function ProductsPage() {
  return <Products />;
}
