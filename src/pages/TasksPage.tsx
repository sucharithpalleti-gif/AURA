import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  GripVertical,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
  Trello
} from "lucide-react";
import type {
  AppData,
  EditorKind,
  Task,
  TaskPriority,
  TaskStatus
} from "../types";
import { formatDate, getTodayKey } from "../lib/date";

interface TasksPageProps {
  data: AppData;
  onCreate: (kind: EditorKind) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const columns: Array<{ status: TaskStatus; label: string }> = [
  { status: "todo", label: "To do" },
  { status: "inprogress", label: "In progress" },
  { status: "done", label: "Completed" }
];

function priorityClasses(priority: TaskPriority): string {
  if (priority === "high") {
    return "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300";
  }

  if (priority === "medium") {
    return "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300";
  }

  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
}

const selectClass =
  "rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  draggable = false
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  draggable?: boolean;
}) {
  const today = getTodayKey();
  const overdue = Boolean(
    task.dueDate && task.dueDate < today && task.status !== "done"
  );

  return (
    <article
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", task.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
    >
      <div className="flex items-start gap-2">
        {draggable ? (
          <GripVertical
            size={16}
            className="mt-0.5 shrink-0 cursor-grab text-slate-300 dark:text-slate-600"
          />
        ) : null}

        <button
          type="button"
          onClick={() => onEdit(task)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="block break-words text-sm font-semibold text-slate-900 dark:text-white">
            {task.title}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-violet-700 dark:hover:bg-slate-800 dark:hover:text-violet-300"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete ${task.title}`}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {task.description ? (
        <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-xs leading-5 text-slate-500 dark:text-slate-400">
          {task.description}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${priorityClasses(task.priority)}`}
        >
          {task.priority}
        </span>
        {task.category ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {task.category}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <span
          className={`inline-flex items-center gap-1.5 text-xs ${
            overdue
              ? "font-semibold text-rose-600 dark:text-rose-300"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <CalendarDays size={13} />
          {task.dueDate
            ? overdue
              ? `Overdue · ${formatDate(task.dueDate)}`
              : formatDate(task.dueDate)
            : "No due date"}
        </span>

        <label className="sr-only" htmlFor={`status-${task.id}`}>
          Change status for {task.title}
        </label>
        <select
          id={`status-${task.id}`}
          value={task.status}
          onChange={(event) =>
            onStatusChange(task.id, event.target.value as TaskStatus)
          }
          className={selectClass}
        >
          <option value="todo">To do</option>
          <option value="inprogress">In progress</option>
          <option value="done">Completed</option>
        </select>
      </div>
    </article>
  );
}

export default function TasksPage({
  data,
  onCreate,
  onEdit,
  onDelete,
  onStatusChange
}: TasksPageProps) {
  const [view, setView] = useState<"board" | "list">("board");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [status, setStatus] = useState<TaskStatus | "all">("all");

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...data.tasks]
      .filter((task) => {
        const matchesQuery =
          !normalizedQuery ||
          [task.title, task.description, task.category]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

        const matchesPriority =
          priority === "all" || task.priority === priority;

        const matchesStatus = status === "all" || task.status === status;

        return matchesQuery && matchesPriority && matchesStatus;
      })
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [data.tasks, priority, query, status]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Capture, prioritize, and move work forward.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-violet-50 px-3 py-1.5 font-semibold text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
              {data.tasks.filter((task) => task.status === "todo").length} to do
            </span>
            <span className="rounded-full bg-sky-50 px-3 py-1.5 font-semibold text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
              {data.tasks.filter((task) => task.status === "inprogress").length}{" "}
              in progress
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              {data.tasks.filter((task) => task.status === "done").length}{" "}
              completed
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onCreate("task")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          <Plus size={17} />
          New task
        </button>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:p-4">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search tasks</span>
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <label>
            <span className="sr-only">Filter by priority</span>
            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TaskPriority | "all")
              }
              className={selectClass}
            >
              <option value="all">All priorities</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </label>

          <label>
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as TaskStatus | "all")
              }
              className={selectClass}
            >
              <option value="all">All statuses</option>
              <option value="todo">To do</option>
              <option value="inprogress">In progress</option>
              <option value="done">Completed</option>
            </select>
          </label>

          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setView("board")}
              aria-label="Kanban board view"
              aria-pressed={view === "board"}
              className={`rounded-lg p-2 transition ${
                view === "board"
                  ? "bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              <Trello size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
              className={`rounded-lg p-2 transition ${
                view === "list"
                  ? "bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </section>

      {filteredTasks.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
            <Check size={22} />
          </span>
          <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
            {data.tasks.length
              ? "No tasks match these filters"
              : "A clear slate"}
          </h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            {data.tasks.length
              ? "Try adjusting your search or filters."
              : "Create your first task and give your next step a home."}
          </p>
          {!data.tasks.length ? (
            <button
              type="button"
              onClick={() => onCreate("task")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <Plus size={16} />
              Create a task
            </button>
          ) : null}
        </section>
      ) : view === "board" ? (
        <section className="grid gap-4 xl:grid-cols-3">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter(
              (task) => task.status === column.status
            );

            return (
              <div
                key={column.status}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const taskId = event.dataTransfer.getData("text/plain");

                  if (taskId) {
                    onStatusChange(taskId, column.status);
                  }
                }}
                className="min-h-64 rounded-2xl border border-slate-200 bg-slate-100/70 p-3 dark:border-slate-800 dark:bg-slate-900/60 sm:p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2 px-1">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {column.label}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      draggable
                    />
                  ))}

                  {columnTasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 px-3 py-8 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                      Drop a task here
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/60">
                <tr>
                  <th className="px-5 py-3.5">Task</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Due date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => onEdit(task)}
                        className="text-left"
                      >
                        <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                          {task.title}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                          {task.category ||
                            task.description ||
                            "No category"}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${priorityClasses(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {task.dueDate ? formatDate(task.dueDate) : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={task.status}
                        onChange={(event) =>
                          onStatusChange(
                            task.id,
                            event.target.value as TaskStatus
                          )
                        }
                        className={selectClass}
                        aria-label={`Change status for ${task.title}`}
                      >
                        <option value="todo">To do</option>
                        <option value="inprogress">In progress</option>
                        <option value="done">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(task)}
                          aria-label={`Edit ${task.title}`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-700 dark:hover:bg-slate-800 dark:hover:text-violet-300"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(task.id)}
                          aria-label={`Delete ${task.title}`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}