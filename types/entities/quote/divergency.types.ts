export interface Divergency {
  divergency_id: string;
  quote_id: string;
  type: string;
  problem_description: string;
  resolved: boolean;
  created_by: string;
  created_at: string;
  resolved_at: string | null;
  resolution_description: string | null;
  resolved_by: string | null;
}

export interface EnrichedDivergency extends Omit<Divergency, 'created_by' | 'resolved_by'> {
  created_by_name: string;
  resolved_by_name: string | null;
}

export interface CreateDivergencyPayload {
  type: string;
  problem_description: string;
}

export interface ResolveDivergencyPayload {
  resolution_description: string;
}

export interface DivergenciesResponse {
  divergencies: Divergency[];
}
