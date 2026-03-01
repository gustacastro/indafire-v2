'use client';
import { ExpandableCard } from '@/components/ui/ExpandableCard/ExpandableCard';
import { CurrencyInput } from '@/components/ui/CurrencyInput/CurrencyInput';
import { FormField } from '@/components/ui/FormField/FormField';
import { PercentageInput } from '@/components/ui/PercentageInput/PercentageInput';
import { IconAlertFill } from '@/components/icons';
import { InstallmentCardProps } from '@/types/payments/installment-card.types';
import { maskCurrencyInput, parseCurrencyInputToCents, parsePercentageInput } from '@/utils/currency';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { FormGrid } from '@/components/ui/FormGrid/FormGrid';

function SummaryCard({
  percentages,
  saleAmountCents,
  failingIndices,
}: {
  percentages: string[];
  saleAmountCents: number;
  failingIndices?: Set<number>;
}) {
  const totalInt = percentages.reduce((acc, p) => acc + parsePercentageInput(p), 0);
  const total = totalInt / 100;
  const isValid = totalInt === 10000;
  const totalValueCents = Math.round((totalInt / 10000) * saleAmountCents);

  return (
    <div
      className={[
        'bg-secondary/50 border rounded-(--radius-lg) p-5 relative overflow-hidden',
        isValid ? 'border-border' : 'border-destructive/40',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'absolute top-0 left-0 w-full h-0.5',
          isValid ? 'bg-primary' : 'bg-destructive',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      <h3 className="text-sm font-semibold text-heading mb-4">Resumo do Parcelamento</h3>
      <div className="space-y-2 mb-4">
        {percentages.map((p, idx) => {
          const pctInt = parsePercentageInput(p);
          const valueCents = Math.round((pctInt / 10000) * saleAmountCents);
          const isFailing = failingIndices?.has(idx) ?? false;
          return (
            <div key={idx} className="flex justify-between items-center text-sm gap-4">
              <span className={isFailing ? 'text-destructive shrink-0 font-medium' : 'text-muted shrink-0'}>
                Parcela {idx + 1}
              </span>
              <div className="flex items-center gap-3 ml-auto">
                <span className={isFailing ? 'font-medium text-destructive' : 'font-medium text-foreground'}>
                  {p || '0,00'}%
                </span>
                {saleAmountCents > 0 && (
                  <span className={isFailing ? 'text-destructive text-xs font-semibold' : 'text-muted text-xs'}>
                    R$ {maskCurrencyInput(String(valueCents))}
                  </span>
                )}
                {isFailing && <IconAlertFill size={13} className="text-destructive shrink-0" />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border pt-3 flex justify-between items-center gap-4">
        <span className="text-sm font-semibold text-heading shrink-0">Total distribuído</span>
        <div className="flex items-center gap-3 ml-auto">
          <div
            className={[
              'flex items-center gap-1.5 text-base font-bold',
              isValid ? 'text-success' : 'text-destructive',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {total.toFixed(2)}%
            {!isValid && <IconAlertFill size={16} />}
          </div>
          {saleAmountCents > 0 && (
            <span className={['text-sm font-semibold', isValid ? 'text-success' : 'text-destructive'].join(' ')}>
              R$ {maskCurrencyInput(String(totalValueCents))}
            </span>
          )}
        </div>
      </div>
      {!isValid && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-(--radius-md)">
          <IconAlertFill size={14} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive font-medium">
            A soma das parcelas deve ser exatamente 100%.{' '}
            {totalInt > 10000
              ? `Sobram ${((totalInt - 10000) / 100).toFixed(2)}%.`
              : `Faltam ${((10000 - totalInt) / 100).toFixed(2)}%.`}
          </p>
        </div>
      )}
    </div>
  );
}

export function InstallmentCard({
  allowInstallments,
  onAllowInstallmentsChange,
  minimumInstallmentAmount,
  onMinimumInstallmentAmountChange,
  minimumInstallmentAmountError,
  minimumSaleAmount,
  installmentCount,
  onInstallmentCountChange,
  installmentCountError,
  globalIntervalDays,
  onGlobalIntervalDaysChange,
  useIndividualIntervals,
  onUseIndividualIntervalsChange,
  installmentPercentages,
  onInstallmentPercentageChange,
  installmentIntervals,
  onInstallmentIntervalChange,
  percentagesError,
  installmentValueError,
}: InstallmentCardProps) {
  const saleAmountCents = parseCurrencyInputToCents(minimumSaleAmount);
  const minInstallmentCents = parseCurrencyInputToCents(minimumInstallmentAmount);
  const failingIndices = new Set(
    installmentValueError
      ? installmentPercentages
          .map((p, idx) => {
            if (!saleAmountCents || !minInstallmentCents) return -1;
            const pctInt = parsePercentageInput(p);
            const valueCents = Math.round((pctInt / 10000) * saleAmountCents);
            return valueCents < minInstallmentCents ? idx : -1;
          })
          .filter((i) => i >= 0)
      : [],
  );

  return (
    <ExpandableCard
      title="Permitir Parcelamento"
      description="Habilite para definir regras de divisão e intervalos entre parcelas."
      checked={allowInstallments}
      onChange={onAllowInstallmentsChange}
    >
      <div className="flex flex-col gap-6">
        <FormGrid cols={3} className="items-start">
          <CurrencyInput
            label="Valor mínimo da parcela"
            required
            value={minimumInstallmentAmount}
            onChange={onMinimumInstallmentAmountChange}
            error={minimumInstallmentAmountError}
          />
          <FormField
            label="Número de parcelas"
            required
            type="number"
            min={1}
            value={installmentCount}
            onChange={(e) => onInstallmentCountChange(e.target.value)}
            error={installmentCountError}
          />
          {!useIndividualIntervals && (
            <FormField
              label="Intervalo entre parcelas (dias)"
              required
              type="number"
              min={1}
              value={globalIntervalDays}
              onChange={(e) => onGlobalIntervalDaysChange(e.target.value)}
            />
          )}
        </FormGrid>

        <Checkbox
          checked={useIndividualIntervals}
          onChange={onUseIndividualIntervalsChange}
          label="Intervalo individual por parcela"
        />

        <div className="border-t border-border pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-heading">
              Percentuais de Parcelamento
            </h3>
            {percentagesError && (
              <p className="text-xs text-destructive">{percentagesError}</p>
            )}
            {installmentValueError && (
              <p className="text-xs text-destructive">{installmentValueError}</p>
            )}
            <div className="space-y-4">
              {installmentPercentages.map((pct, idx) => (
                <FormGrid key={idx} gap={3}>
                  <PercentageInput
                    label={`Parcela ${idx + 1} (%)`}
                    required
                    value={pct}
                    onChange={(v) => onInstallmentPercentageChange(idx, v)}
                    error={failingIndices.has(idx) ? 'Valor abaixo do mínimo permitido' : undefined}
                  />
                  {useIndividualIntervals && (
                    <FormField
                      label={`Intervalo dias parcela ${idx + 1}`}
                      type="number"
                      min={1}
                      value={installmentIntervals[idx] ?? '1'}
                      onChange={(e) => onInstallmentIntervalChange(idx, e.target.value)}
                    />
                  )}
                </FormGrid>
              ))}
            </div>
          </div>

          <SummaryCard
            percentages={installmentPercentages}
            saleAmountCents={saleAmountCents}
            failingIndices={failingIndices}
          />
        </div>
      </div>
    </ExpandableCard>
  );
}
