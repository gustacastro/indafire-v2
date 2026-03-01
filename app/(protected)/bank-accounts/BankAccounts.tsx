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
import { CsvExportButton } from '@/components/ui/CsvExportButton/CsvExportButton';
import { IconLandmark, IconPlus, IconTrash, IconEdit } from '@/components/icons';
import { fetchBankAccounts, BankAccount } from './bank-accounts.facade';
import {
  getBankAccountsColumns,
  getDefaultVisibleColumns,
} from './bank-accounts.columns';
import { BankAccountViewPanel } from './BankAccountViewPanel';

const PER_PAGE = 10;

export function BankAccounts() {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const canView = hasPermission('bank_accounts', 'view');
  const canCreate = hasPermission('bank_accounts', 'create');
  const canEdit = hasPermission('bank_accounts', 'edit');
  const canDelete = hasPermission('bank_accounts', 'delete');

  useEffect(() => {
    if (!authLoading && !canView) router.replace('/dashboard');
  }, [authLoading, canView, router]);

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewingAccount, setViewingAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadAccounts = useCallback(async () => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const res = await fetchBankAccounts({ page, perPage, search: debouncedSearch });
      setAccounts(res.data);
      setTotalItems(res.pagination.total_items);
    } catch {
      toast.error('Erro ao carregar contas bancárias.');
    } finally {
      setIsLoading(false);
    }
  }, [canView, page, perPage, debouncedSearch]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePerPageChange(value: number) {
    setPerPage(value);
    setPage(1);
  }

  function handleEdit(account: BankAccount) {
    router.push(`/bank-accounts/${account.account_id}/edit`);
  }

  function handleView(account: BankAccount) {
    setViewingAccount(account);
  }

  function handleDeleteRequest(account: BankAccount) {
    setDeleteTarget(account);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await toast.promise(api.delete(`/bank-accounts/${deleteTarget.account_id}`), {
        loading: 'Excluindo conta bancária...',
        success: 'Conta bancária excluída com sucesso.',
        error: (err) =>
          err?.response?.data?.detail?.message ?? 'Erro ao excluir conta bancária.',
      });
      setDeleteTarget(null);
      loadAccounts();
    } catch {
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns = useMemo(
    () =>
      getBankAccountsColumns(
        handleEdit,
        handleDeleteRequest,
        canEdit,
        canDelete,
        handleView,
        canView,
      ),
    [canEdit, canDelete, canView],
  );

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    getDefaultVisibleColumns(
      getBankAccountsColumns(() => {}, () => {}, canEdit, canDelete, undefined, canView),
    ),
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  if (authLoading || (!authLoading && !canView)) return null;

  return (
    <div>
      <PageHeader
        title="Contas Bancárias"
        description="Gerencie as contas bancárias cadastradas no sistema."
        icon={<IconLandmark size={20} />}
        action={
          canCreate ? (
            <Button
              variant="primary"
              iconLeft={<IconPlus size={18} />}
              onClick={() => router.push('/bank-accounts/create')}
              fullWidth
            >
              Cadastrar conta
            </Button>
          ) : undefined
        }
      />

      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Pesquisar por nome ou banco..."
        totalItems={totalItems}
        columns={columns}
        visibleColumns={visibleColumns}
        onColumnsChange={setVisibleColumns}
        perPage={perPage}
        onPerPageChange={handlePerPageChange}
        extraActions={
          <CsvExportButton
            table="bank-accounts"
            filename="contas-bancarias"
            columns={columns
              .filter((c) => c.key !== 'actions')
              .map((c) => ({ key: c.key, label: c.label }))}
            visibleColumns={visibleColumns.filter((k) => k !== 'actions')}
            data={accounts as unknown as Record<string, unknown>[]}
          />
        }
      />

      <DataTable
        columns={columns}
        data={accounts}
        isLoading={isLoading}
        emptyMessage="Nenhuma conta bancária encontrada."
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
        title="Excluir conta bancária"
        description={
          deleteTarget ? (
            <>
              Tem certeza que deseja excluir{' '}
              <span className="font-bold">{deleteTarget.alias}</span>? Esta ação não
              pode ser desfeita.
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Excluir conta"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        confirmLoading={deleteLoading}
        requireConfirmation
        requireConfirmationLabel="Confirmo que desejo excluir esta conta bancária"
      />

      <BankAccountViewPanel
        isOpen={!!viewingAccount}
        bankAccountId={viewingAccount?.account_id ?? null}
        onClose={() => setViewingAccount(null)}
        footerButtons={[
          ...(canDelete
            ? [
                {
                  label: 'Excluir',
                  variant: 'destructive' as const,
                  icon: <IconTrash size={16} />,
                  onClick: () => {
                    if (viewingAccount) {
                      setDeleteTarget(viewingAccount);
                      setViewingAccount(null);
                    }
                  },
                },
              ]
            : []),
          ...(canEdit
            ? [
                {
                  label: 'Editar conta',
                  variant: 'primary' as const,
                  icon: <IconEdit size={16} />,
                  onClick: () => {
                    if (viewingAccount) {
                      router.push(`/bank-accounts/${viewingAccount.account_id}/edit`);
                      setViewingAccount(null);
                    }
                  },
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}
