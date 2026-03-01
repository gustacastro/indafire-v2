import { ColumnDef } from '@/types/ui/data-table.types';
import { RowAction } from '@/types/ui/row-actions.types';
import { RowActions } from '@/components/data/RowActions/RowActions';
import { CopyField } from '@/components/ui/CopyField/CopyField';
import { IconEdit, IconTrash, IconEye } from '@/components/icons';
import { displayBankCode, formatBranch, formatAccountNumber } from '@/utils/bank-number';
import { PIX_TYPE_OPTIONS, formatPixKey, PixKeyType } from '@/utils/pix';
import { BankAccount } from './bank-accounts.facade';

export function getBankAccountsColumns(
  onEdit: (account: BankAccount) => void,
  onDelete: (account: BankAccount) => void,
  canEdit: boolean,
  canDelete: boolean,
  onView?: (account: BankAccount) => void,
  canView?: boolean,
): ColumnDef<BankAccount>[] {
  const hasActions = canView || canEdit || canDelete;

  const columns: ColumnDef<BankAccount>[] = [
    {
      key: 'alias',
      label: 'Nome da Conta',
      canHide: false,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm font-semibold text-foreground">{row.alias}</span>
      ),
    },
    {
      key: 'bank_number',
      label: 'Código',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm font-mono text-muted">{displayBankCode(String(row.bank_number))}</span>
      ),
    },
    {
      key: 'bank',
      label: 'Banco',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-foreground">{row.bank || '—'}</span>
      ),
    },
    {
      key: 'branch',
      label: 'Agência',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm font-mono text-muted">{formatBranch(row.branch) || '—'}</span>
      ),
    },
    {
      key: 'account_number',
      label: 'Conta',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm font-mono text-muted">{formatAccountNumber(row.account_number) || '—'}</span>
      ),
    },
    {
      key: 'pix_key_type',
      label: 'Tipo PIX',
      canHide: true,
      defaultVisible: false,
      render: (row) => {
        const option = PIX_TYPE_OPTIONS.find((o) => o.value === row.pix_key_type);
        return (
          <span className="text-sm text-muted">{option?.label ?? row.pix_key_type ?? '—'}</span>
        );
      },
    },
    {
      key: 'pix_key',
      label: 'Chave PIX',
      canHide: true,
      defaultVisible: false,
      render: (row) => {
        const formatted = row.pix_key_type && row.pix_key
          ? formatPixKey(row.pix_key_type as PixKeyType, row.pix_key)
          : row.pix_key;
        if (!formatted) return <span className="text-sm font-mono text-muted">—</span>;
        return (
          <CopyField value={row.pix_key}>
            <span className="text-sm font-mono text-muted">{formatted}</span>
          </CopyField>
        );
      },
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
            icon: <IconEye size={16} />,
            onClick: () => onView(row),
          });
        }
        if (canEdit) {
          actions.push({
            label: 'Editar',
            icon: <IconEdit size={16} />,
            onClick: () => onEdit(row),
          });
        }
        if (canDelete) {
          actions.push({
            label: 'Excluir',
            icon: <IconTrash size={16} />,
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

export function getDefaultVisibleColumns(columns: ColumnDef<BankAccount>[]): string[] {
  return columns.filter((c) => c.defaultVisible !== false).map((c) => c.key);
}

