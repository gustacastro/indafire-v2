import { InfoValueProps } from '@/types/ui/info-value.types';

export function InfoValue({ children }: InfoValueProps) {
  return <div className="text-sm font-medium text-foreground mt-0.5">{children}</div>;
}
