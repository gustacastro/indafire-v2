'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { FormHeader } from '@/components/ui/FormHeader/FormHeader';
import { FormSection } from '@/components/ui/FormSection/FormSection';
import { FormField } from '@/components/ui/FormField/FormField';
import { Button } from '@/components/ui/Button/Button';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { PixKeySelect } from '@/components/ui/PixKeySelect/PixKeySelect';
import { FormGrid } from '@/components/ui/FormGrid/FormGrid';
import {
  IconSave
} from '@/components/icons';
import { BankAccountFormProps } from '@/types/entities/bank-account/bank-account-form.types';
import { PixKeyType, validatePixKey, formatPixKey } from '@/utils/pix';
import { formatBankCode, displayBankCode, formatBranch, formatAccountNumber } from '@/utils/bank-number';
import {
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  lookupBankByCode,
} from './bank-accounts.facade';

export function BankAccountForm({ mode, bankAccountId }: BankAccountFormProps) {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const canProceed =
    mode === 'create'
      ? hasPermission('bank_accounts', 'create')
      : hasPermission('bank_accounts', 'edit');

  useEffect(() => {
    if (!authLoading && !canProceed) {
      router.replace('/dashboard');
    }
  }, [authLoading, canProceed, router]);

  const [alias, setAlias] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType | ''>('cnpj');
  const [pixKeyValue, setPixKeyValue] = useState('');

  const [aliasError, setAliasError] = useState('');
  const [bankCodeError, setBankCodeError] = useState('');
  const [branchError, setBranchError] = useState('');
  const [accountNumberError, setAccountNumberError] = useState('');
  const [pixKeyTypeError, setPixKeyTypeError] = useState('');
  const [pixKeyValueError, setPixKeyValueError] = useState('');

  const [isBankLookingUp, setIsBankLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === 'edit');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const bankLookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadBankAccount = useCallback(async () => {
    if (mode !== 'edit' || !bankAccountId) return;
    setIsFetching(true);
    try {
      const account = await getBankAccountById(bankAccountId);
      const keyType = (account.pix_key_type as PixKeyType | '') ?? '';
      setAlias(account.alias);
      setBankCode(String(account.bank_number));
      setBankName(account.bank);
      setBranch(formatBranch(account.branch));
      setAccountNumber(formatAccountNumber(account.account_number));
      setPixKeyType(keyType);
      setPixKeyValue(keyType && account.pix_key ? formatPixKey(keyType, account.pix_key) : (account.pix_key ?? ''));
    } catch {
      toast.error('Erro ao carregar dados da conta bancária.');
    } finally {
      setIsFetching(false);
    }
  }, [mode, bankAccountId]);

  useEffect(() => {
    loadBankAccount();
  }, [loadBankAccount]);

  function handleBankCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatBankCode(e.target.value);
    setBankCode(formatted);
    setBankCodeError('');
    setBankName('');

    if (bankLookupTimer.current) clearTimeout(bankLookupTimer.current);

    if (formatted.length === 3) {
      bankLookupTimer.current = setTimeout(async () => {
        setIsBankLookingUp(true);
        const info = await lookupBankByCode(formatted);
        setIsBankLookingUp(false);
        if (info) {
          setBankName(info.name);
        }
      }, 600);
    }
  }

  function handleBankCodeBlur() {
    if (bankCode && bankCode.length < 3) {
      setBankCodeError('Código deve ter 3 dígitos.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let hasError = false;

    if (!alias.trim()) {
      setAliasError('Nome da conta é obrigatório.');
      hasError = true;
    }
    if (!bankCode.trim() || bankCode.length < 1) {
      setBankCodeError('Código do banco é obrigatório.');
      hasError = true;
    }
    if (!branch.trim()) {
      setBranchError('Agência é obrigatória.');
      hasError = true;
    }
    if (!accountNumber.trim()) {
      setAccountNumberError('Número da conta é obrigatório.');
      hasError = true;
    }
    if (pixKeyType) {
      const pixError = validatePixKey(pixKeyType as PixKeyType, pixKeyValue);
      if (pixError) {
        setPixKeyValueError(pixError);
        hasError = true;
      }
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      const stripFormatting = (v: string) => v.replace(/\D/g, '');
      const cleanPixKey = pixKeyType && ['cpf', 'cnpj', 'phone'].includes(pixKeyType)
        ? stripFormatting(pixKeyValue)
        : pixKeyValue;

      const payload = {
        alias,
        bank: bankName,
        bank_number: Number(displayBankCode(bankCode)),
        branch: stripFormatting(branch),
        account_number: stripFormatting(accountNumber),
        pix_key_type: pixKeyType,
        pix_key: cleanPixKey,
      };

      if (mode === 'create') {
        await toast.promise(createBankAccount(payload), {
          loading: 'Criando conta bancária...',
          success: 'Conta bancária criada com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao salvar conta bancária.',
        });
      } else {
        await toast.promise(updateBankAccount(bankAccountId!, payload), {
          loading: 'Salvando alterações...',
          success: 'Conta bancária atualizada com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao salvar conta bancária.',
        });
      }
      router.push('/bank-accounts');
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSaveDisabled = !alias || !bankCode || isSubmitting || isFetching;

  if (authLoading || (!authLoading && !canProceed)) return null;

  return (
    <form onSubmit={handleSubmit}>
      <FormHeader
        backHref="/bank-accounts"
        onBackClick={(e) => { e.preventDefault(); setShowDiscardModal(true); }}
        title={mode === 'create' ? 'Criar conta bancária' : 'Editar conta bancária'}
        description={mode === 'create'
          ? 'Preencha os dados bancários e chaves PIX para recebimentos e pagamentos.'
          : 'Atualize os dados e configurações da conta bancária.'}
      />

      <div className="flex flex-col gap-6">
        <FormSection
          title="Dados da Instituição"
        >
          <FormGrid>
            <div className="sm:col-span-2">
              <FormField
                label="Nome da conta"
                required
                type="text"
                value={alias}
                onChange={(e) => {
                  setAlias(e.target.value);
                  setAliasError('');
                }}
                placeholder="Ex: Conta Principal Nubank"
                error={aliasError}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FormField
                label="Código do banco"
                required
                type="text"
                value={bankCode}
                onChange={handleBankCodeChange}
                onBlur={handleBankCodeBlur}
                placeholder="000"
                maxLength={3}
                error={bankCodeError}
              />
              {isBankLookingUp && (
                <p className="text-xs text-muted animate-pulse">Buscando banco...</p>
              )}
            </div>
            <FormField
              label="Nome do banco"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Preenchido automaticamente"
              disabled={!!bankName}
            />
          </FormGrid>
        </FormSection>

        <FormSection
          title="Detalhes da Conta"
        >
          <FormGrid>
            <FormField
              label="Agência"
              required
              type="text"
              value={branch}
              onChange={(e) => {
                setBranch(formatBranch(e.target.value));
                setBranchError('');
              }}
              placeholder="Ex: 0001-5"
              error={branchError}
            />
            <FormField
              label="Conta"
              required
              type="text"
              value={accountNumber}
              onChange={(e) => {
                setAccountNumber(formatAccountNumber(e.target.value));
                setAccountNumberError('');
              }}
              placeholder="Ex: 1234567-8"
              error={accountNumberError}
            />
          </FormGrid>
        </FormSection>

        <FormSection
          title="Integração PIX"
        >
          <PixKeySelect
            pixKeyType={pixKeyType}
            onPixKeyTypeChange={(t) => {
              setPixKeyType(t);
              setPixKeyTypeError('');
              setPixKeyValueError('');
            }}
            pixKeyValue={pixKeyValue}
            onPixKeyValueChange={(v) => {
              setPixKeyValue(v);
              setPixKeyValueError('');
            }}
            onPixKeyValueBlur={() => {
              if (pixKeyType && pixKeyValue) {
                const err = validatePixKey(pixKeyType as PixKeyType, pixKeyValue);
                if (err) setPixKeyValueError(err);
              }
            }}
            pixKeyTypeError={pixKeyTypeError}
            pixKeyValueError={pixKeyValueError}
          />
        </FormSection>

        <div className="flex items-center justify-end gap-3 pb-8">
            <Button
            type="button"
            variant="ghost"
            onClick={() => setShowDiscardModal(true)}
            fullWidth
            className="sm:w-auto"
            >
            Cancelar
            </Button>
            <Button
            type="submit"
            variant="primary"
            iconLeft={<IconSave size={16} />}
            disabled={isSaveDisabled}
            fullWidth
            className="sm:w-auto"
            >
            {mode === 'create' ? 'Cadastrar conta' : 'Salvar alterações'}
            </Button>
        </div>
      </div>

      <ModalConfirm
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        variant="warning"
        title="Descartar alterações"
        description="Tem certeza que deseja sair? Todas as alterações não salvas serão perdidas."
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        onConfirm={() => router.push('/bank-accounts')}
      />
    </form>
  );
}
