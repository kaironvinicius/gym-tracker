'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { expensesDb, type ExpenseCategoryKind } from '@/lib/expensesDb';
import { CATEGORY_COLORS } from '@/lib/expensesUtils';
import { ICON_OPTIONS, generateId } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';

export default function NewCategoryPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initialKind = (params.get('kind') as ExpenseCategoryKind) || 'expense';

  const [kind, setKind] = useState<ExpenseCategoryKind>(initialKind);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0]);
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const now = new Date().toISOString();
    await expensesDb.expense_categories.add({
      id: generateId(),
      name: name.trim(),
      kind,
      icon_image: icon,
      color,
      created_at: now,
      updated_at: now,
    });
    router.push('/categories');
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Nueva categoría" backHref="/categories" />
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
            placeholder="Ej: Comida, Transporte…"
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
                  color === c ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white scale-110' : ''
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
          Crear categoría
        </button>
      </main>
    </div>
  );
}
