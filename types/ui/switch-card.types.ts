export interface SwitchCardProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
  activeDescription?: string;
  disabled?: boolean;
}
