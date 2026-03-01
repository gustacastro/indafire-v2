import { Metadata } from 'next';
import { PaymentMethods } from './PaymentMethods';

export const metadata: Metadata = {
  title: 'IndaFire - Meios de Pagamento',
};

export default function PaymentMethodsPage() {
  return <PaymentMethods />;
}
