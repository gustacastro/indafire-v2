'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SideModal } from '@/components/ui/SideModal/SideModal';
import { InfoItem } from '@/components/ui/InfoItem/InfoItem';
import { IconReceipt, IconPercent, IconToggleLeft } from '@/components/icons';
import { getTaxById, TaxCategory } from './taxes.facade';
import { ViewSection } from '@/components/ui/ViewSection/ViewSection';
import { ViewDivider } from '@/components/ui/ViewDivider/ViewDivider';
import { InfoValue } from '@/components/ui/InfoValue/InfoValue';
import { TaxViewPanelProps } from '@/types/entities/tax/tax-view-panel.types';
import { mapLabel } from '@/utils/label-map';
import { APPLIES_TO_LABELS } from './taxes.columns';

export function TaxViewPanel({ taxId, isOpen, onClose, footerButtons }: TaxViewPanelProps) {
  const [tax, setTax] = useState<TaxCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !taxId) return;
    setTax(null);
    setIsLoading(true);
    getTaxById(taxId)
      .then(setTax)
      .catch(() => toast.error('Erro ao carregar detalhes da categoria.'))
      .finally(() => setIsLoading(false));
  }, [isOpen, taxId]);

  return (
    <SideModal isOpen={isOpen} onClose={onClose} title="Detalhes da Categoria" footerButtons={footerButtons}>
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm text-muted">Carregando...</span>
        </div>
      )}

      {!isLoading && tax && (
        <>
          <ViewSection title="Identificação">
            <InfoItem icon={<IconReceipt size={16} />} label="Nome da Categoria">
              <InfoValue>{tax.name || '—'}</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconToggleLeft size={16} />} label="Modalidade">
              <InfoValue>{mapLabel(tax.applies_to, APPLIES_TO_LABELS)}</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconToggleLeft size={16} />} label="Dedução de ISS">
              <InfoValue>{tax.allow_iss_deduction ? 'Permitida' : 'Não permitida'}</InfoValue>
            </InfoItem>
          </ViewSection>

          <ViewDivider />

          <ViewSection title="Alíquotas Aplicadas">
            <InfoItem icon={<IconPercent size={16} />} label="ISS">
              <InfoValue>{tax.iss_rate}%</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconPercent size={16} />} label="CSLL">
              <InfoValue>{tax.csll_rate}%</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconPercent size={16} />} label="IR">
              <InfoValue>{tax.ir_rate}%</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconPercent size={16} />} label="INSS">
              <InfoValue>{tax.inss_rate}%</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconPercent size={16} />} label="PIS">
              <InfoValue>{tax.pis_rate}%</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconPercent size={16} />} label="COFINS">
              <InfoValue>{tax.cofins_rate}%</InfoValue>
            </InfoItem>
          </ViewSection>
        </>
      )}
    </SideModal>
  );
}
