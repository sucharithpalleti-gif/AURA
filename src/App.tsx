import { useEffect, useRef, useState } from "react";
import AppShell from "./components/AppShell";
import RecordModal from "./components/RecordModal";
import Toast, {
  type ToastMessage,
  type ToastTone
} from "./components/Toast";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import HabitsPage from "./pages/HabitsPage";
import JournalPage from "./pages/JournalPage";
import SettingsPage from "./pages/SettingsPage";
import TasksPage from "./pages/TasksPage";
import { loadAppData, saveAppData } from "./lib/storage";
import { createSeedData } from "./lib/seed";
import { upsertById } from "./lib/utils";
import { getTodayKey } from "./lib/date";
import {
  createEmptyAppData,
  type AppData,
  type AppView,
  type EditorKind,
  type EditorRecord,
  type Habit,
  type JournalEntry,
  type Task,
  type TaskStatus,
  type Theme,
  type Transaction
} from "./types";

type SaveStatus = "saved" | "saving" | "error";

interface EditorState {
  kind: EditorKind;
  item: EditorRecord | null;
}

export default function App() {
  const [data, setData] = useState<AppData>(() => createEmptyAppData());
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<number | null>(null);
  const saveSequence = useRef(0);

  const notify = (message: string, tone: ToastTone = "success") => {
    setToast({ message, tone });

    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current);
    }

    toastTimer.current = window.setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3400);
  };

  useEffect(() => {
    let active = true;

    loadAppData()
      .then((loadedData) => {
        if (active) {
          setData(loadedData);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setData(createEmptyAppData());
          setReady(true);
          notify("Could not read saved data. A new workspace was opened.", "error");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const sequence = ++saveSequence.current;
    setSaveStatus("saving");

    const timer = window.setTimeout(() => {
      saveAppData(data)
        .then(() => {
          if (sequence === saveSequence.current) {
            setSaveStatus("saved");
          }
        })
        .catch(() => {
          if (sequence === saveSequence.current) {
            setSaveStatus("error");
            notify(
              "Your latest changes could not be saved. Export a backup from Settings.",
              "error"
            );
          }
        });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [data, ready]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", data.theme === "dark");
    document.documentElement.style.colorScheme = data.theme;
  }, [data.theme]);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) {
        window.clearTimeout(toastTimer.current);
      }
    },
    []
  );

  const openEditor = (kind: EditorKind, item: EditorRecord | null = null) => {
    setEditor({ kind, item });
  };

  const handleRecordSave = (record: EditorRecord) => {
    if (!editor) {
      return;
    }

    setData((current) => {
      switch (editor.kind) {
        case "task":
          return {
            ...current,
            tasks: upsertById(current.tasks, record as Task)
          };

        case "transaction":
          return {
            ...current,
            transactions: upsertById(
              current.transactions,
              record as Transaction
            )
          };

        case "habit":
          return {
            ...current,
            habits: upsertById(current.habits, record as Habit)
          };

        case "journal":
          return {
            ...current,
            journalEntries: upsertById(
              current.journalEntries,
              record as JournalEntry
            )
          };

        default:
          return current;
      }
    });

    const labels: Record<EditorKind, string> = {
      task: "Task",
      transaction: "Transaction",
      habit: "Habit",
      journal: "Journal entry"
    };

    notify(`${labels[editor.kind]} saved.`);
    setEditor(null);
  };

  const handleDelete = (kind: EditorKind, id: string) => {
    const confirmed = window.confirm(
      `Delete this ${kind === "journal" ? "journal entry" : kind}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setData((current) => {
      switch (kind) {
        case "task":
          return {
            ...current,
            tasks: current.tasks.filter((item) => item.id !== id)
          };

        case "transaction":
          return {
            ...current,
            transactions: current.transactions.filter((item) => item.id !== id)
          };

        case "habit":
          return {
            ...current,
            habits: current.habits.filter((item) => item.id !== id)
          };

        case "journal":
          return {
            ...current,
            journalEntries: current.journalEntries.filter(
              (item) => item.id !== id
            )
          };

        default:
          return current;
      }
    });

    notify(
      `${kind === "journal" ? "Journal entry" : kind[0].toUpperCase() + kind.slice(1)} deleted.`
    );
  };

  const handleToggleHabit = (habitId: string) => {
    const today = getTodayKey();

    setData((current) => ({
      ...current,
      habits: current.habits.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }

        const alreadyComplete = habit.completedDates.includes(today);

        return {
          ...habit,
          completedDates: alreadyComplete
            ? habit.completedDates.filter((date) => date !== today)
            : [...habit.completedDates, today]
        };
      })
    }));
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    }));
  };

  const handleToggleTheme = () => {
    setData((current) => ({
      ...current,
      theme: (current.theme === "dark" ? "light" : "dark") as Theme
    }));
  };

  const handleSeed = () => {
    setData(createSeedData(data.theme));
    notify("Sample workspace loaded.");
  };

  const handleRestore = (restoredData: AppData) => {
    setData(restoredData);
    setEditor(null);
    notify("Backup restored successfully.");
  };

  const handleReset = () => {
    setData(createEmptyAppData(data.theme));
    notify("Workspace cleared.");
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 dark:bg-[#0b1020]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-lg font-bold text-white shadow-lg shadow-violet-600/20">
            A
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
            Opening your workspace…
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Your data stays on this device.
          </p>
        </div>
      </div>
    );
  }

  const page = (() => {
    switch (activeView) {
      case "dashboard":
        return (
          <DashboardPage
            data={data}
            onCreate={(kind) => openEditor(kind)}
            onNavigate={setActiveView}
            onToggleHabit={handleToggleHabit}
            onEditTask={(task) => openEditor("task", task)}
            onEditTransaction={(transaction) =>
              openEditor("transaction", transaction)
            }
          />
        );

      case "tasks":
        return (
          <TasksPage
            data={data}
            onCreate={(kind) => openEditor(kind)}
            onEdit={(task) => openEditor("task", task)}
            onDelete={(id) => handleDelete("task", id)}
            onStatusChange={handleStatusChange}
          />
        );

      case "expenses":
        return (
          <ExpensesPage
            data={data}
            onCreate={(kind) => openEditor(kind)}
            onEdit={(transaction) => openEditor("transaction", transaction)}
            onDelete={(id) => handleDelete("transaction", id)}
          />
        );

      case "habits":
        return (
          <HabitsPage
            data={data}
            onCreate={(kind) => openEditor(kind)}
            onEdit={(habit) => openEditor("habit", habit)}
            onDelete={(id) => handleDelete("habit", id)}
            onToggle={handleToggleHabit}
          />
        );

      case "journal":
        return (
          <JournalPage
            data={data}
            onCreate={(kind) => openEditor(kind)}
            onEdit={(entry) => openEditor("journal", entry)}
            onDelete={(id) => handleDelete("journal", id)}
          />
        );

      case "settings":
        return (
          <SettingsPage
            data={data}
            theme={data.theme}
            saveStatus={saveStatus}
            onToggleTheme={handleToggleTheme}
            onSeed={handleSeed}
            onRestore={handleRestore}
            onReset={handleReset}
            notify={notify}
          />
        );

      default:
        return null;
    }
  })();

  return (
    <>
      <AppShell
        activeView={activeView}
        onNavigate={setActiveView}
        theme={data.theme}
        onToggleTheme={handleToggleTheme}
        saveStatus={saveStatus}
      >
        {page}
      </AppShell>

      {editor ? (
        <RecordModal
          kind={editor.kind}
          initial={editor.item}
          onClose={() => setEditor(null)}
          onSave={handleRecordSave}
        />
      ) : null}

      {toast ? <Toast toast={toast} onClose={() => setToast(null)} /> : null}
    </>
  );
}