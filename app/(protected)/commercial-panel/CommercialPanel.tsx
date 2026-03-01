'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useKanban } from '@/hooks/useKanban';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { KanbanBoard } from '@/components/ui/KanbanBoard/KanbanBoard';
import { KanbanFilterBar } from '@/components/ui/KanbanBoard/KanbanFilterBar';
import { Button } from '@/components/ui/Button/Button';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { SendProposalModal } from '@/components/ui/Modal/SendProposalModal';
import { TextArea } from '@/components/ui/TextArea/TextArea';
import { ItemSelectorPanel } from '@/components/ui/ItemSelector/ItemSelectorPanel';
import { IconStore, IconPlus, IconEdit, IconTrash, IconUser, IconUserCheck } from '@/components/icons';
import { QuoteKanbanCard as QuoteKanbanCardType } from '@/types/entities/quote/quote-kanban.types';
import { KanbanCardComponentProps } from '@/types/ui/kanban.types';
import { QuoteKanbanCard } from './QuoteKanbanCard';
import { QuoteViewPanel } from '@/app/(protected)/quotes/QuoteViewPanel';
import {
  fetchQuotesForKanban,
  getAllowedTargetColumns,
  getTargetStatus,
  getMoveActionType,
  updateQuoteStatus,
  sendProposalWhatsapp,
  sendProposalEmail,
  createAttendance,
  findClientByDocument,
} from './commercial-panel.facade';
import { deleteQuote } from '@/app/(protected)/quotes/quotes.facade';
import {
  fetchClients,
  getClientName,
  getClientDocument,
  Client,
} from '@/app/(protected)/clients/clients.facade';

interface PendingMove {
  card: QuoteKanbanCardType;
  sourceColId: string;
  targetColId: string;
  targetStatus: string;
}

