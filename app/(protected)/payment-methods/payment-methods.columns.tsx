import { ColumnDef } from '@/types/ui/data-table.types';
import { RowActions } from '@/components/data/RowActions/RowActions';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { IconEdit, IconTrash, IconEye } from '@/components/icons';
import { PaymentMethod } from './payment-methods.facade';
import { maskCurrencyInput } from '@/utils/currency';

export function getPaymentMethodsColumns(
  onEdit: (pm: PaymentMethod) => void,
  onDelete: (pm: PaymentMethod) => void,
  canEdit: boolean,
  canDelete: boolean,
  onView?: (pm: PaymentMethod) => void,
  canView?: boolean,
): ColumnDef<PaymentMethod>[] {
  const hasActions = canView || canEdit || canDelete;

  const columns: ColumnDef<PaymentMethod>[] = [
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
      key: 'provider',
      label: 'Provedor',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-muted">{row.provider}</span>
      ),
    },
    {
      key: 'minimum_amount',
      label: 'Valor Mínimo',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-muted font-medium">
          R$ {maskCurrencyInput(String(row.minimum_amount))}
        </span>
      ),
    },
    {
      key: 'allow_installments',
      label: 'Parcelamento',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <StatusBadge value={row.allow_installments} trueVariant='primary'/>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <StatusBadge value={row.active} trueVariant='primary' trueLabel='Ativo' falseLabel='Inativo'/>
      ),
    },
    {
      key: 'method_info',
      label: 'Informações',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.method_info || '—'}</span>
      ),
    },
    {
      key: 'installment_count',
      label: 'Nº Parcelas',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.installment_count ?? '—'}</span>
      ),
    },
  ];

  if (hasActions) {
    columns.push({
      key: 'actions',
      label: 'Ações',
      canHide: false,
      defaultVisible: true,
      render: (row) => (
        <RowActions
          actions={[
            ...(canView && onView
              ? [{ label: 'Visualizar', icon: <IconEye size={14} />, onClick: () => onView(row) }]
              : []),
            ...(canEdit
              ? [{ label: 'Editar', icon: <IconEdit size={14} />, onClick: () => onEdit(row) }]
              : []),
            ...(canDelete
              ? [{ label: 'Excluir', icon: <IconTrash size={14} />, variant: 'destructive' as const, onClick: () => onDelete(row) }]
              : []),
          ]}
        />
      ),
    });
  }

  return columns;
}

export function getDefaultVisibleColumns(columns: ColumnDef<PaymentMethod>[]): string[] {
  return columns.filter((c) => c.defaultVisible !== false).map((c) => c.key);
}
