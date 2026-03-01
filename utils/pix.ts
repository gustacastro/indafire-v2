export type PixKeyType = 'email' | 'cpf' | 'cnpj' | 'phone' | 'random';

export const PIX_TYPE_OPTIONS = [
  { value: 'email', label: 'E-mail' },
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'phone', label: 'Telefone' },
  { value: 'random', label: 'Chave Aleatória' },
];

export function formatPixKey(type: PixKeyType, value: string): string {
  const digits = value.replace(/\D/g, '');

  switch (type) {
    case 'cpf': {
      const d = digits.slice(0, 11);
      if (d.length <= 3) return d;
      if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
      if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
      return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
    }
    case 'cnpj': {
      const d = digits.slice(0, 14);
      if (d.length <= 2) return d;
      if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
      if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
      if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
      return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
    }
    case 'phone': {
      const d = digits.slice(0, 11);
      if (d.length <= 2) return d;
      if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
      return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    }
    case 'email':
    case 'random':
    default:
      return value;
  }
}

export function validatePixKey(type: PixKeyType, value: string): string | null {
  if (!value.trim()) return 'Chave PIX é obrigatória.';

  switch (type) {
    case 'cpf': {
      const d = value.replace(/\D/g, '');
      if (d.length !== 11) return 'CPF deve ter 11 dígitos.';
      if (/^(\d)\1{10}$/.test(d)) return 'CPF inválido.';
      let sum = 0;
      for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
      let r = (sum * 10) % 11;
      if (r === 10 || r === 11) r = 0;
      if (r !== parseInt(d[9])) return 'CPF inválido.';
      sum = 0;
      for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
      r = (sum * 10) % 11;
      if (r === 10 || r === 11) r = 0;
      if (r !== parseInt(d[10])) return 'CPF inválido.';
      return null;
    }
    case 'cnpj': {
      const d = value.replace(/\D/g, '');
      if (d.length !== 14) return 'CNPJ deve ter 14 dígitos.';
      if (/^(\d)\1{13}$/.test(d)) return 'CNPJ inválido.';
      const calcDigit = (s: string, weights: number[]) => {
        const sum = s.split('').reduce((acc, c, i) => acc + parseInt(c) * weights[i], 0);
        const r = sum % 11;
        return r < 2 ? 0 : 11 - r;
      };
      const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      if (calcDigit(d.slice(0, 12), w1) !== parseInt(d[12])) return 'CNPJ inválido.';
      if (calcDigit(d.slice(0, 13), w2) !== parseInt(d[13])) return 'CNPJ inválido.';
      return null;
    }
    case 'phone': {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 11) return 'Telefone inválido. Use DDD + número.';
      return null;
    }
    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'E-mail inválido.';
      return null;
    }
    case 'random': {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) return 'Chave aleatória deve estar no formato UUID.';
      return null;
    }
    default:
      return null;
  }
}

export function getPixKeyPlaceholder(type: PixKeyType): string {
  switch (type) {
    case 'cpf': return '000.000.000-00';
    case 'cnpj': return '00.000.000/0000-00';
    case 'phone': return '(11) 99999-9999';
    case 'email': return 'exemplo@email.com';
    case 'random': return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
    default: return 'Digite a chave PIX';
  }
}
