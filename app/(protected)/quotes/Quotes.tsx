'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { FilterBar } from '@/components/data/FilterBar/FilterBar';
import { DataTable } from '@/components/data/DataTable/DataTable';
import { Pagination } from '@/components/data/Pagination/Pagination';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { PdfPreviewModal } from '@/components/ui/PdfPreviewModal/PdfPreviewModal';
import { Button } from '@/components/ui/Button/Button';
import { CsvExportButton } from '@/components/ui/CsvExportButton/CsvExportButton';
import { IconClipboardCheck, IconPlus, IconTrash, IconEdit } from '@/components/icons';
import {
  fetchQuotesEnriched,
  QuoteListItem,
  getQuoteStatusLabel,
  deleteQuote,
  generateQuotePdf,
} from './quotes.facade';
import { getQuotesColumns, getDefaultVisibleColumns } from './quotes.columns';
import { QuoteViewPanel } from './QuoteViewPanel';
import { formatApiCurrency } from '@/utils/currency';

const PER_PAGE = 10;

export function Quotes() {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const canView = hasPermission('quotes', 'view');
  const canCreate = hasPermission('quotes', 'create');
  const canEdit = hasPermission('quotes', 'edit');
  const canDelete = hasPermission('quotes', 'delete');

  useEffect(() => {
    if (!authLoading && !canView) router.replace('/dashboard');
  }, [authLoading, canView, router]);

  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<QuoteListItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<QuoteListItem | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfQuoteCode, setPdfQuoteCode] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadQuotes = useCallback(async () => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const res = await fetchQuotesEnriched({ page, perPage, search: debouncedSearch });
      setQuotes(res.data);
      setTotalItems(res.pagination.total_items);
    } catch {
      toast.error('Erro ao carregar orçamentos.');
    } finally {
      setIsLoading(false);
    }
  }, [canView, page, perPage, debouncedSearch]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePerPageChange(value: number) {
    setPerPage(value);
    setPage(1);
  }

  function handleEdit(quote: QuoteListItem) {
    router.push(`/quotes/${quote.id}/edit`);
  }

  function handleView(quote: QuoteListItem) {
    setViewingQuote(quote);
  }

  async function handlePrint(quote: QuoteListItem) {
    setPdfQuoteCode(quote.quote_code);
    setPdfModalOpen(true);
    setPdfLoading(true);
    setPdfUrl(null);
    try {
      const blob = await generateQuotePdf(quote.id);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { detail?: { message?: string } } } })
          ?.response?.data?.detail?.message ?? 'Erro ao gerar PDF do orçamento.',
      );
      setPdfModalOpen(false);
    } finally {
      setPdfLoading(false);
    }
  }

  function handleDeleteRequest(quote: QuoteListItem) {
    setDeleteTarget(quote);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await toast.promise(
        deleteQuote(deleteTarget.id),
        {
          loading: 'Excluindo orçamento...',
          success: 'Orçamento excluído com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao excluir orçamento.',
        },
      );
      setDeleteTarget(null);
      loadQuotes();
    } catch {
      // toast.promise handles error
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns = useMemo(
    () => getQuotesColumns(
      handleEdit,
      handleDeleteRequest,
      canEdit,
      canDelete,
      handleView,
      canView,
      handlePrint,
    ),
    [canEdit, canDelete, canView],
  );

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    getDefaultVisibleColumns(
      getQuotesColumns(() => {}, () => {}, canEdit, canDelete, undefined, canView, undefined),
    ),
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const csvData = useMemo(() => quotes.map((q) => ({
    quote_code: String(q.quote_code),
    clientName: q.clientName ?? '',
    status: getQuoteStatusLabel(q.status),
    net_value: formatApiCurrency(q.net_value),
    expected_delivery_date: q.expected_delivery_date,
    paymentMethodName: q.paymentMethodName ?? '',
    installments: q.installments > 0 ? `${q.installments}x` : 'À vista',
    valor_por_parcela: q.installments > 0 ? formatApiCurrency(Math.floor(q.net_value / q.installments)) : '—',
    freight: formatApiCurrency(q.freight),
    discount_percentage: q.discount_percentage > 0
      ? `${(q.discount_percentage / 100).toFixed(2).replace('.', ',')}%`
      : '0%',
  })), [quotes]);

  if (authLoading || (!authLoading && !canView)) return null;

  return (
    <div>
      <PageHeader
        title="Orçamentos"
        description="Gerencie os orçamentos cadastrados no sistema."
        icon={<IconClipboardCheck size={20} />}
        action={
          canCreate ? (
            <Button
              variant="primary"
              iconLeft={<IconPlus size={18} />}
              onClick={() => router.push('/quotes/create')}
              fullWidth
            >
              Criar orçamento
            </Button>
          ) : undefined
        }
      />

      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Pesquisar por código ou cliente..."
        totalItems={totalItems}
        columns={columns}
        visibleColumns={visibleColumns}
        onColumnsChange={setVisibleColumns}
        perPage={perPage}
        onPerPageChange={handlePerPageChange}
        extraActions={
          <CsvExportButton
            table="quotes"
            filename="orcamentos"
            columns={columns
              .filter((c) => c.key !== 'actions')
              .map((c) => ({ key: c.key, label: c.label }))}
            visibleColumns={visibleColumns.filter((k) => k !== 'actions')}
            data={csvData as unknown as Record<string, unknown>[]}
          />
        }
      />

      <DataTable
        columns={columns}
        data={quotes}
        isLoading={isLoading}
        emptyMessage="Nenhum orçamento encontrado."
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
        title="Excluir orçamento"
        description={
          deleteTarget ? (
            <>
              Tem certeza que deseja excluir o orçamento{' '}
              <span className="font-bold">#{deleteTarget.quote_code}</span>? Esta ação não pode ser desfeita.
            </>
          ) : ''
        }
        confirmLabel="Excluir orçamento"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        confirmLoading={deleteLoading}
        requireConfirmation
        requireConfirmationLabel="Confirmo que desejo excluir este orçamento"
      />

      <QuoteViewPanel
        isOpen={!!viewingQuote}
        quoteId={viewingQuote?.id ?? null}
        onClose={() => setViewingQuote(null)}
        footerButtons={[
          ...(canDelete
            ? [{
                label: 'Excluir',
                variant: 'destructive' as const,
                icon: <IconTrash size={16} />,
                onClick: () => {
                  if (viewingQuote) {
                    setDeleteTarget(viewingQuote);
                    setViewingQuote(null);
                  }
                },
              }]
            : []),
          ...(canEdit && viewingQuote?.status !== 'APPROVED'
            ? [{
                label: 'Editar orçamento',
                variant: 'primary' as const,
                icon: <IconEdit size={16} />,
                onClick: () => {
                  if (viewingQuote) {
                    router.push(`/quotes/${viewingQuote.id}/edit`);
                    setViewingQuote(null);
                  }
                },
              }]
            : []),
        ]}
      />

      <PdfPreviewModal
        isOpen={pdfModalOpen}
        onClose={() => {
          setPdfModalOpen(false);
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
          }
        }}
        title={pdfQuoteCode ? `Orçamento #${pdfQuoteCode}` : 'Orçamento'}
        subtitle={`Gerado em ${new Date().toLocaleDateString('pt-BR')}`}
        pdfUrl={pdfUrl}
        isLoading={pdfLoading}
      />
    </div>
  );
}
