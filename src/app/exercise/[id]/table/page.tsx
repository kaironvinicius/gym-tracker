'use client';

import { useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { formatDateShort, formatWeight } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function TablePage() {
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
        <PageHeader title="Tabla" />
        <div className="p-4 animate-pulse">
          <div className="h-48 bg-gym-card rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader title="Tabla" />
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
        title="Tabla"
        subtitle={exercise.name}
        backHref={`/exercise/${exerciseId}`}
      />

      <main className="flex-1 overflow-y-auto p-4">
        {records.length > 0 ? (
          <div className="bg-gym-card border border-gym-border rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[80px_80px_70px_1fr_44px] gap-0 border-b border-gym-border bg-gym-surface">
              <div className="px-3 py-3 text-xs font-semibold text-gym-muted uppercase">Fecha</div>
              <div className="px-2 py-3 text-xs font-semibold text-gym-muted uppercase">Peso</div>
              <div className="px-2 py-3 text-xs font-semibold text-gym-muted uppercase">Var.</div>
              <div className="px-2 py-3 text-xs font-semibold text-gym-muted uppercase">Comentario</div>
              <div className="px-2 py-3 text-xs font-semibold text-gym-muted uppercase">Foto</div>
            </div>

            {/* Table rows */}
            {records.map((record, index) => {
              const prevWeight = index < records.length - 1 ? records[index + 1].weight : null;
              const variation = prevWeight !== null ? record.weight - prevWeight : null;

              return (
                <div
                  key={record.id}
                  onClick={() => router.push(`/exercise/${exerciseId}/record/${record.id}/edit`)}
                  className={`grid grid-cols-[80px_80px_70px_1fr_44px] gap-0 border-b border-gym-border last:border-b-0 cursor-pointer hover:bg-gym-border/50 transition-colors ${
                    index % 2 === 0 ? '' : 'bg-gym-surface/30'
                  }`}
                >
                  <div className="px-3 py-3 text-xs text-gym-text">
                    {formatDateShort(record.exercise_date)}
                  </div>
                  <div className="px-2 py-3 text-xs font-semibold text-gym-accent">
                    {formatWeight(record.weight)}
                  </div>
                  <div className="px-2 py-3 text-xs">
                    {variation !== null ? (
                      <span
                        className={
                          variation > 0
                            ? 'text-gym-green'
                            : variation < 0
                            ? 'text-gym-red'
                            : 'text-gym-muted'
                        }
                      >
                        {variation > 0 ? '+' : ''}{variation.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gym-muted">-</span>
                    )}
                  </div>
                  <div className="px-2 py-3 text-xs text-gym-muted truncate">
                    {record.comment || '-'}
                  </div>
                  <div className="px-2 py-3 flex items-center justify-center">
                    {record.image_path ? (
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-gym-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={record.image_path} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-gym-muted text-xs">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="📊"
            title="Sin datos"
            description="Agrega registros para ver la tabla de progreso"
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
