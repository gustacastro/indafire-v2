import { KanbanColumnConfig, KanbanMoveActionType } from '@/types/ui/kanban.types';
import {
  PickupKanbanCard,
  PickupProgress,
  PickupItemResponse,
} from '@/types/entities/job-task/pickup-kanban.types';
import {
  fetchJobTaskCards,
  updateJobTaskStatus,
  fetchPickupItems,
  fetchAllPickupProgress as fetchProgressBase,
} from '@/app/(protected)/logistics/pickup-panel/pickup-panel.facade';

export type WorkshopColumnColor = 'default' | 'warning' | 'success';

interface ColumnDefinition {
  id: string;
  title: string;
  statuses: string[];
  color: WorkshopColumnColor;
}

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  { id: 'col-waiting', title: 'A Executar Manutenção', statuses: ['WAITING_MAINTENANCE'], color: 'default' },
  { id: 'col-executing', title: 'Manutenção em Execução', statuses: ['IN_MAINTENANCE'], color: 'warning' },
  { id: 'col-done', title: 'Manutenção Concluída', statuses: ['MAINTENANCE_DONE'], color: 'success' },
];

const WORKSHOP_MOVE_RULES: Record<string, string[]> = {
  WAITING_MAINTENANCE: ['IN_MAINTENANCE'],
  IN_MAINTENANCE: ['MAINTENANCE_DONE'],
  MAINTENANCE_DONE: [],
};

const MOVE_ACTIONS: Record<string, KanbanMoveActionType> = {
  'WAITING_MAINTENANCE->IN_MAINTENANCE': 'confirm',
  'IN_MAINTENANCE->MAINTENANCE_DONE': 'confirm',
};

export async function fetchWorkshopKanbanData(
  search?: string
): Promise<KanbanColumnConfig<PickupKanbanCard>[]> {
  const cards = await fetchJobTaskCards(search);

  return COLUMN_DEFINITIONS.map((def) => ({
    ...def,
    cards: cards.filter((card) => def.statuses.includes(card.status)),
  }));
}

export function getAllowedTargetColumns(cardStatus: string): string[] {
  const allowedStatuses = WORKSHOP_MOVE_RULES[cardStatus] ?? [];
  if (allowedStatuses.length === 0) return [];

  return COLUMN_DEFINITIONS.filter((col) =>
    col.statuses.some((s) => allowedStatuses.includes(s))
  ).map((col) => col.id);
}

export function getTargetStatus(
  sourceStatus: string,
  targetColId: string
): string | null {
  const allowedStatuses = WORKSHOP_MOVE_RULES[sourceStatus] ?? [];
  const targetCol = COLUMN_DEFINITIONS.find((c) => c.id === targetColId);
  if (!targetCol) return null;

  const matchingStatus = targetCol.statuses.find((s) => allowedStatuses.includes(s));
  return matchingStatus ?? null;
}

export function getMoveActionType(
  sourceStatus: string,
  targetStatus: string
): KanbanMoveActionType {
  const key = `${sourceStatus}->${targetStatus}`;
  return MOVE_ACTIONS[key] ?? null;
}

const WORKSHOP_STATUSES = ['WAITING_MAINTENANCE', 'IN_MAINTENANCE', 'MAINTENANCE_DONE'];

export async function fetchWorkshopPickupProgress(
  columns: KanbanColumnConfig<PickupKanbanCard>[]
): Promise<Map<string, PickupProgress>> {
  const progressMap = new Map<string, PickupProgress>();
  const relevantCards = columns
    .flatMap((col) => col.cards)
    .filter((card) => WORKSHOP_STATUSES.includes(card.status) && card.requiresPickup);

  if (relevantCards.length === 0) return progressMap;

  const results = await Promise.all(
    relevantCards.map((card) =>
      fetchPickupItems(card.quoteJobId)
        .then((items) => ({ cardId: card.id, items, amount: card.amount }))
        .catch(() => ({ cardId: card.id, items: [] as PickupItemResponse[], amount: card.amount }))
    )
  );

  results.forEach(({ cardId, items, amount }) => {
    progressMap.set(cardId, {
      picked: items.length,
      total: amount,
    });
  });

  return progressMap;
}

export { updateJobTaskStatus, fetchPickupItems };
