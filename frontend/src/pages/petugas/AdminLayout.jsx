import { useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Anchor, BarChart3, Bell, CalendarClock, ChevronDown, ClipboardList, FileBarChart, Globe, LayoutDashboard, LogOut, Map, Megaphone,
  Menu, QrCode, Route, Search, Settings2, Ship, Target, Ticket, UserCog, Users, Wallet, Building2, ListChecks, UserRound,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useStore } from "@/store/AppStore";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { hm } from "@/lib/format";
import { useWitaClock } from "@/pages/landing/Schedule";
import { NotifButton } from "./NotifButton";

export const MENU = [
  { group: "Menu", items: [{ to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard }, { to: "/profile", label: "Profil", Icon: UserRound }] },
  { group: "Operasional", items: [{ to: "/jadwal", label: "Jadwal & Approval", Icon: CalendarClock }, { to: "/manifest", label: "Manifest & Barang", Icon: ClipboardList }] },
  { group: "Master Data", items: [
    { to: "/master/kapal", label: "Kapal", Icon: Ship }, { to: "/master/penumpang", label: "Jenis Penumpang", Icon: Users },
    { to: "/master/dermaga", label: "Dermaga", Icon: Anchor }, { to: "/master/rute", label: "Rute", Icon: Route },
    { to: "/master/tujuan-penumpang", label: "Tujuan Penumpang", Icon: Target }, { to: "/master/sop", label: "SOP", Icon: ListChecks },
  ] },
  { group: "Pengguna", items: [{ to: "/user/petugas", label: "Petugas", Icon: UserCog }, { to: "/user/operator-armada", label: "Operator Armada", Icon: Building2 }] },
  { group: "Konten", items: [{ to: "/pengumuman", label: "Pengumuman", Icon: Megaphone }] },
  { group: "Laporan", items: [
    { to: "/laporan/operator/harian", label: "Operator Harian", Icon: FileBarChart }, { to: "/laporan/operator/bulanan", label: "Operator Bulanan", Icon: BarChart3 },
    { to: "/laporan/penumpang", label: "Penumpang", Icon: Users }, { to: "/laporan/transaksi", label: "Transaksi", Icon: Wallet },
  ] },
  { group: "Rekonsiliasi", items: [{ to: "/rekonsiliasi/va", label: "Virtual Account", Icon: Wallet }, { to: "/rekonsiliasi/qris", label: "QRIS", Icon: QrCode }] },
  { group: "Pengaturan", items: [{ to: "/pengaturan/batas-penjualan", label: "Batas Penjualan Tiket", Icon: Settings2 }] },
];

const Group = ({ g, onNav }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} data-testid={`sidebar-group-${g.group.toLowerCase().replace(/ /g, "-")}`} className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {g.group}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && g.items.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} onClick={onNav} data-testid={`sidebar-link-${to.replace(/\//g, "-").slice(1)}`}
          className={({ isActive }) => `mt-0.5 flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-[var(--ink)] text-white shadow-[0_10px_24px_-12px_rgba(6,34,58,0.8)]" : "text-slate-700 hover:bg-slate-100"}`}>
          <Icon className="h-4 w-4" />{label}
        </NavLink>
      ))}
    </div>
  );
};

const SidebarBody = ({ onNav }) => {
  const { staff, logoutStaff } = useStore();
  const nav = useNavigate();
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5"><Logo to="/dashboard" sub="Modul Petugas" testid="admin-logo" /></div>
      <div className="flex-1 overflow-y-auto px-3 pb-4" data-lenis-prevent>{MENU.map((g) => <Group key={g.group} g={g} onNav={onNav} />)}</div>
      <div className="m-3 flex items-center gap-3 rounded-3xl bg-[var(--canvas)] p-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full grad-sea font-bold text-white">{staff?.nama?.[0]}</span>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{staff?.nama}</p><p className="truncate text-xs text-slate-500">{staff?.email}</p></div>
        <button data-testid="sidebar-logout" onClick={() => { logoutStaff(); toast.success("Anda telah keluar"); nav("/login"); }} className="rounded-full p-2 text-slate-500 hover:bg-white hover:text-red-600"><LogOut className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

export default function AdminLayout() {
  const { staff } = useStore();
  const [open, setOpen] = useState(false);
  const now = useWitaClock();
  const loc = useLocation();
  if (!staff) return <Navigate to="/login" replace />;
  const title = MENU.flatMap((g) => g.items).find((i) => loc.pathname.startsWith(i.to))?.label || "Dashboard";
  return (
    <div className="min-h-screen bg-[#eef3f3]" data-testid="admin-layout">
      <aside className="fixed inset-y-3 left-3 z-30 hidden w-[264px] rounded-[28px] bg-white lg:block no-print"><SidebarBody /></aside>
      <Sheet open={open} onOpenChange={setOpen}><SheetContent side="left" className="w-[290px] p-0"><SidebarBody onNav={() => setOpen(false)} /></SheetContent></Sheet>
      <div className="lg:pl-[284px]">
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-[#eef3f3]/85 px-4 py-4 backdrop-blur-lg sm:px-6 no-print">
          <button data-testid="admin-mobile-menu-btn" onClick={() => setOpen(true)} className="rounded-full bg-white p-2.5 lg:hidden"><Menu className="h-5 w-5" /></button>
          <div className="hidden flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm text-slate-500 md:flex md:max-w-sm">
            <Search className="h-4 w-4" /><input data-testid="admin-search" placeholder={`Cari di ${title}…`} className="w-full bg-transparent outline-none" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-white px-4 py-2 font-mono text-xs font-semibold text-[var(--ocean)] sm:block" data-testid="admin-clock">{hm(now)} WITA</span>
            <Link to="/tiket" data-testid="admin-link-tiket" className="hidden items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold hover:bg-[var(--foam)] md:flex"><Ticket className="h-3.5 w-3.5" />Modul Tiket</Link>
            <Link to="/" data-testid="admin-link-landing" className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold hover:bg-[var(--foam)]"><Globe className="h-3.5 w-3.5" />Landing</Link>
            <NotifButton />
          </div>
        </header>
        <main className="px-4 pb-10 sm:px-6"><Outlet /></main>
      </div>
    </div>
  );
}

export const PageTitle = ({ title, sub, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="font-display text-4xl font-bold tracking-[-0.03em] sm:text-5xl" data-testid="admin-page-title">{title}</h1>
      {sub && <p className="mt-1 text-sm text-slate-600">{sub}</p>}
    </div>
    <div className="flex flex-wrap items-center gap-2">{children}</div>
  </div>
);

export const Panel = ({ children, className = "", ...p }) => <div {...p} className={`rounded-[28px] bg-white p-5 sm:p-6 ${className}`}>{children}</div>;
export const MapIcon = Map;
