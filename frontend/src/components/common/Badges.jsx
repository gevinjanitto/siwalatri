import { STATUS_STYLE } from "@/lib/format";

export const StatusBadge = ({ status, testid }) => (
  <span data-testid={testid} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_STYLE[status]}`}>
    <span className="relative flex h-2 w-2">
      {status === "Berlayar" && <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-500" />}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${status === "Berlayar" ? "bg-emerald-500" : status === "Persiapan" ? "bg-amber-500" : status === "Off" ? "bg-slate-500" : "bg-sky-500"}`} />
    </span>
    {status}
  </span>
);

export const Chip = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 ${className}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-[var(--sea)]" />
    {children}
  </span>
);
