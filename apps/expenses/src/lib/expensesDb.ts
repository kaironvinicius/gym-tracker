import Dexie, { type Table } from 'dexie';

export type ExpenseCategoryKind = 'expense' | 'income';

export interface ExpenseCategory {
  id: string;
  name: string;
  kind: ExpenseCategoryKind;
  icon_image: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  category_id: string;
  kind: ExpenseCategoryKind;
  amount: number;
  date: string; // YYYY-MM-DD
  note: string;
  created_at: string;
  updated_at: string;
}

export class ExpensesDB extends Dexie {
  expense_categories!: Table<ExpenseCategory>;
  transactions!: Table<Transaction>;

  constructor() {
    super('ExpensesDB');
    this.version(1).stores({
      expense_categories: 'id, name, kind, created_at',
      transactions: 'id, category_id, kind, date, amount, created_at',
    });
  }
}

export const expensesDb = new ExpensesDB();

export async function deleteCategoryWithCascade(categoryId: string): Promise<void> {
  await expensesDb.transactions.where('category_id').equals(categoryId).delete();
  await expensesDb.expense_categories.delete(categoryId);
}

export async function getMonthRange(year: number, monthIndex: number): Promise<{ start: string; end: string }> {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);
  const toISODate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  return { start: toISODate(start), end: toISODate(end) };
}
