export type Theme = "light" | "dark";

export type AppView =
  | "dashboard"
  | "tasks"
  | "expenses"
  | "habits"
  | "journal"
  | "settings";

export type TaskStatus = "todo" | "inprogress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TransactionType = "expense" | "income";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  category: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  completedDates: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  updatedAt: string;
}

export interface AppData {
  version: 1;
  theme: Theme;
  tasks: Task[];
  transactions: Transaction[];
  habits: Habit[];
  journalEntries: JournalEntry[];
}

export type EditorKind = "task" | "transaction" | "habit" | "journal";

export type EditorRecord = Task | Transaction | Habit | JournalEntry;

export function createEmptyAppData(theme: Theme = "light"): AppData {
  return {
    version: 1,
    theme,
    tasks: [],
    transactions: [],
    habits: [],
    journalEntries: []
  };
}