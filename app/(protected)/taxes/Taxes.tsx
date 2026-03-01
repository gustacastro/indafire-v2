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
import { IconReceipt, IconPlus, IconTrash, IconEdit } from '@/components/icons';
import { CsvExportButton } from '@/components/ui/CsvExportButton/CsvExportButton';
import { mapRecord } from '@/utils/label-map';
import { APPLIES_TO_LABELS } from './taxes.columns';
import { fetchTaxes, TaxCategory } from './taxes.facade';
import { getTaxesColumns, getDefaultVisibleColumns } from './taxes.columns';
import { TaxViewPanel } from './TaxViewPanel';

const PER_PAGE = 10;

export function Taxes() {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const canView = hasPermission('tax_categories', 'view');
  const canCreate = hasPermission('tax_categories', 'create');
  const canEdit = hasPermission('tax_categories', 'edit');
  const canDelete = hasPermission('tax_categories', 'delete');

  useEffect(() => {
    if (!authLoading && !canView) {
      router.replace('/dashboard');
    }
  }, [authLoading, canView, router]);

  const [taxes, setTaxes] = useState<TaxCategory[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<TaxCategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewingTax, setViewingTax] = useState<TaxCategory | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadTaxes = useCallback(async () => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const res = await fetchTaxes({ page, perPage, search: debouncedSearch });
      setTaxes(res.data);
      setTotalItems(res.pagination.total_items);
    } catch {
      toast.error('Erro ao carregar categorias de imposto.');
    } finally {
      setIsLoading(false);
    }
  }, [canView, page, perPage, debouncedSearch]);

  useEffect(() => {
    loadTaxes();
  }, [loadTaxes]);

  function handleSearchChange(value: string) { setSearch(value); setPage(1); }
  function handlePerPageChange(value: number) { setPerPage(value); setPage(1); }
  function handleEdit(tax: TaxCategory) { router.push(`/taxes/${tax.category_id}/edit`); }
  function handleView(tax: TaxCategory) { setViewingTax(tax); }
  function handleDeleteRequest(tax: TaxCategory) { setDeleteTarget(tax); }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await toast.promise(
        api.delete(`/taxes/${deleteTarget.category_id}`),
        {
          loading: 'Excluindo categoria...',
          success: 'Categoria excluída com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao excluir categoria.',
        },
      );
      setDeleteTarget(null);
      loadTaxes();
    } catch {
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns = useMemo(
    () => getTaxesColumns(handleEdit, handleDeleteRequest, canEdit, canDelete, handleView, canView),
    [canEdit, canDelete, canView],
  );

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    getDefaultVisibleColumns(
      getTaxesColumns(() => {}, () => {}, canEdit, canDelete, undefined, canView),
    ),
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  if (authLoading || (!authLoading && !canView)) return null;

  return (
    <div>
      <PageHeader
        title="Impostos"
        description="Gerencie as categorias de impostos da empresa."
        icon={<IconReceipt size={20} />}
        action={
          canCreate ? (
            <Button
              variant="primary"
              iconLeft={<IconPlus size={18} />}
              onClick={() => router.push('/taxes/create')}
              fullWidth
            >
              Cadastrar categoria
            </Button>
          ) : undefined
        }
      />

      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Pesquisar por nome..."
        totalItems={totalItems}
        columns={columns}
        visibleColumns={visibleColumns}
        onColumnsChange={setVisibleColumns}
        perPage={perPage}
        onPerPageChange={handlePerPageChange}
        extraActions={
          <CsvExportButton
            table="taxes"
            filename="impostos"
            columns={columns.filter((c) => c.key !== 'actions').map((c) => ({ key: c.key, label: c.label }))}
            visibleColumns={visibleColumns.filter((k) => k !== 'actions')}
            data={taxes.map((t) =>
              mapRecord(t as unknown as Record<string, unknown>, {
                applies_to: APPLIES_TO_LABELS,
                allow_iss_deduction: { true: 'Sim', false: 'Não' },
              })
            )}
          />
        }
      />

      <DataTable
        columns={columns}
        data={taxes}
        isLoading={isLoading}
        emptyMessage="Nenhuma categoria de imposto encontrada."
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
        title="Excluir categoria"
        description={
          deleteTarget ? (
            <>
              <span>Tem certeza que deseja excluir </span>
              <span className="font-bold">{deleteTarget.name}</span>? Esta ação não pode ser desfeita.
            </>
          ) : ''
        }
        confirmLabel="Excluir categoria"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        confirmLoading={deleteLoading}
        requireConfirmation
        requireConfirmationLabel="Confirmo que desejo excluir esta categoria"
      />

      <TaxViewPanel
        isOpen={!!viewingTax}
        taxId={viewingTax?.category_id ?? null}
        onClose={() => setViewingTax(null)}
        footerButtons={[
          ...(canDelete
            ? [{
                label: 'Excluir',
                variant: 'destructive' as const,
                icon: <IconTrash size={16} />,
                onClick: () => {
                  if (viewingTax) {
                    setDeleteTarget(viewingTax);
                    setViewingTax(null);
                  }
                },
              }]
            : []),
          ...(canEdit
            ? [{
                label: 'Editar categoria',
                variant: 'primary' as const,
                icon: <IconEdit size={16} />,
                onClick: () => {
                  if (viewingTax) {
                    router.push(`/taxes/${viewingTax.category_id}/edit`);
                    setViewingTax(null);
                  }
                },
              }]
            : []),
        ]}
      />
    </div>
  );
}
