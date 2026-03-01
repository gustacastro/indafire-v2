'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { FormHeader } from '@/components/ui/FormHeader/FormHeader';
import { FormSection } from '@/components/ui/FormSection/FormSection';
import { FormField } from '@/components/ui/FormField/FormField';
import { TextArea } from '@/components/ui/TextArea/TextArea';
import { Select } from '@/components/ui/Select/Select';
import { TagInput } from '@/components/ui/TagInput/TagInput';
import { CurrencyInput } from '@/components/ui/CurrencyInput/CurrencyInput';
import { SwitchCard } from '@/components/ui/SwitchCard/SwitchCard';
import { PillSelector } from '@/components/ui/PillSelector/PillSelector';
import { Button } from '@/components/ui/Button/Button';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { IconSave } from '@/components/icons';
import { JobFormProps } from '@/types/entities/job/job-form.types';
import { APPLICATION_METHODS, getApplicationMethodSuffix } from '@/utils/application-methods';
import { getJobById, createJob, updateJob } from './jobs.facade';
import { FormGrid } from '@/components/ui/FormGrid/FormGrid';

const INCOME_STATEMENT_OPTIONS = [
  { value: 'dre1', label: 'Receitas de Serviços' },
  { value: 'dre2', label: 'Outras Receitas Operacionais' },
];

const ALLOCATION_GROUP_OPTIONS = [
  { value: 'grupo1', label: 'Grupo Administrativo' },
  { value: 'grupo2', label: 'Grupo Operacional' },
];

const RELATED_SERVICE_FAMILY_OPTIONS = [
  { value: 'familia1', label: 'Manutenção' },
  { value: 'familia2', label: 'Instalação' },
];

const RESPONSIBLE_DEPARTMENT_OPTIONS = [
  { value: 'depto1', label: 'Operações' },
  { value: 'depto2', label: 'Administrativo' },
];

