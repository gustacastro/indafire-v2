'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { FormHeader } from '@/components/ui/FormHeader/FormHeader';
import { FormSection } from '@/components/ui/FormSection/FormSection';
import { FormField } from '@/components/ui/FormField/FormField';
import { CurrencyInput } from '@/components/ui/CurrencyInput/CurrencyInput';
import { SwitchCard } from '@/components/ui/SwitchCard/SwitchCard';
import { Button } from '@/components/ui/Button/Button';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { IconSave } from '@/components/icons';
import { PaymentMethodFormProps } from '@/types/entities/payment-method/payment-method-form.types';
import {
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
} from './payment-methods.facade';
import { InstallmentCard } from './InstallmentCard';
import { maskCurrencyInput, parseCurrencyInputToCents, maskPercentageInput, parsePercentageInput } from '@/utils/currency';
import { FormGrid } from '@/components/ui/FormGrid/FormGrid';

function redistributePercentages(count: number): string[] {
  if (count < 1) return [];
  const equalInt = Math.floor(10000 / count);
  const remainder = 10000 - equalInt * count;
  const arr = Array(count).fill(maskPercentageInput(String(equalInt)));
  if (remainder > 0) {
    arr[count - 1] = maskPercentageInput(String(equalInt + remainder));
  }
  return arr;
}

