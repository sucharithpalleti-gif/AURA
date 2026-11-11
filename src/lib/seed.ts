import { addDays, getLastNDays, getTodayKey } from "./date";
import { createId } from "./utils";
import type { AppData, Theme } from "../types";

export function createSeedData(theme: Theme = "light"): AppData {
  const today = getTodayKey();
  const now = new Date().toISOString();
  const recentDates = getLastNDays(8, today);

  return {
    version: 1,
    theme,
    tasks: [
      {
        id: createId(),
        title: "Plan the week with intention",
        description: "Choose three priorities and make room for focused work.",
        status: "inprogress",
        priority: "high",
        dueDate: today,
        category: "Personal",
        createdAt: now
      },
      {
        id: createId(),
        title: "Review monthly spending",
        description: "Look over recent purchases and recurring expenses.",
        status: "todo",
        priority: "medium",
        dueDate: addDays(today, 1),
        category: "Finance",
        createdAt: now
      },
      {
        id: createId(),
        title: "Organize workspace",
        description: "Clear the desk and prepare a calm place to focus.",
        status: "todo",
        priority: "low",
        dueDate: addDays(today, 3),
        category: "Home",
        createdAt: now
      },
      {
        id: createId(),
        title: "Set up Aether Life OS",
        description: "Your workspace is ready to make your own.",
        status: "done",
        priority: "low",
        dueDate: addDays(today, -1),
        category: "Personal",
        createdAt: now
      }
    ],
    transactions: [
      {
        id: createId(),
        type: "expense",
        amount: 18.5,
        category: "Food & dining",
        note: "Lunch with a friend",
        date: today
      },
      {
        id: createId(),
        type: "income",
        amount: 2400,
        category: "Salary",
        note: "Monthly salary",
        date: addDays(today, -1)
      },
      {
        id: createId(),
        type: "expense",
        amount: 42.75,
        category: "Transport",
        note: "Train and rideshare",
        date: addDays(today, -2)
      },
      {
        id: createId(),
        type: "expense",
        amount: 64.2,
        category: "Groceries",
        note: "Weekly groceries",
        date: addDays(today, -4)
      },
      {
        id: createId(),
        type: "expense",
        amount: 12,
        category: "Subscriptions",
        note: "Music subscription",
        date: addDays(today, -6)
      }
    ],
    habits: [
      {
        id: createId(),
        name: "Morning movement",
        color: "#7c6df2",
        createdAt: now,
        completedDates: recentDates
      },
      {
        id: createId(),
        name: "Read for 20 minutes",
        color: "#0f9f8f",
        createdAt: now,
        completedDates: recentDates.slice(2)
      },
      {
        id: createId(),
        name: "Reflect and journal",
        color: "#e68b47",
        createdAt: now,
        completedDates: recentDates.slice(1, 6)
      }
    ],
    journalEntries: [
      {
        id: createId(),
        date: today,
        content:
          "# A fresh start\n\n- What deserves my attention today?\n- One small win I want to notice\n\n**Today I choose progress over perfection.**",
        updatedAt: now
      },
      {
        id: createId(),
        date: addDays(today, -1),
        content:
          "A quieter day than expected. I made time to reset, took a walk, and came back to my work with a clearer mind.",
        updatedAt: now
      }
    ]
  };
}