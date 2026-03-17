'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import PageHeader from '@/components/PageHeader';
import { createRecord } from '@/hooks/useRecords';
import { getTodayISO, imageToBase64 } from '@/lib/utils';

export default function NewRecordPage() {
  const router = useRouter();
  const params = useParams();
  const exerciseId = params.id as string;

  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [comment, setComment] = useState('');
  const [image, setImage] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const exercise = useLiveQuery(() => db.exercises.get(exerciseId), [exerciseId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await imageToBase64(file);
      setImage(base64);
    } catch {
      setError('Error al cargar la imagen');
    }
  };

  const handleSave = async () => {
    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      setError('El peso debe ser un número válido mayor que 0');
      return;
    }
    if (!date) {
      setError('La fecha es obligatoria');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createRecord({
        exercise_id: exerciseId,
        weight: weightNum,
        exercise_date: date,
        comment: comment.trim(),
        image_path: image,
      });
      router.push(`/exercise/${exerciseId}/history`);
    } catch {
      setError('Error al guardar el registro');
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Nuevo registro"
        subtitle={exercise?.name}
        backHref={`/exercise/${exerciseId}`}
      />

      <main className="flex-1 overflow-y-auto p-4 space-y-5 pb-6">
        {/* Weight field */}
        <div>
          <label className="block text-sm font-medium text-gym-muted mb-2">
            Peso (kg) *
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              className="w-full bg-gym-card border border-gym-border rounded-xl px-4 py-4 text-gym-text text-2xl font-bold placeholder:text-gym-border focus:border-gym-accent transition-colors pr-16"
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gym-muted font-medium">
              kg
            </span>
          </div>
        </div>

        {/* Date field */}
        <div>
          <label className="block text-sm font-medium text-gym-muted mb-2">
            Fecha *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={getTodayISO()}
            className="w-full bg-gym-card border border-gym-border rounded-xl px-4 py-3 text-gym-text focus:border-gym-accent transition-colors"
          />
        </div>

        {/* Comment field */}
        <div>
          <label className="block text-sm font-medium text-gym-muted mb-2">
            Comentario
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Notas sobre la sesión, sensaciones, etc."
            rows={3}
            className="w-full bg-gym-card border border-gym-border rounded-xl px-4 py-3 text-gym-text placeholder:text-gym-muted focus:border-gym-accent transition-colors resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gym-muted mt-1 text-right">{comment.length}/500</p>
        </div>

        {/* Photo field */}
        <div>
          <label className="block text-sm font-medium text-gym-muted mb-2">
            Foto
          </label>
          {image ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Foto del registro"
                className="w-full h-48 object-cover rounded-xl border border-gym-border"
              />
              <button
                onClick={() => setImage('')}
                className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gym-border hover:border-gym-accent/50 rounded-xl p-6 text-center transition-colors">
                <svg className="w-8 h-8 text-gym-muted mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-gym-muted">Toca para agregar foto</p>
                <p className="text-xs text-gym-muted/60 mt-1">Opcional</p>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>

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
          disabled={saving || !weight || !date}
          className="flex-1 py-3 px-4 rounded-xl bg-black/70 backdrop-blur-md border-2 border-violet-500/70 hover:bg-black/80 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
