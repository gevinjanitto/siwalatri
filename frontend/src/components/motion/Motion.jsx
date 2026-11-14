import { useEffect } from "react";
import { motion } from "framer-motion";
import Lenis from "lenis";

const ease = [0.22, 1, 0.36, 1];

export const MaskLines = ({ lines, className = "", lineClass = "", delay = 0.15 }) => (
  <span className={className}>
    {lines.map((l, i) => (
      <span key={i} className="block overflow-hidden pb-[0.08em]">
        <motion.span
          className={`block ${lineClass}`}
          initial={{ y: "105%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 1.1, ease, delay: delay + i * 0.12 }}
        >
          {l}
        </motion.span>
      </span>
    ))}
  </span>
);

export const Reveal = ({ children, delay = 0, y = 28, className = "", as = "div" }) => {
  const C = motion[as];
  return (
    <C
      className={className}
      initial={{ opacity: 0.001, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </C>
  );
};

export const Marquee = ({ items, className = "" }) => (
  <div className={`relative overflow-hidden ${className}`} data-testid="editorial-marquee">
    <div className="flex w-max animate-marquee">
      {[...items, ...items].map((t, i) => (
        <span key={i} className="flex items-center gap-8 px-8 font-display text-5xl sm:text-7xl font-semibold tracking-tight whitespace-nowrap">
          {t}
          <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--mint)]"><path fill="currentColor" d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" /></svg>
        </span>
      ))}
    </div>
  </div>
);

export const useLenis = () => {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let id;
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, []);
};

export const PageFade = ({ children, className = "" }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease }}>
    {children}
  </motion.div>
);