export function JobForm({ mode, jobId }: JobFormProps) {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const canProceed =
    mode === 'create' ? hasPermission('jobs', 'create') : hasPermission('jobs', 'edit');

  useEffect(() => {
    if (!authLoading && !canProceed) {
      router.replace('/dashboard');
    }
  }, [authLoading, canProceed, router]);

  const [serviceName, setServiceName] = useState('');
  const [serviceCode, setServiceCode] = useState('');
  const [technicalDescription, setTechnicalDescription] = useState('');
  const [applicationMethods, setApplicationMethods] = useState('unidade');
  const [applicationMethodAmount, setApplicationMethodAmount] = useState('1');
  const [averageExecutionTime, setAverageExecutionTime] = useState('0');
  const [value, setValue] = useState('');
  const [relatedTaxes, setRelatedTaxes] = useState<string[]>([]);
  const [incomeStatement, setIncomeStatement] = useState('');
  const [allocationGroup, setAllocationGroup] = useState('');
  const [relatedServiceFamily, setRelatedServiceFamily] = useState('');
  const [responsibleDepartment, setResponsibleDepartment] = useState('');
  const [financialReports, setFinancialReports] = useState<string[]>([]);
  const [tagsKeywords, setTagsKeywords] = useState<string[]>([]);
  const [status, setStatus] = useState(true);
  const [allowRecurringContract, setAllowRecurringContract] = useState(false);
  const [requiresPickup, setRequiresPickup] = useState(false);
  const [addWithProducts, setAddWithProducts] = useState(false);

  const [serviceNameError, setServiceNameError] = useState('');
  const [serviceCodeError, setServiceCodeError] = useState('');
  const [valueError, setValueError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === 'edit');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const loadJob = useCallback(async () => {
    if (mode !== 'edit' || !jobId) return;
    setIsFetching(true);
    try {
      const job = await getJobById(jobId);
      setServiceName(job.service_name);
      setServiceCode(job.service_code);
      setTechnicalDescription(job.technical_description);
      setApplicationMethods(job.application_methods);
      setApplicationMethodAmount(String(job.application_method_amount));
      setAverageExecutionTime(String(job.average_execution_time));
      setValue(job.value.replace('R$ ', '').replace('R$', '').trim());
      setRelatedTaxes(job.related_taxes ? job.related_taxes.split(',').map((t) => t.trim()).filter(Boolean) : []);
      setIncomeStatement(job.income_statement);
      setAllocationGroup(job.allocation_group);
      setRelatedServiceFamily(job.related_service_family);
      setResponsibleDepartment(job.responsible_department);
      setFinancialReports(job.financial_reports ? job.financial_reports.split(',').map((t) => t.trim()).filter(Boolean) : []);
      setTagsKeywords(job.tags_keywords ? job.tags_keywords.split(',').map((t) => t.trim()).filter(Boolean) : []);
      setStatus(job.status);
      setAllowRecurringContract(job.allow_recurring_contract);
      setRequiresPickup(job.requires_pickup);
      setAddWithProducts(job.add_with_products);
    } catch {
      toast.error('Erro ao carregar dados do serviço.');
    } finally {
      setIsFetching(false);
    }
  }, [mode, jobId]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let hasError = false;
    if (!serviceName.trim()) {
      setServiceNameError('Nome do serviço é obrigatório.');
      hasError = true;
    }
    if (!serviceCode.trim()) {
      setServiceCodeError('Código do serviço é obrigatório.');
      hasError = true;
    }
    if (!value.trim()) {
      setValueError('Valor do serviço é obrigatório.');
      hasError = true;
    }
    if (hasError) return;

    setIsSubmitting(true);
    try {
      const payload = {
        service_name: serviceName,
        service_code: serviceCode,
        technical_description: technicalDescription,
        application_methods: applicationMethods,
        application_method_amount: Number(applicationMethodAmount) || 0,
        value: value ? `R$ ${value}` : '',
        related_taxes: relatedTaxes.join(', '),
        allocation_group: allocationGroup,
        related_service_family: relatedServiceFamily,
        income_statement: incomeStatement,
        financial_reports: financialReports.join(', '),
        add_with_products: addWithProducts,
        requires_pickup: requiresPickup,
        responsible_department: responsibleDepartment,
        allow_recurring_contract: allowRecurringContract,
        average_execution_time: Number(averageExecutionTime) || 0,
        status,
        tags_keywords: tagsKeywords.join(', '),
      };

      if (mode === 'create') {
        await toast.promise(
          createJob(payload),
          {
            loading: 'Criando serviço...',
            success: 'Serviço criado com sucesso.',
            error: (err: unknown) =>
              (err as { response?: { data?: { detail?: { message?: string } } } })
                ?.response?.data?.detail?.message ?? 'Erro ao salvar serviço.',
          },
        );
      } else {
        await toast.promise(
          updateJob(jobId!, payload),
          {
            loading: 'Salvando alterações...',
            success: 'Serviço atualizado com sucesso.',
            error: (err: unknown) =>
              (err as { response?: { data?: { detail?: { message?: string } } } })
                ?.response?.data?.detail?.message ?? 'Erro ao salvar serviço.',
          },
        );
      }
      router.push('/jobs');
    } catch {
      // error toast handled by toast.promise
    } finally {
      setIsSubmitting(false);
    }
  }

  const suffix = getApplicationMethodSuffix(applicationMethods);
  const isSaveDisabled = !serviceName || !serviceCode || isSubmitting || isFetching;

  if (authLoading || (!authLoading && !canProceed)) return null;

  return (
    <form onSubmit={handleSubmit}>
      <FormHeader
        backHref="/jobs"
        onBackClick={(e) => { e.preventDefault(); setShowDiscardModal(true); }}
        title={mode === 'create' ? 'Criar serviço' : 'Editar serviço'}
        description={mode === 'create'
          ? 'Preencha os dados básicos e defina as configurações financeiras do serviço.'
          : 'Atualize os dados e as configurações do serviço.'}
      />

      <div className="flex flex-col gap-6">
        <FormSection title="Dados do serviço">
          <FormGrid>
            <FormField
              label="Nome do serviço"
              type="text"
              value={serviceName}
              onChange={(e) => { setServiceName(e.target.value); setServiceNameError(''); }}
              placeholder="Ex: Manutenção Preventiva"
              required
              error={serviceNameError}
            />
            <FormField
              label="Código do serviço"
              type="text"
              value={serviceCode}
              onChange={(e) => { setServiceCode(e.target.value); setServiceCodeError(''); }}
              placeholder="Ex: SRV-001"
              required
              error={serviceCodeError}
            />
            <div className="sm:col-span-2">
              <TextArea
                label="Descrição técnica do serviço"
                value={technicalDescription}
                onChange={(e) => setTechnicalDescription(e.target.value)}
                placeholder="Digite aqui os detalhes técnicos..."
                rows={3}
              />
            </div>
          </FormGrid>
        </FormSection>

        <FormSection title="Precificação e Aplicação">
          <div className="flex flex-col gap-4">
            <CurrencyInput
              label="Valor do serviço"
              required
              value={value}
              onChange={(v) => { setValue(v); setValueError(''); }}
              error={valueError}
            />
            <PillSelector
              label="Maneiras de aplicação"
              required
              options={APPLICATION_METHODS}
              value={applicationMethods}
              onChange={setApplicationMethods}
            />
            <FormGrid>
              <div>
                <FormField
                  label={`Quantidade de ${applicationMethods || 'unidade'}`}
                  type="number"
                  value={applicationMethodAmount}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setApplicationMethodAmount(v < 1 ? '1' : e.target.value);
                  }}
                  min={1}
                  required
                />
                <div className="flex items-center gap-2 text-sm text-muted mt-2">
                  Equivale a
                  <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-md">
                    {applicationMethodAmount || 0} {suffix}
                  </span>
                </div>
              </div>
              <FormField
                label="Tempo médio de execução (minutos)"
                type="number"
                value={averageExecutionTime}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAverageExecutionTime(v < 0 ? '0' : e.target.value);
                }}
                min={0}
              />
            </FormGrid>
          </div>
        </FormSection>

        <FormSection title="Classificação e Impostos">
          <FormGrid>
            <Select
              label="Demonstrativo de Resultado (DRE)"
              value={incomeStatement}
              onChange={setIncomeStatement}
              options={INCOME_STATEMENT_OPTIONS}
              placeholder="Selecione a conta DRE"
            />
            <TagInput
              label="Impostos relacionados"
              value={relatedTaxes}
              onChange={setRelatedTaxes}
              placeholder="Digite o imposto e pressione Enter"
            />
            <Select
              label="Grupo de rateio"
              value={allocationGroup}
              onChange={setAllocationGroup}
              options={ALLOCATION_GROUP_OPTIONS}
              placeholder="Selecione o grupo de rateio"
            />
            <Select
              label="Família de serviços relacionados"
              value={relatedServiceFamily}
              onChange={setRelatedServiceFamily}
              options={RELATED_SERVICE_FAMILY_OPTIONS}
              placeholder="Selecione a família de serviços"
            />
            <Select
              label="Departamento responsável"
              value={responsibleDepartment}
              onChange={setResponsibleDepartment}
              options={RESPONSIBLE_DEPARTMENT_OPTIONS}
              placeholder="Selecione o departamento"
            />
            <TagInput
              label="Relatórios financeiros"
              value={financialReports}
              onChange={setFinancialReports}
              placeholder="Digite o relatório e pressione Enter"
            />
            <div className="sm:col-span-2">
              <TagInput
                label="Tags ou palavras-chave"
                value={tagsKeywords}
                onChange={setTagsKeywords}
                placeholder="Digite a tag e pressione Enter"
              />
            </div>
          </FormGrid>
        </FormSection>

        <FormSection title="Configurações Adicionais">
          <FormGrid gap={3}>
            <SwitchCard
              checked={status}
              onChange={setStatus}
              title="Status do Serviço"
              description="Inativo e oculto do sistema"
              activeDescription="Ativo e visível no sistema"
            />
            <SwitchCard
              checked={allowRecurringContract}
              onChange={setAllowRecurringContract}
              title="Permite contrato recorrente"
              description="Serviço pode ser faturado mensalmente."
            />
            <SwitchCard
              checked={requiresPickup}
              onChange={setRequiresPickup}
              title="Serviço requer retirada"
              description="Ex: Precisa buscar o item no local."
            />
            <SwitchCard
              checked={addWithProducts}
              onChange={setAddWithProducts}
              title="Adicionar junto a produtos"
              description="Permite associar este serviço a produtos na precificação."
            />
          </FormGrid>
        </FormSection>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Button type="button" variant="outline" onClick={() => setShowDiscardModal(true)}>
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
                ? 'Cadastrar serviço'
                : 'Salvar alterações'}
          </Button>
        </div>
      </div>

      <ModalConfirm
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        variant="warning"
        title="Descartar alterações?"
        description="Você tem alterações não salvas. Tem certeza que deseja sair? Tudo que você fez será perdido."
        confirmLabel="Sim, sair"
        cancelLabel="Continuar editando"
        onConfirm={() => router.back()}
      />
    </form>
  );
}
