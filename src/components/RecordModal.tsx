import { useState, type FormEvent } from "react";
import { createId } from "../lib/utils";
import { getTodayKey } from "../lib/date";
import type {
  EditorKind,
  EditorRecord,
  Habit,
  JournalEntry,
  Task,
  TaskPriority,
  TaskStatus,
  Transaction,
  TransactionType
} from "../types";
import Modal from "./Modal";

interface RecordModalProps {
  kind: EditorKind;
  initial: EditorRecord | null;
  onClose: () => void;
  onSave: (record: EditorRecord) => void;
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

const labelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-200";

const helperClass = "mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 focus-visible:outline-violet-500";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

function FormActions({
  onClose,
  submitLabel
}: {
  onClose: () => void;
  submitLabel: string;
}) {
  return (
    <div className="mt-7 flex justify-end gap-2.5 border-t border-slate-100 pt-5 dark:border-slate-800">
      <button
        type="button"
        onClick={onClose}
        className={secondaryButtonClass}
      >
        Cancel
      </button>
      <button type="submit" className={primaryButtonClass}>
        {submitLabel}
      </button>
    </div>
  );
}

function TaskEditor({
  initial,
  onClose,
  onSave
}: {
  initial: Task | null;
  onClose: () => void;
  onSave: (record: EditorRecord) => void;
}) {
  const [task, setTask] = useState<Task>(() => {
    if (initial) {
      return initial;
    }

    return {
      id: createId(),
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      category: "",
      createdAt: new Date().toISOString()
    };
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!task.title.trim()) {
      return;
    }

    onSave({
      ...task,
      title: task.title.trim(),
      description: task.description.trim(),
      category: task.category.trim()
    });
  };

  return (
    <Modal
      title={initial ? "Edit task" : "Create a task"}
      description="Make the next step clear and easy to act on."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <label className={labelClass}>
          Task name
          <input
            autoFocus
            required
            maxLength={120}
            className={inputClass}
            placeholder="What needs to get done?"
            value={task.title}
            onChange={(event) =>
              setTask({ ...task, title: event.target.value })
            }
          />
        </label>

        <label className={`${labelClass} mt-4`}>
          Description
          <textarea
            rows={3}
            maxLength={1000}
            className={inputClass}
            placeholder="Add a little context or the next action…"
            value={task.description}
            onChange={(event) =>
              setTask({ ...task, description: event.target.value })
            }
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Status
            <select
              className={inputClass}
              value={task.status}
              onChange={(event) =>
                setTask({
                  ...task,
                  status: event.target.value as TaskStatus
                })
              }
            >
              <option value="todo">To do</option>
              <option value="inprogress">In progress</option>
              <option value="done">Completed</option>
            </select>
          </label>

          <label className={labelClass}>
            Priority
            <select
              className={inputClass}
              value={task.priority}
              onChange={(event) =>
                setTask({
                  ...task,
                  priority: event.target.value as TaskPriority
                })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className={labelClass}>
            Due date
            <input
              type="date"
              className={inputClass}
              value={task.dueDate}
              onChange={(event) =>
                setTask({ ...task, dueDate: event.target.value })
              }
            />
          </label>

          <label className={labelClass}>
            Category
            <input
              maxLength={40}
              className={inputClass}
              placeholder="Work, personal, home…"
              value={task.category}
              onChange={(event) =>
                setTask({ ...task, category: event.target.value })
              }
            />
          </label>
        </div>

        <FormActions
          onClose={onClose}
          submitLabel={initial ? "Save changes" : "Create task"}
        />
      </form>
    </Modal>
  );
}

const transactionCategories = [
  "Food & dining",
  "Groceries",
  "Transport",
  "Home",
  "Shopping",
  "Health",
  "Subscriptions",
  "Salary",
  "Freelance",
  "Gifts",
  "Other"
];

function TransactionEditor({
  initial,
  onClose,
  onSave
}: {
  initial: Transaction | null;
  onClose: () => void;
  onSave: (record: EditorRecord) => void;
}) {
  const [transaction, setTransaction] = useState<Transaction>(() => {
    if (initial) {
      return initial;
    }

    return {
      id: createId(),
      type: "expense",
      amount: 0,
      category: "Food & dining",
      note: "",
      date: getTodayKey()
    };
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!Number.isFinite(transaction.amount) || transaction.amount <= 0) {
      return;
    }

    onSave({
      ...transaction,
      category: transaction.category.trim(),
      note: transaction.note.trim()
    });
  };

  return (
    <Modal
      title={initial ? "Edit transaction" : "Log a transaction"}
      description="Keep your income and spending in one clear view."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(["expense", "income"] as TransactionType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTransaction({ ...transaction, type })}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold capitalize transition ${
                transaction.type === type
                  ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Amount
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              className={inputClass}
              placeholder="0.00"
              value={transaction.amount || ""}
              onChange={(event) =>
                setTransaction({
                  ...transaction,
                  amount: Number(event.target.value)
                })
              }
            />
          </label>

          <label className={labelClass}>
            Date
            <input
              required
              type="date"
              className={inputClass}
              value={transaction.date}
              onChange={(event) =>
                setTransaction({
                  ...transaction,
                  date: event.target.value
                })
              }
            />
          </label>

          <label className={labelClass}>
            Category
            <select
              required
              className={inputClass}
              value={transaction.category}
              onChange={(event) =>
                setTransaction({
                  ...transaction,
                  category: event.target.value
                })
              }
            >
              {transactionCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Note
            <input
              maxLength={120}
              className={inputClass}
              placeholder="Optional details"
              value={transaction.note}
              onChange={(event) =>
                setTransaction({ ...transaction, note: event.target.value })
              }
            />
          </label>
        </div>

        <FormActions
          onClose={onClose}
          submitLabel={initial ? "Save changes" : "Add transaction"}
        />
      </form>
    </Modal>
  );
}

const habitColors = [
  "#7c6df2",
  "#0f9f8f",
  "#e68b47",
  "#e2537b",
  "#3977d5",
  "#758a3a"
];

function HabitEditor({
  initial,
  onClose,
  onSave
}: {
  initial: Habit | null;
  onClose: () => void;
  onSave: (record: EditorRecord) => void;
}) {
  const [habit, setHabit] = useState<Habit>(() => {
    if (initial) {
      return initial;
    }

    return {
      id: createId(),
      name: "",
      color: habitColors[0],
      createdAt: new Date().toISOString(),
      completedDates: []
    };
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!habit.name.trim()) {
      return;
    }

    onSave({ ...habit, name: habit.name.trim() });
  };

  return (
    <Modal
      title={initial ? "Edit habit" : "Create a habit"}
      description="Choose a small practice you want to return to."
      onClose={onClose}
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <label className={labelClass}>
          Habit name
          <input
            autoFocus
            required
            maxLength={80}
            className={inputClass}
            placeholder="For example, take a morning walk"
            value={habit.name}
            onChange={(event) =>
              setHabit({ ...habit, name: event.target.value })
            }
          />
        </label>

        <fieldset className="mt-5">
          <legend className={labelClass}>Color</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {habitColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setHabit({ ...habit, color })}
                aria-label={`Choose habit color ${color}`}
                aria-pressed={habit.color === color}
                className={`h-9 w-9 rounded-full transition ${
                  habit.color === color
                    ? "ring-2 ring-slate-900 ring-offset-2 dark:ring-white dark:ring-offset-slate-900"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className={helperClass}>
            Existing check-ins stay attached when you edit a habit.
          </p>
        </fieldset>

        <FormActions
          onClose={onClose}
          submitLabel={initial ? "Save changes" : "Create habit"}
        />
      </form>
    </Modal>
  );
}

function JournalEditor({
  initial,
  onClose,
  onSave
}: {
  initial: JournalEntry | null;
  onClose: () => void;
  onSave: (record: EditorRecord) => void;
}) {
  const [entry, setEntry] = useState<JournalEntry>(() => {
    if (initial) {
      return initial;
    }

    return {
      id: createId(),
      date: getTodayKey(),
      content: "",
      updatedAt: new Date().toISOString()
    };
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSave({
      ...entry,
      content: entry.content.trimEnd(),
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <Modal
      title={initial ? "Edit journal entry" : "Write a journal entry"}
      description="A few honest lines are enough to begin."
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <label className={labelClass}>
          Entry date
          <input
            required
            type="date"
            className={inputClass}
            value={entry.date}
            onChange={(event) =>
              setEntry({ ...entry, date: event.target.value })
            }
          />
        </label>

        <label className={`${labelClass} mt-4`}>
          Reflection
          <textarea
            autoFocus
            rows={12}
            maxLength={12000}
            className={`${inputClass} resize-y font-mono leading-6`}
            placeholder={"# What is on your mind?\n\n- A moment I appreciated\n- What I want to focus on next"}
            value={entry.content}
            onChange={(event) =>
              setEntry({ ...entry, content: event.target.value })
            }
          />
        </label>

        <p className={helperClass}>
          Simple Markdown is supported: headings, lists, quotes, bold, italics,
          and inline code.
        </p>

        <FormActions
          onClose={onClose}
          submitLabel={initial ? "Save entry" : "Save reflection"}
        />
      </form>
    </Modal>
  );
}

export default function RecordModal({
  kind,
  initial,
  onClose,
  onSave
}: RecordModalProps) {
  switch (kind) {
    case "task":
      return (
        <TaskEditor
          key={`task-${initial?.id ?? "new"}`}
          initial={initial && "status" in initial ? (initial as Task) : null}
          onClose={onClose}
          onSave={onSave}
        />
      );

    case "transaction":
      return (
        <TransactionEditor
          key={`transaction-${initial?.id ?? "new"}`}
          initial={
            initial && "amount" in initial ? (initial as Transaction) : null
          }
          onClose={onClose}
          onSave={onSave}
        />
      );

    case "habit":
      return (
        <HabitEditor
          key={`habit-${initial?.id ?? "new"}`}
          initial={
            initial && "completedDates" in initial
              ? (initial as Habit)
              : null
          }
          onClose={onClose}
          onSave={onSave}
        />
      );

    case "journal":
      return (
        <JournalEditor
          key={`journal-${initial?.id ?? "new"}`}
          initial={
            initial && "content" in initial
              ? (initial as JournalEntry)
              : null
          }
          onClose={onClose}
          onSave={onSave}
        />
      );

    default:
      return null;
  }
}