import { KanbanBaseCard } from '@/types/ui/kanban.types';

export interface QuoteKanbanCard extends KanbanBaseCard {
  quoteCode: number;
  clientId: string;
  clientName: string;
  deliveryDate: string;
  netValue: number;
  paymentMethodName: string;
  installments: number;
  isDeclined: boolean;
  creatorName: string;
  creatorId: string;
}
