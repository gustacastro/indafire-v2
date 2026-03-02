import type { Metadata } from 'next';
import { Suspense } from 'react';
import { WorkshopPanel } from './WorkshopPanel';

export const metadata: Metadata = {
  title: 'IndaFire - Oficina',
};

export default function WorkshopPanelPage() {
  return (
    <Suspense>
      <WorkshopPanel />
    </Suspense>
  );
}
