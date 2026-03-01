'use client';
import { Toggle } from '@/components/ui/Toggle/Toggle';
import { UserPermissions } from '@/app/(protected)/users/users.facade';
import { PermissionsEditorProps } from '@/types/permissions/permissions-editor.types';

const ACTIONS: Array<{ key: keyof UserPermissions; label: string }> = [
  { key: 'view', label: 'Visualizar' },
  { key: 'edit', label: 'Editar' },
  { key: 'create', label: 'Criar' },
  { key: 'delete', label: 'Excluir' },
];

export function PermissionsEditor({ permissions, modules, onChange }: PermissionsEditorProps) {
  const moduleKeys = Object.keys(modules);

  if (moduleKeys.length === 0) {
    return <p className="text-sm text-muted text-center py-6">Nenhum módulo disponível.</p>;
  }

  function toggleAction(moduleKey: string, action: keyof UserPermissions) {
    onChange({
      ...permissions,
      [moduleKey]: {
        ...permissions[moduleKey],
        [action]: !permissions[moduleKey]?.[action],
      },
    });
  }

  function toggleModule(moduleKey: string) {
    const modulePerms = permissions[moduleKey] ?? { view: false, edit: false, create: false, delete: false };
    const allOn = ACTIONS.every((a) => modulePerms[a.key]);
    const next = !allOn;
    onChange({
      ...permissions,
      [moduleKey]: { view: next, edit: next, create: next, delete: next },
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {moduleKeys.map((key) => {
        const modulePerms = permissions[key] ?? { view: false, edit: false, create: false, delete: false };
        const allOn = ACTIONS.every((a) => modulePerms[a.key]);

        return (
          <div key={key} className="border border-border rounded-(--radius-lg) overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
              <span className="text-sm font-semibold text-heading">{modules[key]}</span>
              <Toggle
                checked={allOn}
                onChange={() => toggleModule(key)}
                size="sm"
                label={`Todas as permissões de ${modules[key]}`}
              />
            </div>
            <div className="px-4 py-3 flex flex-col gap-3">
              {ACTIONS.map((a) => (
                <div key={a.key} className="flex items-center justify-between">
                  <span className="text-sm text-muted">{a.label}</span>
                  <Toggle
                    checked={modulePerms[a.key]}
                    onChange={() => toggleAction(key, a.key)}
                    size="sm"
                    label={`${modules[key]} - ${a.label}`}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
