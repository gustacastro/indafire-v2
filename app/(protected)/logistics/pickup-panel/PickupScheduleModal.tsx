'use client';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { DetailField } from '@/components/ui/DetailField/DetailField';
import { IconCalendarClock, IconUser, IconPackage, IconBriefcase } from '@/components/icons';
import { PickupScheduleModalProps } from '@/types/entities/job-task/pickup-kanban.types';

export function PickupScheduleModal({
  isOpen,
  onClose,
  onConfirm,
  serviceName,
  amount,
  clientName,
  currentDate,
  loading,
}: PickupScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (isOpen && currentDate) {
      const date = new Date(currentDate);
      const offset = date.getTimezoneOffset();
      const local = new Date(date.getTime() - offset * 60 * 1000);
      setSelectedDate(local.toISOString().slice(0, 16));
    } else if (isOpen) {
      setSelectedDate('');
    }
  }, [isOpen, currentDate]);

  function handleConfirm() {
    if (!selectedDate) return;
    const isoDate = new Date(selectedDate).toISOString();
    onConfirm(isoDate);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20">
            <IconCalendarClock size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-heading">Agendar Retirada</h3>
            <p className="mt-1 text-sm text-muted">
              Selecione a data e hora para a retirada do serviço.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <DetailField icon={<IconBriefcase size={12} />} label="Serviço">
            <p className="text-xs text-foreground font-medium">{serviceName}</p>
          </DetailField>
          <DetailField icon={<IconPackage size={12} />} label="Quantidade">
            <p className="text-xs text-foreground font-medium">{amount}</p>
          </DetailField>
          <DetailField icon={<IconUser size={12} />} label="Cliente" className="col-span-2">
            <p className="text-xs text-foreground font-medium">{clientName}</p>
          </DetailField>
        </div>

        <div className="mt-6">
          <label className="text-[10px] text-muted uppercase font-bold tracking-wider mb-2 block">
            Data e hora da retirada
          </label>
          <input
            type="datetime-local"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-(--radius-md) border border-border bg-secondary text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="px-6 py-4 bg-secondary border-t border-border flex items-center gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" nowrap onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          nowrap
          onClick={handleConfirm}
          disabled={!selectedDate || loading}
        >
          {loading ? 'Agendando...' : 'Confirmar Agendamento'}
        </Button>
      </div>
    </Modal>
  );
}
