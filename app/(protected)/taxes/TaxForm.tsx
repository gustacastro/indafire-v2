'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { FormHeader } from '@/components/ui/FormHeader/FormHeader';
import { FormSection } from '@/components/ui/FormSection/FormSection';
import { FormField } from '@/components/ui/FormField/FormField';
import { PillSelector } from '@/components/ui/PillSelector/PillSelector';
import { SwitchCard } from '@/components/ui/SwitchCard/SwitchCard';
import { PercentageInput } from '@/components/ui/PercentageInput/PercentageInput';
import { Button } from '@/components/ui/Button/Button';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { IconSave } from '@/components/icons';
import { TaxFormProps } from '@/types/entities/tax/tax-form.types';
import { getTaxById, createTax, updateTax } from './taxes.facade';
import { FormGrid } from '@/components/ui/FormGrid/FormGrid';

const APPLIES_TO_OPTIONS = [
  { value: 'job', label: 'Serviço' },
  { value: 'product', label: 'Produto' },
];

export function TaxForm({ mode, taxId }: TaxFormProps) {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const canProceed =
    mode === 'create'
      ? hasPermission('tax_categories', 'create')
      : hasPermission('tax_categories', 'edit');

  useEffect(() => {
    if (!authLoading && !canProceed) {
      router.replace('/dashboard');
    }
  }, [authLoading, canProceed, router]);

  const [name, setName] = useState('');
  const [appliesTo, setAppliesTo] = useState('job');
  const [allowIssDeduction, setAllowIssDeduction] = useState(false);
  const [issRate, setIssRate] = useState('0');
  const [csllRate, setCsllRate] = useState('0');
  const [irRate, setIrRate] = useState('0');
  const [inssRate, setInssRate] = useState('0');
  const [pisRate, setPisRate] = useState('0');
  const [cofinsRate, setCofinsRate] = useState('0');

  const [nameError, setNameError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === 'edit');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const loadTax = useCallback(async () => {
    if (mode !== 'edit' || !taxId) return;
    setIsFetching(true);
    try {
      const tax = await getTaxById(taxId);
      setName(tax.name);
      setAppliesTo(tax.applies_to);
      setAllowIssDeduction(tax.allow_iss_deduction);
      setIssRate(String(tax.iss_rate));
      setCsllRate(String(tax.csll_rate));
      setIrRate(String(tax.ir_rate));
      setInssRate(String(tax.inss_rate));
      setPisRate(String(tax.pis_rate));
      setCofinsRate(String(tax.cofins_rate));
    } catch {
      toast.error('Erro ao carregar dados da categoria de imposto.');
    } finally {
      setIsFetching(false);
    }
  }, [mode, taxId]);

  useEffect(() => {
    loadTax();
  }, [loadTax]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let hasError = false;
    if (!name.trim()) {
      setNameError('Nome da categoria é obrigatório.');
      hasError = true;
    }
    if (hasError) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        applies_to: appliesTo,
        allow_iss_deduction: allowIssDeduction,
        iss_rate: parseFloat(issRate) || 0,
        csll_rate: parseFloat(csllRate) || 0,
        ir_rate: parseFloat(irRate) || 0,
        inss_rate: parseFloat(inssRate) || 0,
        pis_rate: parseFloat(pisRate) || 0,
        cofins_rate: parseFloat(cofinsRate) || 0,
      };

      if (mode === 'create') {
        await toast.promise(createTax(payload), {
          loading: 'Criando categoria...',
          success: 'Categoria criada com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao criar categoria.',
        });
      } else {
        await toast.promise(updateTax(taxId!, payload), {
          loading: 'Salvando alterações...',
          success: 'Categoria atualizada com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao atualizar categoria.',
        });
      }
      router.push('/taxes');
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSaveDisabled = !name || isSubmitting || isFetching;

  if (authLoading || (!authLoading && !canProceed)) return null;

  return (
    <form onSubmit={handleSubmit}>
      <FormHeader
        backHref="/taxes"
        onBackClick={(e) => { e.preventDefault(); setShowDiscardModal(true); }}
        title={mode === 'create' ? 'Cadastrar categoria de imposto' : 'Editar categoria de imposto'}
        description={
          mode === 'create'
            ? 'Preencha os dados abaixo para criar uma nova categoria de imposto.'
            : 'Edite os campos abaixo para atualizar a categoria de imposto.'
        }
      />

      <div className="flex flex-col gap-6">
        <FormSection title="Identificação">
          <div className="flex flex-col gap-4">
            <FormGrid>
              <FormField
                label="Nome da categoria"
                required
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) setNameError(''); }}
                placeholder="Ex: Imposto sobre serviços"
                error={nameError}
              />
              <PillSelector
                label="Modalidade"
                required
                options={APPLIES_TO_OPTIONS}
                value={appliesTo}
                onChange={setAppliesTo}
              />
            </FormGrid>
            <SwitchCard
              title="Permitir dedução de ISS"
              description="O ISS pode ser deduzido da base de cálculo de outros impostos."
              activeDescription="Dedução de ISS permitida."
              checked={allowIssDeduction}
              onChange={setAllowIssDeduction}
            />
          </div>
        </FormSection>

        <FormSection title="Alíquotas aplicadas">
          <FormGrid cols={3}>
            <PercentageInput
              label="% Alíquota do ISS"
              value={issRate}
              onChange={setIssRate}
            />
            <PercentageInput
              label="% Alíquota do CSLL"
              value={csllRate}
              onChange={setCsllRate}
            />
            <PercentageInput
              label="% Alíquota do IR"
              value={irRate}
              onChange={setIrRate}
            />
            <PercentageInput
              label="% Alíquota do INSS"
              value={inssRate}
              onChange={setInssRate}
            />
            <PercentageInput
              label="% Alíquota do PIS"
              value={pisRate}
              onChange={setPisRate}
            />
            <PercentageInput
              label="% Alíquota do COFINS"
              value={cofinsRate}
              onChange={setCofinsRate}
            />
          </FormGrid>
          <p className="text-xs text-muted mt-2">
            • Deixe o valor a zero (0) caso o imposto não se aplique a esta categoria.
          </p>
        </FormSection>

        <div className="flex items-center justify-end gap-3 pb-8">
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
            {isSubmitting
              ? 'Salvando...'
              : mode === 'create'
                ? 'Cadastrar categoria'
                : 'Salvar alterações'}
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
        onConfirm={() => router.push('/taxes')}
      />
    </form>
  );
}
