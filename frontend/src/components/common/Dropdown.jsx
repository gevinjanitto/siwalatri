import * as S from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

const EMPTY = "__empty__";
const TRIGGER = {
  field: "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm hover:border-teal-300",
  big: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium hover:border-teal-300",
  pill: "rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm hover:border-teal-300",
  glass: "w-full bg-transparent py-0.5 text-sm font-medium text-white",
};

// Dropdown bergaya: pengganti <select> native dengan panel melayang, ikon centang, dan animasi
export const Dropdown = ({ value, onChange, options, placeholder = "Pilih…", testid, variant = "field", className = "", sub }) => {
  const v = value === "" || value === null || value === undefined ? EMPTY : String(value);
  const current = options.find((o) => String(o.value === "" ? EMPTY : o.value) === v);
  return (
    <S.Root value={v} onValueChange={(nv) => onChange(nv === EMPTY ? "" : nv)}>
      <S.Trigger data-testid={testid} className={`group flex items-center justify-between gap-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--teal)]/40 data-[state=open]:border-[var(--teal)] ${TRIGGER[variant]} ${className}`}>
        <span className={`truncate ${current ? "" : variant === "glass" ? "text-white/70" : "text-slate-400"}`}>{current?.label ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180 ${variant === "glass" ? "text-[var(--mint)]" : "text-teal-600"}`} />
      </S.Trigger>
      <S.Portal>
        <S.Content position="popper" sideOffset={8} data-lenis-prevent
          className="z-[100] max-h-[min(360px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-teal-100 bg-white/95 p-1.5 shadow-[0_24px_60px_-20px_rgba(6,34,58,0.35)] backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
          {sub && <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">{sub}</p>}
          <S.Viewport>
            {options.map((o) => {
              const ov = o.value === "" ? EMPTY : String(o.value);
              return (
                <S.Item key={ov} value={ov} data-testid={testid ? `${testid}-option-${ov}` : undefined}
                  className="relative flex cursor-pointer select-none items-center gap-3 rounded-xl py-2.5 pl-3 pr-9 text-sm text-slate-800 outline-none transition-colors data-[highlighted]:bg-[var(--foam)] data-[state=checked]:font-semibold data-[state=checked]:text-[var(--ink)]">
                  {o.icon && <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--canvas)] text-teal-700">{o.icon}</span>}
                  <span className="min-w-0">
                    <S.ItemText>{o.label}</S.ItemText>
                    {o.hint && <span className="block text-[11px] font-normal text-slate-500">{o.hint}</span>}
                  </span>
                  <S.ItemIndicator className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full grad-sea text-white"><Check className="h-3 w-3" /></S.ItemIndicator>
                </S.Item>
              );
            })}
          </S.Viewport>
        </S.Content>
      </S.Portal>
    </S.Root>
  );
};

export const toOpts = (list, label = "nama", hint) => list.map((x) => ({ value: x.id, label: typeof label === "function" ? label(x) : x[label], hint: hint?.(x) }));
export const strOpts = (list) => list.map((x) => ({ value: x, label: x }));
