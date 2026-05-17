'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { expensesDb, type ExpenseCategoryKind } from '@/lib/expensesDb';
import { formatAmountInput, parseAmount } from '@/lib/expensesUtils';
import { generateId, getTodayISO } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';

export default function NewTransactionPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initialKind = (params.get('kind') as ExpenseCategoryKind) || 'expense';

  const [kind, setKind] = useState<ExpenseCategoryKind>(initialKind);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState(getTodayISO());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = useLiveQuery(
    async () => expensesDb.expense_categories.where('kind').equals(kind).toArray(),
    [kind]
  );

  const filteredCategories = useMemo(
    () => (categories ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.find((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0].id);
    } else if (filteredCategories.length === 0) {
      setCategoryId('');
    }
  }, [filteredCategories, categoryId]);

  const canSave = parseAmount(amount) > 0 && categoryId && date && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const now = new Date().toISOString();
    await expensesDb.transactions.add({
      id: generateId(),
      category_id: categoryId,
      kind,
      amount: parseAmount(amount),
      date,
      note: note.trim(),
      created_at: now,
      updated_at: now,
    });
    router.push('/expenses');
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Nueva transacción" backHref="/expenses" />
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Kind toggle */}
        <div className="grid grid-cols-2 gap-2 bg-gym-card border border-gym-border rounded-2xl p-1">
          <button
            onClick={() => setKind('expense')}
            className={`py-2 rounded-xl text-sm font-medium transition-colors ${
              kind === 'expense' ? 'bg-gym-red text-white' : 'text-gym-muted'
            }`}
          >
            Gasto
          </button>
          <button
            onClick={() => setKind('income')}
            className={`py-2 rounded-xl text-sm font-medium transition-colors ${
              kind === 'income' ? 'bg-gym-green text-white' : 'text-gym-muted'
            }`}
          >
            Ingreso
          </button>
        </div>

        {/* Amount */}
        <div className="bg-gym-card border border-gym-border rounded-2xl p-4">
          <label className="block text-xs uppercase tracking-wide text-gym-muted mb-2">
            Importe (€)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(formatAmountInput(e.target.value))}
            placeholder="0.00"
            className="w-full bg-transparent text-3xl font-orbitron text-gym-text focus:outline-none"
          />
        </div>

        {/* Category */}
        <div className="bg-gym-card border border-gym-border rounded-2xl p-4">
          <label className="block text-xs uppercase tracking-wide text-gym-muted mb-2">
            Categoría
          </label>
          {filteredCategories.length === 0 ? (
            <div className="text-sm text-gym-muted">
              No hay categorías de {kind === 'expense' ? 'gasto' : 'ingreso'}.{' '}
              <button
                onClick={() =>
                  router.push(`/expenses/categories/new?kind=${kind}`)
                }
                className="text-gym-accent underline"
              >
                Crear una
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredCategories.map((cat) => {
                const selected = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                      selected
                        ? 'border-gym-accent bg-gym-accent/10'
                        : 'border-gym-border bg-gym-card/50'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center"
                      style={{ backgroundColor: cat.color + '33' }}
                    >
                      {cat.icon_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cat.icon_image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      )}
                    </span>
                    <span className="text-sm text-gym-text">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Date */}
        <div className="bg-gym-card border border-gym-border rounded-2xl p-4">
          <label className="block text-xs uppercase tracking-wide text-gym-muted mb-2">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-gym-text focus:outline-none"
          />
        </div>

        {/* Note */}
        <div className="bg-gym-card border border-gym-border rounded-2xl p-4">
          <label className="block text-xs uppercase tracking-wide text-gym-muted mb-2">
            Nota (opcional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="¿En qué fue?"
            className="w-full bg-transparent text-gym-text focus:outline-none resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="btn-save w-full bg-gym-accent hover:bg-gym-accent-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Guardar
        </button>
      </main>
    </div>
  );
}
