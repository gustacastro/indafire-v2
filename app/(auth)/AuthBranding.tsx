import { IconFlame } from '@/components/icons';
import { Logo } from '@/components/ui/Logo/Logo';

export function AuthBranding() {
  return (
    <div className="hidden lg:flex w-1/2 bg-panel relative items-center justify-center overflow-hidden z-1">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--c-panel-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--c-panel-grid) 1px, transparent 1px)',
          backgroundSize: '4rem 4rem',
        }}
      />
      <div className="relative z-10 flex flex-col items-center text-center px-12">
          <Logo variant="icon" size="lg3" className='mb-2'/>
        <h2 className="text-4xl font-bold text-panel-fg mb-4 tracking-tight">IndaFire</h2>
        <p className="text-panel-muted text-lg max-w-md font-light leading-relaxed">
          Soluções de segurança contra incêndios.
          <br className="hidden md:block" />
          Há 27 anos, somos tradição, confiança e excelência
        </p>
      </div>
    </div>
  );
}
