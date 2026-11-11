import type { ReactNode } from "react";
import {
  BookOpen,
  CheckSquare,
  Flame,
  LayoutDashboard,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Wallet
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppView, Theme } from "../types";
import { formatLongDate } from "../lib/date";

type SaveStatus = "saved" | "saving" | "error";

interface AppShellProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  theme: Theme;
  onToggleTheme: () => void;
  saveStatus: SaveStatus;
  children: ReactNode;
}

const navItems: Array<{ id: AppView; label: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "expenses", label: "Expenses", icon: Wallet },
  { id: "habits", label: "Habits", icon: Flame },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings }
];

const viewTitles: Record<AppView, string> = {
  dashboard: "Your overview",
  tasks: "Task manager",
  expenses: "Expense tracker",
  habits: "Habit tracker",
  journal: "Daily journal",
  settings: "Workspace settings"
};

function NavigationButton({
  item,
  active,
  onClick,
  compact = false
}: {
  item: (typeof navItems)[number];
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl text-sm font-medium transition ${
        compact ? "shrink-0 px-3 py-2.5" : "w-full px-3.5 py-3"
      } ${
        active
          ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      }`}
    >
      <Icon size={18} strokeWidth={1.9} />
      <span>{item.label}</span>
    </button>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  const text =
    status === "saved"
      ? "All changes saved"
      : status === "saving"
        ? "Saving changes"
        : "Save issue";

  const dotClass =
    status === "saved"
      ? "bg-emerald-500"
      : status === "saving"
        ? "animate-pulse bg-amber-500"
        : "bg-rose-500";

  return (
    <div className="hidden items-center gap-2 text-xs text-slate-500 dark:text-slate-400 sm:flex">
      <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      <span>{text}</span>
    </div>
  );
}

export default function AppShell({
  activeView,
  onNavigate,
  theme,
  onToggleTheme,
  saveStatus,
  children
}: AppShellProps) {
  const toggleLabel =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#0b1020] dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-5 py-6 dark:border-slate-800 dark:bg-slate-950 lg:flex">
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className="mb-10 flex items-center gap-3 text-left"
          aria-label="Go to Aether Life OS overview"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/25">
            <Sparkles size={21} />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight text-slate-950 dark:text-white">
              Aether Life OS
            </span>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              Your personal workspace
            </span>
          </span>
        </button>

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </p>
        <nav className="space-y-1.5" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavigationButton
              key={item.id}
              item={item}
              active={activeView === item.id}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-violet-100 bg-violet-50/80 p-4 dark:border-violet-900/50 dark:bg-violet-950/30">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
            A little more in focus.
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Your workspace is stored privately on this device.
          </p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90">
          <div className="flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-9">
            <div className="min-w-0">
              <div className="flex items-center gap-2 lg:hidden">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white">
                  <Sparkles size={17} />
                </span>
                <span className="truncate text-sm font-bold tracking-tight">
                  Aether Life OS
                </span>
              </div>
              <h1 className="hidden text-lg font-semibold tracking-tight text-slate-950 dark:text-white lg:block">
                {viewTitles[activeView]}
              </h1>
              <p className="hidden text-xs text-slate-500 dark:text-slate-400 lg:block">
                {formatLongDate()}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 sm:gap-5">
              <SaveIndicator status={saveStatus} />
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={toggleLabel}
                title={toggleLabel}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ThemeIcon size={17} />
              </button>
              <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-semibold text-white sm:flex">
                A
              </div>
            </div>
          </div>

          <nav
            className="flex gap-1.5 overflow-x-auto px-4 pb-3 lg:hidden"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <NavigationButton
                key={item.id}
                item={item}
                active={activeView === item.id}
                onClick={() => onNavigate(item.id)}
                compact
              />
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}