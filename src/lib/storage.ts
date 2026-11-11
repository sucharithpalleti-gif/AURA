import {
  createEmptyAppData,
  type AppData,
  type Habit,
  type JournalEntry,
  type Task,
  type Theme,
  type Transaction
} from "../types";

const STORAGE_KEY = "aether-life-os:v1";
const DATABASE_NAME = "aether-life-os";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "workspace";
const OBJECT_STORE_KEY = "app-data";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.title) &&
    isString(value.description) &&
    (value.status === "todo" ||
      value.status === "inprogress" ||
      value.status === "done") &&
    (value.priority === "low" ||
      value.priority === "medium" ||
      value.priority === "high") &&
    isString(value.dueDate) &&
    isString(value.category) &&
    isString(value.createdAt)
  );
}

function isTransaction(value: unknown): value is Transaction {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    (value.type === "expense" || value.type === "income") &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    value.amount > 0 &&
    isString(value.category) &&
    isString(value.note) &&
    isString(value.date)
  );
}

function isHabit(value: unknown): value is Habit {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.color) &&
    isString(value.createdAt) &&
    Array.isArray(value.completedDates) &&
    value.completedDates.every(isString)
  );
}

function isJournalEntry(value: unknown): value is JournalEntry {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.date) &&
    isString(value.content) &&
    isString(value.updatedAt)
  );
}

export function parseAppData(value: unknown): AppData | null {
  if (!isRecord(value)) {
    return null;
  }

  const tasks = value.tasks ?? [];
  const transactions = value.transactions ?? [];
  const habits = value.habits ?? [];
  const journalEntries = value.journalEntries ?? [];

  if (
    !Array.isArray(tasks) ||
    !tasks.every(isTask) ||
    !Array.isArray(transactions) ||
    !transactions.every(isTransaction) ||
    !Array.isArray(habits) ||
    !habits.every(isHabit) ||
    !Array.isArray(journalEntries) ||
    !journalEntries.every(isJournalEntry)
  ) {
    return null;
  }

  const theme: Theme = value.theme === "dark" ? "dark" : "light";

  return {
    version: 1,
    theme,
    tasks,
    transactions,
    habits,
    journalEntries
  };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        database.createObjectStore(OBJECT_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Could not open the local database."));
    request.onblocked = () =>
      reject(new Error("The local database is currently blocked."));
  });
}

async function readIndexedDb(): Promise<unknown> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(OBJECT_STORE_NAME, "readonly");
    const request = transaction
      .objectStore(OBJECT_STORE_NAME)
      .get(OBJECT_STORE_KEY);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Could not read local database data."));

    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Local database read failed."));
    };
  });
}

async function writeIndexedDb(data: AppData): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(OBJECT_STORE_NAME, "readwrite");
    transaction.objectStore(OBJECT_STORE_NAME).put(data, OBJECT_STORE_KEY);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Local database write failed."));
    };

    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("Local database write was aborted."));
    };
  });
}

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed = parseAppData(JSON.parse(raw));

      if (parsed) {
        return parsed;
      }
    }
  } catch {
    // If localStorage is unavailable or malformed, try IndexedDB next.
  }

  try {
    const fallback = parseAppData(await readIndexedDb());

    if (fallback) {
      return fallback;
    }
  } catch {
    // Return an empty workspace if neither browser store can be read.
  }

  return createEmptyAppData();
}

async function persistSerializedData(serialized: string): Promise<void> {
  const parsed = parseAppData(JSON.parse(serialized));

  if (!parsed) {
    throw new Error("Workspace data could not be validated before saving.");
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return;
  } catch {
    // A quota error or unavailable localStorage triggers the IndexedDB fallback.
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Removing a stale localStorage copy is best-effort.
  }

  await writeIndexedDb(parsed);
}

let saveQueue: Promise<void> = Promise.resolve();

export function saveAppData(data: AppData): Promise<void> {
  const serialized = JSON.stringify(data);
  const operation = saveQueue.then(() => persistSerializedData(serialized));

  saveQueue = operation.catch(() => undefined);

  return operation;
}