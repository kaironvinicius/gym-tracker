'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Category, deleteCategoryWithCascade } from '@/lib/db';
import { sortByLeastRecent, generateId } from '@/lib/utils';

export function useCategories() {
  const rawCategories = useLiveQuery(
    () => db.categories.toArray(),
    []
  );

  const categories = rawCategories ? sortByLeastRecent(rawCategories, 'last_exercise_date') : undefined;

  return { categories };
}

export function useCategoryWithExerciseCount(categoryId: string) {
  const data = useLiveQuery(async () => {
    const category = await db.categories.get(categoryId);
    const exerciseCount = await db.exercises.where('category_id').equals(categoryId).count();
    return { category, exerciseCount };
  }, [categoryId]);

  return data;
}

export async function createCategory(data: {
  name: string;
  icon_image: string;
}): Promise<Category> {
  const now = new Date().toISOString();
  const category: Category = {
    id: generateId(),
    name: data.name,
    icon_image: data.icon_image,
    last_exercise_date: null,
    created_at: now,
    updated_at: now,
  };
  await db.categories.add(category);
  return category;
}

export async function updateCategory(
  id: string,
  data: { name: string; icon_image: string }
): Promise<void> {
  await db.categories.update(id, {
    name: data.name,
    icon_image: data.icon_image,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteCategoryWithCascade(id);
}
