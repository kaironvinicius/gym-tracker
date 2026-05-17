'use client';

export const dynamic = 'force-static';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import PageHeader from '@/components/PageHeader';
import ConfirmDialog from '@/components/ConfirmDialog';
import { updateCategory, deleteCategory } from '@/hooks/useCategories';
import { ICON_OPTIONS, isImageIcon, imageToBase64 } from '@/lib/utils';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const category = useLiveQuery(() => db.categories.get(categoryId), [categoryId]);

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      if (category.icon_image.startsWith('data:')) {
        setCustomImage(category.icon_image);
        setSelectedIcon(ICON_OPTIONS[0]);
      } else {
        setSelectedIcon(category.icon_image);
        setCustomImage(null);
      }
    }
  }, [category]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await imageToBase64(file);
      setCustomImage(base64);
    } catch {
      setError('Error al cargar la imagen');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateCategory(categoryId, {
        name: name.trim(),
        icon_image: customImage || selectedIcon,
      });
      router.push('/');
    } catch {
      setError('Error al guardar la categoría');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(categoryId);
      router.push('/');
    } catch {
      setError('Error al eliminar la categoría');
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gym-muted">Categoría no encontrada</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Editar categoría" />

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Name field */}
        <div>
          <label className="block text-sm font-medium text-gym-muted mb-2">
            Nombre *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Push, Pull, Piernas..."
            className="w-full bg-gym-card border border-gym-border rounded-xl px-4 py-3 text-gym-text placeholder:text-gym-muted focus:border-gym-accent transition-colors"
            maxLength={50}
          />
        </div>

        {/* Icon preview */}
        <div>
          <label className="block text-sm font-medium text-gym-muted mb-2">
            Icono seleccionado
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gym-surface border border-gym-border overflow-hidden">
              {isImageIcon(customImage || selectedIcon) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customImage || selectedIcon} alt="Icono" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl flex items-center justify-center w-full h-full">{selectedIcon}</span>
              )}
            </div>
            {customImage && (
              <button
                onClick={() => setCustomImage(null)}
                className="text-sm text-gym-red hover:text-red-400 transition-colors"
              >
                Eliminar imagen
              </button>
            )}
          </div>
        </div>

        {/* Icon grid */}
        <div>
          <label className="block text-sm font-medium text-gym-muted mb-3">
            Elige un icono
          </label>
          <div className="grid grid-cols-5 gap-3">
            {ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                onClick={() => { setSelectedIcon(icon); setCustomImage(null); }}
                className={`w-full aspect-square rounded-xl flex items-center justify-center p-3 transition-all ${
                  selectedIcon === icon && !customImage
                    ? 'bg-gym-accent/20 border-2 border-gym-accent'
                    : 'bg-gym-card border border-gym-border hover:border-gym-accent/50'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon} alt="" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gym-muted mb-2">
            O sube una imagen
          </label>
          <label className="block w-full cursor-pointer">
            <div className="border-2 border-dashed border-gym-border hover:border-gym-accent/50 rounded-xl p-4 text-center transition-colors">
              <svg className="w-8 h-8 text-gym-muted mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gym-muted">Toca para seleccionar</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {/* Delete button */}
        <div className="pt-4">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 px-4 rounded-xl border border-gym-red/50 text-gym-red hover:bg-gym-red/10 transition-colors font-medium"
          >
            Eliminar categoría
          </button>
        </div>

        {/* Error */}
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
          disabled={saving || !name.trim()}
          className="flex-1 py-3 px-4 rounded-xl bg-gym-accent hover:bg-gym-accent-dark text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-save"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar categoría"
        message="Esta acción eliminará la categoría, sus ejercicios y todo el historial asociado."
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        danger
      />
    </div>
  );
}
