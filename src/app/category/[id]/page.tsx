'use client';

export const dynamic = 'force-static';
export const runtime = 'edge';

import { useRouter, useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { sortByLeastRecent, isImageIcon } from '@/lib/utils';
import ExerciseCard from '@/components/ExerciseCard';
import EmptyState from '@/components/EmptyState';

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const data = useLiveQuery(async () => {
    const category = await db.categories.get(categoryId);
    if (!category) return null;
    const exercises = await db.exercises.where('category_id').equals(categoryId).toArray();
    const sorted = sortByLeastRecent(exercises, 'last_record_date');
    return { category, exercises: sorted };
  }, [categoryId]);

  if (data === undefined) {
    return (
      <div className="h-full flex flex-col">
        <header className="sticky top-0 z-10 bg-gym-surface border-b border-gym-border px-4 py-3">
          <div className="h-6 bg-gym-border rounded animate-pulse w-32" />
        </header>
        <main className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gym-card border border-gym-border rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gym-border rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gym-border rounded w-28" />
                  <div className="h-3 bg-gym-border rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gym-muted">Categoría no encontrada</p>
      </div>
    );
  }

  const { category, exercises } = data;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gym-surface border-b border-gym-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gym-border transition-colors flex-shrink-0"
            >
              <svg className="w-6 h-6 text-gym-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gym-card border border-gym-border flex-shrink-0 overflow-hidden">
                {isImageIcon(category.icon_image) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={category.icon_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl flex items-center justify-center w-full h-full">{category.icon_image}</span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-gym-text truncate font-orbitron">{category.name}</h1>
                <p className="text-xs text-gym-muted">
                  {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <button
              onClick={() => router.push(`/category/${categoryId}/edit`)}
              className="w-10 h-10 rounded-full hover:bg-gym-border transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-gym-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => router.push(`/exercise/new?categoryId=${categoryId}`)}
              className="w-12 h-12 bg-gym-accent hover:bg-gym-accent-dark rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-gym-accent/25"
              aria-label="Nuevo ejercicio"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {exercises.length > 0 ? (
          <div className="flex flex-col gap-3">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                categoryIcon={category.icon_image}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={category.icon_image}
            title="Sin ejercicios"
            description="Agrega tu primer ejercicio a esta categoría"
            action={
              <button
                onClick={() => router.push(`/exercise/new?categoryId=${categoryId}`)}
                className="bg-gym-accent hover:bg-gym-accent-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Agregar ejercicio
              </button>
            }
          />
        )}
      </main>

      {exercises.length > 0 && (
        <div className="px-4 pb-6 pt-2">
          <p className="text-xs text-gym-muted text-center">
            Mantén presionado para editar
          </p>
        </div>
      )}
    </div>
  );
}
