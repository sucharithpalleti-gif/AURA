import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  Flame,
  Plus,
  Sparkles,
  Wallet
} from "lucide-react";
import type {
  AppData,
  AppView,
  EditorKind,
  Task,
  Transaction
} from "../types";
import {
  formatCurrency,
  formatDate,
  getCurrentStreak,
  getMonthKey,
  getTodayKey
} from "../lib/date";
import { getGreeting } from "../lib/utils";
import StatCard from "../components/StatCard";

interface DashboardPageProps {
  data: AppData;
  onCreate: (kind: EditorKind) => void;
  onNavigate: (view: AppView) => void;
  onToggleHabit: (habitId: string) => void;
  onEditTask: (task: Task) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

function statusLabel(status: Task["status"]): string {
  if (status === "inprogress") {
    return "In progress";
  }

  return status === "done" ? "Completed" : "To do";
}

export default function DashboardPage({
  data,
  onCreate,
  onNavigate,
  onToggleHabit,
  onEditTask,
  onEditTransaction
}: DashboardPageProps) {
  const today = getTodayKey();
  const monthKey = getMonthKey();
  const activeTasks = data.tasks.filter((task) => task.status !== "done");

  const monthTransactions = data.transactions.filter((transaction) =>
    transaction.date.startsWith(monthKey)
  );

  const monthExpenses = monthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const monthIncome = monthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const completedHabits = data.habits.filter((habit) =>
    habit.completedDates.includes(today)
  ).length;

  const bestStreak = data.habits.reduce(
    (best, habit) =>
      Math.max(best, getCurrentStreak(habit.completedDates, today)),
    0
  );

  const focusTasks = [...activeTasks]
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 4);

