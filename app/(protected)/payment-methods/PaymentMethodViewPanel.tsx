'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SideModal } from '@/components/ui/SideModal/SideModal';
import { InfoItem } from '@/components/ui/InfoItem/InfoItem';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { InfoTable } from '@/components/ui/InfoTable/InfoTable';
import {
  IconCreditCard,
  IconBuilding,
  IconDollarSign,
  IconInfo,
  IconToggleLeft,
  IconPercent,
  IconCalendar,
  IconCalculator,
} from '@/components/icons';
import { getPaymentMethodById, PaymentMethod } from './payment-methods.facade';
import { ViewSection } from '@/components/ui/ViewSection/ViewSection';
import { ViewDivider } from '@/components/ui/ViewDivider/ViewDivider';
import { InfoValue } from '@/components/ui/InfoValue/InfoValue';
import { PaymentMethodViewPanelProps } from '@/types/entities/payment-method/payment-method-view-panel.types';
import { maskCurrencyInput } from '@/utils/currency';

export function PaymentMethodViewPanel({
  paymentMethodId,
  isOpen,
  onClose,
  footerButtons,
}: PaymentMethodViewPanelProps) {
  const [pm, setPm] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !paymentMethodId) return;
    setPm(null);
    setIsLoading(true);
    getPaymentMethodById(paymentMethodId)
      .then(setPm)
      .catch(() =>
        toast.error('Erro ao carregar detalhes do meio de pagamento.'),
      )
      .finally(() => setIsLoading(false));
  }, [isOpen, paymentMethodId]);

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Meio de Pagamento"
      footerButtons={footerButtons}
    >
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm text-muted">Carregando...</span>
        </div>
      )}

      {!isLoading && pm && (
        <>
          <ViewSection title="Informações Principais">
            <InfoItem icon={<IconCreditCard size={16} />} label="Nome">
              <InfoValue>{pm.name || '—'}</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconBuilding size={16} />} label="Provedor">
              <InfoValue>{pm.provider || '—'}</InfoValue>
            </InfoItem>
            <InfoItem
              icon={<IconDollarSign size={16} />}
              label="Valor Mínimo da Venda"
            >
              <InfoValue>
                R$ {maskCurrencyInput(String(pm.minimum_amount))}
              </InfoValue>
            </InfoItem>
            {pm.method_info && (
              <InfoItem
                icon={<IconInfo size={16} />}
                label="Informações Adicionais"
              >
                <InfoValue>{pm.method_info}</InfoValue>
              </InfoItem>
            )}
            <InfoItem icon={<IconToggleLeft size={16} />} label="Status">
              <div className="mt-0.5">
                <StatusBadge value={pm.active} trueLabel="Ativo" falseLabel="Inativo" trueVariant='primary'/>
              </div>
            </InfoItem>
          </ViewSection>

          <ViewDivider />

          <ViewSection title="Parcelamento">
            <InfoItem
              icon={<IconCalculator size={16} />}
              label="Permite Parcelamento"
            >
              <div className="mt-0.5">
                <StatusBadge value={pm.allow_installments} trueVariant='primary'/>
              </div>
            </InfoItem>

            {pm.allow_installments && (
              <>
                <InfoItem
                  icon={<IconDollarSign size={16} />}
                  label="Valor Mínimo da Parcela"
                >
                  <InfoValue>
                    R${' '}
                    {maskCurrencyInput(
                      String(pm.minimum_installment_amount ?? 0),
                    )}
                  </InfoValue>
                </InfoItem>
                <InfoItem
                  icon={<IconCalculator size={16} />}
                  label="Número de Parcelas"
                >
                  <InfoValue>{pm.installment_count ?? '—'}</InfoValue>
                </InfoItem>

                {pm.installment_percentages.length > 0 && (
                  <InfoTable<{ pct: number; interval: number | undefined }>
                    title="Distribuição por parcela"
                    columns={[
                      {
                        key: 'parcela',
                        header: 'Parcela',
                        render: (_, idx) => (
                          <span className="text-muted">#{idx + 1}</span>
                        ),
                      },
                      {
                        key: 'pct',
                        header: (
                          <span className="flex items-center gap-1">
                            <IconPercent size={12} /> %
                          </span>
                        ),
                        render: (row) => (
                          <span className="font-medium text-foreground">
                            {(row.pct / 100).toFixed(2)}%
                          </span>
                        ),
                      },
                      {
                        key: 'valor',
                        header: 'Valor',
                        render: (row) => (
                          <span className="text-muted text-xs">
                            R$ {maskCurrencyInput(String(Math.round((row.pct / 10000) * pm.minimum_amount)))}
                          </span>
                        ),
                      },
                      {
                        key: 'interval',
                        header: (
                          <span className="flex items-center gap-1">
                            <IconCalendar size={12} /> Intervalo
                          </span>
                        ),
                        render: (row) => (
                          <span className="text-muted">
                            {row.interval ?? '—'} dias
                          </span>
                        ),
                      },
                    ]}
                    rows={pm.installment_percentages.map((pct, idx) => ({
                      pct,
                      interval: pm.installment_intervals[idx],
                    }))}
                  />
                )}
              </>
            )}
          </ViewSection>
        </>
      )}
    </SideModal>
  );
}
