import { useId } from "react";
import { Link } from "react-router-dom";

export const LogoMark = ({ className = "h-9 w-9" }) => {
  const gid = useId().replace(/:/g, "");
  return (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <defs>
      <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#06223A" />
        <stop offset=".5" stopColor="#0077B6" />
        <stop offset="1" stopColor="#02C39A" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="20" fill={`url(#${gid})`} />
    <path d="M32 4 L32 15 L42 15 Z" fill="#7CF5D6" />
    <path d="M30 7 L30 15 L23.5 15 Z" fill="#fff" opacity=".8" />
    <path d="M43 22 C37 14 20 15 20 24.5 C20 32 44 29.5 44 38 C44 43 38 45 29 45" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M11 46.5 H53 L46.5 54 H18 Z" fill="#fff" />
    <path d="M12 59.5 C18 57 22 62 28 59.5 C34 57 38 62 44 59.5 C48 58 50 58.5 52 59.5" stroke="#fff" strokeOpacity=".55" strokeWidth="2.2" fill="none" strokeLinecap="round" />
  </svg>
  );
};

export const KlungkungLogo = ({ className = "h-9 w-auto" }) => (
  <img src="/img/logo-klungkung.webp" alt="Logo Kabupaten Klungkung" className={`${className} drop-shadow-sm`} />
);

// Logo selalu kembali ke landing awal
export const Logo = ({ light = false, sub = "Terpadu", testid = "brand-logo" }) => (
  <Link to="/" data-testid={testid} className="flex items-center gap-2.5 group">
    <KlungkungLogo className="h-9 w-auto transition-transform duration-500 group-hover:scale-105" />
    <span className={`h-7 w-px ${light ? "bg-white/30" : "bg-slate-200"}`} />
    <LogoMark className="h-9 w-9 transition-transform duration-500 group-hover:rotate-[-8deg]" />
    <span className="leading-none">
      <span className={`block font-display text-lg font-bold tracking-tight ${light ? "text-white" : "text-[var(--ink)]"}`}>Siwalatri</span>
      <span className={`block text-[10px] uppercase tracking-[0.28em] ${light ? "text-white/80" : "text-teal-700"}`}>{sub}</span>
    </span>
  </Link>
);