  const recentTransactions = [...data.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const quickActions: Array<{
    label: string;
    detail: string;
    icon: typeof Plus;
    kind: EditorKind;
  }> = [
    {
      label: "Add a task",
      detail: "Capture a next step",
      icon: Plus,
      kind: "task"
    },
    {
      label: "Log a transaction",
      detail: "Track income or spending",
      icon: Wallet,
      kind: "transaction"
    },
    {
      label: "Write a reflection",
      detail: "Save a thought for today",
      icon: BookOpen,
      kind: "journal"
    },
    {
      label: "Start a habit",
      detail: "Build a small routine",
      icon: Flame,
      kind: "habit"
    }
  ];

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300">
            <Sparkles size={13} />
            A little more in focus
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            {getGreeting()}
            <span className="text-violet-600 dark:text-violet-400">.</span>
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Your personal space for making steady progress, one day at a time.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:self-auto">
          <CalendarDays
            size={16}
            className="text-violet-600 dark:text-violet-400"
          />
          {formatDate(today, {
            weekday: "short",
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active tasks"
          value={String(activeTasks.length)}
          detail={`${data.tasks.filter((task) => task.status === "done").length} completed in your workspace`}
          icon={Check}
          iconClassName="bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300"
        />
        <StatCard
          label="Best current streak"
          value={`${bestStreak} ${bestStreak === 1 ? "day" : "days"}`}
          detail={
            data.habits.length
              ? `${completedHabits} of ${data.habits.length} habits checked in today`
              : "Create a habit to start a streak"
          }
          icon={Flame}
          iconClassName="bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300"
        />
        <StatCard
          label="Spent this month"
          value={formatCurrency(monthExpenses)}
          detail="Your recorded expenses for the current month"
          icon={ArrowDownRight}
          iconClassName="bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"
        />
        <StatCard
          label="Income this month"
          value={formatCurrency(monthIncome)}
          detail="Income entries recorded this month"
          icon={ArrowUpRight}
          iconClassName="bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-950 dark:text-white">
                Quick actions
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Get something out of your head and into your workspace.
              </p>
            </div>
            <span className="rounded-xl bg-violet-50 p-2.5 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
              <Sparkles size={18} />
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.kind}
                  type="button"
                  onClick={() => onCreate(action.kind)}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/50 dark:border-slate-800 dark:hover:border-violet-900 dark:hover:bg-violet-950/20"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-violet-100 group-hover:text-violet-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-violet-900/50 dark:group-hover:text-violet-300">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                      {action.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                      {action.detail}
                    </span>
                  </span>
                  <ArrowRight
                    size={16}
                    className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-violet-600 dark:group-hover:text-violet-300"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-950 dark:text-white">
                Today&apos;s habits
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {data.habits.length
                  ? `${completedHabits} of ${data.habits.length} complete`
                  : "A simple check-in goes a long way"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("habits")}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-violet-700 dark:hover:bg-slate-800 dark:hover:text-violet-300"
              aria-label="Open habit tracker"
            >
              <ArrowRight size={17} />
            </button>
          </div>

          {data.habits.length ? (
            <div className="mt-4 space-y-2">
              {data.habits.slice(0, 5).map((habit) => {
                const complete = habit.completedDates.includes(today);

                return (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 rounded-xl px-2 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleHabit(habit.id)}
                      aria-pressed={complete}
                      aria-label={`${complete ? "Uncheck" : "Complete"} ${habit.name}`}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                        complete
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-slate-300 text-transparent hover:border-violet-400 dark:border-slate-600"
                      }`}
                    >
                      {complete ? <Check size={14} /> : <Circle size={14} />}
                    </button>
                    <span
                      className={`min-w-0 flex-1 truncate text-sm ${
                        complete
                          ? "text-slate-400 line-through dark:text-slate-500"
                          : "font-medium text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {habit.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Flame size={13} />
                      {getCurrentStreak(habit.completedDates, today)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-5 text-center dark:bg-slate-800/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No habits yet. Add one small practice to get started.
              </p>
              <button
                type="button"
                onClick={() => onCreate("habit")}
                className="mt-3 text-sm font-semibold text-violet-700 hover:text-violet-800 dark:text-violet-300"
              >
                Create a habit
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-950 dark:text-white">
                Focus list
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your next few open tasks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("tasks")}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-950/40"
            >
              View tasks <ArrowRight size={14} />
            </button>
          </div>

          {focusTasks.length ? (
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {focusTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onEditTask(task)}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      task.priority === "high"
                        ? "bg-rose-500"
                        : task.priority === "medium"
                          ? "bg-amber-500"
                          : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {task.title}
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {task.category || statusLabel(task.status)}
                    </span>
                  </span>
                  {task.dueDate ? (
                    <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(task.dueDate)}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-6 text-center dark:bg-slate-800/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You have a clear focus list. Add a task when you need one.
              </p>
              <button
                type="button"
                onClick={() => onCreate("task")}
                className="mt-3 text-sm font-semibold text-violet-700 dark:text-violet-300"
              >
                Add a task
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-950 dark:text-white">
                Recent transactions
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                A quick look at your latest activity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("expenses")}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-violet-700 dark:hover:bg-slate-800 dark:hover:text-violet-300"
              aria-label="Open expense tracker"
            >
              <ArrowRight size={17} />
            </button>
          </div>

          {recentTransactions.length ? (
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((transaction) => {
                const isIncome = transaction.type === "income";

                return (
                  <button
                    key={transaction.id}
                    type="button"
                    onClick={() => onEditTransaction(transaction)}
                    className="flex w-full items-center gap-3 py-3 text-left"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight size={17} />
                      ) : (
                        <ArrowDownRight size={17} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {transaction.note || transaction.category}
                      </span>
                      <span className="mt-1 block text-xs text-slate-400">
                        {transaction.category} · {formatDate(transaction.date)}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 text-sm font-semibold ${
                        isIncome
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-6 text-center dark:bg-slate-800/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your transaction history will show up here.
              </p>
              <button
                type="button"
                onClick={() => onCreate("transaction")}
                className="mt-3 text-sm font-semibold text-violet-700 dark:text-violet-300"
              >
                Log a transaction
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50/60 p-5 dark:border-violet-900/50 dark:from-violet-950/30 dark:to-indigo-950/20 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-white p-2.5 text-violet-700 shadow-sm dark:bg-slate-900 dark:text-violet-300">
            <Clock3 size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Progress can be simple.
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Capture one useful thing, then return to what matters.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("journal")}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-100 dark:bg-slate-900 dark:text-violet-300 dark:hover:bg-slate-800 sm:self-auto"
        >
          Open journal <ArrowRight size={15} />
        </button>
      </section>
    </div>
  );
}