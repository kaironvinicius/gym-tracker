export function getTodayISO(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export const ICON_OPTIONS = [
  '/images/icon-1.svg',
  '/images/icon-2.svg',
  '/images/icon-3.svg',
  '/images/icon-4.svg',
  '/images/icon-5.svg',
  '/images/icon-6.svg',
  '/images/icon-7.svg',
  '/images/icon-8.svg',
  '/images/icon-9.svg',
];

export function isImageIcon(icon: string): boolean {
  return icon.startsWith('data:') || icon.startsWith('/');
}
