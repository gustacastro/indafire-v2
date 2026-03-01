export type WhatsappView = 'disconnected' | 'qr' | 'connected';

export interface WhatsappStatus {
  whatsapp_is_connected: boolean;
  whatsapp_number: string;
}

export interface WhatsappStatusResponse {
  whatsapp: WhatsappStatus;
}

export interface WhatsappConnectResponse {
  message: string;
  qr_code: string;
}

export interface WhatsappDisconnectResponse {
  message: string;
  whatsapp: WhatsappStatus;
}
