'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ExerciseRecord, recalculateAfterRecordChange } from '@/lib/db';
import { generateId } from '@/lib/utils';

export function useRecords(exerciseId: string) {
  const records = useLiveQuery(
    () =>
      db.exercise_records
        .where('exercise_id')
        .equals(exerciseId)
        .toArray()
        .then((recs) =>
          recs.sort(
            (a, b) =>
              new Date(b.exercise_date).getTime() - new Date(a.exercise_date).getTime()
          )
        ),
    [exerciseId]
  );

  return { records };
}

export function useRecord(recordId: string) {
  const record = useLiveQuery(
    () => db.exercise_records.get(recordId),
    [recordId]
  );
  return { record };
}

export async function createRecord(data: {
  exercise_id: string;
  weight: number;
  exercise_date: string;
  comment: string;
  image_path: string;
}): Promise<ExerciseRecord> {
  const now = new Date().toISOString();
  const record: ExerciseRecord = {
    id: generateId(),
    exercise_id: data.exercise_id,
    weight: data.weight,
    exercise_date: data.exercise_date,
    comment: data.comment,
    image_path: data.image_path,
    created_at: now,
    updated_at: now,
  };
  await db.exercise_records.add(record);
  await recalculateAfterRecordChange(data.exercise_id);
  return record;
}

export async function updateRecord(
  id: string,
  data: {
    weight: number;
    exercise_date: string;
    comment: string;
    image_path: string;
  }
): Promise<void> {
  const existing = await db.exercise_records.get(id);
  if (!existing) return;

  await db.exercise_records.update(id, {
    weight: data.weight,
    exercise_date: data.exercise_date,
    comment: data.comment,
    image_path: data.image_path,
    updated_at: new Date().toISOString(),
  });
  await recalculateAfterRecordChange(existing.exercise_id);
}

export async function deleteRecord(id: string): Promise<void> {
  const record = await db.exercise_records.get(id);
  if (!record) return;
  const exerciseId = record.exercise_id;
  await db.exercise_records.delete(id);
  await recalculateAfterRecordChange(exerciseId);
}
