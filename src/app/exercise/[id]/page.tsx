'use client';

export const dynamic = 'force-static';
export const runtime = 'edge';

import { useRouter, useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatDate, formatWeight, daysSince } from '@/lib/utils';

export default function ExerciseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const exerciseId = params.id as string;

  const data = useLiveQuery(async () => {
    const exercise = await db.exercises.get(exerciseId);
    if (!exercise) return null;
    const category = await db.categories.get(exercise.category_id);
    const records = await db.exercise_records.where('exercise_id').equals(exerciseId).toArray();

    const totalSessions = records.length;
    const personalBest = records.length > 0 ? Math.max(...records.map((r) => r.weight)) : null;
    const sortedRecords = records.sort(
      (a, b) => new Date(b.exercise_date).getTime() - new Date(a.exercise_date).getTime()
    );
    const lastRecord = sortedRecords[0] || null;

    return { exercise, category, totalSessions, personalBest, lastRecord };
  }, [exerciseId]);

  if (data === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gym-muted animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gym-muted">Ejercicio no encontrado</p>
      </div>
    );
  }

  const { exercise, category, totalSessions, personalBest, lastRecord } = data;
  const daysSinceLast = daysSince(exercise.last_record_date);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gym-surface border-b border-gym-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => router.push(category ? `/category/${category.id}` : '/')}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gym-border transition-colors flex-shrink-0"
            >
              <svg className="w-6 h-6 text-gym-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gym-text truncate">{exercise.name}</h1>
              {category && <p className="text-xs text-gym-muted">{category.name}</p>}
            </div>
          </div>
          <button
            onClick={() => router.push(`/exercise/${exerciseId}/edit`)}
            className="w-10 h-10 rounded-full hover:bg-gym-border transition-colors flex items-center justify-center flex-shrink-0 ml-2"
          >
            <svg className="w-5 h-5 text-gym-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gym-card border border-gym-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-gym-accent">
              {personalBest !== null ? formatWeight(personalBest) : '-'}
            </p>
            <p className="text-xs text-gym-muted mt-1">Mejor marca</p>
          </div>
          <div className="bg-gym-card border border-gym-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-gym-text">{totalSessions}</p>
            <p className="text-xs text-gym-muted mt-1">Sesiones</p>
          </div>
          <div className="bg-gym-card border border-gym-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-gym-text">
              {daysSinceLast !== null ? daysSinceLast : '-'}
            </p>
            <p className="text-xs text-gym-muted mt-1">
              {daysSinceLast !== null ? 'días' : 'días'}
            </p>
          </div>
        </div>

        {/* Last record */}
        {lastRecord && (
          <div className="bg-gym-card border border-gym-border rounded-2xl p-4">
            <p className="text-sm text-gym-muted mb-3">Último registro</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-gym-text">{formatWeight(lastRecord.weight)}</p>
                <p className="text-sm text-gym-muted mt-1">{formatDate(lastRecord.exercise_date)}</p>
              </div>
              {lastRecord.image_path && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-gym-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lastRecord.image_path} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            {lastRecord.comment && (
              <p className="text-sm text-gym-text/70 mt-3 border-t border-gym-border pt-3">
                {lastRecord.comment}
              </p>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push(`/exercise/${exerciseId}/record/new`)}
            className="bg-gym-accent hover:bg-gym-accent-dark text-white rounded-2xl p-4 flex items-center gap-3 transition-colors"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-sm">Agregar registro</span>
          </button>
          <button
            onClick={() => router.push(`/exercise/${exerciseId}/history`)}
            className="bg-gym-card hover:bg-gym-border border border-gym-border text-gym-text rounded-2xl p-4 flex items-center gap-3 transition-colors"
          >
            <div className="w-10 h-10 bg-gym-border rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-gym-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-sm">Historial</span>
          </button>
          <button
            onClick={() => router.push(`/exercise/${exerciseId}/table`)}
            className="bg-gym-card hover:bg-gym-border border border-gym-border text-gym-text rounded-2xl p-4 flex items-center gap-3 transition-colors"
          >
            <div className="w-10 h-10 bg-gym-border rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-gym-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-sm">Tabla</span>
          </button>
          <button
            onClick={() => router.push(`/exercise/${exerciseId}/chart`)}
            className="bg-gym-card hover:bg-gym-border border border-gym-border text-gym-text rounded-2xl p-4 flex items-center gap-3 transition-colors"
          >
            <div className="w-10 h-10 bg-gym-border rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-gym-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <span className="font-semibold text-sm">Gráfico</span>
          </button>
        </div>

        {totalSessions === 0 && (
          <div className="bg-gym-card border border-gym-border rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🏋️</div>
            <p className="text-gym-text font-medium mb-1">Sin registros aún</p>
            <p className="text-sm text-gym-muted">¡Agrega tu primer registro para empezar a trackear tu progreso!</p>
          </div>
        )}
      </main>
    </div>
  );
}
