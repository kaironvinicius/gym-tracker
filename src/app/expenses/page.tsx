'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { expensesDb, type ExpenseCategory } from '@/lib/expensesDb';
import {
  formatCurrency,
  formatMonth,
  formatTransactionDate,
  getCurrentMonth,
  isDateInMonth,
  shiftMonth,
} from '@/lib/expensesUtils';
import EmptyState from '@/components/EmptyState';

export default function ExpensesHomePage() {
  const router = useRouter();
  const [{ year, month }, setMonth] = useState(getCurrentMonth());

  const data = useLiveQuery(async () => {
    const [transactions, categories] = await Promise.all([
      expensesDb.transactions.toArray(),
      expensesDb.expense_categories.toArray(),
    ]);
    return { transactions, categories };
  });

  const isLoading = data === undefined;

  const monthData = useMemo(() => {
    if (!data) return null;
    const txInMonth = data.transactions.filter((t) => isDateInMonth(t.date, year, month));
    const totalIncome = txInMonth
      .filter((t) => t.kind === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = txInMonth
      .filter((t) => t.kind === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = new Map<string, number>();
    for (const t of txInMonth) {
      if (t.kind !== 'expense') continue;
      byCategory.set(t.category_id, (byCategory.get(t.category_id) ?? 0) + t.amount);
    }

    const chartData = Array.from(byCategory.entries())
      .map(([catId, amount]) => {
        const cat = data.categories.find((c) => c.id === catId);
        return {
          id: catId,
          name: cat?.name ?? 'Sin categoría',
          color: cat?.color ?? '#737373',
          value: amount,
        };
      })
      .sort((a, b) => b.value - a.value);

    const sortedTx = [...txInMonth].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return { txInMonth: sortedTx, totalIncome, totalExpense, chartData };
  }, [data, year, month]);

  const categoriesById = useMemo(() => {
    const map = new Map<string, ExpenseCategory>();
    if (data) for (const c of data.categories) map.set(c.id, c);
    return map;
  }, [data]);

  const goPrev = () => setMonth(shiftMonth(year, month, -1));
  const goNext = () => setMonth(shiftMonth(year, month, 1));

  const balance = (monthData?.totalIncome ?? 0) - (monthData?.totalExpense ?? 0);

  return (
    <div className="h-full flex flex-col">
      <header className="sticky top-0 z-10 bg-gym-surface border-b border-gym-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-3xl text-gym-text font-orbitron">
              <span className="text-gym-accent">$</span> Gastos
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/expenses/categories')}
              className="w-10 h-10 bg-gym-card border border-gym-border hover:border-gym-accent/50 rounded-xl flex items-center justify-center transition-colors"
              aria-label="Categorías"
            >
              <svg className="w-5 h-5 text-gym-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => router.push('/expenses/transaction/new')}
              className="w-12 h-12 bg-gym-accent hover:bg-gym-accent-dark rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-gym-accent/25"
              aria-label="Nueva transacción"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-8">
        {/* Month switcher */}
        <div className="flex items-center justify-between bg-gym-card border border-gym-border rounded-2xl px-2 py-2 mb-4">
          <button
            onClick={goPrev}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gym-border/50 transition-colors"
            aria-label="Mes anterior"
          >
            <svg className="w-5 h-5 text-gym-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-sm font-orbitron text-gym-text">{formatMonth(year, month)}</div>
          <button
            onClick={goNext}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gym-border/50 transition-colors"
            aria-label="Mes siguiente"
          >
            <svg className="w-5 h-5 text-gym-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gym-card border border-gym-border rounded-2xl p-3">
            <div className="text-[11px] text-gym-muted uppercase tracking-wide">Ingresos</div>
            <div className="text-base font-semibold text-gym-green mt-1 break-words">
              {formatCurrency(monthData?.totalIncome ?? 0)}
            </div>
          </div>
          <div className="bg-gym-card border border-gym-border rounded-2xl p-3">
            <div className="text-[11px] text-gym-muted uppercase tracking-wide">Gastos</div>
            <div className="text-base font-semibold text-gym-red mt-1 break-words">
              {formatCurrency(monthData?.totalExpense ?? 0)}
            </div>
          </div>
          <div className="bg-gym-card border border-gym-border rounded-2xl p-3">
            <div className="text-[11px] text-gym-muted uppercase tracking-wide">Balance</div>
            <div
              className={`text-base font-semibold mt-1 break-words ${
                balance >= 0 ? 'text-gym-green' : 'text-gym-red'
              }`}
            >
              {formatCurrency(balance)}
            </div>
          </div>
        </div>

        {/* Chart */}
        {monthData && monthData.chartData.length > 0 && (
          <div className="bg-gym-card border border-gym-border rounded-2xl p-4 mb-4">
            <div className="text-xs text-gym-muted uppercase tracking-wide mb-2">
              Gasto por categoría
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={monthData.chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={32}
                      outerRadius={60}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {monthData.chartData.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(10,10,10,0.95)',
                        border: '1px solid #333',
                        borderRadius: 12,
                        color: '#f5f5f5',
                        fontSize: 12,
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 min-w-0 space-y-1.5">
                {monthData.chartData.slice(0, 5).map((entry) => {
                  const pct =
                    monthData.totalExpense > 0
                      ? (entry.value / monthData.totalExpense) * 100
                      : 0;
                  return (
                    <li key={entry.id} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-gym-text truncate flex-1">{entry.name}</span>
                      <span className="text-gym-muted">{pct.toFixed(0)}%</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* Transaction list */}
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gym-card border border-gym-border rounded-2xl p-4 animate-pulse"
              >
                <div className="h-4 bg-gym-border rounded w-3/4 mb-2" />
                <div className="h-3 bg-gym-border rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : monthData && monthData.txInMonth.length > 0 ? (
          <div className="flex flex-col gap-2">
            {monthData.txInMonth.map((tx) => {
              const cat = categoriesById.get(tx.category_id);
              const isExpense = tx.kind === 'expense';
              return (
                <button
                  key={tx.id}
                  onClick={() => router.push(`/expenses/transaction/${tx.id}/edit`)}
                  className="w-full text-left bg-gym-card border border-gym-border hover:border-gym-accent/40 rounded-2xl p-3 flex items-center gap-3 transition-colors active:scale-98"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: (cat?.color ?? '#737373') + '33' }}
                  >
                    {cat?.icon_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cat.icon_image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-5 h-5"
                        style={{ color: cat?.color ?? '#737373' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gym-text truncate">
                      {cat?.name ?? 'Sin categoría'}
                    </div>
                    <div className="text-xs text-gym-muted truncate">
                      {tx.note ? tx.note : formatTransactionDate(tx.date)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`text-sm font-semibold ${
                        isExpense ? 'text-gym-red' : 'text-gym-green'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatCurrency(tx.amount)}
                    </div>
                    <div className="text-[11px] text-gym-muted">
                      {formatTransactionDate(tx.date)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="💸"
            title="Sin movimientos este mes"
            description="Empieza añadiendo un gasto o ingreso para ver tu balance."
            action={
              <button
                onClick={() => router.push('/expenses/transaction/new')}
                className="bg-gym-accent hover:bg-gym-accent-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Nueva transacción
              </button>
            }
          />
        )}
      </main>
    </div>
  );
}
