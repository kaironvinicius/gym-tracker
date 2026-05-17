'use client';

import { useRef, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useTheme, THEMES } from '@/hooks/useTheme';
import { exportAllData, importAllData } from '@/lib/db';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);
  const [pendingPayload, setPendingPayload] = useState<unknown>(null);
  const [pendingSummary, setPendingSummary] = useState<string>('');

  const handleExport = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const payload = await exportAllData();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `gym-bro-backup-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus({
        kind: 'ok',
        msg: `Backup descargado (${payload.categories.length} categorías, ${payload.exercises.length} ejercicios, ${payload.exercise_records.length} registros)`,
      });
    } catch (e) {
      setStatus({ kind: 'err', msg: e instanceof Error ? e.message : 'Error al exportar' });
    } finally {
      setBusy(false);
    }
  };

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setStatus(null);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (payload?.app !== 'gym-bro') {
        throw new Error('El archivo no es un backup de Gym Bro');
      }
      const cats = Array.isArray(payload.categories) ? payload.categories.length : 0;
      const exs = Array.isArray(payload.exercises) ? payload.exercises.length : 0;
      const recs = Array.isArray(payload.exercise_records) ? payload.exercise_records.length : 0;
      setPendingPayload(payload);
      setPendingSummary(
        `Se reemplazarán los datos actuales por: ${cats} categorías, ${exs} ejercicios y ${recs} registros.`
      );
    } catch (err) {
      setStatus({
        kind: 'err',
        msg: err instanceof Error ? err.message : 'Archivo no válido',
      });
    }
  };

  const confirmImport = async () => {
    if (!pendingPayload) return;
    setBusy(true);
    try {
      const result = await importAllData(pendingPayload);
      setStatus({
        kind: 'ok',
        msg: `Restaurado: ${result.categories} categorías, ${result.exercises} ejercicios, ${result.records} registros`,
      });
    } catch (err) {
      setStatus({
        kind: 'err',
        msg: err instanceof Error ? err.message : 'Error al importar',
      });
    } finally {
      setBusy(false);
      setPendingPayload(null);
      setPendingSummary('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Ajustes" backHref="/" />

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Tema */}
        <section>
          <h2 className="text-xs font-semibold text-gym-muted uppercase tracking-wider mb-3 px-1">
            Apariencia
          </h2>
          <div className="space-y-3">
            {THEMES.map((t) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-full bg-gym-card border rounded-2xl p-4 text-left transition-all ${
                    isActive
                      ? 'border-gym-accent'
                      : 'border-gym-border hover:border-gym-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div
                      className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center border border-white/10"
                      style={{ background: t.bg }}
                    >
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ background: t.accent }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-semibold text-gym-text">{t.name}</p>
                      <p className="text-sm text-gym-muted mt-0.5">{t.description}</p>
                    </div>

                    {/* Check */}
                    {isActive && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: t.accent }}
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Datos */}
        <section>
          <h2 className="text-xs font-semibold text-gym-muted uppercase tracking-wider mb-3 px-1">
            Datos
          </h2>
          <div className="bg-gym-card border border-gym-border rounded-2xl p-4 space-y-3">
            <p className="text-sm text-gym-muted leading-relaxed">
              Tus datos se guardan localmente en este navegador. Exporta un backup
              para no perderlos si cambias de dominio o de dispositivo.
            </p>

            <button
              onClick={handleExport}
              disabled={busy}
              className="w-full bg-gym-accent hover:bg-gym-accent-dark disabled:opacity-40 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              Exportar backup (.json)
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="w-full bg-gym-card border border-gym-border hover:border-gym-accent/50 disabled:opacity-40 text-gym-text font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Restaurar desde backup
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFilePicked}
            />

            {status && (
              <p
                className={`text-sm leading-relaxed ${
                  status.kind === 'ok' ? 'text-gym-green' : 'text-gym-red'
                }`}
              >
                {status.msg}
              </p>
            )}
          </div>
        </section>
      </main>

      <ConfirmDialog
        isOpen={pendingPayload !== null}
        title="Restaurar backup"
        message={pendingSummary}
        confirmLabel="Restaurar"
        danger
        onConfirm={confirmImport}
        onCancel={() => {
          setPendingPayload(null);
          setPendingSummary('');
        }}
      />
    </div>
  );
}
