'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { FilterBar } from '@/components/data/FilterBar/FilterBar';
import { DataTable } from '@/components/data/DataTable/DataTable';
import { Pagination } from '@/components/data/Pagination/Pagination';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { Button } from '@/components/ui/Button/Button';
import { IconUsers, IconPlus, IconTrash, IconEdit } from '@/components/icons';
import { fetchUsers, User } from './users.facade';
import { getUsersColumns, getDefaultVisibleColumns } from './users.columns';
import { UserViewPanel } from './UserViewPanel';
import { CsvExportButton } from '@/components/ui/CsvExportButton/CsvExportButton';

const PER_PAGE = 10;

export function Users() {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const canView = hasPermission('users', 'view');
  const canCreate = hasPermission('users', 'create');
  const canEdit = hasPermission('users', 'edit');
  const canDelete = hasPermission('users', 'delete');

  useEffect(() => {
    if (!authLoading && !canView) {
      router.replace('/dashboard');
    }
  }, [authLoading, canView, router]);

  const [users, setUsers] = useState<User[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadUsers = useCallback(async () => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const res = await fetchUsers({ page, perPage, search: debouncedSearch });
      setUsers(res.data);
      setTotalItems(res.pagination.total_items);
    } catch {
      toast.error('Erro ao carregar usuários.');
    } finally {
      setIsLoading(false);
    }
  }, [canView, page, perPage, debouncedSearch]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePerPageChange(value: number) {
    setPerPage(value);
    setPage(1);
  }

  function handleEdit(user: User) {
    router.push(`/users/${user.id}/edit`);
  }

  function handleView(user: User) {
    setViewingUser(user);
  }

  function handleDeleteRequest(user: User) {
    setDeleteTarget(user);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await toast.promise(
        api.delete(`/users/${deleteTarget.id}/`),
        {
          loading: 'Excluindo usuário...',
          success: 'Usuário excluído com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao excluir usuário.',
        },
      );
      setDeleteTarget(null);
      loadUsers();
    } catch {
      // error toast handled by toast.promise
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns = useMemo(
    () => getUsersColumns(handleEdit, handleDeleteRequest, canEdit, canDelete, handleView, canView),
    [canEdit, canDelete, canView],
  );

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    getDefaultVisibleColumns(
      getUsersColumns(() => {}, () => {}, canEdit, canDelete, undefined, canView),
    ),
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  if (authLoading || (!authLoading && !canView)) return null;

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Gerencie os usuários do sistema."
        icon={<IconUsers size={20} />}
        action={
          canCreate ? (
            <Button
              variant="primary"
              iconLeft={<IconPlus size={18} />}
              onClick={() => router.push('/users/create')}
              fullWidth
            >
              Cadastrar usuário
            </Button>
          ) : undefined
        }
      />

      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Pesquisar por nome ou e-mail..."
        totalItems={totalItems}
        columns={columns}
        visibleColumns={visibleColumns}
        onColumnsChange={setVisibleColumns}
        perPage={perPage}
        onPerPageChange={handlePerPageChange}
        extraActions={
          <CsvExportButton
            table="users"
            filename="usuarios"
            columns={columns.filter((c) => c.key !== 'actions').map((c) => ({ key: c.key, label: c.label }))}
            visibleColumns={visibleColumns.filter((k) => k !== 'actions')}
            data={users as unknown as Record<string, unknown>[]}
          />
        }
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyMessage="Nenhum usuário encontrado."
        visibleColumns={visibleColumns}
      />

      {!isLoading && totalItems > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      )}

      <ModalConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        variant="danger"
        icon={<IconTrash size={20} className="text-destructive" />}
        title="Excluir usuário"
        description={
          deleteTarget
            ? <>
                Tem certeza que deseja excluir <span className="font-bold">{deleteTarget.name}</span>? Esta ação não pode ser desfeita.
              </>
            : ''
        }
        confirmLabel="Excluir usuário"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        confirmLoading={deleteLoading}
        requireConfirmation
        requireConfirmationLabel="Confirmo que desejo excluir este usuário"
      />

      <UserViewPanel
        isOpen={!!viewingUser}
        userId={viewingUser?.id ?? null}
        onClose={() => setViewingUser(null)}
        footerButtons={[
          ...(canDelete
            ? [{
                label: 'Excluir',
                variant: 'destructive' as const,
                icon: <IconTrash size={16} />,
                onClick: () => {
                  if (viewingUser) {
                    setDeleteTarget(viewingUser);
                    setViewingUser(null);
                  }
                },
              }]
            : []),
          ...(canEdit
            ? [{
                label: 'Editar perfil',
                variant: 'primary' as const,
                icon: <IconEdit size={16} />,
                onClick: () => {
                  if (viewingUser) {
                    router.push(`/users/${viewingUser.id}/edit`);
                    setViewingUser(null);
                  }
                },
              }]
            : []),
        ]}
      />
    </div>
  );
}
