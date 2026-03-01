import { ColumnDef } from '@/types/ui/data-table.types';
import { RowAction } from '@/types/ui/row-actions.types';
import { RowActions } from '@/components/data/RowActions/RowActions';
import { IconEdit, IconTrash, IconEye } from '@/components/icons';
import { mapLabel } from '@/utils/label-map';
import { TaxCategory } from './taxes.facade';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';

export const APPLIES_TO_LABELS: Record<string, string> = {
  job: 'Serviço',
  product: 'Produto',
};

export function getTaxesColumns(
  onEdit: (tax: TaxCategory) => void,
  onDelete: (tax: TaxCategory) => void,
  canEdit: boolean,
  canDelete: boolean,
  onView?: (tax: TaxCategory) => void,
  canView?: boolean,
): ColumnDef<TaxCategory>[] {
  const hasActions = canView || canEdit || canDelete;

  const columns: ColumnDef<TaxCategory>[] = [
    {
      key: 'name',
      label: 'Nome',
      canHide: false,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm font-medium text-foreground">{row.name}</span>
      ),
    },
    {
      key: 'applies_to',
      label: 'Modalidade',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-muted">{mapLabel(row.applies_to, APPLIES_TO_LABELS)}</span>
      ),
    },
    {
      key: 'allow_iss_deduction',
      label: 'Dedução de ISS',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
              <StatusBadge value={row.allow_iss_deduction} trueVariant="primary" />
            ),
    },
    {
      key: 'iss_rate',
      label: '% ISS',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-muted">{row.iss_rate}%</span>
      ),
    },
    {
      key: 'cofins_rate',
      label: '% COFINS',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-muted">{row.cofins_rate}%</span>
      ),
    },
    {
      key: 'csll_rate',
      label: '% CSLL',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.csll_rate}%</span>
      ),
    },
    {
      key: 'ir_rate',
      label: '% IR',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.ir_rate}%</span>
      ),
    },
    {
      key: 'inss_rate',
      label: '% INSS',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.inss_rate}%</span>
      ),
    },
    {
      key: 'pis_rate',
      label: '% PIS',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.pis_rate}%</span>
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
        if (canView && onView)
          actions.push({ label: 'Visualizar', icon: <IconEye size={14} />, variant: 'default', onClick: () => onView(row) });
        if (canEdit)
          actions.push({ label: 'Editar', icon: <IconEdit size={14} />, onClick: () => onEdit(row) });
        if (canDelete)
          actions.push({ label: 'Excluir', icon: <IconTrash size={14} />, variant: 'destructive', separator: actions.length > 0, onClick: () => onDelete(row) });
        return <RowActions actions={actions} />;
      },
    });
  }

  return columns;
}

export function getDefaultVisibleColumns(columns: ColumnDef<TaxCategory>[]): string[] {
  return columns.filter((c) => c.defaultVisible !== false).map((c) => c.key);
}
