'use client';

export const dynamic = 'force-static';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import PageHeader from '@/components/PageHeader';
import ConfirmDialog from '@/components/ConfirmDialog';
import { updateExercise, deleteExercise } from '@/hooks/useExercises';

export default function EditExercisePage() {
  const router = useRouter();
  const params = useParams();
  const exerciseId = params.id as string;

  const data = useLiveQuery(async () => {
    const exercise = await db.exercises.get(exerciseId);
    const categories = await db.categories.toArray();
    return { exercise, categories };
  }, [exerciseId]);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (data?.exercise) {
      setName(data.exercise.name);
      setCategoryId(data.exercise.category_id);
    }
  }, [data]);

  const selectedCategory = data?.categories?.find((c) => c.id === categoryId);

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
      await updateExercise(exerciseId, { name: name.trim(), category_id: categoryId });
      router.push(`/exercise/${exerciseId}`);
    } catch {
      setError('Error al guardar el ejercicio');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const exercise = data?.exercise;
      await deleteExercise(exerciseId);
      if (exercise) {
        router.push(`/category/${exercise.category_id}`);
      } else {
        router.push('/');
      }
    } catch {
      setError('Error al eliminar el ejercicio');
    }
  };

  if (!data?.exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gym-muted">Ejercicio no encontrado</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Editar ejercicio" />

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
            {data.categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon_image.startsWith('data:') ? '🖼️' : cat.icon_image} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Icon preview */}
        {selectedCategory && (
          <div className="bg-gym-card border border-gym-border rounded-xl p-4">
            <p className="text-sm text-gym-muted mb-3">Vista previa</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gym-surface border border-gym-border flex items-center justify-center">
                {selectedCategory.icon_image.startsWith('data:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedCategory.icon_image} alt="" className="w-8 h-8 object-cover rounded-lg" />
                ) : (
                  <span className="text-2xl">{selectedCategory.icon_image}</span>
                )}
              </div>
              <div>
                <p className="text-gym-text font-medium">{name || 'Nombre del ejercicio'}</p>
                <p className="text-xs text-gym-muted mt-1">{selectedCategory.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Delete button */}
        <div className="pt-4">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 px-4 rounded-xl border border-gym-red/50 text-gym-red hover:bg-gym-red/10 transition-colors font-medium"
          >
            Eliminar ejercicio
          </button>
        </div>

        {error && <p className="text-sm text-gym-red">{error}</p>}
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

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar ejercicio"
        message="Esta acción eliminará el ejercicio y todo su historial de registros."
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        danger
      />
    </div>
  );
}
