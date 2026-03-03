'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo/Logo';
import { Button } from '@/components/ui/Button/Button';
import { SystemBackground } from '@/components/layout/SystemBackground/SystemBackground';
import { IconArrowLeft, IconHome } from '@/components/icons';
import { NotFoundPageProps } from '@/types/ui/not-found.types';

export function NotFoundPage({ isAuthenticated }: NotFoundPageProps) {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      <SystemBackground />

      <div className="relative z-10 flex flex-col items-center text-center px-6 py-12 max-w-md w-full">
        <Logo variant="icon" size="lg2" className="mb-8" />

        <span
          className="text-[8rem] sm:text-[10rem] font-black leading-none tracking-tighter text-brand"
          style={{ lineHeight: 1 }}
        >
          404
        </span>

        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-heading tracking-tight">
          Página não encontrada
        </h1>

        <p className="mt-3 text-base text-muted leading-relaxed">
          A página que você está procurando não existe ou foi removida.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="lg"
            iconLeft={<IconArrowLeft size={18} strokeWidth={1.5} />}
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Voltar
          </Button>

          {isAuthenticated ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                iconLeft={<IconHome size={18} strokeWidth={1.5} />}
                className="w-full"
              >
                Ir para o Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                iconLeft={<IconHome size={18} strokeWidth={1.5} />}
                className="w-full"
              >
                Ir para o Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
