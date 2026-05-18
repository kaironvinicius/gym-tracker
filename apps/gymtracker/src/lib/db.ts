import Dexie, { type Table } from 'dexie';

export interface Category {
  id: string;
  name: string;
  icon_image: string;
  last_exercise_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  category_id: string;
  name: string;
  last_record_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseRecord {
  id: string;
  exercise_id: string;
  weight: number;
  exercise_date: string;
  comment: string;
  image_path: string;
  created_at: string;
  updated_at: string;
}

export class GymTrackerDB extends Dexie {
  categories!: Table<Category>;
  exercises!: Table<Exercise>;
  exercise_records!: Table<ExerciseRecord>;

  constructor() {
    super('GymTrackerDB');
    this.version(1).stores({
      categories: 'id, name, last_exercise_date, created_at',
      exercises: 'id, category_id, name, last_record_date, created_at',
      exercise_records: 'id, exercise_id, exercise_date, weight, created_at',
    });
  }
}

export const db = new GymTrackerDB();

// Helper functions for date recalculation

export async function recalculateExerciseLastDate(exerciseId: string): Promise<void> {
  const latestRecord = await db.exercise_records
    .where('exercise_id')
    .equals(exerciseId)
    .toArray();

  let lastDate: string | null = null;
  if (latestRecord.length > 0) {
    const sorted = latestRecord.sort((a, b) =>
      new Date(b.exercise_date).getTime() - new Date(a.exercise_date).getTime()
    );
    lastDate = sorted[0].exercise_date;
  }

  await db.exercises.update(exerciseId, {
    last_record_date: lastDate,
    updated_at: new Date().toISOString(),
  });
}

export async function recalculateCategoryLastDate(categoryId: string): Promise<void> {
  const exercises = await db.exercises.where('category_id').equals(categoryId).toArray();

  let lastDate: string | null = null;
  for (const exercise of exercises) {
    if (exercise.last_record_date) {
      if (!lastDate || new Date(exercise.last_record_date) > new Date(lastDate)) {
        lastDate = exercise.last_record_date;
      }
    }
  }

  await db.categories.update(categoryId, {
    last_exercise_date: lastDate,
    updated_at: new Date().toISOString(),
  });
}

export async function recalculateAfterRecordChange(exerciseId: string): Promise<void> {
  await recalculateExerciseLastDate(exerciseId);
  const exercise = await db.exercises.get(exerciseId);
  if (exercise) {
    await recalculateCategoryLastDate(exercise.category_id);
  }
}

export async function deleteCategoryWithCascade(categoryId: string): Promise<void> {
  const exercises = await db.exercises.where('category_id').equals(categoryId).toArray();
  for (const exercise of exercises) {
    await db.exercise_records.where('exercise_id').equals(exercise.id).delete();
  }
  await db.exercises.where('category_id').equals(categoryId).delete();
  await db.categories.delete(categoryId);
}

export async function deleteExerciseWithCascade(exerciseId: string): Promise<void> {
  const exercise = await db.exercises.get(exerciseId);
  await db.exercise_records.where('exercise_id').equals(exerciseId).delete();
  await db.exercises.delete(exerciseId);
  if (exercise) {
    await recalculateCategoryLastDate(exercise.category_id);
  }
}

// ── Backup ────────────────────────────────────────────────────────────

export interface BackupPayload {
  app: 'gym-bro';
  version: 1;
  exported_at: string;
  categories: Category[];
  exercises: Exercise[];
  exercise_records: ExerciseRecord[];
}

export async function exportAllData(): Promise<BackupPayload> {
  const [categories, exercises, exercise_records] = await Promise.all([
    db.categories.toArray(),
    db.exercises.toArray(),
    db.exercise_records.toArray(),
  ]);
  return {
    app: 'gym-bro',
    version: 1,
    exported_at: new Date().toISOString(),
    categories,
    exercises,
    exercise_records,
  };
}

export async function importAllData(payload: unknown): Promise<{
  categories: number;
  exercises: number;
  records: number;
}> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Archivo no válido');
  }
  const p = payload as Partial<BackupPayload>;
  if (p.app !== 'gym-bro') {
    throw new Error('El archivo no es un backup de Gym Bro');
  }
  if (
    !Array.isArray(p.categories) ||
    !Array.isArray(p.exercises) ||
    !Array.isArray(p.exercise_records)
  ) {
    throw new Error('Estructura del backup incorrecta');
  }

  await db.transaction(
    'rw',
    db.categories,
    db.exercises,
    db.exercise_records,
    async () => {
      await db.categories.clear();
      await db.exercises.clear();
      await db.exercise_records.clear();
      if (p.categories!.length) await db.categories.bulkAdd(p.categories!);
      if (p.exercises!.length) await db.exercises.bulkAdd(p.exercises!);
      if (p.exercise_records!.length)
        await db.exercise_records.bulkAdd(p.exercise_records!);
    }
  );

  return {
    categories: p.categories!.length,
    exercises: p.exercises!.length,
    records: p.exercise_records!.length,
  };
}
