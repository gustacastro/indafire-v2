import { IconNavigation } from '@/components/icons';
import { buildGoogleMapsUrl } from '@/app/(protected)/clients/clients.facade';
import { MapsButtonProps } from '@/types/ui/maps-button.types';

export function MapsButton({ address, size = 'md', stopPropagation }: MapsButtonProps) {
  const url = buildGoogleMapsUrl(address);
  const iconSize = size === 'sm' ? 12 : 14;
  const textClass = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`shrink-0 flex items-center gap-1 ${textClass} font-bold text-primary hover:text-primary/80 transition-colors mt-0.5`}
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      <IconNavigation size={iconSize} />
      Abrir Mapa
    </a>
  );
}
