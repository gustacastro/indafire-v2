'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useKanban } from '@/hooks/useKanban';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { KanbanBoard } from '@/components/ui/KanbanBoard/KanbanBoard';
import { KanbanFilterBar } from '@/components/ui/KanbanBoard/KanbanFilterBar';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { IconTruck } from '@/components/icons';
import { PickupKanbanCard as PickupKanbanCardType, PickupProgress } from '@/types/entities/job-task/pickup-kanban.types';
import { KanbanCardComponentProps } from '@/types/ui/kanban.types';
import { PickupKanbanCard } from './PickupKanbanCard';
import { PickupScheduleModal } from './PickupScheduleModal';
import { StartRouteModal } from './StartRouteModal';
import { PickupItemModal } from './PickupItemModal';
import { QuoteViewPanel } from '@/app/(protected)/quotes/QuoteViewPanel';
import {
  fetchPickupKanbanData,
  getAllowedTargetColumns,
  getTargetStatus,
  getMoveActionType,
  updateJobTaskStatus,
  schedulePickup,
  fetchAllPickupProgress,
} from './pickup-panel.facade';

interface PendingMove {
  card: PickupKanbanCardType;
  sourceColId: string;
  targetColId: string;
  targetStatus: string;
}

interface ScheduleModalState {
  quoteJobId: string;
  serviceName: string;
  amount: number;
  clientName: string;
  currentDate: string | null;
}

