import { NotificationProps, NotificationVariant } from '@/types/ui/notification.types';
import {
  IconInfo,
  IconTriangleAlert,
  IconXCircle,
  IconCheckCircle,
} from '@/components/icons';
import { ReactNode } from 'react';

const variantStyles: Record<NotificationVariant, string> = {
  info: 'bg-info/10 text-info border border-info/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  error: 'bg-error/10 text-error border border-error/20',
  success: 'bg-success/5 text-success border border-success/20',
};

const defaultIcons: Record<NotificationVariant, ReactNode> = {
  info: <IconInfo size={18} />,
  warning: <IconTriangleAlert size={18} />,
  error: <IconXCircle size={18} />,
  success: <IconCheckCircle size={18} />,
};

export function Notification({
  variant,
  message,
  title,
  icon,
  className = '',
}: NotificationProps) {
  const resolvedIcon = icon ?? defaultIcons[variant];

  return (
    <div
      className={[
        'flex items-start gap-(--spacing-sm) p-(--spacing-md) rounded-(--r-lg)',
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="shrink-0 mt-0.5">{resolvedIcon}</span>
      <div className="flex flex-col gap-0.5 min-w-0">
        {title && (
          <span className="text-sm font-bold leading-snug">{title}</span>
        )}
        <span className="text-sm leading-relaxed">{message}</span>
      </div>
    </div>
  );
}
