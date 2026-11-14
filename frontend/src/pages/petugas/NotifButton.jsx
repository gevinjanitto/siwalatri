import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CalendarClock, CheckCheck, CreditCard, QrCode, ShieldAlert, Ship } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLookup, useStore } from "@/store/AppStore";
import { rupiah } from "@/lib/format";

export const NotifButton = () => {
  const { jadwal, invoices } = useStore();
  const L = useLookup();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(() => new Set(JSON.parse(localStorage.getItem("siwalatri-notif-read") || "[]")));
  const items = useMemo(() => [
    ...jadwal.filter((j) => j.approval === "Menunggu").map(L.detail).map((j) => ({ id: `apv-${j.id}`, Icon: CalendarClock, tone: "bg-amber-100 text-amber-800", title: `Jadwal ${j.jam} menunggu approval`, sub: `${j.armada.nama} · ${j.asal.nama} → ${j.tujuan.nama}`, to: "/jadwal", time: "Baru" })),
    ...invoices.slice(0, 5).map((i) => ({ id: `inv-${i.id}-${i.status}`, Icon: i.metode === "qris" ? QrCode : CreditCard, tone: i.status ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800", title: `${i.status ? "Pembayaran lunas" : "Invoice baru"} ${i.id}`, sub: `${i.units.length} unit · ${rupiah(i.grandtotal)}`, to: i.metode === "qris" ? "/rekonsiliasi/qris" : "/rekonsiliasi/va", time: new Date(i.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) })),
    { id: "sys-cuaca", Icon: ShieldAlert, tone: "bg-red-100 text-red-700", title: "Info gelombang Selat Badung", sub: "Pantau cuaca sebelum memberi izin berlayar", to: "/pengumuman", time: "08:00" },
    { id: "sys-angkal", Icon: Ship, tone: "bg-teal-100 text-teal-800", title: "Data The Angkal Fast Cruise dari database", sub: "API armada timeout, fallback ke database utama", to: "/dashboard", time: "07:45" },
  ], [jadwal, invoices, L]);
  const unread = items.filter((n) => !read.has(n.id)).length;
  const save = (s) => { setRead(s); localStorage.setItem("siwalatri-notif-read", JSON.stringify([...s])); };
  const go = (n) => { save(new Set([...read, n.id])); setOpen(false); nav(n.to); };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger data-testid="admin-notif-btn" className="relative rounded-full bg-white p-2.5 transition-colors hover:bg-[var(--foam)] data-[state=open]:bg-[var(--ink)] data-[state=open]:text-white">
        <Bell className="h-4 w-4" />
        {unread > 0 && <span data-testid="admin-notif-count" className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--mint)] px-1 text-[10px] font-bold text-[var(--ink)] ring-2 ring-white">{unread}</span>}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-[min(380px,calc(100vw-24px))] rounded-[24px] border-teal-100 p-0 shadow-[0_30px_70px_-25px_rgba(6,34,58,0.4)]" data-testid="admin-notif-panel">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><p className="font-display text-lg font-bold">Notifikasi</p><p className="text-xs text-slate-500">{unread} belum dibaca</p></div>
          <button data-testid="admin-notif-read-all" onClick={() => save(new Set(items.map((n) => n.id)))} className="flex items-center gap-1.5 rounded-full bg-[var(--canvas)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--foam)]"><CheckCheck className="h-3.5 w-3.5" />Tandai dibaca</button>
        </div>
        <div className="max-h-[380px] overflow-y-auto p-2" data-lenis-prevent>
          {items.map((n) => (
            <button key={n.id} data-testid={`admin-notif-item-${n.id}`} onClick={() => go(n)} className="flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-[var(--canvas)]">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.tone}`}><n.Icon className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">{n.title}</span><span className="shrink-0 font-mono text-[10px] text-slate-500">{n.time}</span></span>
                <span className="block text-xs text-slate-600">{n.sub}</span>
              </span>
              {!read.has(n.id) && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--teal)]" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
