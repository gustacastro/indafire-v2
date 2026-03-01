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
import { IconBriefcase, IconPlus, IconTrash, IconEdit } from '@/components/icons';
import { fetchJobs, Job } from './jobs.facade';
import { getJobsColumns, getDefaultVisibleColumns } from './jobs.columns';
import { JobViewPanel } from './JobViewPanel';
import { CsvExportButton } from '@/components/ui/CsvExportButton/CsvExportButton';

const PER_PAGE = 10;

export function Jobs() {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const canView = hasPermission('jobs', 'view');
  const canCreate = hasPermission('jobs', 'create');
  const canEdit = hasPermission('jobs', 'edit');
  const canDelete = hasPermission('jobs', 'delete');

  useEffect(() => {
    if (!authLoading && !canView) {
      router.replace('/dashboard');
    }
  }, [authLoading, canView, router]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadJobs = useCallback(async () => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const res = await fetchJobs({ page, perPage, search: debouncedSearch });
      setJobs(res.data);
      setTotalItems(res.pagination.total_items);
    } catch {
      toast.error('Erro ao carregar serviços.');
    } finally {
      setIsLoading(false);
    }
  }, [canView, page, perPage, debouncedSearch]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePerPageChange(value: number) {
    setPerPage(value);
    setPage(1);
  }

  function handleEdit(job: Job) {
    router.push(`/jobs/${job.job_id}/edit`);
  }

  function handleView(job: Job) {
    setViewingJob(job);
  }

  function handleDeleteRequest(job: Job) {
    setDeleteTarget(job);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await toast.promise(
        api.delete(`/jobs/${deleteTarget.job_id}`),
        {
          loading: 'Excluindo serviço...',
          success: 'Serviço excluído com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao excluir serviço.',
        },
      );
      setDeleteTarget(null);
      loadJobs();
    } catch {
      // error toast handled by toast.promise
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns = useMemo(
    () => getJobsColumns(handleEdit, handleDeleteRequest, canEdit, canDelete, handleView, canView),
    [canEdit, canDelete, canView],
  );

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    getDefaultVisibleColumns(
      getJobsColumns(() => {}, () => {}, canEdit, canDelete, undefined, canView),
    ),
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  if (authLoading || (!authLoading && !canView)) return null;

  return (
    <div>
      <PageHeader
        title="Serviços"
        description="Gerencie os serviços cadastrados no sistema."
        icon={<IconBriefcase size={20} />}
        action={
          canCreate ? (
            <Button
              variant="primary"
              iconLeft={<IconPlus size={18} />}
              onClick={() => router.push('/jobs/create')}
              fullWidth
            >
              Cadastrar serviço
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
            table="jobs"
            filename="servicos"
            columns={columns.filter((c) => c.key !== 'actions').map((c) => ({ key: c.key, label: c.label }))}
            visibleColumns={visibleColumns.filter((k) => k !== 'actions')}
            data={jobs as unknown as Record<string, unknown>[]}
          />
        }
      />

      <DataTable
        columns={columns}
        data={jobs}
        isLoading={isLoading}
        emptyMessage="Nenhum serviço encontrado."
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
        title="Excluir serviço"
        description={
          deleteTarget ? (
            <>
              Tem certeza que deseja excluir{' '}
              <span className="font-bold">{deleteTarget.service_name}</span>? Esta ação não pode ser desfeita.
            </>
          ) : ''
        }
        confirmLabel="Excluir serviço"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        confirmLoading={deleteLoading}
        requireConfirmation
        requireConfirmationLabel="Confirmo que desejo excluir este serviço"
      />

      <JobViewPanel
        isOpen={!!viewingJob}
        jobId={viewingJob?.job_id ?? null}
        onClose={() => setViewingJob(null)}
        footerButtons={[
          ...(canDelete
            ? [{
                label: 'Excluir',
                variant: 'destructive' as const,
                icon: <IconTrash size={16} />,
                onClick: () => {
                  if (viewingJob) {
                    setDeleteTarget(viewingJob);
                    setViewingJob(null);
                  }
                },
              }]
            : []),
          ...(canEdit
            ? [{
                label: 'Editar serviço',
                variant: 'primary' as const,
                icon: <IconEdit size={16} />,
                onClick: () => {
                  if (viewingJob) {
                    router.push(`/jobs/${viewingJob.job_id}/edit`);
                    setViewingJob(null);
                  }
                },
              }]
            : []),
        ]}
      />
    </div>
  );
}
