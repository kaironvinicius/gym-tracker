'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { expensesDb, type ExpenseCategoryKind } from '@/lib/expensesDb';
import { formatAmountInput, parseAmount } from '@/lib/expensesUtils';
import PageHeader from '@/components/PageHeader';
import ConfirmDialog from '@/components/ConfirmDialog';

export const runtime = 'edge';

export default function EditTransactionPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const tx = useLiveQuery(async () => expensesDb.transactions.get(id), [id]);

  const [kind, setKind] = useState<ExpenseCategoryKind>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (tx && !hydrated) {
      setKind(tx.kind);
      setAmount(String(tx.amount));
      setCategoryId(tx.category_id);
      setDate(tx.date);
      setNote(tx.note);
      setHydrated(true);
    }
  }, [tx, hydrated]);

  const categories = useLiveQuery(
    async () => expensesDb.expense_categories.where('kind').equals(kind).toArray(),
    [kind]
  );

  const filteredCategories = useMemo(
    () => (categories ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  const canSave = parseAmount(amount) > 0 && categoryId && date && !saving;

  const handleSave = async () => {
    if (!canSave || !tx) return;
    setSaving(true);
    await expensesDb.transactions.update(tx.id, {
      kind,
      amount: parseAmount(amount),
      category_id: categoryId,
      date,
      note: note.trim(),
      updated_at: new Date().toISOString(),
    });
    router.push('/');
  };

  const handleDelete = async () => {
    if (!tx) return;
    await expensesDb.transactions.delete(tx.id);
    router.push('/');
  };

  if (!tx && hydrated === false) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader title="Cargando…" backHref="/" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Editar transacción"
        backHref="/"
        rightElement={
          <button
            onClick={() => setShowDelete(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gym-red/20 transition-colors"
            aria-label="Eliminar"
          >
            <svg className="w-5 h-5 text-gym-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3"
              />
            </svg>
          </button>
        }
      />
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
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

        <div className="bg-gym-card border border-gym-border rounded-2xl p-4">
          <label className="block text-xs uppercase tracking-wide text-gym-muted mb-2">
            Categoría
          </label>
          {filteredCategories.length === 0 ? (
            <div className="text-sm text-gym-muted">
              No hay categorías.{' '}
              <button
                onClick={() => router.push(`/categories/new?kind=${kind}`)}
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

        <div className="bg-gym-card border border-gym-border rounded-2xl p-4">
          <label className="block text-xs uppercase tracking-wide text-gym-muted mb-2">
            Nota (opcional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
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

      <ConfirmDialog
        isOpen={showDelete}
        title="Eliminar transacción"
        message="¿Seguro que quieres eliminar esta transacción? No se puede deshacer."
        confirmLabel="Eliminar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
