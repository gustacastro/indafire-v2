'use client';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { DetailField } from '@/components/ui/DetailField/DetailField';
import { MapsButton } from '@/components/ui/MapsButton/MapsButton';
import {
  IconTruck,
  IconUser,
  IconPackage,
  IconBriefcase,
  IconMapPin,
  IconCalendar,
  IconCalendarClock,
  IconArrowRight,
} from '@/components/icons';
import { StartRouteModalProps } from '@/types/entities/job-task/pickup-kanban.types';
import { formatAddressShort } from '@/app/(protected)/clients/clients.facade';
import { formatDateTimeBR } from '@/utils/datetime';

export function StartRouteModal({
  isOpen,
  onClose,
  onConfirm,
  card,
  loading,
}: StartRouteModalProps) {
  const hasAddress = card.address.street || card.address.city;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20">
            <IconTruck size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-heading">Iniciar Rota</h3>
            <p className="mt-1 text-sm text-muted">
              Confira as informações antes de iniciar a rota de retirada.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-(--spacing-md)">
          <div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Cliente</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailField icon={<IconUser size={12} />} label="Nome" className="sm:col-span-2">
                <p className="text-xs text-foreground font-medium">{card.clientName}</p>
              </DetailField>
              {hasAddress && (
                <div className="sm:col-span-2">
                  <DetailField icon={<IconMapPin size={12} />} label="Endereço">
                    <div className="flex items-start gap-2">
                      <p className="text-xs text-foreground font-medium whitespace-pre-line flex-1">
                        {formatAddressShort(card.address)}
                      </p>
                      <MapsButton address={card.address} size="sm" />
                    </div>
                  </DetailField>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-(--spacing-md)">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Serviço</p>
            <div className="grid grid-cols-2 gap-3">
              <DetailField icon={<IconBriefcase size={12} />} label="Serviço" className="col-span-2">
                <p className="text-xs text-foreground font-medium">{card.serviceName}</p>
              </DetailField>
              <DetailField icon={<IconPackage size={12} />} label="Quantidade">
                <p className="text-xs text-foreground font-medium">{card.amount}</p>
              </DetailField>
              {card.deliveryDate && (
                <DetailField icon={<IconCalendar size={12} />} label="Entrega prevista">
                  <p className="text-xs text-foreground font-medium">
                    {formatDateTimeBR(card.deliveryDate)}
                  </p>
                </DetailField>
              )}
              {card.pickupScheduleDate && (
                <DetailField
                  icon={<IconCalendarClock size={12} />}
                  label="Retirada agendada"
                  className="col-span-2"
                >
                  <p className="text-xs text-foreground font-medium">
                    {formatDateTimeBR(card.pickupScheduleDate)}
                  </p>
                </DetailField>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-secondary border-t border-border flex flex-wrap items-center gap-2 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          nowrap
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          nowrap
          iconRight={<IconArrowRight size={14} />}
          disabled={loading}
          onClick={() => onConfirm(false)}
        >
          Iniciar Rota
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          nowrap
          disabled={loading}
          onClick={() => onConfirm(true)}
        >
          Iniciar Rota + Abrir Mapa
        </Button>
      </div>
    </Modal>
  );
}
