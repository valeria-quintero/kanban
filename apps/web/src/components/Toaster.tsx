import { TOAST_DURATION_MS, useToastStore } from "../tasks/use-toast";

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.kind === 'error' ? 'alert' : 'status'}
          className="toast-in pointer-events-auto flex items-center gap-3 relative overflow-hidden px-3.5 py-3 bg-white border border-slate-100 rounded-xl shadow-lg text-sm text-slate-700"
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
          <span
            className={`toast-progress absolute bottom-0 left-0 h-0.5 w-full origin-left ${
              t.kind === 'success' ? 'bg-emerald-400' : 'bg-red-400'
            }`}
            style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
          />
        </div>
      ))}
    </div>
  )
}
