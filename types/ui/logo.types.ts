export type LogoVariant = 'full' | 'icon' | 'minimal';
export type LogoSize = 'sm' | 'md' | 'lg' | 'lg2' | 'lg3';

export interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  animated?: boolean;
  showText?: boolean;
  className?: string;
}
