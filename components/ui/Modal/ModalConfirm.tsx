'use client';
import { ReactElement, useState, useEffect } from 'react';
import { ModalConfirmProps, ModalVariant } from '@/types/ui/modal.types';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { IconAlertCircle, IconInfo, IconCheckCircle } from '@/components/icons';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';

const variantIcon: Record<ModalVariant, ReactElement> = {
  danger: <IconAlertCircle size={20} className="text-destructive" />,
  warning: <IconAlertCircle size={20} className="text-brand" />,
  info: <IconInfo size={20} className="text-primary" />,
  success: <IconCheckCircle size={20} className="text-success" />,
};

const variantIconBg: Record<ModalVariant, string> = {
  danger: 'bg-destructive/10 border border-destructive/20',
  warning: 'bg-brand/10 border border-brand/20',
  info: 'bg-primary/10 border border-primary/20',
  success: 'bg-success/10 border border-success/20',
};

const variantConfirmBtn: Record<ModalVariant, 'destructive' | 'primary'> = {
  danger: 'destructive',
  warning: 'primary',
  info: 'primary',
  success: 'primary',
};

export function ModalConfirm({
  isOpen,
  onClose,
  size = 'xl',
  title,
  description,
  icon,
  variant = 'info',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  confirmLoading = false,
  children,
  requireConfirmation = false,
  requireConfirmationLabel = 'Confirmo que desejo realizar esta ação',
}: ModalConfirmProps) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!isOpen) setConfirmed(false);
  }, [isOpen]);

  const resolvedIcon = icon ?? variantIcon[variant];
  const iconBg = variantIconBg[variant];
  const confirmVariant = variantConfirmBtn[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size}>
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          {resolvedIcon && (
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
              {resolvedIcon}
            </div>
          )}
          <div className="flex-1">
            {title && <h3 className="text-lg font-semibold text-heading">{title}</h3>}
            {description && (
              <p className="mt-2 text-sm text-muted leading-relaxed">{description}</p>
            )}
            {children && <div className="mt-3">{children}</div>}
          </div>
        </div>
      </div>
      <div className="px-6 py-4 bg-secondary border-t border-border flex flex-wrap items-center gap-3">
        {requireConfirmation && (
          <Checkbox
            checked={confirmed}
            onChange={setConfirmed}
            label={requireConfirmationLabel}
            className="flex-1 min-w-50"
          />
        )}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <Button type="button" variant="ghost" size="sm" nowrap onClick={onClose}>
            {cancelLabel}
          </Button>
          {onConfirm && (
            <Button
              type="button"
              variant={confirmVariant}
              size="sm"
              nowrap
              onClick={onConfirm}
              disabled={confirmLoading || (requireConfirmation && !confirmed)}
            >
              {confirmLoading ? 'Aguarde...' : confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
