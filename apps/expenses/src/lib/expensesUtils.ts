export const CATEGORY_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#64748b', // slate
];

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatAmountInput(value: string): string {
  // Allow only digits and one decimal separator (comma or dot).
  const normalized = value.replace(',', '.');
  const cleaned = normalized.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length <= 1) return cleaned;
  return parts[0] + '.' + parts.slice(1).join('').slice(0, 2);
}

export function parseAmount(value: string): number {
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function formatTransactionDate(dateString: string): string {
  const d = new Date(dateString + 'T00:00:00');
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonth(year: number, monthIndex: number): string {
  const d = new Date(year, monthIndex, 1);
  const formatted = d.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function isDateInMonth(dateString: string, year: number, monthIndex: number): boolean {
  const d = new Date(dateString + 'T00:00:00');
  return d.getFullYear() === year && d.getMonth() === monthIndex;
}
