import { api } from '@/lib/axios';
import {
  getClientById,
  getClientName,
  Client,
} from '@/app/(protected)/clients/clients.facade';
import { getJobById, Job } from '@/app/(protected)/jobs/jobs.facade';
import { getUserById } from '@/app/(protected)/users/users.facade';
import { KanbanColumnConfig, KanbanMoveActionType } from '@/types/ui/kanban.types';
import {
  PickupKanbanCard,
  PickupItemResponse,
  PickupItemFormData,
  PickupProgress,
} from '@/types/entities/job-task/pickup-kanban.types';

export type PickupColumnColor = 'default' | 'warning' | 'info' | 'success';

interface ColumnDefinition {
  id: string;
  title: string;
  statuses: string[];
  color: PickupColumnColor;
}

interface RawJobTask {
  job_id: string;
  quote_job_id: string;
  amount: number;
  status: string;
  quote_id: string;
  unitary_value: number;
  pickup_schedule_date: string | null;
  company_id: string;
}

interface RawJobTasksResponse {
  pagination: { total_items: number; request_total_items: number };
  data: RawJobTask[];
}

interface RawQuoteResponse {
  quote: {
    quote_id: string;
    quote_code: number;
    creator_id: string;
    expected_delivery_date: string;
    client_id: string;
    status: string;
  };
}

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  { id: 'col-new-orders', title: 'Novos Pedidos', statuses: ['WAITING_SCHEDULING', 'APPROVED'], color: 'default' },
  { id: 'col-in-route', title: 'Em Rota', statuses: ['IN_PICKUP_ROUTE'], color: 'info' },
  { id: 'col-executing', title: 'Em Execução – Retirada', statuses: ['EXECUTING_PICKUP'], color: 'warning' },
  { id: 'col-done', title: 'Retirada Concluída', statuses: ['PICKUP_DONE'], color: 'success' },
];

const PICKUP_MOVE_RULES: Record<string, string[]> = {
  WAITING_SCHEDULING: [],
  APPROVED: ['IN_PICKUP_ROUTE'],
  IN_PICKUP_ROUTE: ['EXECUTING_PICKUP'],
  EXECUTING_PICKUP: ['PICKUP_DONE'],
  PICKUP_DONE: [],
};

const MOVE_ACTIONS: Record<string, KanbanMoveActionType> = {
  'APPROVED->IN_PICKUP_ROUTE': 'route',
  'IN_PICKUP_ROUTE->EXECUTING_PICKUP': 'confirm',
  'EXECUTING_PICKUP->PICKUP_DONE': 'confirm',
};

async function fetchJobTasks(): Promise<RawJobTask[]> {
  const { data } = await api.get<RawJobTasksResponse>('/job-tasks/?page=1&per_page=9999');
  return data.data;
}

async function fetchQuoteById(quoteId: string): Promise<RawQuoteResponse['quote']> {
  const { data } = await api.get<RawQuoteResponse>(`/quotes/${quoteId}`);
  return data.quote;
}

export async function fetchJobTaskCards(search?: string): Promise<PickupKanbanCard[]> {
  const tasks = await fetchJobTasks();

  const uniqueQuoteIds = [...new Set(tasks.map((t) => t.quote_id))];
  const uniqueJobIds = [...new Set(tasks.map((t) => t.job_id))];

  const [quotesArr, jobsArr] = await Promise.all([
    Promise.all(uniqueQuoteIds.map((id) => fetchQuoteById(id).catch(() => null))),
    Promise.all(uniqueJobIds.map((id) => getJobById(id).catch(() => null))),
  ]);

  const quoteMap = new Map<string, RawQuoteResponse['quote']>();
  quotesArr.forEach((q) => {
    if (q) quoteMap.set(q.quote_id, q);
  });

  const jobMap = new Map<string, Job>();
  jobsArr.forEach((j) => {
    if (j) jobMap.set(j.job_id, j);
  });

  const uniqueClientIds = [
    ...new Set(
      [...quoteMap.values()].map((q) => q.client_id).filter(Boolean)
    ),
  ];

  const clientsArr = await Promise.all(
    uniqueClientIds.map((id) => getClientById(id).catch(() => null))
  );

  const clientMap = new Map<string, Client>();
  clientsArr.forEach((c) => {
    if (c) clientMap.set(c.id, c);
  });

  const userIds = [...new Set([...quoteMap.values()].map((q) => q.creator_id).filter(Boolean))];
  const usersArr = await Promise.all(
    userIds.map((id) => getUserById(id).catch(() => null))
  );
  const userMap = new Map<string, string>();
  usersArr.forEach((u) => {
    if (u) userMap.set(u.id, u.name);
  });

  let cards: PickupKanbanCard[] = tasks.map((task) => {
    const quote = quoteMap.get(task.quote_id);
    const job = jobMap.get(task.job_id);
    const client = quote ? clientMap.get(quote.client_id) : undefined;

    return {
      id: task.quote_job_id,
      status: task.status,
      quoteJobId: task.quote_job_id,
      jobId: task.job_id,
      quoteId: task.quote_id,
      quoteCode: quote?.quote_code ?? 0,
      amount: task.amount,
      clientId: quote?.client_id ?? '',
      clientName: client ? getClientName(client) : '—',
      deliveryDate: quote?.expected_delivery_date ?? '',
      pickupScheduleDate: task.pickup_schedule_date,
      serviceName: job?.service_name ?? '—',
      serviceCode: job?.service_code ?? '',
      address: client?.address ?? { cep: '', state: '', city: '', district: '', street: '', street_number: '' },
      creatorId: quote?.creator_id ?? '',
      creatorName: quote?.creator_id ? (userMap.get(quote.creator_id) ?? '—') : '—',
      requiresPickup: job?.requires_pickup ?? false,
      cardType: 'job',
    };
  });

  if (search) {
    const term = search.toLowerCase();
    cards = cards.filter(
      (c) =>
        c.clientName.toLowerCase().includes(term) ||
        String(c.quoteCode).includes(term) ||
        c.serviceName.toLowerCase().includes(term)
    );
  }

  return cards;
}

