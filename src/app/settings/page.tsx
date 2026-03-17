'use client';

import PageHeader from '@/components/PageHeader';
import { useTheme, THEMES } from '@/hooks/useTheme';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

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
      </main>
    </div>
  );
}
