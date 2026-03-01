import { Metadata } from 'next';
import { TaxForm } from '../TaxForm';

export const metadata: Metadata = {
  title: 'IndaFire - Cadastrar Categoria de Imposto',
};

export default function CreateTaxPage() {
  return <TaxForm mode="create" />;
}
