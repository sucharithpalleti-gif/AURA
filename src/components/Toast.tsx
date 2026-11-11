import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type ToastTone = "success" | "error" | "info";

export interface ToastMessage {
  message: string;
  tone: ToastTone;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

const toneClasses: Record<ToastTone, string> = {
  success:
    "border-emerald-200 bg-white text-emerald-950 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-200",
  error:
    "border-rose-200 bg-white text-rose-950 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-200",
  info: "border-sky-200 bg-white text-sky-950 dark:border-sky-900 dark:bg-slate-900 dark:text-sky-200"
};

export default function Toast({ toast, onClose }: ToastProps) {
  const Icon =
    toast.tone === "success"
      ? CheckCircle2
      : toast.tone === "error"
        ? AlertCircle
        : Info;

  return (
    <div
      role="status"
      className={`animate-fade-in fixed bottom-4 right-4 z-[60] flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-xl ${toneClasses[toast.tone]}`}
    >
      <Icon className="mt-0.5 shrink-0" size={18} />
      <p className="flex-1 text-sm font-medium leading-5">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
      >
        <X size={15} />
      </button>
    </div>
  );
}