import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Compass } from "lucide-react";
import { MaskLines } from "@/components/motion/Motion";
import { useStore } from "@/store/AppStore";
import { todayWita } from "@/lib/format";
import { Dropdown, toOpts } from "@/components/common/Dropdown";

const Cell = ({ label, children }) => (
  <div className="flex flex-col gap-1 border-white/15 px-5 py-4 sm:border-r">
    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">{label}</span>
    {children}
  </div>
);
const sel = "w-full bg-transparent text-sm font-medium text-white outline-none [&>option]:text-slate-900";

export const SearchStrip = () => {
  const { master } = useStore();
  const nav = useNavigate();
  const [f, setF] = useState({ asal: "Z1", tujuan: "Z2", tanggal: todayWita(), pax: 1 });
  const go = () => nav(`/tiket/booking/${f.asal}/${f.tujuan}/${f.tanggal}`);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_0.7fr_auto] border-t border-white/15 bg-[rgba(6,34,58,0.45)] backdrop-blur-xl" data-testid="hero-search-strip">
      <Cell label="Zona Asal">
        <Dropdown variant="glass" testid="hero-search-asal" sub="Zona asal" value={f.asal} onChange={(v) => setF({ ...f, asal: v, tujuan: v === f.tujuan ? master.zona.find((z) => z.id !== v).id : f.tujuan })} options={toOpts(master.zona)} />
      </Cell>
      <Cell label="Zona Tujuan">
        <Dropdown variant="glass" testid="hero-search-tujuan" sub="Zona tujuan" value={f.tujuan} onChange={(v) => setF({ ...f, tujuan: v })} options={toOpts(master.zona.filter((z) => z.id !== f.asal))} />
      </Cell>
      <Cell label="Tanggal">
        <input data-testid="hero-search-tanggal" type="date" min={todayWita()} className={`${sel} [color-scheme:dark]`} value={f.tanggal} onChange={(e) => setF({ ...f, tanggal: e.target.value })} />
      </Cell>
      <Cell label="Penumpang">
        <input data-testid="hero-search-pax" type="number" min={1} max={20} className={sel} value={f.pax} onChange={(e) => setF({ ...f, pax: e.target.value })} />
      </Cell>
      <button data-testid="hero-search-submit" onClick={go} className="col-span-2 sm:col-span-1 group flex items-center justify-center gap-3 bg-white px-10 py-5 font-display text-lg font-semibold text-[var(--ink)] hover:bg-[var(--mint)] transition-colors">
        Cari Tiket <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};

export const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.2]);
  const nav = useNavigate();
  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[var(--ink)] text-white" data-testid="hero-section">
      <motion.img src="/img/hero-fastboat.jpg" alt="Fast boat melaju di laut biru menuju Nusa Penida" style={{ y, scale }} className="absolute inset-0 h-full w-full object-cover object-[78%_50%] sm:object-[70%_40%]" />
      <div className="absolute inset-0 bg-[rgba(6,34,58,0.28)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(6,34,58,0.7)] via-[rgba(6,34,58,0.15)] to-[rgba(6,34,58,0.8)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(6,34,58,0.8)] via-[rgba(6,34,58,0.35)] to-transparent" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-end px-5 pb-12 pt-32 sm:px-10 sm:pb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
          <Compass className="h-4 w-4 text-[var(--mint)]" /> Klungkung · Nusa Penida · Nusa Lembongan
        </motion.div>
        <h1 className="font-display font-bold leading-[0.92] tracking-[-0.035em] text-[11.5vw] sm:text-[9vw] lg:text-[7.4rem]" data-testid="hero-title">
          <MaskLines lines={["Pesan Tiket Kapal", "Cepat, Aman,", <>dan <span className="italic font-semibold bg-gradient-to-r from-[#7CF5D6] via-[#02C39A] to-white bg-clip-text text-transparent">Nyaman.</span></>]} />
        </h1>
        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="max-w-md text-base text-white/90 sm:text-lg">
            Akses laut hanya sekali klik, temukan kemudahan perjalanan dari Klungkung menuju pulau-pulau impian.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.8 }} className="flex flex-wrap gap-3">
            <button data-testid="hero-pesan-tiket-btn" onClick={() => nav("/tiket")} className="group flex items-center gap-2 rounded-full bg-[var(--mint)] px-7 py-3.5 font-semibold text-[var(--ink)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-white">
              Pesan Tiket <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </button>
            <a data-testid="hero-destinasi-btn" href="https://klungkungtourism.id/" target="_blank" rel="noreferrer" className="rounded-full border border-white/40 px-7 py-3.5 font-semibold backdrop-blur-sm transition-colors hover:bg-white/15">
              Destinasi
            </a>
          </motion.div>
        </div>
      </div>
      <div className="relative z-10"><SearchStrip /></div>
    </section>
  );
};
