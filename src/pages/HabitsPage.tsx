import { useMemo } from "react";
import {
  CalendarDays,
  Check,
  Flame,
  Pencil,
  Plus,
  Sparkles,
  Trash2
} from "lucide-react";
import type { AppData, EditorKind, Habit } from "../types";
import {
  formatDate,
  getCurrentStreak,
  getLastNDays,
  getTodayKey
} from "../lib/date";

interface HabitsPageProps {
  data: AppData;
  onCreate: (kind: EditorKind) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

function HabitCard({
  habit,
  today,
  weekDates,
  onEdit,
  onDelete,
  onToggle
}: {
  habit: Habit;
  today: string;
  weekDates: string[];
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const completeToday = habit.completedDates.includes(today);
  const streak = getCurrentStreak(habit.completedDates, today);
  const completedThisWeek = weekDates.filter((date) =>
    habit.completedDates.includes(date)
  ).length;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start gap-4">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{
            color: habit.color,
            backgroundColor: `${habit.color}1A`
          }}
        >
          <Sparkles size={20} />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="break-words font-semibold text-slate-900 dark:text-white">
            {habit.name}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {completedThisWeek} of 7 check-ins this week
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => onEdit(habit)}
            aria-label={`Edit ${habit.name}`}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-violet-700 dark:hover:bg-slate-800 dark:hover:text-violet-300"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(habit.id)}
            aria-label={`Delete ${habit.name}`}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-800/60">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Flame
            size={16}
            className={streak ? "text-orange-500" : "text-slate-400"}
          />
          <span>
            <strong className="font-semibold text-slate-900 dark:text-white">
              {streak}
            </strong>{" "}
            day streak
          </span>
        </div>

        <button
          type="button"
          onClick={() => onToggle(habit.id)}
          aria-pressed={completeToday}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            completeToday
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/20"
              : "bg-violet-600 text-white hover:bg-violet-700"
          }`}
        >
          {completeToday ? <Check size={14} /> : <Plus size={14} />}
          {completeToday ? "Done today" : "Check in"}
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Last 7 days
          </p>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {completedThisWeek}/7
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date) => {
            const complete = habit.completedDates.includes(date);

            return (
              <div key={date} className="text-center">
                <span className="block text-[10px] text-slate-400">
                  {date === today ? "Today" : date.slice(-2)}
                </span>
                <span
                  title={`${formatDate(date)}${complete ? " · completed" : ""}`}
                  className={`mx-auto mt-1.5 flex h-7 w-7 items-center justify-center rounded-full ${
                    complete
                      ? "text-white"
                      : "bg-slate-100 text-transparent dark:bg-slate-800"
                  }`}
                  style={
                    complete ? { backgroundColor: habit.color } : undefined
                  }
                >
                  <Check size={13} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export default function HabitsPage({
  data,
  onCreate,
  onEdit,
  onDelete,
  onToggle
}: HabitsPageProps) {
  const today = getTodayKey();
  const weekDates = useMemo(() => getLastNDays(7, today), [today]);

  const completedToday = data.habits.filter((habit) =>
    habit.completedDates.includes(today)
  ).length;

  const progress =
    data.habits.length > 0
      ? Math.round((completedToday / data.habits.length) * 100)
      : 0;

  const bestStreak = data.habits.reduce(
    (best, habit) =>
      Math.max(best, getCurrentStreak(habit.completedDates, today)),
    0
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Build consistency through small, repeatable actions.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
            <CalendarDays
              size={15}
              className="text-violet-600 dark:text-violet-400"
            />
            Today · {formatDate(today, { weekday: "long" })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onCreate("habit")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus size={17} />
          Add a habit
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50/60 p-5 dark:border-violet-900/50 dark:from-violet-950/30 dark:to-indigo-950/20 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Today&apos;s check-in
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {completedToday}
                <span className="text-xl font-medium text-slate-400">
                  {" "}
                  / {data.habits.length}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {data.habits.length
                  ? "habits completed today"
                  : "create a habit to start your daily rhythm"}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm dark:bg-slate-900 dark:text-violet-300">
              <Check size={24} />
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/80 dark:bg-slate-900/70">
            <div
              className="h-full rounded-full bg-violet-600 transition-all dark:bg-violet-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-right text-xs font-semibold text-violet-800 dark:text-violet-300">
            {progress}% complete
          </p>
        </article>

        <article className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Best current streak
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {bestStreak}
              <span className="ml-1 text-base font-medium text-slate-400">
                days
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Keep showing up for the next small step.
            </p>
          </div>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-400/10 dark:text-orange-300">
            <Flame size={25} />
          </span>
        </article>
      </section>

      {data.habits.length ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {data.habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              today={today}
              weekDates={weekDates}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
            <Flame size={22} />
          </span>
          <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
            Start with one small habit
          </h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            Choose a practice that feels achievable and check in whenever you
            complete it.
          </p>
          <button
            type="button"
            onClick={() => onCreate("habit")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus size={16} />
            Create a habit
          </button>
        </section>
      )}
    </div>
  );
}