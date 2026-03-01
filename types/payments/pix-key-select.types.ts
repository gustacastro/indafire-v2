import { PixKeyType } from '@/utils/pix';

export interface PixKeySelectProps {
  pixKeyType: PixKeyType | '';
  onPixKeyTypeChange: (type: PixKeyType | '') => void;
  pixKeyValue: string;
  onPixKeyValueChange: (value: string) => void;
  onPixKeyValueBlur?: () => void;
  pixKeyTypeError?: string;
  pixKeyValueError?: string;
}
