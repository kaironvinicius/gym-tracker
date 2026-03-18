'use client';

import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { sortByLeastRecent } from '@/lib/utils';
import CategoryCard from '@/components/CategoryCard';
import EmptyState from '@/components/EmptyState';

export default function CategoriesPage() {
  const router = useRouter();

  const data = useLiveQuery(async () => {
    const categories = await db.categories.toArray();
    const sorted = sortByLeastRecent(categories, 'last_exercise_date');

    const withCounts = await Promise.all(
      sorted.map(async (cat) => {
        const count = await db.exercises.where('category_id').equals(cat.id).count();
        return { category: cat, exerciseCount: count };
      })
    );

    return withCounts;
  });

  const isLoading = data === undefined;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gym-surface border-b border-gym-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-3xl text-gym-text font-orbitron">
              <span className="text-gym-accent">Gym</span> Bro
            </h1>
            <p className="text-xs text-gym-muted">
              {data ? `${data.length} categoría${data.length !== 1 ? 's' : ''}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/settings')}
              className="w-10 h-10 bg-gym-card border border-gym-border hover:border-gym-accent/50 rounded-xl flex items-center justify-center transition-colors"
              aria-label="Ajustes"
            >
              <svg className="w-5 h-5 text-gym-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => router.push('/category/new')}
              className="w-12 h-12 bg-gym-accent hover:bg-gym-accent-dark rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-gym-accent/25"
              aria-label="Nueva categoría"
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
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gym-card border border-gym-border rounded-2xl p-4 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gym-border rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gym-border rounded w-32" />
                    <div className="h-3 bg-gym-border rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="flex flex-col gap-3">
            {data.map(({ category, exerciseCount }) => (
              <CategoryCard
                key={category.id}
                category={category}
                exerciseCount={exerciseCount}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🏋️"
            title="Sin Rutinas"
            description="Añade aquí tus rutinas: Pecho, Espalda, Brazos, etc."
            action={
              <button
                onClick={() => router.push('/category/new')}
                className="bg-gym-accent hover:bg-gym-accent-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Crear categoría
              </button>
            }
          />
        )}
      </main>

      {/* Bottom tip */}
      {data && data.length > 0 && (
        <div className="px-4 pb-6 pt-2">
          <p className="text-xs text-gym-muted text-center">
            Mantén presionado una tarjeta para editar
          </p>
        </div>
      )}
    </div>
  );
}
