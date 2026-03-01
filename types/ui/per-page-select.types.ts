export const DEFAULT_PAGE_OPTIONS = [1, 5, 10, 15, 25, 50];

export interface PerPageSelectProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
}
