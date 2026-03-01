'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SideModal } from '@/components/ui/SideModal/SideModal';
import { InfoItem } from '@/components/ui/InfoItem/InfoItem';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { TagChip } from '@/components/ui/TagChip/TagChip';
import {
  IconHash,
  IconDollarSign,
  IconClock,
  IconTag,
  IconBarChart,
  IconSettings,
  IconBriefcase,
  IconBuilding,
  IconLayers,
  IconPackage,
} from '@/components/icons';
import { formatCurrencyDisplay } from '@/utils/currency';
import { getApplicationMethodSuffix } from '@/utils/application-methods';
import { CopyField } from '@/components/ui/CopyField/CopyField';
import { ViewSection } from '@/components/ui/ViewSection/ViewSection';
import { ViewDivider } from '@/components/ui/ViewDivider/ViewDivider';
import { InfoValue } from '@/components/ui/InfoValue/InfoValue';
import { getJobById, Job } from './jobs.facade';
import { JobViewPanelProps } from '@/types/entities/job/job-view-panel.types';

export function JobViewPanel({ jobId, isOpen, onClose, footerButtons }: JobViewPanelProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !jobId) return;
    setJob(null);
    setIsLoading(true);
    getJobById(jobId)
      .then(setJob)
      .catch(() => toast.error('Erro ao carregar detalhes do serviço.'))
      .finally(() => setIsLoading(false));
  }, [isOpen, jobId]);

  return (
    <SideModal isOpen={isOpen} onClose={onClose} title="Detalhes do Serviço" footerButtons={footerButtons}>
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm text-muted">Carregando...</span>
        </div>
      )}

      {!isLoading && job && (
        <>
          <ViewSection title="Dados do Serviço">
                        <InfoItem icon={<IconBriefcase size={16} />} label="Nome do Serviço">
              <InfoValue>{job.service_name || '—'}</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconHash size={16} />} label="Código do Serviço">
              <InfoValue>
                {job.service_code
                  ? <CopyField value={job.service_code}>{job.service_code}</CopyField>
                  : '—'}
              </InfoValue>
            </InfoItem>
            {job.technical_description && (
              <InfoItem icon={<IconBriefcase size={16} />} label="Descrição Técnica">
                <InfoValue>{job.technical_description}</InfoValue>
              </InfoItem>
            )}
            {job.tags_keywords && (
              <InfoItem icon={<IconTag size={16} />} label="Tags / Palavras-chave">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {job.tags_keywords.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                    <TagChip key={tag} label={tag} />
                  ))}
                </div>
              </InfoItem>
            )}
          </ViewSection>

          <ViewDivider />

          <ViewSection title="Precificação e Aplicação">
            <InfoItem icon={<IconDollarSign size={16} />} label="Valor do Serviço">
              <InfoValue>{formatCurrencyDisplay(job.value)}</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconLayers size={16} />} label="Maneira de Aplicação">
              <div className="flex items-center gap-2 mt-0.5">
                <InfoValue>{job.application_methods || '—'}</InfoValue>
                {job.application_methods && (
                  <TagChip
                    label={`${job.application_method_amount} ${getApplicationMethodSuffix(job.application_methods)}`}
                    variant="primary"
                  />
                )}
              </div>
            </InfoItem>
            <InfoItem icon={<IconClock size={16} />} label="Tempo Médio de Execução">
              <InfoValue>{job.average_execution_time ? `${job.average_execution_time} min` : '—'}</InfoValue>
            </InfoItem>
          </ViewSection>

          <ViewDivider />

          <ViewSection title="Classificação e Impostos">
            {job.related_taxes && (
              <InfoItem icon={<IconBarChart size={16} />} label="Impostos Relacionados">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {job.related_taxes.split(',').map((t) => t.trim()).filter(Boolean).map((tax) => (
                    <TagChip key={tax} label={tax} />
                  ))}
                </div>
              </InfoItem>
            )}
            <InfoItem icon={<IconBarChart size={16} />} label="DRE (Demonstrativo de Resultado)">
              <InfoValue>{job.income_statement || '—'}</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconLayers size={16} />} label="Grupo de Rateio">
              <InfoValue>{job.allocation_group || '—'}</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconPackage size={16} />} label="Família de Serviços">
              <InfoValue>{job.related_service_family || '—'}</InfoValue>
            </InfoItem>
            <InfoItem icon={<IconBuilding size={16} />} label="Departamento Responsável">
              <InfoValue>{job.responsible_department || '—'}</InfoValue>
            </InfoItem>
            {job.financial_reports && (
              <InfoItem icon={<IconBarChart size={16} />} label="Relatórios Financeiros">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {job.financial_reports.split(',').map((t) => t.trim()).filter(Boolean).map((r) => (
                    <TagChip key={r} label={r} />
                  ))}
                </div>
              </InfoItem>
            )}
          </ViewSection>

          <ViewDivider />

          <ViewSection title="Configurações">
            <InfoItem icon={<IconSettings size={16} />} label="Status">
              <StatusBadge value={job.status} trueLabel="Ativo" falseLabel="Inativo" trueVariant="primary"/>
            </InfoItem>
            <InfoItem icon={<IconSettings size={16} />} label="Contrato Recorrente">
              <StatusBadge value={job.allow_recurring_contract} trueVariant="primary"/>
            </InfoItem>
            <InfoItem icon={<IconSettings size={16} />} label="Requer Retirada">
              <StatusBadge value={job.requires_pickup} trueVariant="primary" />
            </InfoItem>
            <InfoItem icon={<IconSettings size={16} />} label="Adicionar junto a Produtos">
              <StatusBadge value={job.add_with_products} trueVariant="primary" />
            </InfoItem>
          </ViewSection>
        </>
      )}
    </SideModal>
  );
}
