import { useToastStore } from "../tasks/use-toast";

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.kind === 'error' ? 'alert' : 'status'}
          className="toast-in pointer-events-auto flex items-center gap-3 pl-3.5 pr-2 py-2.5 bg-white border border-slate-100 rounded-xl shadow-lg text-sm text-slate-700"
        >
          <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center ${
            t.kind === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              {t.kind === 'success'
                ? <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />}
            </svg>
          </span>
          <span>{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Cerrar notificación"
            className="p-1 text-slate-300 hover:text-slate-500 rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
