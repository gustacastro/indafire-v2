import { api } from '@/lib/axios';
import {
  WhatsappStatus,
  WhatsappStatusResponse,
  WhatsappConnectResponse,
  WhatsappDisconnectResponse,
} from '@/types/integrations/whatsapp-settings.types';

export async function fetchWhatsappStatus(): Promise<WhatsappStatus> {
  const { data } = await api.get<WhatsappStatusResponse>('/groups/whatsapp');
  return data.whatsapp;
}

export async function connectWhatsapp(): Promise<WhatsappConnectResponse> {
  const { data } = await api.post<WhatsappConnectResponse>('/groups/whatsapp/connect');
  return data;
}

export async function disconnectWhatsapp(): Promise<WhatsappDisconnectResponse> {
  const { data } = await api.post<WhatsappDisconnectResponse>('/groups/whatsapp/disconnect');
  return data;
}
