'use client';
import { useState } from 'react';
import { PermissionsViewProps } from '@/types/permissions/permissions-view.types';
import { UserPermissions } from '@/app/(protected)/users/users.facade';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { IconX, IconCheck, IconChevronRight } from '@/components/icons';

const ACTION_LABELS: Array<{ key: keyof UserPermissions; label: string }> = [
  { key: 'view', label: 'Ver' },
  { key: 'edit', label: 'Editar' },
  { key: 'create', label: 'Criar' },
  { key: 'delete', label: 'Excluir' },
];

function detectAccessType(permissions: Record<string, UserPermissions>): 'total' | 'none' | 'custom' {
  const entries = Object.values(permissions);
  if (entries.length === 0) return 'none';
  const allTrue = entries.every((p) => p.view && p.edit && p.create && p.delete);
  if (allTrue) return 'total';
  const allFalse = entries.every((p) => !p.view && !p.edit && !p.create && !p.delete);
  if (allFalse) return 'none';
  return 'custom';
}

function countCustomModules(permissions: Record<string, UserPermissions>): number {
  return Object.keys(permissions).length;
}

export function PermissionsView({ permissions, modules }: PermissionsViewProps) {
  const [showDetail, setShowDetail] = useState(false);
  const accessType = detectAccessType(permissions);

  if (accessType === 'none') {
    return (
      <p className="text-sm font-medium text-muted mt-0.5">Nenhum acesso configurado</p>
    );
  }

  const moduleCount = countCustomModules(permissions);
  const label = accessType === 'total' ? 'Acesso Total' : 'Acesso Personalizado';

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDetail(true)}
        className="mt-1 flex items-center justify-between w-full group"
      >
        <span className="text-sm font-medium text-foreground">
          {label}
          <span className="ml-2 text-xs text-muted font-normal">
            {moduleCount} {moduleCount === 1 ? 'módulo' : 'módulos'}
          </span>
        </span>
        <span className="flex items-center gap-1 text-xs text-muted group-hover:text-foreground transition-colors">
          Ver permissões
          <IconChevronRight size={13} />
        </span>
      </button>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} size="lg">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary rounded-t-2xl">
          <div>
            <h2 className="text-base font-semibold text-heading">Permissões do usuário</h2>
            <p className="text-xs text-muted mt-0.5">Módulos e ações liberadas</p>
          </div>
          <button
            onClick={() => setShowDetail(false)}
            className="p-2 text-muted hover:text-foreground hover:bg-ghost-hover rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[55vh]">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="sticky top-0 bg-card px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider w-1/2" style={{ boxShadow: '0 1px 0 var(--c-border)' }}>
                  Módulo
                </th>
                {ACTION_LABELS.map((a) => (
                  <th
                    key={a.key}
                    className="sticky top-0 bg-card px-3 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider"
                    style={{ boxShadow: '0 1px 0 var(--c-border)' }}
                  >
                    {a.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(permissions).map(([key, perms], idx) => {
                return (
                  <tr
                    key={key}
                    className={idx % 2 === 0 ? 'bg-transparent' : 'bg-secondary/40'}
                  >
                    <td className="px-6 py-3 font-medium text-foreground">
                      {modules[key] ?? key}
                    </td>
                    {ACTION_LABELS.map((action) => (
                      <td key={action.key} className="px-3 py-3 text-center">
                        {perms[action.key] ? (
                          <span className="inline-flex items-center justify-center">
                            <IconCheck size={15} className="text-foreground" strokeWidth={2.5} />
                          </span>
                        ) : (
                          <span className="inline-block w-3.5 h-px bg-border mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-border bg-secondary rounded-b-2xl flex justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={() => setShowDetail(false)}>
            Fechar
          </Button>
        </div>
      </Modal>
    </>
  );
}
