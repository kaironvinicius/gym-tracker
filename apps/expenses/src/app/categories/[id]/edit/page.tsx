'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  expensesDb,
  type ExpenseCategoryKind,
  deleteCategoryWithCascade,
} from '@/lib/expensesDb';
import { CATEGORY_COLORS } from '@/lib/expensesUtils';
import { ICON_OPTIONS } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import ConfirmDialog from '@/components/ConfirmDialog';

export const runtime = 'edge';

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const category = useLiveQuery(async () => expensesDb.expense_categories.get(id), [id]);
  const txCount = useLiveQuery(
    async () => expensesDb.transactions.where('category_id').equals(id).count(),
    [id]
  );

  const [kind, setKind] = useState<ExpenseCategoryKind>('expense');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0]);
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (category && !hydrated) {
      setKind(category.kind);
      setName(category.name);
      setIcon(category.icon_image);
      setColor(category.color);
      setHydrated(true);
    }
  }, [category, hydrated]);

  const canSave = name.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave || !category) return;
    setSaving(true);
    await expensesDb.expense_categories.update(category.id, {
      name: name.trim(),
      kind,
      icon_image: icon,
      color,
      updated_at: new Date().toISOString(),
    });
    router.push('/categories');
  };

  const handleDelete = async () => {
    if (!category) return;
    await deleteCategoryWithCascade(category.id);
    router.push('/categories');
  };

  if (!category) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader title="Cargando…" backHref="/categories" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Editar categoría"
        backHref="/categories"
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
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent text-gym-text focus:outline-none"
          />
        </div>

        <div className="bg-gym-card border border-gym-border rounded-2xl p-4">
          <label className="block text-xs uppercase tracking-wide text-gym-muted mb-3">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-9 h-9 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-white scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div className="bg-gym-card border border-gym-border rounded-2xl p-4">
          <label className="block text-xs uppercase tracking-wide text-gym-muted mb-3">
            Icono
          </label>
          <div className="grid grid-cols-5 gap-2">
            {ICON_OPTIONS.map((src) => (
              <button
                key={src}
                onClick={() => setIcon(src)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                  icon === src ? 'border-gym-accent' : 'border-gym-border'
                }`}
                style={{ backgroundColor: color + '33' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
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
        title="Eliminar categoría"
        message={
          txCount && txCount > 0
            ? `Esta categoría tiene ${txCount} transacción${
                txCount === 1 ? '' : 'es'
              } asociada${txCount === 1 ? '' : 's'}. Al eliminarla, también se borrarán esas transacciones.`
            : '¿Seguro que quieres eliminar esta categoría?'
        }
        confirmLabel="Eliminar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
