export type AvatarSize = 'x' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
}
