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
import { IconWrench } from '@/components/icons';
import { PickupKanbanCard as PickupKanbanCardType, PickupProgress } from '@/types/entities/job-task/pickup-kanban.types';
import { KanbanCardComponentProps } from '@/types/ui/kanban.types';
import { WorkshopKanbanCard } from './WorkshopKanbanCard';
import { PickupItemModal } from '@/app/(protected)/logistics/pickup-panel/PickupItemModal';
import { QuoteViewPanel } from '@/app/(protected)/quotes/QuoteViewPanel';
import { OpenDivergencyModal } from '@/components/ui/DivergencyModal/OpenDivergencyModal';
import {
  fetchWorkshopKanbanData,
  getAllowedTargetColumns,
  getTargetStatus,
  getMoveActionType,
  updateJobTaskStatus,
  fetchWorkshopPickupProgress,
} from './workshop-panel.facade';

interface PendingMove {
  card: PickupKanbanCardType;
  sourceColId: string;
  targetColId: string;
  targetStatus: string;
}

export function WorkshopPanel() {
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
  const [viewPanelId, setViewPanelId] = useState<string | null>(null);
  const [pickupModalCard, setPickupModalCard] = useState<PickupKanbanCardType | null>(null);
  const [pickupProgress, setPickupProgress] = useState<Map<string, PickupProgress>>(new Map());
  const [divergencyCard, setDivergencyCard] = useState<PickupKanbanCardType | null>(null);

  useEffect(() => {
    if (!authLoading && !canView) router.replace('/dashboard');
  }, [authLoading, canView, router]);

  const loadData = useCallback(async (search?: string) => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const cols = await fetchWorkshopKanbanData(search);
      setColumns(cols);
      const progress = await fetchWorkshopPickupProgress(cols);
      setPickupProgress(progress);
    } catch {
      toast.error('Erro ao carregar o painel da oficina.');
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

    const actionType = getMoveActionType(card.status, targetStatus);

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

  function handleViewQuote(card: PickupKanbanCardType) {
    setViewPanelId(card.quoteId);
  }

  function handleViewPickups(card: PickupKanbanCardType) {
    setPickupModalCard(card);
  }

  function handleSendToDelivery(card: PickupKanbanCardType) {
    setConfirmModal({
      card,
      sourceColId: 'col-done',
      targetColId: 'col-done',
      targetStatus: 'WAITING_DELIVER',
    });
  }

  function handleOpenDivergency(card: PickupKanbanCardType) {
    setDivergencyCard(card);
  }

  function renderCard(props: KanbanCardComponentProps<PickupKanbanCardType>) {
    return (
      <WorkshopKanbanCard
        {...props}
        isExpanded={expandedCards[props.card.id] ?? false}
        onToggleExpand={() => toggleCard(props.card.id)}
        pickupProgress={pickupProgress.get(props.card.id)}
        onViewQuoteRequest={handleViewQuote}
        onViewPickupsRequest={handleViewPickups}
        onSendToDelivery={handleSendToDelivery}
        onOpenDivergency={handleOpenDivergency}
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
        title="Oficina"
        description="Acompanhe e gerencie as manutenções de serviços."
        icon={<IconWrench size={20} />}
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
              {confirmModal.targetStatus === 'WAITING_DELIVER'
                ? <>Deseja enviar a tarefa do orçamento{' '}<span className="font-bold">#{confirmModal.card.quoteCode}</span> para entrega?</>
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

      <QuoteViewPanel
        isOpen={viewPanelId !== null}
        quoteId={viewPanelId}
        onClose={() => setViewPanelId(null)}
        onDataChanged={() => loadData(searchValue || undefined)}
        hideFinancials
      />

      {pickupModalCard && (
        <PickupItemModal
          isOpen
          onClose={() => setPickupModalCard(null)}
          card={pickupModalCard}
          onItemChanged={() => {}}
          readOnly
        />
      )}

      {divergencyCard && (
        <OpenDivergencyModal
          isOpen
          onClose={() => setDivergencyCard(null)}
          quoteId={divergencyCard.quoteId}
          onSuccess={() => {
            setDivergencyCard(null);
            loadData(searchValue || undefined);
          }}
        />
      )}
    </div>
  );
}
