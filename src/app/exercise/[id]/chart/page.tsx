'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { formatDateShort } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gym-surface border border-gym-border rounded-xl px-3 py-2 shadow-xl">
        <p className="text-xs text-gym-muted">{label}</p>
        <p className="text-base font-bold text-gym-accent">{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
}

export default function ChartPage() {
  const params = useParams();
  const exerciseId = params.id as string;
  const router = useRouter();

  const data = useLiveQuery(async () => {
    const exercise = await db.exercises.get(exerciseId);
    if (!exercise) return null;
    const records = await db.exercise_records
      .where('exercise_id')
      .equals(exerciseId)
      .toArray();
    const sorted = records.sort(
      (a, b) => new Date(a.exercise_date).getTime() - new Date(b.exercise_date).getTime()
    );
    const chartData = sorted.map((r) => ({
      date: formatDateShort(r.exercise_date),
      weight: r.weight,
      id: r.id,
    }));

    const weights = sorted.map((r) => r.weight);
    const personalBest = weights.length > 0 ? Math.max(...weights) : null;
    const minWeight = weights.length > 0 ? Math.min(...weights) : null;

    return { exercise, chartData, personalBest, minWeight };
  }, [exerciseId]);

  if (data === undefined) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader title="Gráfico" />
        <div className="p-4 animate-pulse">
          <div className="h-64 bg-gym-card rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader title="Gráfico" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gym-muted">Ejercicio no encontrado</p>
        </div>
      </div>
    );
  }

  const { exercise, chartData, personalBest } = data;

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Gráfico de progreso"
        subtitle={exercise.name}
        backHref={`/exercise/${exerciseId}`}
      />

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {chartData.length > 1 ? (
          <>
            {/* Chart */}
            <div className="bg-gym-card border border-gym-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gym-text">Progresión de peso</p>
                  <p className="text-xs text-gym-muted">{chartData.length} registros</p>
                </div>
                {personalBest !== null && (
                  <div className="text-right">
                    <p className="text-xs text-gym-muted">Mejor marca</p>
                    <p className="text-base font-bold text-gym-accent">{personalBest} kg</p>
                  </div>
                )}
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2a2a2a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#737373', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#737373', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {personalBest !== null && (
                    <ReferenceLine
                      y={personalBest}
                      stroke="#f97316"
                      strokeDasharray="4 4"
                      strokeOpacity={0.5}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    dot={{ fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#0a0a0a' }}
                    activeDot={{ r: 6, fill: '#f97316', stroke: '#0a0a0a', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Data points */}
            <div className="bg-gym-card border border-gym-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gym-border">
                <p className="text-sm font-medium text-gym-text">Todos los registros</p>
              </div>
              <div className="divide-y divide-gym-border max-h-64 overflow-y-auto">
                {[...chartData].reverse().map((point) => (
                  <div
                    key={point.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-sm text-gym-muted">{point.date}</span>
                    <span
                      className={`text-sm font-semibold ${
                        point.weight === personalBest ? 'text-gym-accent' : 'text-gym-text'
                      }`}
                    >
                      {point.weight} kg
                      {point.weight === personalBest && (
                        <span className="ml-2 text-xs text-gym-accent">🏆</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : chartData.length === 1 ? (
          <div className="bg-gym-card border border-gym-border rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">📈</div>
            <p className="text-gym-text font-medium mb-1">Solo un registro</p>
            <p className="text-sm text-gym-muted">
              Necesitas al menos 2 registros para ver el gráfico de progreso
            </p>
            <div className="mt-4 text-2xl font-bold text-gym-accent">
              {chartData[0].weight} kg
            </div>
            <p className="text-xs text-gym-muted mt-1">{chartData[0].date}</p>
          </div>
        ) : (
          <EmptyState
            icon="📈"
            title="Sin datos"
            description="Agrega al menos 2 registros para ver el gráfico de progreso"
            action={
              <button
                onClick={() => router.push(`/exercise/${exerciseId}/record/new`)}
                className="bg-gym-accent hover:bg-gym-accent-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Agregar registro
              </button>
            }
          />
        )}
      </main>
    </div>
  );
}
