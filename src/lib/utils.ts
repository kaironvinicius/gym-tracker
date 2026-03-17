export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Sin registro';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

export function daysSince(dateString: string | null | undefined): number | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getActivityColor(dateString: string | null | undefined): string {
  if (!dateString) return 'bg-gym-muted';
  const days = daysSince(dateString);
  if (days === null) return 'bg-gym-muted';
  if (days <= 3) return 'bg-gym-green';
  if (days <= 7) return 'bg-gym-yellow';
  return 'bg-gym-red';
}

export function getActivityColorClass(dateString: string | null | undefined): string {
  if (!dateString) return 'text-gym-muted';
  const days = daysSince(dateString);
  if (days === null) return 'text-gym-muted';
  if (days <= 3) return 'text-gym-green';
  if (days <= 7) return 'text-gym-yellow';
  return 'text-gym-red';
}

export function sortByLeastRecent<T extends { last_exercise_date?: string | null; last_record_date?: string | null }>(
  items: T[],
  dateField: 'last_exercise_date' | 'last_record_date'
): T[] {
  return [...items].sort((a, b) => {
    const dateA = a[dateField];
    const dateB = b[dateField];

    // Null dates (never trained) appear first
    if (!dateA && !dateB) return 0;
    if (!dateA) return -1;
    if (!dateB) return 1;

    // Older dates appear first (least recent first)
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });
}

export function getTodayISO(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function formatWeight(weight: number): string {
  return weight % 1 === 0 ? `${weight} kg` : `${weight.toFixed(1)} kg`;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export const EMOJI_OPTIONS = [
  '💪', '🏋️', '🦵', '🔄', '🏃', '🚴', '🤸', '🏊',
  '⚡', '🔥', '💥', '🎯', '🏆', '⭐', '🦾', '🧠',
  '🫀', '🦷', '🦶', '🤜', '🥊', '🏅', '🎽', '👟',
  '🧘', '🤾', '🚵', '🤺', '🥋', '⛹️', '🏇', '🤼',
];
