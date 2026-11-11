import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import type { AppData, EditorKind, Transaction } from "../types";
import {
  formatCurrency,
  formatDate,
  getMonthKey,
  getMonthLabel
} from "../lib/date";
import StatCard from "../components/StatCard";

interface ExpensesPageProps {
  data: AppData;
  onCreate: (kind: EditorKind) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

type TransactionFilter = "all" | "expense" | "income";

const selectClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

function TransactionRow({
  transaction,
  onEdit,
  onDelete
}: {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  const isIncome = transaction.type === "income";

  return (
    <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isIncome
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
            : "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"
        }`}
      >
        {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {transaction.note || transaction.category}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
          {transaction.category} · {formatDate(transaction.date)}
        </p>
      </div>

      <p
        className={`shrink-0 text-sm font-semibold ${
          isIncome
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-slate-900 dark:text-slate-100"
        }`}
      >
        {isIncome ? "+" : "−"}
        {formatCurrency(transaction.amount)}
      </p>

      <div className="flex shrink-0 gap-0.5">
        <button
          type="button"
          onClick={() => onEdit(transaction)}
          aria-label={`Edit transaction ${transaction.note || transaction.category}`}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-violet-700 dark:hover:bg-slate-800 dark:hover:text-violet-300"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(transaction.id)}
          aria-label={`Delete transaction ${transaction.note || transaction.category}`}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default function ExpensesPage({
  data,
  onCreate,
  onEdit,
  onDelete
}: ExpensesPageProps) {
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [query, setQuery] = useState("");

  const currentMonthKey = getMonthKey();
  const currentMonthTransactions = data.transactions.filter((transaction) =>
    transaction.date.startsWith(currentMonthKey)
  );

  const income = currentMonthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenses = currentMonthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = income - expenses;

  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>();

    currentMonthTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        totals.set(
          transaction.category,
          (totals.get(transaction.category) ?? 0) + transaction.amount
        );
      });

    return [...totals.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [currentMonthTransactions]);

  const weeklyTotals = useMemo(() => {
    const weeks = Array.from({ length: 5 }, (_, index) => ({
      label: index === 4 ? "29+" : `${index * 7 + 1}–${index * 7 + 7}`,
      income: 0,
      expense: 0
    }));

    currentMonthTransactions.forEach((transaction) => {
      const day = Number(transaction.date.slice(-2));
      const index = Math.min(4, Math.floor((day - 1) / 7));

      if (transaction.type === "income") {
        weeks[index].income += transaction.amount;
      } else {
        weeks[index].expense += transaction.amount;
      }
    });

    return weeks;
  }, [currentMonthTransactions]);

  const chartMaximum = Math.max(
    1,
    ...weeklyTotals.flatMap((week) => [week.income, week.expense])
  );

  const categoryMaximum = Math.max(
    1,
    ...categoryTotals.map((category) => category.amount)
  );

  const visibleTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...data.transactions]
      .filter((transaction) => {
        const matchesFilter =
          filter === "all" || transaction.type === filter;

        const matchesQuery =
          !normalizedQuery ||
          [transaction.note, transaction.category, transaction.date]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

        return matchesFilter && matchesQuery;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.transactions, filter, query]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Understand your spending and keep income in view.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
            <CalendarDays
              size={15}
              className="text-violet-600 dark:text-violet-400"
            />
            {getMonthLabel()}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onCreate("transaction")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          <Plus size={17} />
          Add transaction
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Income"
          value={formatCurrency(income)}
          detail="Recorded this month"
          icon={TrendingUp}
          iconClassName="bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
        />
        <StatCard
          label="Expenses"
          value={formatCurrency(expenses)}
          detail="Recorded this month"
          icon={TrendingDown}
          iconClassName="bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"
        />
        <StatCard
          label="Net balance"
          value={formatCurrency(balance)}
          detail="Income minus expenses this month"
          icon={CreditCard}
          iconClassName="bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div>
            <h3 className="font-semibold text-slate-950 dark:text-white">
              Monthly cash flow
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Income and expenses grouped by week.
            </p>
          </div>

          <div
            role="img"
            aria-label={`Monthly cash flow chart for ${getMonthLabel()}`}
            className="mt-6"
          >
            <div className="flex h-44 items-end justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800 sm:gap-5">
              {weeklyTotals.map((week) => {
                const incomeHeight = Math.max(
                  3,
                  (week.income / chartMaximum) * 100
                );
                const expenseHeight = Math.max(
                  3,
                  (week.expense / chartMaximum) * 100
                );

                return (
                  <div
                    key={week.label}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <div className="flex h-full w-full items-end justify-center gap-1.5">
                      <div
                        title={`Income: ${formatCurrency(week.income)}`}
                        className="w-4 rounded-t-md bg-emerald-400 transition-all dark:bg-emerald-500 sm:w-6"
                        style={{ height: `${incomeHeight}%` }}
                      />
                      <div
                        title={`Expenses: ${formatCurrency(week.expense)}`}
                        className="w-4 rounded-t-md bg-violet-500 transition-all dark:bg-violet-400 sm:w-6"
                        style={{ height: `${expenseHeight}%` }}
                      />
                    </div>
                    <span className="mt-2 text-[10px] font-medium text-slate-400 sm:text-xs">
                      {week.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400 dark:bg-emerald-500" />
                Income
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-violet-500 dark:bg-violet-400" />
                Expenses
              </span>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div>
            <h3 className="font-semibold text-slate-950 dark:text-white">
              Spending by category
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Where this month&apos;s expenses are going.
            </p>
          </div>

          {categoryTotals.length ? (
            <div className="mt-6 space-y-5">
              {categoryTotals.map((item) => (
                <div key={item.category}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                      {item.category}
                    </span>
                    <span className="shrink-0 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-violet-500 dark:bg-violet-400"
                      style={{
                        width: `${Math.max(
                          4,
                          (item.amount / categoryMaximum) * 100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-slate-50 px-4 py-8 text-center dark:bg-slate-800/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add an expense to see your category breakdown.
              </p>
            </div>
          )}
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h3 className="font-semibold text-slate-950 dark:text-white">
              Transactions
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {data.transactions.length} entries in your workspace
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <span className="sr-only">Search transactions</span>
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:w-44"
              />
            </label>

            <label>
              <span className="sr-only">Filter transactions</span>
              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as TransactionFilter)
                }
                className={selectClass}
              >
                <option value="all">All types</option>
                <option value="expense">Expenses</option>
                <option value="income">Income</option>
              </select>
            </label>
          </div>
        </div>

        {visibleTransactions.length ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <CreditCard size={20} />
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-white">
              {data.transactions.length
                ? "No transactions found"
                : "Nothing logged yet"}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {data.transactions.length
                ? "Try another search or filter."
                : "Add your first income or expense to get started."}
            </p>
            {!data.transactions.length ? (
              <button
                type="button"
                onClick={() => onCreate("transaction")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus size={16} />
                Add transaction
              </button>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}