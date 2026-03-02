import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PickupPanel } from './PickupPanel';

export const metadata: Metadata = {
  title: 'IndaFire - Painel de Retirada',
};

export default function PickupPanelPage() {
  return (
    <Suspense>
      <PickupPanel />
    </Suspense>
  );
}