export function CommercialPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, hasPermission, isLoading: authLoading } = useAuth();
  const canView = hasPermission('quotes', 'view');
  const canCreate = hasPermission('quotes', 'create');
  const canEdit = hasPermission('quotes', 'edit');
  const canDelete = hasPermission('quotes', 'delete');

  const {
    columns,
    setColumns,
    expandedCards,
    movingCardId,
    setMovingCardId,
    moveCard,
    revertMove,
    toggleCard,
  } = useKanban<QuoteKanbanCardType>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [showAll, setShowAll] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [confirmModal, setConfirmModal] = useState<PendingMove | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [declineModal, setDeclineModal] = useState<PendingMove | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [declineLoading, setDeclineLoading] = useState(false);
  const [viewPanelId, setViewPanelId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuoteKanbanCardType | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sendProposalModal, setSendProposalModal] = useState<PendingMove | null>(null);
  const [sendProposalLoading, setSendProposalLoading] = useState(false);

  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [clientSearchValue, setClientSearchValue] = useState('');
  const [clientResults, setClientResults] = useState<Client[]>([]);
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [selectedAttendanceClient, setSelectedAttendanceClient] = useState<Client | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const clientDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [newClientConfirm, setNewClientConfirm] = useState<{ id: string; name: string } | null>(null);
  const [newClientConfirmLoading, setNewClientConfirmLoading] = useState(false);

  const [editBeforeMoveModal, setEditBeforeMoveModal] = useState<{ quoteId: string; quoteCode: number } | null>(null);
  const [moveAfterEditConfirm, setMoveAfterEditConfirm] = useState<{ quoteId: string; quoteCode: number } | null>(null);
  const [moveAfterEditLoading, setMoveAfterEditLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !canView) router.replace('/dashboard');
  }, [authLoading, canView, router]);

  useEffect(() => {
    const newClientDoc = searchParams.get('newClientDoc');
    const newClientName = searchParams.get('newClientName');
    const editedQuoteId = searchParams.get('editedQuoteId');
    const editedQuoteCode = searchParams.get('editedQuoteCode');

    if (editedQuoteId && editedQuoteCode) {
      window.history.replaceState({}, '', '/commercial-panel');
      setMoveAfterEditConfirm({
        quoteId: editedQuoteId,
        quoteCode: Number(editedQuoteCode),
      });
      return;
    }

    if (newClientDoc && newClientName) {
      window.history.replaceState({}, '', '/commercial-panel');
      findClientByDocument(newClientDoc)
        .then((result) => {
          if (result) {
            setNewClientConfirm({ id: result.id, name: result.name });
          } else {
            toast.error('Cliente criado, mas não foi possível localizá-lo para criar o atendimento.');
          }
        })
        .catch(() => {
          toast.error('Erro ao buscar cliente criado.');
        });
    }
  }, [searchParams]);

  const loadData = useCallback(async (search?: string) => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const cols = await fetchQuotesForKanban(search);
      setColumns(cols);
    } catch {
      toast.error('Erro ao carregar o painel comercial.');
    } finally {
      setIsLoading(false);
    }
  }, [canView, setColumns]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      loadData(value || undefined);
    }, 500);
  }

  const loadClientSearch = useCallback(async (search: string) => {
    setClientSearchLoading(true);
    try {
      const res = await fetchClients({ perPage: 10, search: search || undefined });
      setClientResults(res.data);
    } catch {
      toast.error('Erro ao buscar clientes.');
    } finally {
      setClientSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!clientSearchOpen) return;
    if (clientDebounceRef.current) clearTimeout(clientDebounceRef.current);

    if (clientSearchValue.length === 0) {
      loadClientSearch('');
    } else if (clientSearchValue.length >= 2) {
      clientDebounceRef.current = setTimeout(() => {
        loadClientSearch(clientSearchValue);
      }, 400);
    }

    return () => {
      if (clientDebounceRef.current) clearTimeout(clientDebounceRef.current);
    };
  }, [clientSearchValue, clientSearchOpen, loadClientSearch]);

  function handleOpenClientSearch() {
    setClientSearchValue('');
    setSelectedAttendanceClient(null);
    setClientResults([]);
    setClientSearchOpen(true);
  }

  function handleSelectAttendanceClient(client: Client) {
    setSelectedAttendanceClient((prev) => prev?.id === client.id ? null : client);
  }

  async function handleCreateAttendance() {
    if (!selectedAttendanceClient) return;
    setAttendanceLoading(true);
    try {
      await toast.promise(createAttendance(selectedAttendanceClient.id), {
        loading: 'Criando atendimento...',
        success: 'Atendimento criado com sucesso.',
        error: (err: unknown) =>
          (err as { response?: { data?: { detail?: { message?: string } } } })
            ?.response?.data?.detail?.message ?? 'Erro ao criar atendimento.',
      });
      setClientSearchOpen(false);
      setSelectedAttendanceClient(null);
      await loadData(searchValue || undefined);
    } catch {
      //
    } finally {
      setAttendanceLoading(false);
    }
  }

  async function handleNewClientConfirm() {
    if (!newClientConfirm) return;
    setNewClientConfirmLoading(true);
    try {
      await toast.promise(createAttendance(newClientConfirm.id), {
        loading: 'Criando atendimento...',
        success: 'Atendimento criado com sucesso.',
        error: (err: unknown) =>
          (err as { response?: { data?: { detail?: { message?: string } } } })
            ?.response?.data?.detail?.message ?? 'Erro ao criar atendimento.',
      });
      await loadData(searchValue || undefined);
    } catch {
      //
    } finally {
      setNewClientConfirmLoading(false);
      setNewClientConfirm(null);
    }
  }

  async function handleMoveAfterEdit() {
    if (!moveAfterEditConfirm) return;
    setMoveAfterEditLoading(true);
    try {
      await toast.promise(
        updateQuoteStatus(moveAfterEditConfirm.quoteId, 'PENDING_APPROVAL'),
        {
          loading: 'Movendo orçamento...',
          success: 'Orçamento movido para Orçamento com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao mover orçamento.',
        }
      );
      await loadData(searchValue || undefined);
    } catch {
      //
    } finally {
      setMoveAfterEditLoading(false);
      setMoveAfterEditConfirm(null);
    }
  }

  async function executeMoveWithApi(
    card: QuoteKanbanCardType,
    sourceColId: string,
    targetColId: string,
    targetStatus: string,
    body?: { reason: string }
  ) {
    setMovingCardId(card.id);
    moveCard(card.id, sourceColId, targetColId, targetStatus);

    try {
      await toast.promise(
        updateQuoteStatus(card.id, targetStatus, body),
        {
          loading: 'Movendo orçamento...',
          success: 'Orçamento movido com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao mover orçamento.',
        }
      );
    } catch {
      revertMove(card.id, sourceColId, targetColId);
    } finally {
      setMovingCardId(null);
    }
  }

  function handleCardDrop(
    card: QuoteKanbanCardType,
    sourceColId: string,
    targetColId: string
  ) {
    const targetStatus = getTargetStatus(card.status, targetColId);
    if (!targetStatus) return;

    const actionType = getMoveActionType(card.status, targetStatus);

    if (actionType === 'edit_first') {
      setEditBeforeMoveModal({ quoteId: card.id, quoteCode: card.quoteCode });
      return;
    }

    if (actionType === 'send_proposal') {
      setSendProposalModal({ card, sourceColId, targetColId, targetStatus });
      return;
    }

    if (actionType === 'confirm') {
      setConfirmModal({ card, sourceColId, targetColId, targetStatus });
      return;
    }

    if (actionType === 'reason') {
      setDeclineModal({ card, sourceColId, targetColId, targetStatus });
      setDeclineReason('');
      return;
    }

    executeMoveWithApi(card, sourceColId, targetColId, targetStatus);
  }

  async function handleConfirmMove() {
    if (!confirmModal) return;
    setConfirmLoading(true);
    await executeMoveWithApi(
      confirmModal.card,
      confirmModal.sourceColId,
      confirmModal.targetColId,
      confirmModal.targetStatus
    );
    setConfirmLoading(false);
    setConfirmModal(null);
  }

  async function handleDeclineConfirm() {
    if (!declineModal || !declineReason.trim()) return;
    setDeclineLoading(true);
    await executeMoveWithApi(
      declineModal.card,
      declineModal.sourceColId,
      declineModal.targetColId,
      declineModal.targetStatus,
      { reason: declineReason.trim() }
    );
    setDeclineLoading(false);
    setDeclineModal(null);
    setDeclineReason('');
  }

  async function handleSkipAndMove() {
    if (!sendProposalModal) return;
    setSendProposalModal(null);
    await executeMoveWithApi(
      sendProposalModal.card,
      sendProposalModal.sourceColId,
      sendProposalModal.targetColId,
      sendProposalModal.targetStatus
    );
  }

  async function handleSendAndMove(
    selectedEmails: string[],
    selectedPhones: string[],
    includePhotos: boolean
  ) {
    if (!sendProposalModal) return;
    const { card, sourceColId, targetColId, targetStatus } = sendProposalModal;
    setSendProposalLoading(true);
    setSendProposalModal(null);

    setMovingCardId(card.id);
    moveCard(card.id, sourceColId, targetColId, targetStatus);

    try {
      await toast.promise(updateQuoteStatus(card.id, targetStatus), {
        loading: 'Movendo orçamento...',
        success: 'Orçamento movido com sucesso.',
        error: (err: unknown) =>
          (err as { response?: { data?: { detail?: { message?: string } } } })
            ?.response?.data?.detail?.message ?? 'Erro ao mover orçamento.',
      });
    } catch {
      revertMove(card.id, sourceColId, targetColId);
      setMovingCardId(null);
      setSendProposalLoading(false);
      return;
    }

    setMovingCardId(null);

    try {
      if (selectedPhones.length > 0) {
        await toast.promise(
          sendProposalWhatsapp(card.id, selectedPhones, includePhotos),
          {
            loading: 'Enviando proposta via WhatsApp...',
            success: 'Proposta enviada via WhatsApp.',
            error: (err: unknown) => {
              const msg =
                (err as { response?: { data?: { detail?: { message?: string } } } })
                  ?.response?.data?.detail?.message ?? 'Erro ao enviar proposta via WhatsApp.';
              return msg;
            },
          }
        );
      }

      if (selectedEmails.length > 0) {
        await toast.promise(
          sendProposalEmail(card.id, selectedEmails, includePhotos),
          {
            loading: 'Enviando proposta via e-mail...',
            success: 'Proposta enviada via e-mail.',
            error: (err: unknown) => {
              const msg =
                (err as { response?: { data?: { detail?: { message?: string } } } })
                  ?.response?.data?.detail?.message ?? 'Erro ao enviar proposta via e-mail.';
              return msg;
            },
          }
        );
      }
    } catch {
      setMovingCardId(card.id);
      moveCard(card.id, targetColId, sourceColId, card.status);
      try {
        await toast.promise(updateQuoteStatus(card.id, card.status), {
          loading: 'Revertendo status do orçamento...',
          success: 'Orçamento revertido para orçamento.',
          error: 'Erro ao reverter o status do orçamento.',
        });
      } catch {
        // toast já exibido pelo toast.promise acima
      }
      setMovingCardId(null);
      setSendProposalLoading(false);
      return;
    }

    setSendProposalLoading(false);
  }

  function handleDeclineRequest(card: QuoteKanbanCardType) {
    const sourceColId = columns.find((col) =>
      col.cards.some((c) => c.id === card.id)
    )?.id;
    if (!sourceColId) return;

    const targetColId = columns.find((col) =>
      col.statuses.includes('PENDING_APPROVAL')
    )?.id;
    if (!targetColId) return;

    setDeclineModal({
      card,
      sourceColId,
      targetColId,
      targetStatus: 'DECLINED',
    });
    setDeclineReason('');
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await toast.promise(deleteQuote(deleteTarget.id), {
        loading: 'Excluindo orçamento...',
        success: 'Orçamento excluído com sucesso.',
        error: 'Erro ao excluir orçamento.',
      });
      await loadData(searchValue || undefined);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  function renderCard(props: KanbanCardComponentProps<QuoteKanbanCardType>) {
    return (
      <QuoteKanbanCard
        {...props}
        isExpanded={expandedCards[props.card.id] ?? false}
        onToggleExpand={() => toggleCard(props.card.id)}
        onDeclineRequest={handleDeclineRequest}
        onViewRequest={(card) => setViewPanelId(card.id)}
        onEditRequest={canEdit ? (card) => {
          if (card.status === 'IN_ATTENDANCE') {
            router.push(`/quotes/${card.id}/edit?returnTo=${encodeURIComponent(`/commercial-panel?editedQuoteId=${card.id}&editedQuoteCode=${card.quoteCode}`)}`);
          } else {
            router.push(`/quotes/${card.id}/edit?returnTo=/commercial-panel`);
          }
        } : undefined}
        onDeleteRequest={canDelete ? (card) => setDeleteTarget(card) : undefined}
      />
    );
  }

  if (authLoading || (!authLoading && !canView)) return null;

  const attendanceHeaderAction = canCreate ? (
    <button
      type="button"
      onClick={handleOpenClientSearch}
      className="w-6 h-6 flex items-center justify-center rounded-md bg-primary text-primary-fg hover:bg-primary/90 transition-colors"
      title="Criar atendimento"
    >
      <IconPlus size={14} />
    </button>
  ) : undefined;

  const displayColumns = (showAll
    ? columns
    : columns.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.creatorId === user?.id),
      }))
  ).map((col) => ({
    ...col,
    headerAction: col.id === 'col-attendance' ? attendanceHeaderAction : undefined,
  }));

  const userCardCount = columns.reduce(
    (acc, col) => acc + col.cards.filter((c) => c.creatorId === user?.id).length,
    0
  );

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Painel Comercial"
        description="Acompanhe e gerencie os orçamentos e pedidos em andamento."
        icon={<IconStore size={20} />}
      />

      <KanbanFilterBar
        user={user}
        showAllActive={showAll}
        onToggleShowAll={() => setShowAll((prev) => !prev)}
        userCardCount={userCardCount}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Pesquisar orçamento..."
        action={
          canCreate ? (
            <Button
              variant="primary"
              iconLeft={<IconPlus size={16} />}
              onClick={() => router.push('/quotes/create?returnTo=/commercial-panel')}
            >
              Criar Orçamento
            </Button>
          ) : undefined
        }
      />

      <KanbanBoard<QuoteKanbanCardType>
        columns={displayColumns}
        renderCard={renderCard}
        isLoading={isLoading}
        getAllowedTargetColumns={getAllowedTargetColumns}
        onCardDrop={handleCardDrop}
        movingCardId={movingCardId}
        emptyMessage="Nenhum orçamento"
        emptyDescription="Não há orçamentos com este status"
      />

      <QuoteViewPanel
        isOpen={viewPanelId !== null}
        quoteId={viewPanelId}
        onClose={() => setViewPanelId(null)}
        footerButtons={(() => {
          const viewCard = columns.flatMap((c) => c.cards).find((c) => c.id === viewPanelId);
          const isApproved = viewCard?.status === 'APPROVED';
          return [
            ...(canDelete
              ? [{
                  label: 'Excluir',
                  variant: 'destructive' as const,
                  icon: <IconTrash size={16} />,
                  onClick: () => {
                    if (viewCard) { setDeleteTarget(viewCard); setViewPanelId(null); }
                  },
                }]
              : []),
            ...(canEdit && !isApproved
              ? [{
                  label: 'Editar orçamento',
                  variant: 'primary' as const,
                  icon: <IconEdit size={16} />,
                  onClick: () => {
                    if (viewPanelId && viewCard) {
                      const isAttendance = viewCard.status === 'IN_ATTENDANCE';
                      const returnUrl = isAttendance
                        ? `/commercial-panel?editedQuoteId=${viewCard.id}&editedQuoteCode=${viewCard.quoteCode}`
                        : '/commercial-panel';
                      router.push(`/quotes/${viewPanelId}/edit?returnTo=${encodeURIComponent(returnUrl)}`);
                      setViewPanelId(null);
                    }
                  },
                }]
              : []),
          ];
        })()}
      />

      {sendProposalModal && (
        <SendProposalModal
          isOpen
          onClose={() => setSendProposalModal(null)}
          quoteId={sendProposalModal.card.id}
          quoteCode={sendProposalModal.card.quoteCode}
          clientName={sendProposalModal.card.clientName}
          clientId={sendProposalModal.card.clientId}
          onSkipAndMove={handleSkipAndMove}
          onSendAndMove={handleSendAndMove}
          sendLoading={sendProposalLoading}
        />
      )}

      <ModalConfirm
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        variant="info"
        title="Mover orçamento"
        description={
          confirmModal ? (
            <>
              Deseja mover o orçamento{' '}
              <span className="font-bold">#{confirmModal.card.quoteCode}</span> para a
              próxima etapa?
            </>
          ) : ''
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmMove}
        confirmLoading={confirmLoading}
      />

      <ModalConfirm
        isOpen={!!declineModal}
        onClose={() => {
          setDeclineModal(null);
          setDeclineReason('');
        }}
        variant="danger"
        title="Recusar proposta"
        description={
          declineModal ? (
            <>
              Informe o motivo da recusa do orçamento{' '}
              <span className="font-bold">#{declineModal.card.quoteCode}</span>.
            </>
          ) : ''
        }
        confirmLabel="Recusar proposta"
        cancelLabel="Cancelar"
        onConfirm={handleDeclineConfirm}
        confirmLoading={declineLoading}
      >
        <div className="mt-(--spacing-sm)">
          <TextArea
            label="Motivo da recusa"
            required
            placeholder="Descreva o motivo da recusa da proposta..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={4}
          />
        </div>
      </ModalConfirm>

      <ModalConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        variant="danger"
        title="Excluir orçamento"
        description={
          deleteTarget ? (
            <>
              Deseja excluir permanentemente o orçamento{' '}
              <span className="font-bold">#{deleteTarget.quoteCode}</span>? Esta ação não pode ser desfeita.
            </>
          ) : ''
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        confirmLoading={deleteLoading}
        requireConfirmation
        requireConfirmationLabel="Confirmo que desejo excluir este orçamento"
      />

      <ItemSelectorPanel<Client>
        isOpen={clientSearchOpen}
        onClose={() => {
          setClientSearchOpen(false);
          setSelectedAttendanceClient(null);
          setClientSearchValue('');
        }}
        title="Selecionar Cliente"
        items={clientResults}
        isLoading={clientSearchLoading}
        selectedIds={selectedAttendanceClient ? [selectedAttendanceClient.id] : []}
        onToggle={handleSelectAttendanceClient}
        getId={(c) => c.id}
        renderItem={(c) => (
          <div>
            <h3 className="font-bold text-sm text-foreground">{getClientName(c)}</h3>
            <p className="text-xs text-muted mt-0.5">
              {getClientDocument(c)}
              {c.identity.supplier && ' · Fornecedor'}
            </p>
          </div>
        )}
        searchValue={clientSearchValue}
        onSearchChange={setClientSearchValue}
        mode="single"
        closeOnSelect={false}
        footerButtons={[
          {
            label: 'Criar Atendimento',
            variant: 'primary',
            icon: <IconPlus size={16} />,
            onClick: handleCreateAttendance,
            disabled: !selectedAttendanceClient || attendanceLoading,
          },
        ]}
        noResultsContent={
          clientSearchValue.length >= 2 ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted text-center mb-2">
                Nenhum cliente encontrado. Deseja criar um novo?
              </p>
              <Button
                variant="primary"
                fullWidth
                iconLeft={<IconUser size={16} />}
                onClick={() => {
                  setClientSearchOpen(false);
                  router.push('/clients/create?returnTo=/commercial-panel&fromKanban=true');
                }}
              >
                Criar Cliente Completo
              </Button>
              <Button
                variant="outline"
                fullWidth
                iconLeft={<IconUserCheck size={16} />}
                onClick={() => {
                  setClientSearchOpen(false);
                  router.push('/clients/create?returnTo=/commercial-panel&fromKanban=true&prospection=true');
                }}
              >
                Criar Cliente em Prospecção
              </Button>
            </div>
          ) : undefined
        }
      />

      <ModalConfirm
        isOpen={!!newClientConfirm}
        onClose={() => setNewClientConfirm(null)}
        variant="info"
        title="Criar Atendimento"
        description={
          newClientConfirm ? (
            <>
              Deseja criar um atendimento para o cliente{' '}
              <span className="font-bold">{newClientConfirm.name}</span>?
            </>
          ) : ''
        }
        confirmLabel="Criar Atendimento"
        cancelLabel="Cancelar"
        onConfirm={handleNewClientConfirm}
        confirmLoading={newClientConfirmLoading}
      />

      <ModalConfirm
        isOpen={!!editBeforeMoveModal}
        onClose={() => setEditBeforeMoveModal(null)}
        variant="info"
        title="Editar orçamento"
        description={
          editBeforeMoveModal ? (
            <>
              O orçamento{' '}
              <span className="font-bold">#{editBeforeMoveModal.quoteCode}</span> está em
              atendimento e precisa ser preenchido antes de ser movido para Orçamento.
              Deseja editar agora?
            </>
          ) : ''
        }
        confirmLabel="Editar orçamento"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (editBeforeMoveModal) {
            const returnUrl = `/commercial-panel?editedQuoteId=${editBeforeMoveModal.quoteId}&editedQuoteCode=${editBeforeMoveModal.quoteCode}`;
            router.push(`/quotes/${editBeforeMoveModal.quoteId}/edit?returnTo=${encodeURIComponent(returnUrl)}`);
            setEditBeforeMoveModal(null);
          }
        }}
      />

      <ModalConfirm
        isOpen={!!moveAfterEditConfirm}
        onClose={() => setMoveAfterEditConfirm(null)}
        variant="info"
        title="Mover para Orçamento"
        description={
          moveAfterEditConfirm ? (
            <>
              Deseja mover o orçamento{' '}
              <span className="font-bold">#{moveAfterEditConfirm.quoteCode}</span> para a
              coluna Orçamento?
            </>
          ) : ''
        }
        confirmLabel="Mover para Orçamento"
        cancelLabel="Cancelar"
        onConfirm={handleMoveAfterEdit}
        confirmLoading={moveAfterEditLoading}
      />
    </div>
  );
}
