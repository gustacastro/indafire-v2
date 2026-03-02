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
import { PickupKanbanCard as PickupKanbanCardType, DeliveryProgress } from '@/types/entities/job-task/pickup-kanban.types';
import { KanbanCardComponentProps } from '@/types/ui/kanban.types';
import { DeliveryKanbanCard } from './DeliveryKanbanCard';
import { DeliveryItemModal } from './DeliveryItemModal';
import { StartRouteModal } from '@/app/(protected)/logistics/pickup-panel/StartRouteModal';
import { PickupItemModal } from '@/app/(protected)/logistics/pickup-panel/PickupItemModal';
import { QuoteViewPanel } from '@/app/(protected)/quotes/QuoteViewPanel';
import {
  fetchDeliveryKanbanData,
  getAllowedTargetColumns,
  getTargetStatus,
  getMoveActionType,
  updateJobTaskStatus,
  updateProductTaskStatus,
  fetchDeliveryProgress,
} from './delivery-panel.facade';

interface PendingMove {
  card: PickupKanbanCardType;
  sourceColId: string;
  targetColId: string;
  targetStatus: string;
}

export function DeliveryPanel() {
  const router = useRouter();
  const { user, hasPermission, isLoading: authLoading } = useAuth();
  const canViewJobs = hasPermission('job_tasks', 'view');
  const canViewProducts = hasPermission('product_tasks', 'view');
  const canView = canViewJobs || canViewProducts;

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
  const [viewPanelId, setViewPanelId] = useState<string | null>(null);
  const [deliveryProgress, setDeliveryProgress] = useState<Map<string, DeliveryProgress>>(new Map());
  const [deliveryModalCard, setDeliveryModalCard] = useState<PickupKanbanCardType | null>(null);
  const [pickupModalCard, setPickupModalCard] = useState<PickupKanbanCardType | null>(null);

  useEffect(() => {
    if (!authLoading && !canView) router.replace('/dashboard');
  }, [authLoading, canView, router]);

  const loadData = useCallback(async (search?: string) => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const cols = await fetchDeliveryKanbanData(search);
      setColumns(cols);
      const progress = await fetchDeliveryProgress(cols);
      setDeliveryProgress(progress);
    } catch {
      toast.error('Erro ao carregar o painel de entrega.');
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

  async function executeStatusUpdate(card: PickupKanbanCardType, targetStatus: string): Promise<void> {
    if (card.cardType === 'product') {
      await updateProductTaskStatus(card.id, targetStatus);
    } else {
      await updateJobTaskStatus(card.id, targetStatus);
    }
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
        executeStatusUpdate(card, targetStatus),
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

    if (targetStatus === 'DELIVERED' && card.cardType === 'job' && card.requiresPickup) {
      const progress = deliveryProgress.get(card.id);
      if (!progress || progress.delivered < progress.total) {
        toast.error('Entregue todos os itens antes de concluir a entrega.');
        return;
      }
    }

    const actionType = getMoveActionType(card.status, targetStatus);

    if (actionType === 'route') {
      setRouteModal({ card, sourceColId, targetColId, targetStatus });
      return;
    }

    if (actionType === 'confirm') {
      setConfirmModal({ card, sourceColId, targetColId, targetStatus });
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

  function handleViewQuote(card: PickupKanbanCardType) {
    setViewPanelId(card.quoteId);
  }

  function handleViewPickups(card: PickupKanbanCardType) {
    setPickupModalCard(card);
  }

  function handleDeliverRequest(card: PickupKanbanCardType) {
    setDeliveryModalCard(card);
  }

  async function handleDeliveryItemChanged() {
    const progress = await fetchDeliveryProgress(columns);
    setDeliveryProgress(progress);
  }

  function renderCard(props: KanbanCardComponentProps<PickupKanbanCardType>) {
    return (
      <DeliveryKanbanCard
        {...props}
        isExpanded={expandedCards[props.card.id] ?? false}
        onToggleExpand={() => toggleCard(props.card.id)}
        deliveryProgress={deliveryProgress.get(props.card.id)}
        onViewQuoteRequest={handleViewQuote}
        onViewPickupsRequest={handleViewPickups}
        onDeliverRequest={handleDeliverRequest}
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
        title="Painel de Entrega"
        description="Acompanhe e gerencie as entregas de serviços e produtos."
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
              Deseja mover a tarefa do orçamento{' '}
              <span className="font-bold">#{confirmModal.card.quoteCode}</span> para a próxima etapa?
            </>
          ) : ''
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmMove}
        confirmLoading={confirmLoading}
      />

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

      {deliveryModalCard && (
        <DeliveryItemModal
          isOpen
          onClose={() => setDeliveryModalCard(null)}
          card={deliveryModalCard}
          onItemChanged={handleDeliveryItemChanged}
          onMoveCard={() => {
            const card = deliveryModalCard;
            setDeliveryModalCard(null);
            if (card.status === 'IN_DELIVER_ROUTE') {
              handleCardDrop(card, 'col-in-route', 'col-delivered');
            }
          }}
        />
      )}

      {pickupModalCard && (
        <PickupItemModal
          isOpen
          onClose={() => setPickupModalCard(null)}
          card={pickupModalCard}
          onItemChanged={() => {}}
          readOnly
        />
      )}
    </div>
  );
}
