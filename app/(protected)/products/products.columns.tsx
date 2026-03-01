import { ColumnDef } from '@/types/ui/data-table.types';
import { RowAction } from '@/types/ui/row-actions.types';
import { RowActions } from '@/components/data/RowActions/RowActions';
import { TagChip } from '@/components/ui/TagChip/TagChip';
import { Tooltip } from '@/components/ui/Tooltip/Tooltip';
import { IconEdit, IconTrash, IconEye, IconImage } from '@/components/icons';
import { TaxCategory } from '@/app/(protected)/taxes/taxes.facade';
import { CopyField } from '@/components/ui/CopyField/CopyField';
import { formatMeasurementUnit } from '@/utils/measurement-units';
import { formatBarcodeDisplay } from '@/utils/barcode';
import { formatNcmDisplay } from '@/utils/ncm';
import { formatCfopDisplay } from '@/utils/cfop';
import { formatApiCurrency } from '@/utils/currency';
import { Product } from './products.facade';

function calcNetValueCents(salePriceCents: string, taxes: TaxCategory[]): string {
  const cents = parseFloat(salePriceCents);
  if (!cents || isNaN(cents)) return '—';
  const totalRate = taxes.reduce((sum, t) => {
    if (!t.allow_iss_deduction) return sum;
    return sum + t.iss_rate + t.cofins_rate + t.csll_rate + t.ir_rate + t.inss_rate + t.pis_rate;
  }, 0);
  const netCents = cents * (1 - totalRate / 100);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netCents / 100);
}

function getFirstFileUrl(files: Record<string, string>): string | null {
  const keys = Object.keys(files ?? {});
  return keys.length > 0 ? files[keys[0]] : null;
}

export function getProductsColumns(
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void,
  canEdit: boolean,
  canDelete: boolean,
  onView?: (product: Product) => void,
  canView?: boolean,
  onThumbnailClick?: (images: string[], index: number) => void,
  onTaxClick?: (tax: TaxCategory) => void,
): ColumnDef<Product>[] {
  const hasActions = canView || canEdit || canDelete;

  const columns: ColumnDef<Product>[] = [
    {
      key: 'name',
      label: 'Produto',
      canHide: false,
      defaultVisible: true,
      render: (row) => {
        const firstUrl = getFirstFileUrl(row.files);
        const allUrls = Object.values(row.files ?? {});
        return (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => allUrls.length > 0 && onThumbnailClick?.(allUrls, 0)}
              className={[
                'shrink-0 w-10 h-10 rounded-(--radius-md) overflow-hidden border border-border bg-secondary flex items-center justify-center transition-all',
                allUrls.length > 0 ? 'cursor-pointer hover:opacity-80 hover:border-primary' : 'cursor-default',
              ].join(' ')}
            >
              {firstUrl ? (
                <img src={firstUrl} alt={row.info.name} className="w-full h-full object-cover" />
              ) : (
                <IconImage size={16} className="text-muted" />
              )}
            </button>
            <span className="text-sm font-semibold text-foreground">{row.info.name}</span>
          </div>
        );
      },
    },
    {
      key: 'fantasy_name',
      label: 'Nome Fantasia',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.info.fantasy_name || '—'}</span>
      ),
    },
    {
      key: 'barcode',
      label: 'Código de Barras',
      canHide: true,
      defaultVisible: true,
      render: (row) => row.info.barcode ? (
        <CopyField value={row.info.barcode}>
          <span className="text-sm font-mono text-muted">{formatBarcodeDisplay(row.info.barcode)}</span>
        </CopyField>
      ) : (
        <span className="text-sm font-mono text-muted">—</span>
      ),
    },
    {
      key: 'measurement_unit',
      label: 'Unidade',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-muted">
          {row.info.measurement_unit
            ? `${row.info.measurement_amount} × ${formatMeasurementUnit(row.info.measurement_unit)}`
            : '—'}
        </span>
      ),
    },
    {
      key: 'sale_price',
      label: 'Preço de Venda',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm font-semibold text-foreground">
          {formatApiCurrency(row.tax.sale_price)}
        </span>
      ),
    },
    {
      key: 'net_value',
      label: 'Valor Líquido',
      canHide: true,
      defaultVisible: true,
      render: (row) => {
        const net = calcNetValueCents(row.tax.sale_price, row.applied_taxes);
        const hasDiscount = row.applied_taxes.length > 0;
        return (
          <span className={['text-sm font-semibold', hasDiscount ? 'text-brand' : 'text-foreground'].join(' ')}>
            {net}
          </span>
        );
      },
    },
    {
      key: 'available_stock',
      label: 'Estoque',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-muted">{row.info.available_stock ?? 0}</span>
      ),
    },
    {
      key: 'applied_taxes',
      label: 'Impostos',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.applied_taxes.length > 0
            ? row.applied_taxes.map((t) => (
                onTaxClick ? (
                  <Tooltip key={t.category_id} content="Clique para ver detalhes" side="top">
                    <button
                      type="button"
                      onClick={() => onTaxClick(t)}
                      className="cursor-pointer"
                    >
                      <TagChip label={t.name} />
                    </button>
                  </Tooltip>
                ) : (
                  <TagChip key={t.category_id} label={t.name} />
                )
              ))
            : <span className="text-sm text-muted">—</span>}
        </div>
      ),
    },
    {
      key: 'production_cost',
      label: 'Custo de Produção',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{formatApiCurrency(row.tax.production_cost)}</span>
      ),
    },
    {
      key: 'delivery_fee',
      label: 'Frete',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{formatApiCurrency(row.tax.delivery_fee)}</span>
      ),
    },
    {
      key: 'ncm',
      label: 'NCM',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm font-mono text-muted">
          {row.tax.ncm ? formatNcmDisplay(row.tax.ncm) : '—'}
        </span>
      ),
    },
    {
      key: 'cfop',
      label: 'CFOP',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm font-mono text-muted">
          {row.tax.cfop ? formatCfopDisplay(row.tax.cfop) : '—'}
        </span>
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

export function getDefaultVisibleColumns(columns: ColumnDef<Product>[]): string[] {
  return columns.filter((c) => c.defaultVisible !== false).map((c) => c.key);
}
