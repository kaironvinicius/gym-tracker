'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { expensesDb, type ExpenseCategoryKind } from '@/lib/expensesDb';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

export default function CategoriesPage() {
  const router = useRouter();
  const [kind, setKind] = useState<ExpenseCategoryKind>('expense');

  const categories = useLiveQuery(
    async () =>
      (await expensesDb.expense_categories.where('kind').equals(kind).toArray()).sort(
        (a, b) => a.name.localeCompare(b.name)
      ),
    [kind]
  );

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Categorías"
        backHref="/"
        rightElement={
          <button
            onClick={() => router.push(`/categories/new?kind=${kind}`)}
            className="w-10 h-10 bg-gym-accent rounded-xl flex items-center justify-center hover:bg-gym-accent-dark transition-colors"
            aria-label="Nueva categoría"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        }
      />
      <main className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-2 bg-gym-card border border-gym-border rounded-2xl p-1 mb-4">
          <button
            onClick={() => setKind('expense')}
            className={`py-2 rounded-xl text-sm font-medium transition-colors ${
              kind === 'expense' ? 'bg-gym-red text-white' : 'text-gym-muted'
            }`}
          >
            Gastos
          </button>
          <button
            onClick={() => setKind('income')}
            className={`py-2 rounded-xl text-sm font-medium transition-colors ${
              kind === 'income' ? 'bg-gym-green text-white' : 'text-gym-muted'
            }`}
          >
            Ingresos
          </button>
        </div>

        {categories === undefined ? (
          <div className="text-sm text-gym-muted text-center py-8">Cargando…</div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon="🗂️"
            title={`Sin categorías de ${kind === 'expense' ? 'gasto' : 'ingreso'}`}
            description="Crea categorías para organizar tus movimientos."
            action={
              <button
                onClick={() => router.push(`/categories/new?kind=${kind}`)}
                className="bg-gym-accent hover:bg-gym-accent-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Nueva categoría
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/categories/${cat.id}/edit`)}
                className="w-full text-left bg-gym-card border border-gym-border hover:border-gym-accent/40 rounded-2xl p-3 flex items-center gap-3 transition-colors active:scale-98"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: cat.color + '33' }}
                >
                  {cat.icon_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.icon_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gym-text truncate">{cat.name}</div>
                </div>
                <svg
                  className="w-4 h-4 text-gym-muted flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
