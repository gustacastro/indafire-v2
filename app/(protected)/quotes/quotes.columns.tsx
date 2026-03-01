import { ColumnDef } from '@/types/ui/data-table.types';
import { RowAction } from '@/types/ui/row-actions.types';
import { RowActions } from '@/components/data/RowActions/RowActions';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { IconEdit, IconTrash, IconEye } from '@/components/icons';
import { formatApiCurrency } from '@/utils/currency';
import { QuoteListItem, getQuoteStatusLabel, getQuoteStatusVariant } from './quotes.facade';

function formatDateBR(dateStr: string): string {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function getQuotesColumns(
  onEdit: (quote: QuoteListItem) => void,
  onDelete: (quote: QuoteListItem) => void,
  canEdit: boolean,
  canDelete: boolean,
  onView?: (quote: QuoteListItem) => void,
  canView?: boolean,
): ColumnDef<QuoteListItem>[] {
  const hasActions = canView || canEdit || canDelete;

  const columns: ColumnDef<QuoteListItem>[] = [
    {
      key: 'quote_code',
      label: 'Código',
      canHide: false,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm font-semibold text-foreground">#{row.quote_code}</span>
      ),
    },
    {
      key: 'clientName',
      label: 'Cliente',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-foreground">{row.clientName ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <StatusBadge
          label={getQuoteStatusLabel(row.status)}
          variant={getQuoteStatusVariant(row.status)}
        />
      ),
    },
    {
      key: 'net_value',
      label: 'Valor Líquido',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm font-semibold text-foreground">
          {formatApiCurrency(row.net_value)}
        </span>
      ),
    },
    {
      key: 'expected_delivery_date',
      label: 'Entrega Prevista',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-muted">{formatDateBR(row.expected_delivery_date)}</span>
      ),
    },
    {
      key: 'paymentMethodName',
      label: 'Pagamento',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-muted">{row.paymentMethodName ?? '—'}</span>
      ),
    },
    {
      key: 'installments',
      label: 'Parcelas',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.installments > 0 ? `${row.installments}x` : 'À vista'}</span>
      ),
    },
    {
      key: 'valor_por_parcela',
      label: 'Valor por Parcela',
      canHide: true,
      defaultVisible: true,
      render: (row) => {
        if (!row.installments || row.installments <= 0) return <span className="text-sm text-muted">—</span>;
        return (
          <span className="text-sm font-semibold text-foreground">
            {formatApiCurrency(Math.floor(row.net_value / row.installments))}
          </span>
        );
      },
    },
    {
      key: 'freight',
      label: 'Frete',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{formatApiCurrency(row.freight)}</span>
      ),
    },
    {
      key: 'discount_percentage',
      label: 'Desconto',
      canHide: true,
      defaultVisible: false,
      render: (row) => {
        if (!row.discount_percentage) return <span className="text-sm text-muted">—</span>;
        const pct = (row.discount_percentage / 100).toFixed(2).replace('.', ',');
        return <span className="text-sm text-muted">{pct}%</span>;
      },
    },
  ];

  if (hasActions) {
    columns.push({
      key: 'actions',
      label: '',
      canHide: false,
      defaultVisible: true,
      render: (row) => {
        const actions: RowAction[] = [];
        if (canView && onView) {
          actions.push({ label: 'Visualizar', icon: <IconEye size={14} />, onClick: () => onView(row) });
        }
        if (canEdit && row.status !== 'APPROVED') {
          actions.push({ label: 'Editar', icon: <IconEdit size={14} />, onClick: () => onEdit(row) });
        }
        if (canDelete) {
          actions.push({
            label: 'Excluir',
            icon: <IconTrash size={14} />,
            variant: 'destructive',
            onClick: () => onDelete(row),
            separator: true,
          });
        }
        return <RowActions actions={actions} />;
      },
    });
  }

  return columns;
}

export function getDefaultVisibleColumns(columns: ColumnDef<QuoteListItem>[]): string[] {
  return columns.filter((c) => c.defaultVisible !== false).map((c) => c.key);
}
