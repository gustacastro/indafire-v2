import { Metadata } from 'next';
import { BankAccountForm } from '../BankAccountForm';

export const metadata: Metadata = {
  title: 'IndaFire - Nova Conta Bancária',
};

export default function CreateBankAccountPage() {
  return <BankAccountForm mode="create" />;
}
