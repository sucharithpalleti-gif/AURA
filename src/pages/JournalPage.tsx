import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Pencil,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import type { AppData, EditorKind, JournalEntry } from "../types";
import { formatDate } from "../lib/date";
import MarkdownPreview from "../components/MarkdownPreview";

interface JournalPageProps {
  data: AppData;
  onCreate: (kind: EditorKind) => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export default function JournalPage({
  data,
  onCreate,
  onEdit,
  onDelete
}: JournalPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    data.journalEntries[0]?.id ?? null
  );
  const [query, setQuery] = useState("");

  const entries = useMemo(
    () =>
      [...data.journalEntries].sort((a, b) =>
        b.date === a.date
          ? b.updatedAt.localeCompare(a.updatedAt)
          : b.date.localeCompare(a.date)
      ),
    [data.journalEntries]
  );

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries.filter(
      (entry) =>
        !normalizedQuery ||
        `${entry.date} ${entry.content}`
          .toLowerCase()
          .includes(normalizedQuery)
    );
  }, [entries, query]);

  useEffect(() => {
    if (!entries.some((entry) => entry.id === selectedId)) {
      setSelectedId(entries[0]?.id ?? null);
    }
  }, [entries, selectedId]);

  const selectedEntry =
    filteredEntries.find((entry) => entry.id === selectedId) ??
    filteredEntries[0] ??
    null;

  const wordCount = selectedEntry
    ? selectedEntry.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A private place to reflect, remember, and make sense of your day.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <CalendarDays
              size={14}
              className="text-violet-600 dark:text-violet-400"
            />
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onCreate("journal")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus size={17} />
          New entry
        </button>
      </section>

      <section className="grid min-h-[560px] gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <label className="relative block">
              <span className="sr-only">Search journal entries</span>
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search entries…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          </div>

          {filteredEntries.length ? (
            <div className="max-h-[680px] overflow-y-auto p-2">
              {filteredEntries.map((entry) => {
                const active = selectedEntry?.id === entry.id;
                const excerpt = entry.content
                  .replace(/^#{1,3}\s+/gm, "")
                  .replace(/[*`>]/g, "")
                  .replace(/\s+/g, " ")
                  .trim();

                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSelectedId(entry.id)}
                    aria-current={active ? "true" : undefined}
                    className={`mb-1 w-full rounded-xl p-3.5 text-left transition ${
                      active
                        ? "bg-violet-50 dark:bg-violet-950/40"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="block text-xs font-semibold text-violet-700 dark:text-violet-300">
                      {formatDate(entry.date, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                    <span className="mt-2 block text-sm font-semibold text-slate-900 dark:text-white">
                      {excerpt ? excerpt.slice(0, 48) : "Untitled reflection"}
                      {excerpt.length > 48 ? "…" : ""}
                    </span>
                    <span className="mt-1.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {excerpt
                        ? `${excerpt.slice(0, 76)}${excerpt.length > 76 ? "…" : ""}`
                        : "No written reflection yet."}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {entries.length ? "No entries match" : "Your journal starts here"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {entries.length
                  ? "Try another search."
                  : "Capture a moment, a lesson, or a thought for later."}
              </p>
              {!entries.length ? (
                <button
                  type="button"
                  onClick={() => onCreate("journal")}
                  className="mt-4 text-sm font-semibold text-violet-700 dark:text-violet-300"
                >
                  Write your first entry
                </button>
              ) : null}
            </div>
          )}
        </aside>

        <article className="flex min-h-[480px] flex-col rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
          {selectedEntry ? (
            <>
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:px-7">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <CalendarDays size={14} />
                    {formatDate(selectedEntry.date, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    {wordCount} {wordCount === 1 ? "word" : "words"}
                  </p>
                </div>

                <div className="flex gap-1 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => onEdit(selectedEntry)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(selectedEntry.id)}
                    aria-label="Delete this journal entry"
                    className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:hover:border-rose-900 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="flex-1 px-5 py-6 sm:px-7 sm:py-8">
                <MarkdownPreview content={selectedEntry.content} />
              </div>

              <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500 sm:px-7">
                Updated{" "}
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(new Date(selectedEntry.updatedAt))}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                <BookOpen size={22} />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                Choose an entry to read
              </h3>
              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                Your saved reflections will appear in this space.
              </p>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
