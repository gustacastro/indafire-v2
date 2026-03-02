import { EnrichedDivergency } from '@/types/entities/quote/divergency.types';

export interface DivergencyCardProps {
  divergency: EnrichedDivergency;
  onResolveRequest?: (divergencyId: string) => void;
}
