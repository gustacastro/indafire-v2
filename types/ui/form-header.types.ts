export interface FormHeaderProps {
  backHref: string;
  backLabel?: string;
  onBackClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  title: string;
  description: string;
}
