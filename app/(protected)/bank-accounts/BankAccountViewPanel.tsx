'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SideModal } from '@/components/ui/SideModal/SideModal';
import { InfoItem } from '@/components/ui/InfoItem/InfoItem';
import {
  IconWallet,
  IconBuilding,
  IconHash,
  IconCreditCard,
  IconKeyRound,
} from '@/components/icons';
import { displayBankCode, formatBranch, formatAccountNumber } from '@/utils/bank-number';
import { PIX_TYPE_OPTIONS, formatPixKey, PixKeyType } from '@/utils/pix';
import { CopyField } from '@/components/ui/CopyField/CopyField';
import { getBankAccountById, BankAccount } from './bank-accounts.facade';
import { ViewSection } from '@/components/ui/ViewSection/ViewSection';
import { ViewDivider } from '@/components/ui/ViewDivider/ViewDivider';
import { InfoValue } from '@/components/ui/InfoValue/InfoValue';
import { BankAccountViewPanelProps } from '@/types/entities/bank-account/bank-account-view-panel.types';

export function BankAccountViewPanel({
  bankAccountId,
  isOpen,
  onClose,
  footerButtons,
}: BankAccountViewPanelProps) {
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !bankAccountId) return;
    setAccount(null);
    setIsLoading(true);
    getBankAccountById(bankAccountId)
      .then(setAccount)
      .catch(() => toast.error('Erro ao carregar detalhes da conta bancária.'))
      .finally(() => setIsLoading(false));
  }, [isOpen, bankAccountId]);

  const pixTypeLabel =
    PIX_TYPE_OPTIONS.find((o) => o.value === account?.pix_key_type)?.label ??
    account?.pix_key_type ??
    '—';

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Conta Bancária"
      footerButtons={footerButtons}
    >
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm text-muted">Carregando...</span>
        </div>
      )}

      {!isLoading && account && (
        <>
          <ViewSection title="Dados da Instituição">
            <InfoItem icon={<IconWallet size={16} />} label="Nome da Conta">
              <InfoValue>{account.alias || '—'}</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconHash size={16} />} label="Código do Banco">
              <InfoValue>{displayBankCode(String(account.bank_number))}</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconBuilding size={16} />} label="Nome do Banco">
              <InfoValue>{account.bank || '—'}</InfoValue>
            </InfoItem>
          </ViewSection>

          <ViewDivider />

          <ViewSection title="Detalhes da Conta">
            <InfoItem icon={<IconCreditCard size={16} />} label="Agência">
              <InfoValue>{formatBranch(account.branch) || '—'}</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconCreditCard size={16} />} label="Conta">
              <InfoValue>{formatAccountNumber(account.account_number) || '—'}</InfoValue>
            </InfoItem>
          </ViewSection>

          {(account.pix_key_type || account.pix_key) && (
            <>
              <ViewDivider />
              <ViewSection title="Integração PIX">
                <InfoItem icon={<IconKeyRound size={16} />} label="Tipo de Chave PIX">
                  <InfoValue>{pixTypeLabel}</InfoValue>
                </InfoItem>
                <InfoItem icon={<IconKeyRound size={16} />} label="Chave PIX">
                  <InfoValue>
                    {account.pix_key ? (
                      <CopyField value={account.pix_key}>
                        {account.pix_key_type
                          ? formatPixKey(account.pix_key_type as PixKeyType, account.pix_key)
                          : account.pix_key}
                      </CopyField>
                    ) : '—'}
                  </InfoValue>
                </InfoItem>
              </ViewSection>
            </>
          )}
        </>
      )}
    </SideModal>
  );
}
