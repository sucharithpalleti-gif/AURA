import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl"
} satisfies Record<NonNullable<ModalProps["size"]>, string>;

export default function Modal({
  title,
  description,
  onClose,
  children,
  size = "md"
}: ModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`animate-fade-in w-full ${sizeClasses[size]} max-h-[92vh] overflow-y-auto rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:rounded-3xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-7">
          <div>
            <h2
              id="modal-title"
              className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-7 sm:py-6">{children}</div>
      </section>
    </div>
  );
}