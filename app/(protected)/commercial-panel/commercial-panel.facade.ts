import { api } from '@/lib/axios';
import {
  fetchQuotesEnriched,
  QuoteListItem,
  updateQuoteStatus,
} from '@/app/(protected)/quotes/quotes.facade';
import {
  fetchClients,
  getClientById,
  getClientName,
  ClientContact,
} from '@/app/(protected)/clients/clients.facade';
import { KanbanColumnConfig, KanbanMoveActionType } from '@/types/ui/kanban.types';
import { QuoteKanbanCard } from '@/types/entities/quote/quote-kanban.types';
import { ContactItem } from '@/types/ui/send-proposal-modal.types';

export { updateQuoteStatus };

export type QuoteKanbanColumnColor = 'default' | 'warning' | 'info' | 'success' | 'danger';

interface ColumnDefinition {
  id: string;
  title: string;
  statuses: string[];
  color: QuoteKanbanColumnColor;
}

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  { id: 'col-attendance', title: 'Atendimento', statuses: ['IN_ATTENDANCE'], color: 'default' },
  { id: 'col-quote', title: 'Orçamento', statuses: ['PENDING_APPROVAL', 'DECLINED'], color: 'warning' },
  { id: 'col-submitted', title: 'Proposta Enviada', statuses: ['SUBMITTED'], color: 'info' },
  { id: 'col-approved', title: 'Pedidos', statuses: ['APPROVED'], color: 'success' },
  { id: 'col-divergent', title: 'Pedido Divergente', statuses: ['WITH_DIVERGENCY'], color: 'danger' },
];

const QUOTE_MOVE_RULES: Record<string, string[]> = {
  IN_ATTENDANCE: ['PENDING_APPROVAL'],
  PENDING_APPROVAL: ['SUBMITTED'],
  SUBMITTED: ['APPROVED', 'DECLINED'],
  DECLINED: ['SUBMITTED'],
  APPROVED: [],
  WITH_DIVERGENCY: [],
};

const MOVE_ACTIONS: Record<string, KanbanMoveActionType> = {
  'IN_ATTENDANCE->PENDING_APPROVAL': 'edit_first',
  'PENDING_APPROVAL->SUBMITTED': 'send_proposal',
  'DECLINED->SUBMITTED': 'send_proposal',
  'SUBMITTED->APPROVED': 'confirm',
  'SUBMITTED->DECLINED': 'reason',
  'DECLINED->APPROVED': 'confirm',
};

function quoteToKanbanCard(quote: QuoteListItem): QuoteKanbanCard {
  return {
    id: quote.id,
    status: quote.status,
    quoteCode: quote.quote_code,
    clientId: quote.client_id,
    clientName: quote.clientName ?? '—',
    deliveryDate: quote.expected_delivery_date,
    netValue: quote.net_value,
    paymentMethodName: quote.paymentMethodName ?? '—',
    installments: quote.installments,
    isDeclined: quote.status === 'DECLINED',
    creatorName: quote.creatorName ?? '—',
    creatorId: quote.creator_id,
  };
}

export async function fetchQuotesForKanban(search?: string): Promise<KanbanColumnConfig<QuoteKanbanCard>[]> {
  const res = await fetchQuotesEnriched({ page: 1, perPage: 9999, search });
  const cards = res.data.map(quoteToKanbanCard);

  return COLUMN_DEFINITIONS.map((def) => ({
    ...def,
    cards: cards.filter((card) => def.statuses.includes(card.status)),
  }));
}

export function getAllowedTargetColumns(
  cardStatus: string
): string[] {
  const allowedStatuses = QUOTE_MOVE_RULES[cardStatus] ?? [];
  if (allowedStatuses.length === 0) return [];

  return COLUMN_DEFINITIONS
    .filter((col) => col.statuses.some((s) => allowedStatuses.includes(s)))
    .map((col) => col.id);
}

export function getTargetStatus(
  sourceStatus: string,
  targetColId: string
): string | null {
  const allowedStatuses = QUOTE_MOVE_RULES[sourceStatus] ?? [];
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

export function getNextColumnId(columnId: string): string | undefined {
  const index = COLUMN_DEFINITIONS.findIndex((c) => c.id === columnId);
  return COLUMN_DEFINITIONS[index + 1]?.id;
}

function normalizeContacts(contact: ClientContact): {
  emails: ContactItem[];
  phones: ContactItem[];
} {
  const emails: ContactItem[] = [];
  const phones: ContactItem[] = [];

  if (contact.email) {
    emails.push({ value: contact.email, department: contact.email_department ?? '' });
  }
  contact.additional_emails.forEach((e) => {
    emails.push({ value: e.email, department: e.department });
  });

  if (contact.phone_number) {
    phones.push({ value: contact.phone_number, department: '' });
  }
  contact.additional_phone_numbers.forEach((p) => {
    phones.push({ value: p.number, department: p.department });
  });

  return { emails, phones };
}

export async function fetchClientContacts(clientId: string): Promise<{
  emails: ContactItem[];
  phones: ContactItem[];
}> {
  const client = await getClientById(clientId);
  return normalizeContacts(client.contact);
}

export async function sendProposalWhatsapp(
  quoteId: string,
  selectedNumbers: string[],
  includeProductPhotos: boolean
): Promise<void> {
  await api.post(`/quotes/${quoteId}/send-proposal-whatsapp`, {
    selected_numbers: selectedNumbers,
    include_product_photos: includeProductPhotos,
  });
}

export async function sendProposalEmail(
  quoteId: string,
  selectedEmails: string[],
  includeProductPhotos: boolean
): Promise<void> {
  await api.post(`/quotes/${quoteId}/send-proposal-email`, {
    selected_emails: selectedEmails,
    include_product_photos: includeProductPhotos,
  });
}

export async function createAttendance(clientId: string): Promise<void> {
  await api.post('/quotes/create/IN_ATTENDANCE', {
    client_id: clientId,
    status: 'IN_ATTENDANCE',
  });
}

export async function findClientByDocument(
  doc: string
): Promise<{ id: string; name: string } | null> {
  const res = await fetchClients({ perPage: 10, search: doc });
  const found = res.data.find((c) => {
    if ('cnpj' in c.identity) return c.identity.cnpj === doc;
    if ('cpf' in c.identity) return c.identity.cpf === doc;
    return false;
  });
  if (!found) return null;
  return { id: found.id, name: getClientName(found) };
}
