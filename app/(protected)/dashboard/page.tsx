import { IconConstruction } from '@/components/icons';

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-brand/10 mb-6">
        <IconConstruction size={40} className="text-brand" />
      </div>
      <h1 className="text-3xl font-bold text-heading mb-3">
        Dashboard em Construção
      </h1>
      <p className="text-muted max-w-md text-lg">
        Estamos trabalhando para trazer uma experiência incrível.
        Em breve você terá acesso a todos os dados e métricas do sistema.
      </p>
      <div className="mt-8 flex items-center gap-2 text-sm text-muted">
        <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        Em desenvolvimento
      </div>
    </div>
  );
}
