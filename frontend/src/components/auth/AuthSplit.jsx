import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export const UnderlineField = ({ label, error, type = "text", testid, ...props }) => {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <span className="relative block">
        <input data-testid={testid} type={isPw && show ? "text" : type} {...props}
          className="w-full border-0 border-b-2 border-slate-200 bg-transparent py-2.5 pr-8 text-[15px] text-[var(--ink)] outline-none transition-colors placeholder:text-slate-400 focus:border-[var(--teal)]" />
        {isPw && (
          <button type="button" data-testid={`${testid}-toggle`} onClick={() => setShow(!show)} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[var(--ink)]">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </span>
      {error && <span className="mt-1 block text-xs text-red-600" data-testid={`${testid}-error`}>{error}</span>}
    </label>
  );
};

export const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.2-2.1 3.5-5.2 3.5-8.8z" /><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.4 7.4 24 12 24z" /><path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.6.4-2.4V6.5h-4C.5 8.2 0 10 0 12s.5 3.8 1.4 5.5l4-3.1z" /><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.5l4 3.1c.9-2.8 3.5-4.8 6.6-4.8z" /></svg>
);

export const AuthSplit = ({ image, badge, caption, children, logoTo = "/", logoSub = "Terpadu", testid }) => {
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 14 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 14 });
  const onMove = (e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); };
  return (
    <div className="min-h-screen bg-[var(--canvas)] p-3 sm:p-6 lg:p-8" data-testid={testid}>
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-[1280px] overflow-hidden rounded-[36px] bg-white shadow-[0_40px_120px_-60px_rgba(6,34,58,0.45)] lg:grid-cols-[1.05fr_1fr]">
        <div className="p-3 [perspective:1200px]" onMouseMove={onMove} onMouseLeave={() => { mx.set(0); my.set(0); }}>
          <motion.div style={{ rotateX: rx, rotateY: ry }} className="relative h-56 overflow-hidden rounded-[28px] sm:h-72 lg:h-full">
            <motion.img initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }} src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,34,58,0.75)] via-transparent to-[rgba(0,168,150,0.25)]" />
            {badge && <div className="absolute left-5 top-5 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold text-[var(--ink)] backdrop-blur-md">{badge}</div>}
            {caption && <div className="absolute inset-x-5 bottom-5 hidden rounded-3xl border border-white/30 bg-white/15 p-5 text-white backdrop-blur-xl sm:block">{caption}</div>}
          </motion.div>
        </div>
        <div className="flex flex-col px-6 py-8 sm:px-14 lg:px-20 lg:py-12">
          <div className="flex justify-center"><Logo to={logoTo} sub={logoSub} testid="auth-logo" /></div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mx-auto my-auto w-full max-w-sm py-8">
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export const PillButton = ({ children, className = "", ...p }) => (
  <button {...p} className={`flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-6 py-4 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-[var(--ocean)] active:scale-[0.98] disabled:opacity-60 ${className}`}>{children}</button>
);

export const GoogleButton = (p) => (
  <button type="button" {...p} className="flex w-full items-center justify-center gap-3 rounded-full bg-slate-100 px-6 py-4 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-slate-200">
    <GoogleIcon /> {p.children || "Masuk dengan Google"}
  </button>
);
