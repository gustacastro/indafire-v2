import { api } from '@/lib/axios';
import {
  getClientById,
  getClientName,
  Client,
} from '@/app/(protected)/clients/clients.facade';
import { getProductById, Product } from '@/app/(protected)/products/products.facade';
import { getUserById } from '@/app/(protected)/users/users.facade';
import { KanbanColumnConfig, KanbanMoveActionType } from '@/types/ui/kanban.types';
import {
  PickupKanbanCard,
  PickupItemResponse,
  DeliveryItemFormData,
  DeliveryProgress,
} from '@/types/entities/job-task/pickup-kanban.types';
import {
  fetchJobTaskCards,
  updateJobTaskStatus,
  fetchPickupItems,
} from '@/app/(protected)/logistics/pickup-panel/pickup-panel.facade';

export type DeliveryColumnColor = 'default' | 'info' | 'warning' | 'success';

interface ColumnDefinition {
  id: string;
  title: string;
  statuses: string[];
  color: DeliveryColumnColor;
}

interface RawProductTask {
  quote_product_id: string;
  product_id: string;
  amount: number;
  company_id: string;
  quote_id: string;
  unitary_value: number;
  status: string;
}

interface RawProductTasksResponse {
  pagination: { total_items: number; request_total_items: number };
  data: RawProductTask[];
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

const DELIVERY_STATUSES = ['WAITING_DELIVER', 'IN_DELIVER_ROUTE', 'DELIVERED', 'FINISHED'];
const PRODUCT_DELIVERY_STATUSES = ['APPROVED', ...DELIVERY_STATUSES];

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  { id: 'col-ready', title: 'Pronto para Entrega', statuses: ['WAITING_DELIVER', 'APPROVED'], color: 'default' },
  { id: 'col-in-route', title: 'Em Rota de Entrega', statuses: ['IN_DELIVER_ROUTE'], color: 'info' },
  { id: 'col-delivered', title: 'Entrega Concluída', statuses: ['DELIVERED'], color: 'warning' },
  { id: 'col-finished', title: 'Concluídos', statuses: ['FINISHED'], color: 'success' },
];

const DELIVERY_MOVE_RULES: Record<string, string[]> = {
  WAITING_DELIVER: ['IN_DELIVER_ROUTE'],
  APPROVED: ['IN_DELIVER_ROUTE'],
  IN_DELIVER_ROUTE: ['DELIVERED'],
  DELIVERED: ['FINISHED'],
  FINISHED: [],
};

const MOVE_ACTIONS: Record<string, KanbanMoveActionType> = {
  'WAITING_DELIVER->IN_DELIVER_ROUTE': 'route',
  'APPROVED->IN_DELIVER_ROUTE': 'route',
  'IN_DELIVER_ROUTE->DELIVERED': 'confirm',
  'DELIVERED->FINISHED': 'confirm',
};

async function fetchProductTasks(): Promise<RawProductTask[]> {
  const { data } = await api.get<RawProductTasksResponse>('/products-tasks/?page=1&per_page=9999');
  return data.data;
}

async function fetchQuoteById(quoteId: string): Promise<RawQuoteResponse['quote']> {
  const { data } = await api.get<RawQuoteResponse>(`/quotes/${quoteId}`);
  return data.quote;
}