export function PickupPanel() {
  const router = useRouter();
  const { user, hasPermission, isLoading: authLoading } = useAuth();
  const canView = hasPermission('job_tasks', 'view');

  const {
    columns,
    setColumns,
    expandedCards,
    movingCardId,
    setMovingCardId,
    moveCard,
    revertMove,
    toggleCard,
  } = useKanban<PickupKanbanCardType>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [showAll, setShowAll] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [confirmModal, setConfirmModal] = useState<PendingMove | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [routeModal, setRouteModal] = useState<PendingMove | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [scheduleModal, setScheduleModal] = useState<ScheduleModalState | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [viewPanelId, setViewPanelId] = useState<string | null>(null);
  const [pickupProgress, setPickupProgress] = useState<Map<string, PickupProgress>>(new Map());
  const [pickupModalCard, setPickupModalCard] = useState<PickupKanbanCardType | null>(null);

  useEffect(() => {
    if (!authLoading && !canView) router.replace('/dashboard');
  }, [authLoading, canView, router]);

  const loadData = useCallback(async (search?: string) => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const cols = await fetchPickupKanbanData(search);
      setColumns(cols);
      const progress = await fetchAllPickupProgress(cols);
      setPickupProgress(progress);
    } catch {
      toast.error('Erro ao carregar o painel de retirada.');
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

  async function executeMoveWithApi(
    card: PickupKanbanCardType,
    sourceColId: string,
    targetColId: string,
    targetStatus: string
  ) {
    setMovingCardId(card.id);
    moveCard(card.id, sourceColId, targetColId, targetStatus);

    try {
      await toast.promise(
        updateJobTaskStatus(card.id, targetStatus),
        {
          loading: 'Movendo tarefa...',
          success: 'Tarefa movida com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao mover tarefa.',
        }
      );
    } catch {
      revertMove(card.id, sourceColId, targetColId);
    } finally {
      setMovingCardId(null);
    }
  }

  function handleCardDrop(
    card: PickupKanbanCardType,
    sourceColId: string,
    targetColId: string
  ) {
    const targetStatus = getTargetStatus(card.status, targetColId);
    if (!targetStatus) return;

    if (targetStatus === 'PICKUP_DONE' && card.status === 'EXECUTING_PICKUP') {
      const progress = pickupProgress.get(card.id);
      if (!progress || progress.picked < progress.total) {
        toast.error('Retire todos os itens antes de concluir a retirada.');
        return;
      }
    }

    const actionType = getMoveActionType(card.status, targetStatus);

    if (actionType === 'confirm') {
      setConfirmModal({ card, sourceColId, targetColId, targetStatus });
      return;
    }

    if (actionType === 'route') {
      setRouteModal({ card, sourceColId, targetColId, targetStatus });
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
    await loadData(searchValue || undefined);
  }

  async function handleStartRoute(openMap: boolean) {
    if (!routeModal) return;
    setRouteLoading(true);
    if (openMap && (routeModal.card.address.street || routeModal.card.address.city)) {
      const { buildGoogleMapsUrl } = await import('@/app/(protected)/clients/clients.facade');
      window.open(buildGoogleMapsUrl(routeModal.card.address), '_blank');
    }
    await executeMoveWithApi(
      routeModal.card,
      routeModal.sourceColId,
      routeModal.targetColId,
      routeModal.targetStatus
    );
    setRouteLoading(false);
    setRouteModal(null);
  }

  function handleScheduleRequest(card: PickupKanbanCardType) {
    setScheduleModal({
      quoteJobId: card.quoteJobId,
      serviceName: card.serviceName,
      amount: card.amount,
      clientName: card.clientName,
      currentDate: card.pickupScheduleDate,
    });
  }

  async function handleScheduleConfirm(date: string) {
    if (!scheduleModal) return;
    setScheduleLoading(true);
    try {
      await toast.promise(
        schedulePickup(scheduleModal.quoteJobId, date),
        {
          loading: 'Agendando retirada...',
          success: 'Retirada agendada com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao agendar retirada.',
        }
      );
      setScheduleModal(null);
      await loadData(searchValue || undefined);
    } catch {
      //
    } finally {
      setScheduleLoading(false);
    }
  }

  function handleViewQuote(card: PickupKanbanCardType) {
    setViewPanelId(card.quoteId);
  }

  function handlePickupRequest(card: PickupKanbanCardType) {
    setPickupModalCard(card);
  }

  function handleViewPickups(card: PickupKanbanCardType) {
    setPickupModalCard(card);
  }

  function handleSendToWorkshop(card: PickupKanbanCardType) {
    setConfirmModal({
      card,
      sourceColId: 'col-done',
      targetColId: 'col-done',
      targetStatus: 'WAITING_MAINTENANCE',
    });
  }

  async function handlePickupItemChanged() {
    const progress = await fetchAllPickupProgress(columns);
    setPickupProgress(progress);
  }

  function renderCard(props: KanbanCardComponentProps<PickupKanbanCardType>) {
    return (
      <PickupKanbanCard
        {...props}
        isExpanded={expandedCards[props.card.id] ?? false}
        onToggleExpand={() => toggleCard(props.card.id)}
        pickupProgress={pickupProgress.get(props.card.id)}
        onScheduleRequest={handleScheduleRequest}
        onViewQuoteRequest={handleViewQuote}
        onPickupRequest={handlePickupRequest}
        onViewPickupsRequest={handleViewPickups}
        onSendToWorkshop={handleSendToWorkshop}
      />
    );
  }

  if (authLoading || (!authLoading && !canView)) return null;

  const displayColumns = showAll
    ? columns
    : columns.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.creatorId === user?.id),
      }));

  const userCardCount = columns.reduce(
    (acc, col) => acc + col.cards.filter((c) => c.creatorId === user?.id).length,
    0
  );

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Painel de Retirada"
        description="Acompanhe e gerencie as retiradas de serviços."
        icon={<IconTruck size={20} />}
      />

      <KanbanFilterBar
        user={user}
        showAllActive={showAll}
        onToggleShowAll={() => setShowAll((prev) => !prev)}
        userCardCount={userCardCount}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Pesquisar por cliente, código ou serviço..."
      />

      <KanbanBoard<PickupKanbanCardType>
        columns={displayColumns}
        renderCard={renderCard}
        isLoading={isLoading}
        getAllowedTargetColumns={getAllowedTargetColumns}
        onCardDrop={handleCardDrop}
        movingCardId={movingCardId}
        emptyMessage="Nenhuma tarefa"
        emptyDescription="Não há tarefas com este status"
      />

      <ModalConfirm
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        variant="info"
        title="Mover tarefa"
        description={
          confirmModal ? (
            <>
              {confirmModal.targetStatus === 'WAITING_MAINTENANCE'
                ? <>Deseja enviar a tarefa do orçamento{' '}<span className="font-bold">#{confirmModal.card.quoteCode}</span> para a oficina?</>
                : <>Deseja mover a tarefa do orçamento{' '}<span className="font-bold">#{confirmModal.card.quoteCode}</span> para a próxima etapa?</>
              }
            </>
          ) : ''
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmMove}
        confirmLoading={confirmLoading}
      />

      {scheduleModal && (
        <PickupScheduleModal
          isOpen
          onClose={() => setScheduleModal(null)}
          onConfirm={handleScheduleConfirm}
          serviceName={scheduleModal.serviceName}
          amount={scheduleModal.amount}
          clientName={scheduleModal.clientName}
          currentDate={scheduleModal.currentDate}
          loading={scheduleLoading}
        />
      )}

      {routeModal && (
        <StartRouteModal
          isOpen
          onClose={() => setRouteModal(null)}
          onConfirm={handleStartRoute}
          card={routeModal.card}
          loading={routeLoading}
        />
      )}

      <QuoteViewPanel
        isOpen={viewPanelId !== null}
        quoteId={viewPanelId}
        onClose={() => setViewPanelId(null)}
        hideFinancials
      />

      {pickupModalCard && (
        <PickupItemModal
          isOpen
          onClose={() => setPickupModalCard(null)}
          card={pickupModalCard}
          onItemChanged={handlePickupItemChanged}
          onMoveCard={() => {
            const card = pickupModalCard;
            setPickupModalCard(null);
            if (card.status === 'EXECUTING_PICKUP') {
              handleCardDrop(card, 'col-executing', 'col-done');
            }
          }}
        />
      )}
    </div>
  );
}
