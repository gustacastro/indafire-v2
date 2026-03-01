import Link from 'next/link';
import { IconArrowLeft } from '@/components/icons';
import { FormHeaderProps } from '@/types/ui/form-header.types';

export function FormHeader({ backHref, backLabel = 'Voltar para listagem', onBackClick, title, description }: FormHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4"
        onClick={onBackClick}
      >
        <IconArrowLeft size={14} />
        {backLabel}
      </Link>
      <h1 className="text-2xl font-bold text-heading leading-tight">{title}</h1>
      <p className="text-sm text-muted mt-1">{description}</p>
    </div>
  );
}
