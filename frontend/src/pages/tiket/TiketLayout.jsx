import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { History, LogOut, Menu, UserRound, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { MaiHartaCredit } from "@/pages/landing/Sections";
import { useStore } from "@/store/AppStore";
import { useLenis } from "@/components/motion/Motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/tiket", label: "Beranda", end: true },
  { to: "/tiket/jadwal", label: "Jadwal Pelayaran" },
  { to: "/tiket/info", label: "Info Pemesanan" },
  { to: "/tiket/partner", label: "Partner" },
  { to: "/tiket/contact-us", label: "Kontak" },
];
const IDLE_MS = 15 * 60 * 1000;
const ACT_KEY = "siwalatri-last-activity";

const useIdleLogout = (active, logout) => {
  useEffect(() => {
    if (!active) return undefined;
    const bump = () => localStorage.setItem(ACT_KEY, String(Date.now()));
    bump();
    const evs = ["click", "keydown", "scroll"];
    evs.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const t = setInterval(() => {
      if (Date.now() - Number(localStorage.getItem(ACT_KEY) || 0) > IDLE_MS) { logout(); toast.info("Sesi berakhir setelah 15 menit tidak aktif"); }
    }, 30000);
    return () => { evs.forEach((e) => window.removeEventListener(e, bump)); clearInterval(t); };
  }, [active, logout]);
};

const linkCls = ({ isActive }) => `rounded-full px-4 py-2 text-sm font-medium transition-colors ${isActive ? "bg-[var(--ink)] text-white" : "text-slate-700 hover:bg-slate-100"}`;

export default function TiketLayout() {
  useLenis();
  const { customer, logoutCustomer } = useStore();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  useIdleLogout(!!customer, logoutCustomer);
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [loc.pathname]);
  const out = () => { logoutCustomer(); toast.success("Anda telah keluar"); nav("/tiket"); };
  return (
    <div className="min-h-screen bg-[var(--canvas)]" data-testid="tiket-layout">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl no-print">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Logo to="/tiket" sub="Tiket" testid="tiket-logo" />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={linkCls} data-testid={`tiket-nav-${n.label.toLowerCase().replace(/ /g, "-")}`}>{n.label}</NavLink>)}
            {customer && <NavLink to="/tiket/riwayat-pemesanan" className={linkCls} data-testid="tiket-nav-riwayat">Riwayat Pemesanan</NavLink>}
          </nav>
          <div className="flex items-center gap-2">
            {customer ? (
              <DropdownMenu>
                <DropdownMenuTrigger data-testid="tiket-account-menu" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm font-medium">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full grad-sea text-xs font-bold text-white">{customer.nama[0]}</span>
                  <span className="hidden sm:block max-w-[120px] truncate">{customer.nama}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                  <DropdownMenuLabel className="text-xs text-slate-500">{customer.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="tiket-account-riwayat" onClick={() => nav("/tiket/riwayat-pemesanan")}><History className="mr-2 h-4 w-4" />Riwayat Pemesanan</DropdownMenuItem>
                  <DropdownMenuItem data-testid="tiket-account-logout" onClick={out}><LogOut className="mr-2 h-4 w-4" />Keluar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/tiket/login" data-testid="tiket-login-btn" className="flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--ocean)]"><UserRound className="h-4 w-4" />Masuk</Link>
            )}
            <button data-testid="tiket-mobile-menu-btn" onClick={() => setOpen(true)} className="rounded-full border border-slate-200 bg-white p-2 lg:hidden"><Menu className="h-5 w-5" /></button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed inset-x-3 top-3 z-50 rounded-3xl bg-white p-5 shadow-2xl lg:hidden" data-testid="tiket-mobile-menu">
            <div className="flex items-center justify-between"><Logo to="/tiket" sub="Tiket" /><button data-testid="tiket-mobile-close" onClick={() => setOpen(false)} className="rounded-full bg-slate-100 p-2"><X className="h-5 w-5" /></button></div>
            <div className="mt-5 flex flex-col gap-1">
              {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>{n.label}</NavLink>)}
              {customer && <NavLink to="/tiket/riwayat-pemesanan" className={linkCls}>Riwayat Pemesanan</NavLink>}
              <Link to="/" className="px-4 py-2 text-sm text-slate-600">← Kembali ke Landing</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <main><Outlet /></main>
      <footer className="mt-20 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 no-print">
        <p>Modul Tiket · Siwalatri Terpadu — tiket.siwalatri.klungkungkab.go.id · <Link to="/" className="underline">Landing</Link></p>
        <div className="mt-2 flex justify-center"><MaiHartaCredit /></div>
      </footer>
    </div>
  );
}
