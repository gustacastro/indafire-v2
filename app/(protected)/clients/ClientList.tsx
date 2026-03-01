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
import { IconUsers, IconPlus, IconTrash, IconEdit, IconTruck } from '@/components/icons';
import {
  fetchClients,
  deleteClient,
  toggleClientStatus,
  Client,
  getClientName,
  getClientDocument,
  getClientType,
  isClientActive,
  isCompanyClient,
} from './clients.facade';
import { getClientsColumns, getDefaultVisibleColumns } from './clients.columns';
import { ClientViewPanel } from './ClientViewPanel';
import { ClientListProps } from '@/types/entities/client/client.types';
import { formatCpf, formatCnpj, formatPhone } from '@/utils/document';

const PER_PAGE = 10;

export function ClientList({ isSupplier }: ClientListProps) {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();
  const basePath = isSupplier ? '/suppliers' : '/clients';
  const entityLabel = isSupplier ? 'fornecedor' : 'cliente';
  const entityLabelPlural = isSupplier ? 'Fornecedores' : 'Clientes';

  const canView = hasPermission('clients', 'view');
  const canCreate = hasPermission('clients', 'create');
  const canEdit = hasPermission('clients', 'edit');
  const canDelete = hasPermission('clients', 'delete');

  useEffect(() => {
    if (!authLoading && !canView) router.replace('/dashboard');
  }, [authLoading, canView, router]);

  const [clients, setClients] = useState<Client[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadClients = useCallback(async () => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const res = await fetchClients({ page, perPage, search: debouncedSearch, supplier: isSupplier });
      setClients(res.data);
      setTotalItems(res.pagination.total_items);
    } catch {
      toast.error(`Erro ao carregar ${entityLabelPlural.toLowerCase()}.`);
    } finally {
      setIsLoading(false);
    }
  }, [canView, page, perPage, debouncedSearch, isSupplier, entityLabelPlural]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePerPageChange(value: number) {
    setPerPage(value);
    setPage(1);
  }

  function handleEdit(client: Client) {
    router.push(`${basePath}/${client.id}/edit`);
  }

  function handleView(client: Client) {
    setViewingClient(client);
  }

  function handleDeleteRequest(client: Client) {
    setDeleteTarget(client);
  }

  async function handleToggleStatus(client: Client) {
    try {
      await toast.promise(toggleClientStatus(client.id), {
        loading: 'Alterando status...',
        success: 'Status alterado com sucesso.',
        error: (err: unknown) =>
          (err as { response?: { data?: { detail?: { message?: string } } } })
            ?.response?.data?.detail?.message ?? 'Erro ao alterar status.',
      });
      loadClients();
    } catch {
      //
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await toast.promise(deleteClient(deleteTarget.id), {
        loading: `Excluindo ${entityLabel}...`,
        success: `${isSupplier ? 'Fornecedor' : 'Cliente'} excluído com sucesso.`,
        error: (err: unknown) =>
          (err as { response?: { data?: { detail?: { message?: string } } } })
            ?.response?.data?.detail?.message ?? `Erro ao excluir ${entityLabel}.`,
      });
      setDeleteTarget(null);
      loadClients();
    } catch {
      //
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns = useMemo(
    () => getClientsColumns(
      handleEdit,
      handleDeleteRequest,
      canEdit,
      canDelete,
      handleView,
      canView,
      handleToggleStatus,
    ),
    [canEdit, canDelete, canView],
  );

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    getDefaultVisibleColumns(
      getClientsColumns(() => {}, () => {}, canEdit, canDelete, undefined, canView),
    ),
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const csvData = useMemo(() => clients.map((c) => ({
    name: getClientName(c),
    code: c.code ?? '',
    type: getClientType(c) === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física',
    document: isCompanyClient(c.identity) ? formatCnpj(getClientDocument(c)) : formatCpf(getClientDocument(c)),
    city: c.address.city && c.address.state ? `${c.address.city}/${c.address.state}` : '',
    phone: c.contact.phone_number ? formatPhone(c.contact.phone_number) : '',
    email: c.contact.email ?? '',
    instagram: c.contact.instagram ?? '',
    facebook: c.contact.facebook ?? '',
    status: isClientActive(c) ? 'Ativo' : 'Inativo',
  })), [clients]);

  if (authLoading || (!authLoading && !canView)) return null;

  return (
    <div>
      <PageHeader
        title={entityLabelPlural}
        description={`Gerencie os ${entityLabelPlural.toLowerCase()} cadastrados no sistema.`}
        icon={isSupplier ? <IconTruck size={20} /> : <IconUsers size={20} />}
        action={
          canCreate ? (
            <Button
              variant="primary"
              iconLeft={<IconPlus size={18} />}
              onClick={() => router.push(`${basePath}/create`)}
              fullWidth
            >
              Cadastrar {entityLabel}
            </Button>
          ) : undefined
        }
      />

      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={`Pesquisar por nome, CPF, CNPJ...`}
        totalItems={totalItems}
        columns={columns}
        visibleColumns={visibleColumns}
        onColumnsChange={setVisibleColumns}
        perPage={perPage}
        onPerPageChange={handlePerPageChange}
        extraActions={
          <CsvExportButton
            table="clients"
            filename={isSupplier ? 'fornecedores' : 'clientes'}
            columns={columns.filter((c) => c.key !== 'actions').map((c) => ({ key: c.key, label: c.label }))}
            data={csvData as unknown as Record<string, unknown>[]}
          />
        }
      />

      <DataTable
        columns={columns}
        data={clients}
        isLoading={isLoading}
        emptyMessage={`Nenhum ${entityLabel} encontrado.`}
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
        title={`Excluir ${entityLabel}`}
        description={
          deleteTarget ? (
            <>
              Tem certeza que deseja excluir{' '}
              <span className="font-bold">{getClientName(deleteTarget)}</span>? Esta ação não pode ser desfeita.
            </>
          ) : ''
        }
        confirmLabel={`Excluir ${entityLabel}`}
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        confirmLoading={deleteLoading}
        requireConfirmation
        requireConfirmationLabel={`Confirmo que desejo excluir este ${entityLabel}`}
      />

      <ClientViewPanel
        isOpen={!!viewingClient}
        clientId={viewingClient?.id ?? null}
        onClose={() => setViewingClient(null)}
        isSupplier={isSupplier}
        onStatusChange={loadClients}
        footerButtons={[
          ...(canDelete
            ? [{
                label: 'Excluir',
                variant: 'destructive' as const,
                icon: <IconTrash size={16} />,
                onClick: () => {
                  if (viewingClient) {
                    setDeleteTarget(viewingClient);
                    setViewingClient(null);
                  }
                },
              }]
            : []),
          ...(canEdit
            ? [{
                label: `Editar ${entityLabel}`,
                variant: 'primary' as const,
                icon: <IconEdit size={16} />,
                onClick: () => {
                  if (viewingClient) {
                    router.push(`${basePath}/${viewingClient.id}/edit`);
                    setViewingClient(null);
                  }
                },
              }]
            : []),
        ]}
      />
    </div>
  );
}
