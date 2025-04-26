import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para validar CPF
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, "")

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (10 - i)
  }
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder

  if (Number.parseInt(cpf.charAt(9)) !== digit1) return false

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (11 - i)
  }
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder

  if (Number.parseInt(cpf.charAt(10)) !== digit2) return false

  return true
}

// Função para formatar CPF
export function formatCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, "")
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

// Função para formatar telefone
export function formatPhone(phone: string): string {
  phone = phone.replace(/[^\d]/g, "")
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
  return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
}

// Função para gerar um número aleatório entre min e max
export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Função para formatar valor em reais
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function geradorPix(valor: number) {
  function formatField(id: string, value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
  }  

  function calculateCRC16(payload: string): string {
    const polynomial = 0x1021;
    let result = 0xFFFF;

    for (let i = 0; i < payload.length; i++) {
      result ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((result & 0x8000) !== 0) {
          result = (result << 1) ^ polynomial;
        } else {
          result <<= 1;
        }
        result &= 0xFFFF;
      }
    }

    return result.toString(16).toUpperCase().padStart(4, '0');
  }

  const pixKey = 'eloidecarvalho0717@gmail.com';
  const merchantName = 'Eloi de Carvalho Junior';
  const merchantCity = 'FORTALEZA';
  const transactionAmount = valor;
  const transactionId = '***';

  const gui = formatField('00', 'br.gov.bcb.pix');
  const key = formatField('01', pixKey);
  const merchantAccountInfo = formatField('26', gui + key);

  const payloadFormatIndicator = formatField('00', '01');
  const merchantCategoryCode = formatField('52', '0000');
  const transactionCurrency = formatField('53', '986');
  const transactionAmountField = formatField('54', transactionAmount.toFixed(2));
  const countryCode = formatField('58', 'BR');
  const merchantNameField = formatField('59', merchantName);
  const merchantCityField = formatField('60', merchantCity);
  const additionalDataField = formatField('62', formatField('05', transactionId));

  let payload = payloadFormatIndicator +
    merchantAccountInfo +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmountField +
    countryCode +
    merchantNameField +
    merchantCityField +
    additionalDataField +
    '6304';

  const crc = calculateCRC16(payload);
  payload += crc;

  return payload;
}