export async function fetchPickupKanbanData(
  search?: string
): Promise<KanbanColumnConfig<PickupKanbanCard>[]> {
  const cards = await fetchJobTaskCards(search);

  return COLUMN_DEFINITIONS.map((def) => ({
    ...def,
    cards: cards.filter((card) => def.statuses.includes(card.status)),
  }));
}

export function getAllowedTargetColumns(cardStatus: string): string[] {
  const allowedStatuses = PICKUP_MOVE_RULES[cardStatus] ?? [];
  if (allowedStatuses.length === 0) return [];

  return COLUMN_DEFINITIONS.filter((col) =>
    col.statuses.some((s) => allowedStatuses.includes(s))
  ).map((col) => col.id);
}

export function getTargetStatus(
  sourceStatus: string,
  targetColId: string
): string | null {
  const allowedStatuses = PICKUP_MOVE_RULES[sourceStatus] ?? [];
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

export async function updateJobTaskStatus(
  quoteJobId: string,
  newStatus: string
): Promise<void> {
  await api.put(`/job-tasks/${quoteJobId}/${newStatus}`);
}

export async function schedulePickup(
  quoteJobId: string,
  pickupScheduleDate: string
): Promise<void> {
  await api.put(`/job-tasks/${quoteJobId}`, { pickup_schedule_date: pickupScheduleDate });
}

export async function fetchPickupItems(
  jobTaskId: string
): Promise<PickupItemResponse[]> {
  const { data } = await api.get(`/job-tasks/${jobTaskId}/pickups`);
  const items: PickupItemResponse[] = data.pickups ?? [];
  return items.filter((item) => item.type === 'PICKUP');
}

function base64ToBlob(base64: string): Blob {
  const [meta, data] = base64.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] ?? 'image/png';
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function urlToBlob(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url);
    return response.blob();
  } catch {
    return null;
  }
}

async function buildPickupFormData(payload: PickupItemFormData): Promise<FormData> {
  const fd = new FormData();
  fd.append('picked_item_serial_number', payload.picked_item_serial_number);
  fd.append('replacement_item_serial_number', payload.replacement_item_serial_number);
  if (payload.picked_item_photo) {
    if (payload.picked_item_photo.startsWith('data:')) {
      fd.append('picked_item_photo', base64ToBlob(payload.picked_item_photo), 'picked.png');
    } else {
      const blob = await urlToBlob(payload.picked_item_photo);
      if (blob) fd.append('picked_item_photo', blob, 'picked.png');
    }
  }
  if (payload.replacement_item_photo) {
    if (payload.replacement_item_photo.startsWith('data:')) {
      fd.append('replacement_item_photo', base64ToBlob(payload.replacement_item_photo), 'replacement.png');
    } else {
      const blob = await urlToBlob(payload.replacement_item_photo);
      if (blob) fd.append('replacement_item_photo', blob, 'replacement.png');
    }
  }
  return fd;
}

export async function createPickupItem(
  jobTaskId: string,
  payload: PickupItemFormData
): Promise<void> {
  const fd = await buildPickupFormData(payload);
  await api.post(`/job-tasks/${jobTaskId}/pickup`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function updatePickupItem(
  jobPickupId: string,
  payload: PickupItemFormData
): Promise<void> {
  const fd = await buildPickupFormData(payload);
  await api.put(`/job-tasks/pickups/${jobPickupId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

const STATUSES_WITH_PICKUPS = ['EXECUTING_PICKUP', 'PICKUP_DONE'];

export async function fetchAllPickupProgress(
  columns: KanbanColumnConfig<PickupKanbanCard>[]
): Promise<Map<string, PickupProgress>> {
  const progressMap = new Map<string, PickupProgress>();
  const relevantCards = columns
    .flatMap((col) => col.cards)
    .filter((card) => STATUSES_WITH_PICKUPS.includes(card.status));

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
