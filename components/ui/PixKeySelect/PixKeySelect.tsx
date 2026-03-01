'use client';
import { Select } from '@/components/ui/Select/Select';
import { FormField } from '@/components/ui/FormField/FormField';
import { PixKeySelectProps } from '@/types/payments/pix-key-select.types';
import { PIX_TYPE_OPTIONS, PixKeyType, formatPixKey, getPixKeyPlaceholder } from '@/utils/pix';

export function PixKeySelect({
  pixKeyType,
  onPixKeyTypeChange,
  pixKeyValue,
  onPixKeyValueChange,
  onPixKeyValueBlur,
  pixKeyTypeError,
  pixKeyValueError,
}: PixKeySelectProps) {
  function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!pixKeyType) {
      onPixKeyValueChange(e.target.value);
      return;
    }
    const formatted = formatPixKey(pixKeyType as PixKeyType, e.target.value);
    onPixKeyValueChange(formatted);
  }

  const placeholder = pixKeyType
    ? getPixKeyPlaceholder(pixKeyType as PixKeyType)
    : 'Selecione o tipo primeiro';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Select
        label="Tipo de Chave PIX"
        required
        placeholder="Selecione o tipo"
        options={PIX_TYPE_OPTIONS}
        value={pixKeyType}
        onChange={(v) => {
          onPixKeyTypeChange(v as PixKeyType | '');
          onPixKeyValueChange('');
        }}
        error={pixKeyTypeError}
      />
      <FormField
        label="Chave PIX"
        required
        type="text"
        value={pixKeyValue}
        onChange={handleValueChange}
        onBlur={onPixKeyValueBlur}
        placeholder={placeholder}
        disabled={!pixKeyType}
        error={pixKeyValueError}
      />
    </div>
  );
}
