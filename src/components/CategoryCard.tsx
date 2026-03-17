'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { type Category } from '@/lib/db';
import { formatDate, getActivityColor, daysSince } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  exerciseCount: number;
}

export default function CategoryCard({ category, exerciseCount }: CategoryCardProps) {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const days = daysSince(category.last_exercise_date);

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
      router.push(`/category/${category.id}`);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-gym-card border border-gym-border rounded-2xl p-4 cursor-pointer hover:border-gym-accent/50 hover:bg-gym-card/80 transition-all active:scale-98"
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gym-surface flex items-center justify-center flex-shrink-0 border border-gym-border">
            {category.icon_image.startsWith('data:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={category.icon_image}
                alt={category.name}
                className="w-10 h-10 object-cover rounded-xl"
              />
            ) : (
              <span className="text-3xl">{category.icon_image}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gym-text text-base truncate">{category.name}</h3>
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${getActivityColor(category.last_exercise_date)}`}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gym-muted">
                {exerciseCount} ejercicio{exerciseCount !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-gym-muted">•</span>
              <span className="text-xs text-gym-muted">
                {category.last_exercise_date
                  ? days === 0
                    ? 'Hoy'
                    : days === 1
                    ? 'Ayer'
                    : `Hace ${days} días`
                  : 'Sin actividad'}
              </span>
            </div>
            <p className="text-xs text-gym-muted mt-1">
              {formatDate(category.last_exercise_date)}
            </p>
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
                <span className="text-2xl">{category.icon_image.startsWith('data:') ? '🖼️' : category.icon_image}</span>
                <span className="font-semibold text-gym-text">{category.name}</span>
              </div>
            </div>
            <button
              onClick={() => { setShowActions(false); router.push(`/category/${category.id}/edit`); }}
              className="w-full px-4 py-4 text-left text-gym-text hover:bg-gym-border transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar categoría
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
