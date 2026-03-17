'use client';

import { useRouter, useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import PageHeader from '@/components/PageHeader';
import RecordCard from '@/components/RecordCard';
import EmptyState from '@/components/EmptyState';

export default function HistoryPage() {
  const params = useParams();
  const exerciseId = params.id as string;
  const router = useRouter();

  const data = useLiveQuery(async () => {
    const exercise = await db.exercises.get(exerciseId);
    if (!exercise) return null;
    const records = await db.exercise_records
      .where('exercise_id')
      .equals(exerciseId)
      .toArray();
    const sorted = records.sort(
      (a, b) => new Date(b.exercise_date).getTime() - new Date(a.exercise_date).getTime()
    );
    return { exercise, records: sorted };
  }, [exerciseId]);

  if (data === undefined) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader title="Historial" />
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gym-card border border-gym-border rounded-2xl p-4 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader title="Historial" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gym-muted">Ejercicio no encontrado</p>
        </div>
      </div>
    );
  }

  const { exercise, records } = data;

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Historial"
        subtitle={exercise.name}
        backHref={`/exercise/${exerciseId}`}
        rightElement={
          <button
            onClick={() => router.push(`/exercise/${exerciseId}/record/new`)}
            className="w-10 h-10 bg-gym-accent hover:bg-gym-accent-dark rounded-xl flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto p-4">
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.map((record, index) => (
              <RecordCard
                key={record.id}
                record={record}
                exerciseId={exerciseId}
                previousWeight={index < records.length - 1 ? records[index + 1].weight : null}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📋"
            title="Sin registros"
            description="Aún no hay registros para este ejercicio"
            action={
              <button
                onClick={() => router.push(`/exercise/${exerciseId}/record/new`)}
                className="bg-gym-accent hover:bg-gym-accent-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Agregar registro
              </button>
            }
          />
        )}
      </main>
    </div>
  );
}
