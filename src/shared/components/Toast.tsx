import { useEffect } from "react";
import { X } from "lucide-react";
import { TOAST_DURATION_MS } from "../constants/toast.constants";
import { useToastStore } from "../stores/toast-store";
import type { Toast as ToastData } from "../types/toast.types";

interface ToastProps {
  toast: ToastData;
}

export function Toast({ toast }: ToastProps) {
  const descartarToast = useToastStore((state) => state.descartarToast);

  useEffect(() => {
    const timer = setTimeout(() => descartarToast(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast.id, descartarToast]);

  const toneClass = toast.type === "success" ? "bg-green-700" : "bg-red-700";

  return (
    <div
      role="status"
      className={`animate-toast-pop pointer-events-auto flex min-w-64 max-w-sm items-start gap-3 rounded-2xl px-5 py-4 text-white shadow-xl ${toneClass}`}
    >
      <div className="flex-1">
        <p className="font-black">{toast.title}</p>
        {toast.description && (
          <p className="text-sm font-semibold opacity-90">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        aria-label="Cerrar notificación"
        onClick={() => descartarToast(toast.id)}
        className="-mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full opacity-80 transition hover:bg-white/20 hover:opacity-100"
      >
        <X className="h-5 w-5" strokeWidth={3} />
      </button>
    </div>
  );
}
