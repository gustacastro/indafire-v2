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
import { Button } from '@/components/ui/Button/Button';
import { CsvExportButton } from '@/components/ui/CsvExportButton/CsvExportButton';
import { ImageGalleryModal } from '@/components/ui/ImageGalleryModal/ImageGalleryModal';
import { Modal } from '@/components/ui/Modal/Modal';
import { TaxCard } from '@/components/ui/TaxCard/TaxCard';
import { IconShoppingBag, IconPlus, IconTrash, IconEdit, IconX } from '@/components/icons';
import { fetchProducts, Product } from './products.facade';
import { TaxCategory } from '@/app/(protected)/taxes/taxes.facade';
import { getProductsColumns, getDefaultVisibleColumns } from './products.columns';
import { ProductViewPanel } from './ProductViewPanel';
import { api } from '@/lib/axios';
import { formatApiCurrency } from '@/utils/currency';
import { formatBarcodeDisplay } from '@/utils/barcode';
import { formatNcmDisplay } from '@/utils/ncm';
import { formatCfopDisplay } from '@/utils/cfop';
import { formatMeasurementUnit } from '@/utils/measurement-units';

const PER_PAGE = 10;

export function Products() {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const canView = hasPermission('products', 'view');
  const canCreate = hasPermission('products', 'create');
  const canEdit = hasPermission('products', 'edit');
  const canDelete = hasPermission('products', 'delete');

  useEffect(() => {
    if (!authLoading && !canView) router.replace('/dashboard');
  }, [authLoading, canView, router]);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const [viewingTax, setViewingTax] = useState<TaxCategory | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadProducts = useCallback(async () => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const res = await fetchProducts({ page, perPage, search: debouncedSearch });
      setProducts(res.data);
      setTotalItems(res.pagination.total_items);
    } catch {
      toast.error('Erro ao carregar produtos.');
    } finally {
      setIsLoading(false);
    }
  }, [canView, page, perPage, debouncedSearch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePerPageChange(value: number) {
    setPerPage(value);
    setPage(1);
  }

  function handleEdit(product: Product) {
    router.push(`/products/${product.id}/edit`);
  }

  function handleView(product: Product) {
    setViewingProduct(product);
  }

  function handleDeleteRequest(product: Product) {
    setDeleteTarget(product);
  }

  function handleThumbnailClick(images: string[], index: number) {
    setGalleryImages(images);
    setGalleryIndex(index);
    setGalleryOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await toast.promise(
        api.delete(`/products/${deleteTarget.id}`),
        {
          loading: 'Excluindo produto...',
          success: 'Produto excluído com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao excluir produto.',
        },
      );
      setDeleteTarget(null);
      loadProducts();
    } catch {
      // toast.promise handles error
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns = useMemo(
    () => getProductsColumns(
      handleEdit,
      handleDeleteRequest,
      canEdit,
      canDelete,
      handleView,
      canView,
      handleThumbnailClick,
      (tax) => setViewingTax(tax),
    ),
    [canEdit, canDelete, canView],
  );

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    getDefaultVisibleColumns(
      getProductsColumns(() => {}, () => {}, canEdit, canDelete, undefined, canView),
    ),
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const csvData = useMemo(() => products.map((p) => {
    const cents = parseFloat(p.tax.sale_price);
    const totalRate = p.applied_taxes.reduce((sum, t) => {
      if (!t.allow_iss_deduction) return sum;
      return sum + t.iss_rate + t.cofins_rate + t.csll_rate + t.ir_rate + t.inss_rate + t.pis_rate;
    }, 0);
    const netFormatted = cents && !isNaN(cents)
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents * (1 - totalRate / 100) / 100)
      : '—';
    return {
      fantasy_name: p.info.fantasy_name ?? '',
      barcode: p.info.barcode ? formatBarcodeDisplay(p.info.barcode) : '',
      measurement_unit: p.info.measurement_unit
        ? `${p.info.measurement_amount} × ${formatMeasurementUnit(p.info.measurement_unit)}`
        : '',
      sale_price: formatApiCurrency(p.tax.sale_price),
      net_value: netFormatted,
      available_stock: String(p.info.available_stock ?? 0),
      applied_taxes: p.applied_taxes.map((t) => t.name).join(', '),
      production_cost: formatApiCurrency(p.tax.production_cost),
      delivery_fee: formatApiCurrency(p.tax.delivery_fee),
      ncm: p.tax.ncm ? formatNcmDisplay(p.tax.ncm) : '',
      cfop: p.tax.cfop ? formatCfopDisplay(p.tax.cfop) : '',
    };
  }), [products]);

  if (authLoading || (!authLoading && !canView)) return null;

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Gerencie o catálogo de produtos cadastrados no sistema."
        icon={<IconShoppingBag size={20} />}
        action={
          canCreate ? (
            <Button
              variant="primary"
              iconLeft={<IconPlus size={18} />}
              onClick={() => router.push('/products/create')}
              fullWidth
            >
              Cadastrar produto
            </Button>
          ) : undefined
        }
      />

      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Pesquisar por nome ou código..."
        totalItems={totalItems}
        columns={columns}
        visibleColumns={visibleColumns}
        onColumnsChange={setVisibleColumns}
        perPage={perPage}
        onPerPageChange={handlePerPageChange}
        extraActions={
          <CsvExportButton
            table="products"
            filename="produtos"
            columns={columns
              .filter((c) => c.key !== 'actions' && c.key !== 'name')
              .map((c) => ({ key: c.key, label: c.label }))}
            visibleColumns={visibleColumns.filter((k) => k !== 'actions')}
            data={csvData as unknown as Record<string, unknown>[]}
          />
        }
      />

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyMessage="Nenhum produto encontrado."
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
        title="Excluir produto"
        description={
          deleteTarget ? (
            <>
              Tem certeza que deseja excluir{' '}
              <span className="font-bold">{deleteTarget.info.name}</span>? Esta ação não pode ser desfeita.
            </>
          ) : ''
        }
        confirmLabel="Excluir produto"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        confirmLoading={deleteLoading}
        requireConfirmation
        requireConfirmationLabel="Confirmo que desejo excluir este produto"
      />

      <ProductViewPanel
        isOpen={!!viewingProduct}
        productId={viewingProduct?.id ?? null}
        onClose={() => setViewingProduct(null)}
        footerButtons={[
          ...(canDelete
            ? [{
                label: 'Excluir',
                variant: 'destructive' as const,
                icon: <IconTrash size={16} />,
                onClick: () => {
                  if (viewingProduct) {
                    setDeleteTarget(viewingProduct);
                    setViewingProduct(null);
                  }
                },
              }]
            : []),
          ...(canEdit
            ? [{
                label: 'Editar produto',
                variant: 'primary' as const,
                icon: <IconEdit size={16} />,
                onClick: () => {
                  if (viewingProduct) {
                    router.push(`/products/${viewingProduct.id}/edit`);
                    setViewingProduct(null);
                  }
                },
              }]
            : []),
        ]}
      />

      <ImageGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={galleryImages}
        initialIndex={galleryIndex}
        title="Fotos do produto"
      />

      <Modal isOpen={!!viewingTax} onClose={() => setViewingTax(null)} size="3xl">
        {viewingTax && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-heading">Detalhes do imposto</h2>
              <button
                type="button"
                onClick={() => setViewingTax(null)}
                className="text-muted hover:text-foreground hover:bg-secondary p-1.5 rounded-(--radius-md) transition-all"
              >
                <IconX size={18} />
              </button>
            </div>
            <TaxCard tax={viewingTax} variant="full" />
          </div>
        )}
      </Modal>
    </div>
  );
}
