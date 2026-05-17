'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { type Exercise } from '@/lib/db';
import { formatDate, getActivityColor, formatWeight, daysSince, isImageIcon } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

interface ExerciseCardProps {
  exercise: Exercise;
  categoryIcon: string;
}

export default function ExerciseCard({ exercise, categoryIcon }: ExerciseCardProps) {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const lastRecord = useLiveQuery(async () => {
    const records = await db.exercise_records
      .where('exercise_id')
      .equals(exercise.id)
      .toArray();
    if (records.length === 0) return null;
    return records.sort(
      (a, b) => new Date(b.exercise_date).getTime() - new Date(a.exercise_date).getTime()
    )[0];
  }, [exercise.id]);

  const days = daysSince(exercise.last_record_date);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    longPressTimer.current = setTimeout(() => {
      setShowActions(true);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
    if (dx > 10 || dy > 10) {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleClick = () => {
    if (!showActions) {
      router.push(`/exercise/${exercise.id}`);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-gym-card border border-gym-border rounded-2xl p-4 cursor-pointer hover:border-gym-accent/50 transition-all active:scale-98"
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gym-surface flex-shrink-0 border border-gym-border overflow-hidden">
            {isImageIcon(categoryIcon) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={categoryIcon} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl flex items-center justify-center w-full h-full">{categoryIcon}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gym-text text-base truncate">{exercise.name}</h3>
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${getActivityColor(exercise.last_record_date)}`}
              />
            </div>
            <div className="flex items-center gap-3">
              {lastRecord ? (
                <span className="text-sm font-medium text-gym-accent">
                  {formatWeight(lastRecord.weight)}
                </span>
              ) : (
                <span className="text-xs text-gym-muted">Sin registros</span>
              )}
              {exercise.last_record_date && (
                <>
                  <span className="text-xs text-gym-muted">•</span>
                  <span className="text-xs text-gym-muted">
                    {days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days} días`}
                  </span>
                </>
              )}
            </div>
            {exercise.last_record_date && (
              <p className="text-xs text-gym-muted mt-0.5">{formatDate(exercise.last_record_date)}</p>
            )}
          </div>

          {/* Arrow */}
          <svg
            className="w-5 h-5 text-gym-muted flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Actions overlay */}
      {showActions && (
        <div className="fixed inset-0 z-40 flex items-end justify-center p-4 bg-black/60" onClick={() => setShowActions(false)}>
          <div className="w-full max-w-sm bg-gym-card border border-gym-border rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gym-border">
              <div className="flex items-center gap-3">
                {isImageIcon(categoryIcon) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={categoryIcon} alt="" className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-xl">{categoryIcon}</span>
                )}
                <span className="font-semibold text-gym-text">{exercise.name}</span>
              </div>
            </div>
            <button
              onClick={() => { setShowActions(false); router.push(`/exercise/${exercise.id}/edit`); }}
              className="w-full px-4 py-4 text-left text-gym-text hover:bg-gym-border transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar ejercicio
            </button>
            <button
              onClick={() => setShowActions(false)}
              className="w-full px-4 py-4 text-left text-gym-muted hover:bg-gym-border transition-colors border-t border-gym-border"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
