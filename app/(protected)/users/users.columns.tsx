import { ColumnDef } from '@/types/ui/data-table.types';
import { RowAction } from '@/types/ui/row-actions.types';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { RowActions } from '@/components/data/RowActions/RowActions';
import { CopyField } from '@/components/ui/CopyField/CopyField';
import { IconEdit, IconTrash, IconEye } from '@/components/icons';
import { User } from './users.facade';

export function getUsersColumns(
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
  canEdit: boolean,
  canDelete: boolean,
  onView?: (user: User) => void,
  canView?: boolean,
): ColumnDef<User>[] {
  const hasActions = canView || canEdit || canDelete;

  const columns: ColumnDef<User>[] = [
    {
      key: 'name',
      label: 'Nome',
      canHide: false,
      defaultVisible: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <span className="text-sm font-medium text-foreground">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'E-mail',
      canHide: true,
      defaultVisible: true,
      render: (row) => (
        <CopyField value={row.email}>
          <span className="text-sm text-muted">{row.email}</span>
        </CopyField>
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

export function getDefaultVisibleColumns(columns: ColumnDef<User>[]): string[] {
  return columns.filter((c) => c.defaultVisible !== false).map((c) => c.key);
}
