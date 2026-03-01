import { Metadata } from 'next';
import { BankAccounts } from './BankAccounts';

export const metadata: Metadata = {
  title: 'IndaFire - Contas Bancárias',
};

export default function BankAccountsPage() {
  return <BankAccounts />;
}
