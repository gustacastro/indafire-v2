import { ColumnDef } from '@/types/ui/data-table.types';
import { RowAction } from '@/types/ui/row-actions.types';
import { RowActions } from '@/components/data/RowActions/RowActions';
import { CopyField } from '@/components/ui/CopyField/CopyField';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { TagChip } from '@/components/ui/TagChip/TagChip';
import { IconEdit, IconTrash, IconEye } from '@/components/icons';
import { formatCurrencyDisplay } from '@/utils/currency';
import { getApplicationMethodSuffix } from '@/utils/application-methods';
import { Job } from './jobs.facade';

export function getJobsColumns(
  onEdit: (job: Job) => void,
  onDelete: (job: Job) => void,
  canEdit: boolean,
  canDelete: boolean,
  onView?: (job: Job) => void,
  canView?: boolean,
): ColumnDef<Job>[] {
  const hasActions = canView || canEdit || canDelete;

  const columns: ColumnDef<Job>[] = [
    {
      key: 'service_name',
      label: 'Nome do Serviço',
      canHide: false,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm font-semibold text-foreground">{row.service_name}</span>
      ),
    },
    {
      key: 'service_code',
      label: 'Código',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        row.service_code
          ? <CopyField value={row.service_code}><span className="text-sm font-mono text-muted">{row.service_code}</span></CopyField>
          : <span className="text-sm font-mono text-muted">—</span>
      ),
    },
    {
      key: 'value',
      label: 'Valor',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm font-semibold text-foreground">{formatCurrencyDisplay(row.value)}</span>
      ),
    },
    {
      key: 'application_methods',
      label: 'Aplicação',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-muted capitalize">
          {row.application_methods
            ? `${row.application_methods} (${row.application_method_amount} ${getApplicationMethodSuffix(row.application_methods)})`
            : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <StatusBadge value={row.status} trueLabel="Ativo" falseLabel="Inativo" trueVariant='primary' />
      ),
    },
    {
      key: 'requires_pickup',
      label: 'Requer Retirada',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <StatusBadge value={row.requires_pickup} trueVariant="primary" />
      ),
    },
    {
      key: 'technical_description',
      label: 'Descrição Técnica',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.technical_description || '—'}</span>
      ),
    },
    {
      key: 'average_execution_time',
      label: 'Tempo Médio (min)',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.average_execution_time ?? '—'}</span>
      ),
    },
    {
      key: 'related_taxes',
      label: 'Impostos',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.related_taxes
            ? row.related_taxes.split(',').map((t) => t.trim()).filter(Boolean).map((t) => <TagChip key={t} label={t} />)
            : <span className="text-sm text-muted">—</span>}
        </div>
      ),
    },
    {
      key: 'income_statement',
      label: 'DRE',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.income_statement || '—'}</span>
      ),
    },
    {
      key: 'allocation_group',
      label: 'Grupo de Rateio',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.allocation_group || '—'}</span>
      ),
    },
    {
      key: 'related_service_family',
      label: 'Família de Serviços',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.related_service_family || '—'}</span>
      ),
    },
    {
      key: 'responsible_department',
      label: 'Departamento',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.responsible_department || '—'}</span>
      ),
    },
    {
      key: 'financial_reports',
      label: 'Relatórios Financeiros',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.financial_reports
            ? row.financial_reports.split(',').map((t) => t.trim()).filter(Boolean).map((t) => <TagChip key={t} label={t} />)
            : <span className="text-sm text-muted">—</span>}
        </div>
      ),
    },
    {
      key: 'allow_recurring_contract',
      label: 'Contrato Recorrente',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <StatusBadge value={row.allow_recurring_contract} />
      ),
    },
    {
      key: 'add_with_products',
      label: 'Junto a Produtos',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <StatusBadge value={row.add_with_products} />
      ),
    },
    {
      key: 'tags_keywords',
      label: 'Tags',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags_keywords
            ? row.tags_keywords.split(',').map((t) => t.trim()).filter(Boolean).map((t) => <TagChip key={t} label={t} />)
            : <span className="text-sm text-muted">—</span>}
        </div>
      ),
    },
  ];

  if (hasActions) {
    columns.push({
      key: 'actions',
      label: 'Ações',
      canHide: false,
      defaultVisible: true,
      render: (row) => {
        const actions: RowAction[] = [];
        if (canView && onView) {
          actions.push({
            label: 'Visualizar',
            icon: <IconEye size={14} />,
            variant: 'default',
            onClick: () => onView(row),
          });
        }
        if (canEdit) {
          actions.push({
            label: 'Editar',
            icon: <IconEdit size={14} />,
            onClick: () => onEdit(row),
          });
        }
        if (canDelete) {
          actions.push({
            label: 'Excluir',
            icon: <IconTrash size={14} />,
            variant: 'destructive',
            separator: actions.length > 0,
            onClick: () => onDelete(row),
          });
        }
        return <RowActions actions={actions} />;
      },
    });
  }

  return columns;
}

export function getDefaultVisibleColumns(columns: ColumnDef<Job>[]): string[] {
  return columns.filter((c) => c.defaultVisible !== false).map((c) => c.key);
}
