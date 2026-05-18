'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import PageHeader from '@/components/PageHeader';
import { createExercise } from '@/hooks/useExercises';

function NewExerciseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategoryId = searchParams.get('categoryId');

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(preselectedCategoryId || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = useLiveQuery(() => db.categories.toArray());

  useEffect(() => {
    if (preselectedCategoryId) {
      setCategoryId(preselectedCategoryId);
    } else if (categories && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, preselectedCategoryId, categoryId]);

  const selectedCategory = categories?.find((c) => c.id === categoryId);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!categoryId) {
      setError('Selecciona una categoría');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const exercise = await createExercise({ category_id: categoryId, name: name.trim() });
      router.push(`/exercise/${exercise.id}`);
    } catch {
      setError('Error al guardar el ejercicio');
      setSaving(false);
    }
  };

  const backHref = preselectedCategoryId ? `/category/${preselectedCategoryId}` : '/';

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Nuevo ejercicio" backHref={backHref} />

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Name field */}
        <div>
          <label className="block text-sm font-medium text-gym-muted mb-2">
            Nombre *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Press de banca, Sentadilla..."
            className="w-full bg-gym-card border border-gym-border rounded-xl px-4 py-3 text-gym-text placeholder:text-gym-muted focus:border-gym-accent transition-colors"
            maxLength={80}
            autoFocus
          />
        </div>

        {/* Category selector */}
        <div>
          <label className="block text-sm font-medium text-gym-muted mb-2">
            Categoría *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-gym-card border border-gym-border rounded-xl px-4 py-3 text-gym-text focus:border-gym-accent transition-colors appearance-none"
          >
            <option value="" disabled>Selecciona una categoría</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Icon preview */}
        {selectedCategory && (
          <div className="bg-gym-card border border-gym-border rounded-xl p-4">
            <p className="text-sm text-gym-muted mb-3">Vista previa del icono</p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gym-surface border border-gym-border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedCategory.icon_image} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-gym-text font-medium">{name || 'Nombre del ejercicio'}</p>
                <p className="text-xs text-gym-muted mt-1">
                  Hereda el icono de {selectedCategory.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {categories?.length === 0 && (
          <div className="bg-gym-card border border-gym-border rounded-xl p-4 text-center">
            <p className="text-gym-muted text-sm">No hay categorías disponibles.</p>
            <button
              onClick={() => router.push('/category/new')}
              className="text-gym-accent text-sm mt-2 hover:underline"
            >
              Crear una categoría primero
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-gym-red">{error}</p>
        )}
      </main>

      {/* Actions */}
      <div className="p-4 border-t border-gym-border flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 py-3 px-4 rounded-xl border border-gym-border text-gym-text font-medium hover:bg-gym-border transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !name.trim() || !categoryId}
          className="flex-1 py-3 px-4 rounded-xl bg-gym-accent hover:bg-gym-accent-dark text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-save"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

export default function NewExercisePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gym-muted">Cargando...</p></div>}>
      <NewExerciseForm />
    </Suspense>
  );
}
