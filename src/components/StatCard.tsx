import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  iconClassName?: string;
}

export default function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  iconClassName = "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300"
}: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {value}
          </p>
        </div>
        <span className={`rounded-2xl p-3 ${iconClassName}`}>
          <Icon size={20} strokeWidth={2} />
        </span>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {detail}
      </p>
    </article>
  );
}