export function PaymentMethodForm({
  mode,
  paymentMethodId,
}: PaymentMethodFormProps) {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const canProceed =
    mode === 'create'
      ? hasPermission('payment_methods', 'create')
      : hasPermission('payment_methods', 'edit');

  useEffect(() => {
    if (!authLoading && !canProceed) router.replace('/dashboard');
  }, [authLoading, canProceed, router]);

  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [methodInfo, setMethodInfo] = useState('');
  const [minimumAmount, setMinimumAmount] = useState('');
  const [active, setActive] = useState(true);

  const [allowInstallments, setAllowInstallments] = useState(false);
  const [minimumInstallmentAmount, setMinimumInstallmentAmount] = useState('');
  const [installmentCount, setInstallmentCount] = useState('2');
  const [globalIntervalDays, setGlobalIntervalDays] = useState('1');
  const [useIndividualIntervals, setUseIndividualIntervals] = useState(false);
  const [installmentPercentages, setInstallmentPercentages] = useState<string[]>(
    redistributePercentages(2),
  );
  const [installmentIntervals, setInstallmentIntervals] = useState<string[]>([
    '1',
    '1',
  ]);

  const [nameError, setNameError] = useState('');
  const [providerError, setProviderError] = useState('');
  const [minimumAmountError, setMinimumAmountError] = useState('');
  const [minimumInstallmentAmountError, setMinimumInstallmentAmountError] =
    useState('');
  const [installmentCountError, setInstallmentCountError] = useState('');
  const [percentagesError, setPercentagesError] = useState('');
  const [installmentValueError, setInstallmentValueError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === 'edit');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const load = useCallback(async () => {
    if (mode !== 'edit' || !paymentMethodId) return;
    setIsFetching(true);
    try {
      const pm = await getPaymentMethodById(paymentMethodId);
      setName(pm.name);
      setProvider(pm.provider);
      setMethodInfo(pm.method_info ?? '');
      setMinimumAmount(maskCurrencyInput(String(pm.minimum_amount)));
      setActive(pm.active);
      setAllowInstallments(pm.allow_installments);
      if (pm.allow_installments) {
        setMinimumInstallmentAmount(
          maskCurrencyInput(String(pm.minimum_installment_amount ?? 0)),
        );
        const count = pm.installment_count ?? 1;
        setInstallmentCount(String(count));
        const pcts =
          pm.installment_percentages.length > 0
            ? pm.installment_percentages.map((p) => maskPercentageInput(String(p)))
            : redistributePercentages(count);
        setInstallmentPercentages(pcts);
        const intervals =
          pm.installment_intervals.length > 0
            ? pm.installment_intervals.map(String)
            : Array(count).fill('1');
        setInstallmentIntervals(intervals);
        const allEqual =
          intervals.length > 0 && intervals.every((v) => v === intervals[0]);
        if (allEqual) {
          setUseIndividualIntervals(false);
          setGlobalIntervalDays(intervals[0]);
        } else {
          setUseIndividualIntervals(true);
        }
      }
    } catch {
      toast.error('Erro ao carregar meio de pagamento.');
    } finally {
      setIsFetching(false);
    }
  }, [mode, paymentMethodId]);

  useEffect(() => {
    load();
  }, [load]);

  function getMaxInstallments(saleAmount: string, installmentMin: string): number {
    const saleCents = parseCurrencyInputToCents(saleAmount);
    const minCents = parseCurrencyInputToCents(installmentMin);
    if (!saleCents || !minCents) return 120;
    return Math.floor(saleCents / minCents);
  }

  function checkInstallmentValues(
    percentages: string[],
    saleAmountStr: string,
    minInstallmentStr: string,
  ): string {
    const saleCents = parseCurrencyInputToCents(saleAmountStr);
    const minCents = parseCurrencyInputToCents(minInstallmentStr);
    if (!saleCents || !minCents) return '';
    const tooLow: number[] = [];
    percentages.forEach((p, idx) => {
      const pctInt = parsePercentageInput(p);
      const valueCents = Math.round((pctInt / 10000) * saleCents);
      if (valueCents < minCents) tooLow.push(idx + 1);
    });
    if (tooLow.length === 0) return '';
    return `O valor das parcelas ${tooLow.join(', ')} é menor que o valor mínimo da parcela (R$ ${minInstallmentStr}).`;
  }

  function handleInstallmentCountChange(value: string) {
    setInstallmentCountError('');
    setInstallmentCount(value);
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      const max = getMaxInstallments(minimumAmount, minimumInstallmentAmount);
      if (num < 1) {
        setInstallmentCountError('O número de parcelas deve ser no mínimo 1.');
        return;
      }
      if (minimumInstallmentAmount && num > max) {
        setInstallmentCountError(
          `Com parcela mínima de R$ ${minimumInstallmentAmount}, o máximo permitido é ${max} parcela${max !== 1 ? 's' : ''}.`,
        );
        return;
      }
      if (num >= 1 && num <= 120) {
        const pcts = redistributePercentages(num);
        setInstallmentPercentages(pcts);
        setInstallmentValueError(checkInstallmentValues(pcts, minimumAmount, minimumInstallmentAmount));
        setInstallmentIntervals((prev) => {
          const base = Array(num).fill(globalIntervalDays || '1');
          for (let i = 0; i < Math.min(prev.length, num); i++) {
            base[i] = prev[i];
          }
          return base;
        });
      }
    }
  }

  function handlePercentageChange(index: number, value: string) {
    setPercentagesError('');
    const next = [...installmentPercentages];
    next[index] = value;
    setInstallmentPercentages(next);
    setInstallmentValueError(checkInstallmentValues(next, minimumAmount, minimumInstallmentAmount));
  }

  function handleIntervalChange(index: number, value: string) {
    setInstallmentIntervals((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleGlobalIntervalChange(value: string) {
    setGlobalIntervalDays(value);
    if (!useIndividualIntervals) {
      const num = parseInt(installmentCount, 10) || 0;
      setInstallmentIntervals(Array(num).fill(value || '1'));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let hasError = false;

    if (!name.trim()) {
      setNameError('Nome é obrigatório.');
      hasError = true;
    }
    if (!provider.trim()) {
      setProviderError('Provedor é obrigatório.');
      hasError = true;
    }
    if (!minimumAmount) {
      setMinimumAmountError('Valor mínimo da venda é obrigatório.');
      hasError = true;
    }

    if (allowInstallments) {
      const count = parseInt(installmentCount, 10);
      if (isNaN(count) || count < 1) {
        setInstallmentCountError('O número de parcelas deve ser no mínimo 1.');
        hasError = true;
      }

      const saleAmount = parseCurrencyInputToCents(minimumAmount);
      const installmentMin = parseCurrencyInputToCents(minimumInstallmentAmount);
      if (installmentMin > saleAmount) {
        setMinimumInstallmentAmountError(
          'O valor mínimo da parcela não pode ser maior que o valor mínimo da venda.',
        );
        hasError = true;
      }

      if (allowInstallments) {
        const totalInt = installmentPercentages.reduce(
          (acc, p) => acc + parsePercentageInput(p),
          0,
        );
        if (totalInt !== 10000) {
          const diff = Math.abs(totalInt - 10000) / 100;
          setPercentagesError(
            `A soma dos percentuais deve ser exatamente 100%. ${
              totalInt > 10000
                ? `Sobram ${diff.toFixed(2)}%`
                : `Faltam ${diff.toFixed(2)}%`
            }.`,
          );
          hasError = true;
        }
        const valErr = checkInstallmentValues(installmentPercentages, minimumAmount, minimumInstallmentAmount);
        if (valErr) {
          setInstallmentValueError(valErr);
          hasError = true;
        }
      }
    }

    if (hasError) return;

    const count = parseInt(installmentCount, 10) || 0;
    const intervals = useIndividualIntervals
      ? installmentIntervals.slice(0, count).map((v) => parseInt(v, 10) || 1)
      : Array(count).fill(parseInt(globalIntervalDays, 10) || 1);

    const payload = {
      name: name.trim(),
      provider: provider.trim(),
      method_info: methodInfo.trim(),
      minimum_amount: parseCurrencyInputToCents(minimumAmount),
      minimum_installment_amount: allowInstallments
        ? parseCurrencyInputToCents(minimumInstallmentAmount)
        : 0,
      allow_installments: allowInstallments,
      installment_count: allowInstallments ? count : 0,
      installment_percentages: allowInstallments
        ? installmentPercentages
            .slice(0, count)
            .map((p) => parsePercentageInput(p))
        : [],
      installment_intervals: allowInstallments ? intervals : [],
      active,
    };

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await toast.promise(createPaymentMethod(payload), {
          loading: 'Criando meio de pagamento...',
          success: 'Meio de pagamento criado com sucesso.',
          error: (err: unknown) =>
            (
              err as {
                response?: { data?: { detail?: { message?: string } } };
              }
            )?.response?.data?.detail?.message ??
            'Erro ao criar meio de pagamento.',
        });
      } else {
        await toast.promise(updatePaymentMethod(paymentMethodId!, payload), {
          loading: 'Salvando alterações...',
          success: 'Meio de pagamento atualizado com sucesso.',
          error: (err: unknown) =>
            (
              err as {
                response?: { data?: { detail?: { message?: string } } };
              }
            )?.response?.data?.detail?.message ??
            'Erro ao atualizar meio de pagamento.',
        });
      }
      router.push('/payment-methods');
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasAnyError =
    !!nameError ||
    !!providerError ||
    !!minimumAmountError ||
    (allowInstallments && !!minimumInstallmentAmountError) ||
    (allowInstallments && !!installmentCountError) ||
    (allowInstallments && !!percentagesError) ||
    (allowInstallments && !!installmentValueError);

  const isSaveDisabled =
    !name ||
    !provider ||
    !minimumAmount ||
    (allowInstallments && !parseCurrencyInputToCents(minimumInstallmentAmount)) ||
    hasAnyError ||
    isSubmitting ||
    isFetching;

  if (authLoading || (!authLoading && !canProceed)) return null;

  return (
    <form onSubmit={handleSubmit}>
      <FormHeader
        backHref="/payment-methods"
        onBackClick={(e) => {
          e.preventDefault();
          setShowDiscardModal(true);
        }}
        title={
          mode === 'create'
            ? 'Cadastrar meio de pagamento'
            : 'Editar meio de pagamento'
        }
        description={
          mode === 'create'
            ? 'Configure as informações, provedor e regras de parcelamento.'
            : 'Edite as informações do meio de pagamento.'
        }
      />

      <div className="flex flex-col gap-6">
        <FormSection title="Informações Principais">
          <div className="flex flex-col gap-4">
            <SwitchCard
              title="Meio de pagamento ativo"
              description="O meio de pagamento ficará disponível para uso no sistema."
              activeDescription="Ativo e disponível para uso."
              checked={active}
              onChange={setActive}
            />
            <FormGrid>
              <FormField
                label="Nome do meio de pagamento"
                required
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setNameError('');
                }}
                placeholder="Ex: Cartão de Crédito"
                error={nameError}
              />
              <FormField
                label="Provedor"
                required
                type="text"
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value);
                  if (e.target.value.trim()) setProviderError('');
                }}
                placeholder="Ex: Stripe, Mercado Pago..."
                error={providerError}
              />
              <CurrencyInput
                label="Valor mínimo da venda"
                required
                value={minimumAmount}
                onChange={(v) => {
                  setMinimumAmount(v);
                  if (v) setMinimumAmountError('');
                  if (allowInstallments && minimumInstallmentAmount) {
                    const saleAmount = parseCurrencyInputToCents(v);
                    const installmentMin = parseCurrencyInputToCents(minimumInstallmentAmount);
                    if (installmentMin > saleAmount && saleAmount > 0) {
                      setMinimumInstallmentAmountError(
                        'O valor mínimo da parcela não pode ser maior que o valor mínimo da venda.',
                      );
                    } else {
                      setMinimumInstallmentAmountError('');
                    }
                    setInstallmentValueError(checkInstallmentValues(installmentPercentages, v, minimumInstallmentAmount));
                  }
                }}
                error={minimumAmountError}
              />
              <FormField
                label="Informações adicionais"
                type="text"
                value={methodInfo}
                onChange={(e) => setMethodInfo(e.target.value)}
                placeholder="Instruções internas ou notas..."
              />
            </FormGrid>
          </div>
        </FormSection>

        <InstallmentCard
          allowInstallments={allowInstallments}
          onAllowInstallmentsChange={setAllowInstallments}
          minimumInstallmentAmount={minimumInstallmentAmount}
          onMinimumInstallmentAmountChange={(v) => {
            setMinimumInstallmentAmount(v);
            const saleAmount = parseCurrencyInputToCents(minimumAmount);
            const installmentMin = parseCurrencyInputToCents(v);
            if (installmentMin > saleAmount && saleAmount > 0) {
              setMinimumInstallmentAmountError(
                'O valor mínimo da parcela não pode ser maior que o valor mínimo da venda.',
              );
            } else {
              setMinimumInstallmentAmountError('');
            }
            if (installmentMin > 0 && saleAmount > 0) {
              const max = Math.floor(saleAmount / installmentMin);
              const current = parseInt(installmentCount, 10);
              if (!isNaN(current) && current > max) {
                setInstallmentCountError(
                  `Com parcela mínima de R$ ${v}, o máximo permitido é ${max} parcela${max !== 1 ? 's' : ''}.`,
                );
              } else {
                setInstallmentCountError('');
              }
            }
            setInstallmentValueError(checkInstallmentValues(installmentPercentages, minimumAmount, v));
          }}
          minimumInstallmentAmountError={minimumInstallmentAmountError}
          minimumSaleAmount={minimumAmount}
          installmentCount={installmentCount}
          onInstallmentCountChange={handleInstallmentCountChange}
          installmentCountError={installmentCountError}
          globalIntervalDays={globalIntervalDays}
          onGlobalIntervalDaysChange={handleGlobalIntervalChange}
          useIndividualIntervals={useIndividualIntervals}
          onUseIndividualIntervalsChange={setUseIndividualIntervals}
          installmentPercentages={installmentPercentages}
          onInstallmentPercentageChange={handlePercentageChange}
          installmentIntervals={installmentIntervals}
          onInstallmentIntervalChange={handleIntervalChange}
          percentagesError={percentagesError}
          installmentValueError={installmentValueError}
        />

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDiscardModal(true)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            iconLeft={<IconSave size={16} />}
            disabled={isSaveDisabled}
          >
            {mode === 'create'
              ? 'Cadastrar meio de pagamento'
              : 'Salvar alterações'}
          </Button>
        </div>
      </div>

      <ModalConfirm
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        variant="warning"
        title="Descartar alterações"
        description="Tem certeza que deseja sair? As alterações não salvas serão perdidas."
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        onConfirm={() => router.push('/payment-methods')}
      />
    </form>
  );
}
