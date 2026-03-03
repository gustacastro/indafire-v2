'use client';

import { ProfilePermissionsProps } from '@/types/ui/profile-permissions.types';
import { UserPermissions } from '@/app/(protected)/users/users.facade';

const ACTION_LABELS: Array<{ key: keyof UserPermissions; label: string }> = [
  { key: 'view', label: 'Ver' },
  { key: 'edit', label: 'Editar' },
  { key: 'create', label: 'Criar' },
  { key: 'delete', label: 'Excluir' },
];

function getActiveModules(permissions: Record<string, UserPermissions>): Array<[string, UserPermissions]> {
  return Object.entries(permissions).filter(
    ([, perms]) => perms.view || perms.edit || perms.create || perms.delete,
  );
}

export function ProfilePermissions({ permissions, modules }: ProfilePermissionsProps) {
  const activeModules = getActiveModules(permissions);

  if (activeModules.length === 0) {
    return (
      <p className="text-sm text-muted py-4">Nenhuma permissão configurada.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-(--spacing-md)">
      {activeModules.map(([key, perms]) => (
        <div
          key={key}
          className="bg-secondary border border-border rounded-(--radius-lg) p-(--spacing-md) flex flex-col gap-(--spacing-sm)"
        >
          <h3 className="text-sm font-semibold text-heading truncate">
            {modules[key] ?? key}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {ACTION_LABELS.filter((a) => perms[a.key]).map((action) => (
              <span
                key={action.key}
                className="inline-flex items-center text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-sm"
              >
                {action.label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
