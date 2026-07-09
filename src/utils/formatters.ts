/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Format raw number to Brazilian Real (BRL) currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format raw number to percentage representation (ex: 85 -> 85%)
 */
export function formatPercent(value: number): string {
  return `${value}%`;
}

/**
 * Format string or date object to Brazilian readable date format
 */
export function formatDate(date: string | Date | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Clean a string by removing non-numeric characters (CNPJ/CPF/Phone)
 */
export function cleanNonNumeric(str: string): string {
  return str.replace(/\D/g, '');
}

/**
 * Format CNPJ raw numbers to XX.XXX.XXX/XXXX-XX
 */
export function formatCNPJ(cnpj: string): string {
  const clean = cleanNonNumeric(cnpj);
  if (clean.length !== 14) return cnpj;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Format Phone number to (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 */
export function formatPhone(phone: string): string {
  const clean = cleanNonNumeric(phone);
  if (clean.length === 11) {
    return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return phone;
}

/**
 * Truncate text to limit length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
