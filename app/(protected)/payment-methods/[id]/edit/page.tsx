import { Metadata } from 'next';
import { PaymentMethodForm } from '../../PaymentMethodForm';

export const metadata: Metadata = {
  title: 'IndaFire - Editar Meio de Pagamento',
};

interface EditPaymentMethodPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPaymentMethodPage({
  params,
}: EditPaymentMethodPageProps) {
  const { id } = await params;
  return <PaymentMethodForm mode="edit" paymentMethodId={id} />;
}