export async function fetchProductTaskCards(search?: string): Promise<PickupKanbanCard[]> {
  const tasks = await fetchProductTasks();

  const relevantTasks = tasks.filter((t) => PRODUCT_DELIVERY_STATUSES.includes(t.status));

  if (relevantTasks.length === 0) return [];

  const uniqueQuoteIds = [...new Set(relevantTasks.map((t) => t.quote_id))];
  const uniqueProductIds = [...new Set(relevantTasks.map((t) => t.product_id))];

  const [quotesArr, productsArr] = await Promise.all([
    Promise.all(uniqueQuoteIds.map((id) => fetchQuoteById(id).catch(() => null))),
    Promise.all(uniqueProductIds.map((id) => getProductById(id).catch(() => null))),
  ]);

  const quoteMap = new Map<string, RawQuoteResponse['quote']>();
  quotesArr.forEach((q) => {
    if (q) quoteMap.set(q.quote_id, q);
  });

  const productMap = new Map<string, Product>();
  productsArr.forEach((p) => {
    if (p) productMap.set(p.id, p);
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

  let cards: PickupKanbanCard[] = relevantTasks
    .filter((task) => {
      const quote = quoteMap.get(task.quote_id);
      if (!quote) return false;
      if (quote.status === 'WITH_DIVERGENCY') return false;
      return true;
    })
    .map((task) => {
    const quote = quoteMap.get(task.quote_id);
    const product = productMap.get(task.product_id);
    const client = quote ? clientMap.get(quote.client_id) : undefined;

    return {
      id: task.quote_product_id,
      status: task.status,
      quoteJobId: task.quote_product_id,
      jobId: task.product_id,
      quoteId: task.quote_id,
      quoteCode: quote?.quote_code ?? 0,
      amount: task.amount,
      clientId: quote?.client_id ?? '',
      clientName: client ? getClientName(client) : '—',
      deliveryDate: quote?.expected_delivery_date ?? '',
      pickupScheduleDate: null,
      serviceName: product?.info?.name ?? '—',
      serviceCode: product?.info?.code ?? '',
      address: client?.address ?? { cep: '', state: '', city: '', district: '', street: '', street_number: '' },
      creatorId: quote?.creator_id ?? '',
      creatorName: quote?.creator_id ? (userMap.get(quote.creator_id) ?? '—') : '—',
      requiresPickup: false,
      cardType: 'product',
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

export async function fetchDeliveryKanbanData(
  search?: string
): Promise<KanbanColumnConfig<PickupKanbanCard>[]> {
  const [jobCards, productCards] = await Promise.all([
    fetchJobTaskCards(search),
    fetchProductTaskCards(search),
  ]);

  const deliveryJobCards = jobCards.filter((c) => DELIVERY_STATUSES.includes(c.status));
  const allCards = [...deliveryJobCards, ...productCards];

  return COLUMN_DEFINITIONS.map((def) => ({
    ...def,
    cards: allCards.filter((card) => def.statuses.includes(card.status)),
  }));
}

export function getAllowedTargetColumns(cardStatus: string): string[] {
  const allowedStatuses = DELIVERY_MOVE_RULES[cardStatus] ?? [];
  if (allowedStatuses.length === 0) return [];

  return COLUMN_DEFINITIONS.filter((col) =>
    col.statuses.some((s) => allowedStatuses.includes(s))
  ).map((col) => col.id);
}

export function getTargetStatus(
  sourceStatus: string,
  targetColId: string
): string | null {
  const allowedStatuses = DELIVERY_MOVE_RULES[sourceStatus] ?? [];
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

export async function updateProductTaskStatus(
  quoteProductId: string,
  newStatus: string
): Promise<void> {
  await api.put(`/products-tasks/${quoteProductId}/${newStatus}`);
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

async function buildDeliveryFormData(payload: DeliveryItemFormData): Promise<FormData> {
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

export async function createDeliveryItem(
  jobTaskId: string,
  payload: DeliveryItemFormData
): Promise<void> {
  const fd = await buildDeliveryFormData(payload);
  await api.post(`/job-tasks/${jobTaskId}/deliver`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function fetchDeliveryItems(
  jobTaskId: string
): Promise<PickupItemResponse[]> {
  const { data } = await api.get(`/job-tasks/${jobTaskId}/pickups`);
  const items: PickupItemResponse[] = data.pickups ?? [];
  return items.filter((item) => item.type === 'DELIVERY');
}

export async function fetchDeliveryProgress(
  columns: KanbanColumnConfig<PickupKanbanCard>[]
): Promise<Map<string, DeliveryProgress>> {
  const progressMap = new Map<string, DeliveryProgress>();
  const relevantCards = columns
    .flatMap((col) => col.cards)
    .filter((card) => card.cardType === 'job' && card.requiresPickup);

  if (relevantCards.length === 0) return progressMap;

  const results = await Promise.all(
    relevantCards.map((card) =>
      Promise.all([
        fetchPickupItems(card.quoteJobId).catch(() => [] as PickupItemResponse[]),
        fetchDeliveryItems(card.quoteJobId).catch(() => [] as PickupItemResponse[]),
      ]).then(([pickups, delivers]) => ({
        cardId: card.id,
        total: pickups.length,
        delivered: delivers.length,
      }))
    )
  );

  results.forEach(({ cardId, total, delivered }) => {
    progressMap.set(cardId, { delivered, total });
  });

  return progressMap;
}

export { updateJobTaskStatus, fetchPickupItems };
