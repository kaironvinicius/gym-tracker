'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Exercise, deleteExerciseWithCascade } from '@/lib/db';
import { sortByLeastRecent, generateId } from '@/lib/utils';

export function useExercisesByCategory(categoryId: string) {
  const rawExercises = useLiveQuery(
    () => db.exercises.where('category_id').equals(categoryId).toArray(),
    [categoryId]
  );

  const exercises = rawExercises ? sortByLeastRecent(rawExercises, 'last_record_date') : undefined;
  return { exercises };
}

export function useExercise(exerciseId: string) {
  const data = useLiveQuery(async () => {
    const exercise = await db.exercises.get(exerciseId);
    if (!exercise) return null;
    const category = await db.categories.get(exercise.category_id);
    return { exercise, category };
  }, [exerciseId]);

  return data;
}

export function useExerciseStats(exerciseId: string) {
  const data = useLiveQuery(async () => {
    const records = await db.exercise_records
      .where('exercise_id')
      .equals(exerciseId)
      .toArray();

    if (records.length === 0) {
      return { totalSessions: 0, personalBest: null, lastDate: null };
    }

    const totalSessions = records.length;
    const personalBest = Math.max(...records.map((r) => r.weight));
    const sorted = records.sort(
      (a, b) => new Date(b.exercise_date).getTime() - new Date(a.exercise_date).getTime()
    );
    const lastDate = sorted[0].exercise_date;

    return { totalSessions, personalBest, lastDate };
  }, [exerciseId]);

  return data;
}

export async function createExercise(data: {
  category_id: string;
  name: string;
}): Promise<Exercise> {
  const now = new Date().toISOString();
  const exercise: Exercise = {
    id: generateId(),
    category_id: data.category_id,
    name: data.name,
    last_record_date: null,
    created_at: now,
    updated_at: now,
  };
  await db.exercises.add(exercise);
  return exercise;
}

export async function updateExercise(
  id: string,
  data: { name: string; category_id: string }
): Promise<void> {
  await db.exercises.update(id, {
    name: data.name,
    category_id: data.category_id,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteExercise(id: string): Promise<void> {
  await deleteExerciseWithCascade(id);
}
