import { Metadata } from 'next';
import { WhatsappSettings } from './WhatsappSettings';

export const metadata: Metadata = {
  title: 'IndaFire - WhatsApp',
};

export default function WhatsappPage() {
  return <WhatsappSettings />;
}
