'use client';
import { IconX } from '@/components/icons';
import { TaxCardProps } from '@/types/entities/tax/tax-card.types';

function RateItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function RateItemCompact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}

const APPLIES_TO_LABELS: Record<string, string> = {
  product: 'Produto',
  service: 'Serviço',
  commerce: 'Comércio',
};

function formatAppliesTo(value: string): string {
  return APPLIES_TO_LABELS[value?.toLowerCase()] ?? value;
}

export function TaxCard({ tax, variant, onRemove }: TaxCardProps) {
  if (variant === 'full') {
    return (
      <div className="bg-secondary border border-border rounded-(--radius-lg) p-4">
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div>
              <h4 className="text-sm font-bold text-heading leading-tight">{tax.name}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted">Modalidade:</span>
                <span className="text-xs font-semibold text-foreground capitalize">{formatAppliesTo(tax.applies_to)}</span>
              </div>
            </div>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-muted hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-(--radius-md) transition-all shrink-0"
            >
              <IconX size={16} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <RateItem label="Ded. ISS" value={tax.allow_iss_deduction ? 'Sim' : 'Não'} />
          <RateItem label="% ISS" value={`${tax.iss_rate}%`} />
          <RateItem label="% COFINS" value={`${tax.cofins_rate}%`} />
          <RateItem label="% CSLL" value={`${tax.csll_rate}%`} />
          <RateItem label="% IR" value={`${tax.ir_rate}%`} />
          <RateItem label="% INSS" value={`${tax.inss_rate}%`} />
          <RateItem label="% PIS" value={`${tax.pis_rate}%`} />
          <RateItem
            label="% Total"
            value={
              tax.allow_iss_deduction
                ? `${(tax.iss_rate + tax.cofins_rate + tax.csll_rate + tax.ir_rate + tax.inss_rate + tax.pis_rate).toFixed(2).replace('.', ',')}%`
                : 'N/A'
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary border border-border rounded-(--radius-md) p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-heading truncate block">{tax.name}</span>
        </div>
        <span className="text-[10px] font-semibold text-muted capitalize shrink-0">{formatAppliesTo(tax.applies_to)}</span>
      </div>
      <div className="flex flex-col gap-1">
        <RateItemCompact label="Dedução ISS" value={tax.allow_iss_deduction ? 'Sim' : 'Não'} />
        <RateItemCompact label="ISS" value={`${tax.iss_rate}%`} />
        <RateItemCompact label="COFINS" value={`${tax.cofins_rate}%`} />
        <RateItemCompact label="CSLL" value={`${tax.csll_rate}%`} />
        <RateItemCompact label="IR" value={`${tax.ir_rate}%`} />
        <RateItemCompact label="INSS" value={`${tax.inss_rate}%`} />
        <RateItemCompact label="PIS" value={`${tax.pis_rate}%`} />
      </div>
    </div>
  );
}
