import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/brand/Logo";

const LINKS = [
  { href: "#jadwal", label: "Jadwal" },
  { href: "#destinasi", label: "Destinasi" },
  { href: "#pengumuman", label: "Pengumuman" },
];

export const LandingNav = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-5 sm:px-10">
        <Logo light sub="Klungkung" testid="landing-logo" />
        <Link to="/tiket" data-testid="landing-nav-search" className="hidden md:flex flex-1 max-w-xs items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur-md hover:bg-white/20 transition-colors">
          <Search className="h-4 w-4" /> Cari jadwal kapal…
        </Link>
        <nav className="hidden lg:flex items-center gap-7 text-sm text-white/90">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} data-testid={`landing-nav-${l.label.toLowerCase()}`} className="relative hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[var(--mint)] after:transition-[width] hover:after:w-full">{l.label}</a>
          ))}
          <Link to="/tiket" data-testid="landing-nav-tiket" className="hover:text-white">Modul Tiket</Link>
          <Link to="/login" data-testid="landing-nav-login-petugas" className="rounded-full bg-white px-4 py-2 font-semibold text-[var(--ink)] hover:bg-[var(--foam)] transition-colors">Login Petugas</Link>
        </nav>
        <button data-testid="landing-mobile-menu-btn" onClick={() => setOpen(true)} className="lg:hidden rounded-full bg-white/15 p-2.5 text-white backdrop-blur-md"><Menu className="h-5 w-5" /></button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grad-sea p-6 text-white" data-testid="landing-mobile-menu">
            <div className="flex items-center justify-between"><Logo light sub="Klungkung" /><button data-testid="landing-mobile-close" onClick={() => setOpen(false)} className="rounded-full bg-white/15 p-2.5"><X className="h-5 w-5" /></button></div>
            <div className="mt-14 flex flex-col gap-5 font-display text-4xl font-semibold">
              {LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
              <Link to="/tiket">Modul Tiket</Link>
              <Link to="/login">Login Petugas</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
