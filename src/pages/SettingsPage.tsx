import { useRef, type ChangeEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileJson,
  Moon,
  RotateCcw,
  Sprout,
  Sun,
  Trash2,
  Upload
} from "lucide-react";
import type { AppData, Theme } from "../types";
import { formatDate, getTodayKey } from "../lib/date";
import { parseAppData } from "../lib/storage";
import type { ToastTone } from "../components/Toast";

type SaveStatus = "saved" | "saving" | "error";

interface SettingsPageProps {
  data: AppData;
  theme: Theme;
  saveStatus: SaveStatus;
  onToggleTheme: () => void;
  onSeed: () => void;
  onRestore: (data: AppData) => void;
  onReset: () => void;
  notify: (message: string, tone?: ToastTone) => void;
}

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

export default function SettingsPage({
  data,
  theme,
  saveStatus,
  onToggleTheme,
  onSeed,
  onRestore,
  onReset,
  notify
}: SettingsPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === "dark";

  const storageText =
    saveStatus === "saved"
      ? "Changes are saved on this device."
      : saveStatus === "saving"
        ? "Saving your latest changes…"
        : "A save issue was detected. Try exporting a backup.";

  const handleExport = () => {
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `aether-life-os-backup-${getTodayKey()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    notify("Your workspace backup has been downloaded.", "success");
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const parsedFile: unknown = JSON.parse(await file.text());
      const restoredData = parseAppData(parsedFile);

      if (!restoredData) {
        throw new Error("This file does not contain a valid Aether workspace.");
      }

      onRestore(restoredData);
      notify("Workspace restored from backup.", "success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The selected backup could not be read.";

      notify(message, "error");
    } finally {
      event.target.value = "";
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Delete all tasks, transactions, habits, and journal entries from this device? This cannot be undone."
    );

    if (confirmed) {
      onReset();
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your appearance, sample workspace, and data backups.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
            </span>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-950 dark:text-white">
                Appearance
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Choose a comfortable workspace theme. Your preference is saved
                with your local data.
              </p>
              <button
                type="button"
                onClick={onToggleTheme}
                className={`${secondaryButton} mt-4`}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                Switch to {isDark ? "light" : "dark"} mode
              </button>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
              <Database size={20} />
            </span>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-950 dark:text-white">
                Local workspace storage
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Your workspace stays in this browser. Local storage is used
                first, with an IndexedDB fallback when needed.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {saveStatus === "error" ? (
                  <AlertTriangle size={14} className="text-rose-500" />
                ) : (
                  <CheckCircle2
                    size={14}
                    className={
                      saveStatus === "saving"
                        ? "text-amber-500"
                        : "text-emerald-500"
                    }
                  />
                )}
                {storageText}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <FileJson
                size={18}
                className="text-violet-600 dark:text-violet-400"
              />
              <h2 className="font-semibold text-slate-950 dark:text-white">
                Backup and restore
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Export a complete JSON copy of this workspace or restore one from
              a previous backup. Restoring replaces the current workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              className={secondaryButton}
            >
              <Download size={16} />
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              <Upload size={16} />
              Restore backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImport}
              aria-label="Choose a JSON workspace backup"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tasks</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {data.tasks.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transactions
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {data.transactions.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Habits</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {data.habits.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Journal entries
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {data.journalEntries.length}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              <Sprout size={20} />
            </span>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-950 dark:text-white">
                Load sample workspace
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Populate Aether with example tasks, expenses, habits, and journal
                entries. This replaces the current workspace.
              </p>
              <button
                type="button"
                onClick={onSeed}
                className={`${secondaryButton} mt-4`}
              >
                <Sprout size={16} />
                Seed sample data
              </button>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 dark:border-rose-900/60 dark:bg-rose-950/20 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300">
              <Trash2 size={19} />
            </span>
            <div className="flex-1">
              <h2 className="font-semibold text-rose-950 dark:text-rose-100">
                Clear workspace
              </h2>
              <p className="mt-1 text-sm leading-6 text-rose-800/70 dark:text-rose-200/70">
                Permanently remove this workspace&apos;s tasks, transactions,
                habits, and journal entries from this device.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                <RotateCcw size={15} />
                Clear all data
              </button>
            </div>
          </div>
        </article>
      </section>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        Aether Life OS · Local workspace · Today is {formatDate(getTodayKey())}
      </p>
    </div>
  );
}