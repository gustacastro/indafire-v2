import { ColumnDef } from '@/types/ui/data-table.types';
import { RowAction } from '@/types/ui/row-actions.types';
import { RowActions } from '@/components/data/RowActions/RowActions';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { CopyField } from '@/components/ui/CopyField/CopyField';
import { IconEdit, IconTrash, IconEye, IconToggleLeft } from '@/components/icons';
import {
  Client,
  getClientName,
  getClientDocument,
  getClientType,
  isClientActive,
  isCompanyClient,
} from './clients.facade';
import { formatCpf, formatCnpj, formatPhone } from '@/utils/document';

export function getClientsColumns(
  onEdit: (client: Client) => void,
  onDelete: (client: Client) => void,
  canEdit: boolean,
  canDelete: boolean,
  onView?: (client: Client) => void,
  canView?: boolean,
  onToggleStatus?: (client: Client) => void,
): ColumnDef<Client>[] {
  const hasActions = canView || canEdit || canDelete;

  const columns: ColumnDef<Client>[] = [
    {
      key: 'name',
      label: 'Nome',
      canHide: false,
      defaultVisible: true,
      render: (row) => {
        const name = getClientName(row);
        const type = getClientType(row);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{name}</span>
            <span className="text-xs text-muted">
              {type === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'code',
      label: 'Código',
      canHide: true,
      defaultVisible: true,
      render: (row) =>
        row.code ? (
          <CopyField value={row.code}>
            <span className="text-sm font-mono text-muted">{row.code}</span>
          </CopyField>
        ) : (
          <span className="text-sm text-muted">—</span>
        ),
    },
    {
      key: 'document',
      label: 'CPF/CNPJ',
      canHide: true,
      defaultVisible: true,
      render: (row) => {
        const raw = getClientDocument(row);
        const isCompany = isCompanyClient(row.identity);
        const formatted = isCompany ? formatCnpj(raw) : formatCpf(raw);
        const type = isCompany ? 'CNPJ' : 'CPF';
        return (
          <CopyField value={raw}>
            <div className="flex flex-col">
              <span className="text-xs text-muted/60">{type}</span>
              <span className="text-sm font-mono text-muted">{formatted}</span>
            </div>
          </CopyField>
        );
      },
    },
    {
      key: 'city',
      label: 'Cidade/UF',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-muted">
          {row.address.city && row.address.state
            ? `${row.address.city}/${row.address.state}`
            : '—'}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Telefone',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <span className="text-sm text-muted">
          {row.contact.phone_number ? formatPhone(row.contact.phone_number) : '—'}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'E-mail',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.contact.email || '—'}</span>
      ),
    },
    {
      key: 'instagram',
      label: 'Instagram',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.contact.instagram || '—'}</span>
      ),
    },
    {
      key: 'facebook',
      label: 'Facebook',
      canHide: true,
      defaultVisible: false,
      render: (row) => (
        <span className="text-sm text-muted">{row.contact.facebook || '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <StatusBadge
          value={isClientActive(row)}
          trueLabel="Ativo"
          falseLabel="Inativo"
          trueVariant="primary"
          falseVariant="error"
        />
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
        if (canEdit && onToggleStatus) {
          actions.push({
            label: isClientActive(row) ? 'Marcar Inativo' : 'Marcar ativo',
            icon: <IconToggleLeft size={14} />,
            separator: false,
            onClick: () => onToggleStatus(row),
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

export function getDefaultVisibleColumns(columns: ColumnDef<Client>[]): string[] {
  return columns.filter((c) => c.defaultVisible !== false).map((c) => c.key);
}

