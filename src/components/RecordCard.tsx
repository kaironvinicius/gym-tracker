'use client';

import { useRouter } from 'next/navigation';
import { type ExerciseRecord } from '@/lib/db';
import { formatDate, formatWeight } from '@/lib/utils';

interface RecordCardProps {
  record: ExerciseRecord;
  exerciseId: string;
  previousWeight?: number | null;
}

export default function RecordCard({ record, exerciseId, previousWeight }: RecordCardProps) {
  const router = useRouter();

  const variation =
    previousWeight !== null && previousWeight !== undefined
      ? record.weight - previousWeight
      : null;

  return (
    <div
      onClick={() => router.push(`/exercise/${exerciseId}/record/${record.id}/edit`)}
      className="bg-gym-card border border-gym-border rounded-2xl p-4 cursor-pointer hover:border-gym-accent/50 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Date + weight */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-base font-bold text-gym-accent">{formatWeight(record.weight)}</span>
            {variation !== null && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  variation > 0
                    ? 'bg-gym-green/20 text-gym-green'
                    : variation < 0
                    ? 'bg-gym-red/20 text-gym-red'
                    : 'bg-gym-border text-gym-muted'
                }`}
              >
                {variation > 0 ? '+' : ''}{variation.toFixed(1)} kg
              </span>
            )}
          </div>
          <p className="text-sm text-gym-muted mb-1">{formatDate(record.exercise_date)}</p>
          {record.comment && (
            <p className="text-sm text-gym-text/80 mt-2 line-clamp-2">{record.comment}</p>
          )}
        </div>

        {/* Image thumbnail */}
        {record.image_path && (
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gym-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={record.image_path}
              alt="Foto del registro"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Edit indicator */}
      <div className="flex justify-end mt-2">
        <span className="text-xs text-gym-muted flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar
        </span>
      </div>
    </div>
  );
}
