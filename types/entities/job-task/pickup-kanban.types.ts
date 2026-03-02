import { KanbanBaseCard, KanbanCardComponentProps } from '@/types/ui/kanban.types';
import { ClientAddress } from '@/app/(protected)/clients/clients.facade';

export type CardType = 'job' | 'product';

export interface PickupKanbanCard extends KanbanBaseCard {
  quoteJobId: string;
  jobId: string;
  quoteId: string;
  quoteCode: number;
  amount: number;
  clientId: string;
  clientName: string;
  deliveryDate: string;
  pickupScheduleDate: string | null;
  serviceName: string;
  serviceCode: string;
  address: ClientAddress;
  creatorId: string;
  creatorName: string;
  requiresPickup: boolean;
  cardType: CardType;
}

export interface PickupItemResponse {
  job_pickup_id: string;
  quote_job_id: string;
  picked_item_serial_number: string;
  replacement_item_serial_number: string;
  picked_item_image_url: string;
  replacement_item_image_url: string;
  created_at: string;
  type: string;
  company_id: string;
  created_by: string;
  picked_item_image_key: string;
  replacement_item_image_key: string;
}

export interface PickupItemFormData {
  picked_item_serial_number: string;
  replacement_item_serial_number: string;
  picked_item_photo: string;
  replacement_item_photo: string;
}

export interface PickupProgress {
  picked: number;
  total: number;
}

export interface PickupItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: PickupKanbanCard;
  onItemChanged: () => void;
  readOnly?: boolean;
  onMoveCard?: () => void;
}

export interface PickupScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  serviceName: string;
  amount: number;
  clientName: string;
  currentDate: string | null;
  loading: boolean;
}

export interface StartRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (openMap: boolean) => void;
  card: PickupKanbanCard;
  loading: boolean;
}

export interface PickupKanbanCardProps extends KanbanCardComponentProps<PickupKanbanCard> {
  pickupProgress?: PickupProgress;
  onScheduleRequest?: (card: PickupKanbanCard) => void;
  onViewQuoteRequest?: (card: PickupKanbanCard) => void;
  onPickupRequest?: (card: PickupKanbanCard) => void;
  onViewPickupsRequest?: (card: PickupKanbanCard) => void;
  onSendToWorkshop?: (card: PickupKanbanCard) => void;
  onOpenDivergency?: (card: PickupKanbanCard) => void;
}

export interface WorkshopKanbanCardProps extends KanbanCardComponentProps<PickupKanbanCard> {
  pickupProgress?: PickupProgress;
  onViewQuoteRequest?: (card: PickupKanbanCard) => void;
  onViewPickupsRequest?: (card: PickupKanbanCard) => void;
  onSendToDelivery?: (card: PickupKanbanCard) => void;
  onOpenDivergency?: (card: PickupKanbanCard) => void;
}

export interface DeliveryItemResponse {
  job_delivery_id: string;
  quote_job_id: string;
  picked_item_serial_number: string;
  replacement_item_serial_number: string;
  picked_item_image_url: string;
  replacement_item_image_url: string;
  created_at: string;
  type: string;
  company_id: string;
  created_by: string;
  picked_item_image_key: string;
  replacement_item_image_key: string;
}

export interface DeliveryItemFormData {
  picked_item_serial_number: string;
  replacement_item_serial_number: string;
  picked_item_photo: string;
  replacement_item_photo: string;
}

export interface DeliveryProgress {
  delivered: number;
  total: number;
}

export interface DeliveryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: PickupKanbanCard;
  onItemChanged: () => void;
  onMoveCard?: () => void;
}

export interface DeliveryKanbanCardProps extends KanbanCardComponentProps<PickupKanbanCard> {
  deliveryProgress?: DeliveryProgress;
  onViewQuoteRequest?: (card: PickupKanbanCard) => void;
  onViewPickupsRequest?: (card: PickupKanbanCard) => void;
  onDeliverRequest?: (card: PickupKanbanCard) => void;
  onOpenDivergency?: (card: PickupKanbanCard) => void;
}
