import { Suspense } from 'react';
import { Metadata } from 'next';
import { DeliveryPanel } from './DeliveryPanel';

export const metadata: Metadata = {
  title: 'IndaFire - Entrega',
};

export default function DeliveryPanelPage() {
  return (
    <Suspense>
      <DeliveryPanel />
    </Suspense>
  );
}
