import { LogoProps, LogoSize } from '@/types/ui/logo.types';
import LogoIcon from '@/assets/logo-icon.svg';
import Image from 'next/image';

const iconContainerSizes: Record<LogoSize, string> = {
  sm: 'min-w-[32px] w-8 h-8',
  md: 'min-w-[40px] w-10 h-10',
  lg: 'min-w-[48px] w-12 h-12',
  lg2: 'min-w-[56px] w-14 h-14',
  lg3: 'min-w-[64px] w-16 h-16',
};

const flameSizes: Record<LogoSize, number> = {
  sm: 18,
  md: 24,
  lg: 28,
  lg2: 32,
  lg3: 36,
};

const textSizes: Record<LogoSize, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  lg2: 'text-4xl',
  lg3: 'text-5xl',
};

export function Logo({
  variant = 'full',
  size = 'md',
  animated = false,
  showText = true,
  className = '',
}: LogoProps) {
  const shouldShowText = variant === 'full' && showText;

  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={`flex items-center justify-center ${iconContainerSizes[size]} rounded-lg bg-brand text-white shrink-0 shadow-lg shadow-brand/20`}
      >
        <Image src={LogoIcon} alt="IndaFire Logo" width={flameSizes[size]} height={flameSizes[size]} />
      </div>

      {variant === 'full' && (
        <span
          className={`${textSizes[size]} font-bold text-heading whitespace-nowrap ${
            animated
              ? `transition-all duration-300 overflow-hidden ${
                  shouldShowText ? 'opacity-100 w-auto ml-3' : 'opacity-0 w-0 ml-0'
                }`
              : 'ml-3'
          }`}
        >
          IndaFire
        </span>
      )}
    </div>
  );
}
