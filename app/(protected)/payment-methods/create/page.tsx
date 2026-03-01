import { Metadata } from 'next';
import { PaymentMethodForm } from '../PaymentMethodForm';

export const metadata: Metadata = {
  title: 'IndaFire - Cadastrar Meio de Pagamento',
};

export default function CreatePaymentMethodPage() {
  return <PaymentMethodForm mode="create" />;
}
