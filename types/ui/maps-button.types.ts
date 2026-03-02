import { ClientAddress } from '@/app/(protected)/clients/clients.facade';

export interface MapsButtonProps {
  address: ClientAddress;
  size?: 'sm' | 'md';
  stopPropagation?: boolean;
}
