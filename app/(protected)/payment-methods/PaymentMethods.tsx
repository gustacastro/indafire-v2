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
import { IconCreditCard, IconPlus, IconTrash, IconEdit } from '@/components/icons';
import { maskCurrencyInput } from '@/utils/currency';
import {
  fetchPaymentMethods,
  PaymentMethod,
} from './payment-methods.facade';
import {
  getPaymentMethodsColumns,
  getDefaultVisibleColumns,
} from './payment-methods.columns';
import { PaymentMethodViewPanel } from './PaymentMethodViewPanel';

const PER_PAGE = 10;

export function PaymentMethods() {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const canView = hasPermission('payment_methods', 'view');
  const canCreate = hasPermission('payment_methods', 'create');
  const canEdit = hasPermission('payment_methods', 'edit');
  const canDelete = hasPermission('payment_methods', 'delete');

  useEffect(() => {
    if (!authLoading && !canView) {
      router.replace('/dashboard');
    }
  }, [authLoading, canView, router]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewingPaymentMethod, setViewingPaymentMethod] =
    useState<PaymentMethod | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadPaymentMethods = useCallback(async () => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const res = await fetchPaymentMethods({
        page,
        perPage,
        search: debouncedSearch,
      });
      setPaymentMethods(res.data);
      setTotalItems(res.pagination.total_items);
    } catch {
      toast.error('Erro ao carregar meios de pagamento.');
    } finally {
      setIsLoading(false);
    }
  }, [canView, page, perPage, debouncedSearch]);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePerPageChange(value: number) {
    setPerPage(value);
    setPage(1);
  }

  function handleEdit(pm: PaymentMethod) {
    router.push(`/payment-methods/${pm.payment_method_id}/edit`);
  }

  function handleView(pm: PaymentMethod) {
    setViewingPaymentMethod(pm);
  }

  function handleDeleteRequest(pm: PaymentMethod) {
    setDeleteTarget(pm);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await toast.promise(
        api.delete(`/payment-methods/${deleteTarget.payment_method_id}`),
        {
          loading: 'Excluindo meio de pagamento...',
          success: 'Meio de pagamento excluído com sucesso.',
          error: (err: unknown) =>
            (
              err as {
                response?: { data?: { detail?: { message?: string } } };
              }
            )?.response?.data?.detail?.message ??
            'Erro ao excluir meio de pagamento.',
        },
      );
      setDeleteTarget(null);
      loadPaymentMethods();
    } catch {
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns = useMemo(
    () =>
      getPaymentMethodsColumns(
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
      getPaymentMethodsColumns(
        () => {},
        () => {},
        canEdit,
        canDelete,
        undefined,
        canView,
      ),
    ),
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const { csvColumns, csvAlwaysColumns, csvData } = useMemo(() => {
    const maxInstallments = Math.max(
      0,
      ...paymentMethods.map((pm) => pm.installment_count ?? 0),
    );

    const baseColumns = [
      { key: 'name', label: 'Nome' },
      { key: 'provider', label: 'Provedor' },
      { key: 'minimum_amount', label: 'Valor Mínimo da Venda' },
      { key: 'allow_installments', label: 'Parcelamento' },
      { key: 'active', label: 'Status' },
      { key: 'method_info', label: 'Informações' },
      { key: 'installment_count', label: 'Nº Parcelas' },
      { key: 'minimum_installment_amount', label: 'Valor Mínimo da Parcela' },
    ];

    const installmentColumns: { key: string; label: string }[] = [];
    for (let i = 1; i <= maxInstallments; i++) {
      installmentColumns.push({ key: `parcela_${i}_pct`, label: `Parcela ${i} (%)` });
      installmentColumns.push({ key: `parcela_${i}_valor`, label: `Parcela ${i} Valor` });
      installmentColumns.push({
        key: `parcela_${i}_interval`,
        label: `Parcela ${i} Intervalo (dias)`,
      });
    }

    const rows = paymentMethods.map((pm) => {
      const row: Record<string, unknown> = {
        name: pm.name,
        provider: pm.provider,
        minimum_amount: maskCurrencyInput(String(pm.minimum_amount)),
        allow_installments: pm.allow_installments,
        active: pm.active,
        method_info: pm.method_info ?? '',
        installment_count: pm.allow_installments ? (pm.installment_count ?? '') : '',
        minimum_installment_amount: pm.allow_installments
          ? maskCurrencyInput(String(pm.minimum_installment_amount ?? 0))
          : '',
      };
      for (let i = 1; i <= maxInstallments; i++) {
        const pct = pm.installment_percentages?.[i - 1];
        const interval = pm.installment_intervals?.[i - 1];
        if (pct != null) {
          const valueCents = Math.round((pct / 10000) * pm.minimum_amount);
          row[`parcela_${i}_pct`] = (pct / 100).toFixed(2);
          row[`parcela_${i}_valor`] = maskCurrencyInput(String(valueCents));
        } else {
          row[`parcela_${i}_pct`] = '';
          row[`parcela_${i}_valor`] = '';
        }
        row[`parcela_${i}_interval`] = interval != null ? String(interval) : '';
      }
      return row;
    });

    return { csvColumns: baseColumns, csvAlwaysColumns: installmentColumns, csvData: rows };
  }, [paymentMethods]);

  if (authLoading || (!authLoading && !canView)) return null;

  return (
    <div>
      <PageHeader
        title="Meios de Pagamento"
        description="Gerencie os meios de pagamento cadastrados no sistema."
        icon={<IconCreditCard size={20} />}
        action={
          canCreate ? (
            <Button
              variant="primary"
              iconLeft={<IconPlus size={18} />}
              onClick={() => router.push('/payment-methods/create')}
              fullWidth
            >
              Cadastrar meio de pagamento
            </Button>
          ) : undefined
        }
      />
      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Pesquisar por nome ou provedor..."
        totalItems={totalItems}
        columns={columns}
        visibleColumns={visibleColumns}
        onColumnsChange={setVisibleColumns}
        perPage={perPage}
        onPerPageChange={handlePerPageChange}
        extraActions={
          <CsvExportButton
            table="payment-methods"
            filename="meios-de-pagamento"
            columns={csvColumns}
            visibleColumns={visibleColumns.filter((k) => k !== 'actions')}
            data={csvData}
            alwaysExportColumns={csvAlwaysColumns}
          />
        }
      />
      <DataTable
        columns={columns}
        data={paymentMethods}
        isLoading={isLoading}
        emptyMessage="Nenhum meio de pagamento encontrado."
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
        title="Excluir meio de pagamento"
        description={
          deleteTarget ? (
            <>
              Tem certeza que deseja excluir{' '}
              <span className="font-bold">{deleteTarget.name}</span>? Esta ação
              não pode ser desfeita.
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Excluir meio de pagamento"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        confirmLoading={deleteLoading}
        requireConfirmation
        requireConfirmationLabel="Confirmo que desejo excluir este meio de pagamento"
      />
      <PaymentMethodViewPanel
        isOpen={!!viewingPaymentMethod}
        paymentMethodId={
          viewingPaymentMethod?.payment_method_id ?? null
        }
        onClose={() => setViewingPaymentMethod(null)}
        footerButtons={[
          ...(canDelete && viewingPaymentMethod
            ? [
                {
                  label: 'Excluir',
                  variant: 'destructive' as const,
                  icon: <IconTrash size={16} />,
                  onClick: () => {
                    if (viewingPaymentMethod) {
                      setDeleteTarget(viewingPaymentMethod);
                      setViewingPaymentMethod(null);
                    }
                  },
                },
              ]
            : []),
          ...(canEdit && viewingPaymentMethod
            ? [
                {
                  label: 'Editar',
                  variant: 'primary' as const,
                  icon: <IconEdit size={16} />,
                  onClick: () => {
                    if (viewingPaymentMethod) {
                      router.push(
                        `/payment-methods/${viewingPaymentMethod.payment_method_id}/edit`,
                      );
                      setViewingPaymentMethod(null);
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
