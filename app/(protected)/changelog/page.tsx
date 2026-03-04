import { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { IconScrollText } from '@/components/icons';
import { Changelog } from './Changelog';

export const metadata: Metadata = {
  title: 'IndaFire - Changelog',
};

export default function ChangelogPage() {
  return (
    <div>
      <PageHeader
        title="Changelog"
        description="Histórico de atualizações e mudanças no sistema IndaFire."
        icon={<IconScrollText size={20} />}
      />
      <Changelog />
    </div>
  );
}
