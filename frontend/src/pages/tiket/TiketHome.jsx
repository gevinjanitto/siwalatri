import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftRight, ArrowRight, CalendarDays, Megaphone, MapPin, Search } from "lucide-react";
import { useLookup, useStore } from "@/store/AppStore";
import { todayWita, statusKapal, tanggalPanjang } from "@/lib/format";
import { MaskLines, Reveal } from "@/components/motion/Motion";
import { StatusBadge } from "@/components/common/Badges";
import { Dropdown, toOpts } from "@/components/common/Dropdown";
import { useWitaClock } from "@/pages/landing/Schedule";

export const useZonaAkhir = (asal) => {
  const { master } = useStore();
  const L = useLookup();
  return useMemo(() => {
    const ids = new Set(master.rute.filter((r) => L.dermaga[r.awal]?.zona === asal).map((r) => L.dermaga[r.akhir]?.zona));
    return master.zona.filter((z) => ids.has(z.id));
  }, [asal, master, L]);
};

const fieldCls = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium outline-none transition-colors focus:border-[var(--teal)]";

export const SearchCard = ({ compact = false, init }) => {
  const { master } = useStore();
  const nav = useNavigate();
  const [f, setF] = useState(init || { asal: "Z1", tujuan: "Z2", tanggal: todayWita() });
  const akhir = useZonaAkhir(f.asal);
  const tujuan = akhir.some((z) => z.id === f.tujuan) ? f.tujuan : akhir[0]?.id || "";
  const swap = () => setF({ ...f, asal: tujuan, tujuan: f.asal });
  return (
    <div className={`grid gap-3 rounded-[28px] bg-white p-3 shadow-[0_30px_80px_-40px_rgba(6,34,58,0.4)] ${compact ? "md:grid-cols-[1fr_auto_1fr_1fr_auto]" : "md:grid-cols-[1fr_auto_1fr_1fr_auto]"}`} data-testid="tiket-search-card">
      <label className="block"><span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Zona Asal</span>
        <Dropdown variant="big" testid="tiket-search-asal" sub="Zona asal" value={f.asal} onChange={(v) => setF({ ...f, asal: v })} options={toOpts(master.zona)} />
      </label>
      <button data-testid="tiket-search-swap" onClick={swap} className="mx-auto mt-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--foam)] text-[var(--teal)] transition-transform hover:rotate-180 duration-500"><ArrowLeftRight className="h-4 w-4" /></button>
      <label className="block"><span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Zona Tujuan</span>
        <Dropdown variant="big" testid="tiket-search-tujuan" sub="Zona tujuan tersedia" value={tujuan} onChange={(v) => setF({ ...f, tujuan: v })} options={toOpts(akhir)} />
      </label>
      <label className="block"><span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tanggal</span>
        <input data-testid="tiket-search-tanggal" type="date" min={todayWita()} className={fieldCls} value={f.tanggal} onChange={(e) => setF({ ...f, tanggal: e.target.value })} />
      </label>
      <button data-testid="tiket-search-submit" disabled={!tujuan} onClick={() => nav(`/tiket/booking/${f.asal}/${tujuan}/${f.tanggal}`)} className="mt-auto flex h-[52px] items-center justify-center gap-2 rounded-2xl grad-sea px-8 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50">
        <Search className="h-4 w-4" /> Cari
      </button>
    </div>
  );
};

export default function TiketHome() {
  const { jadwal, master } = useStore();
  const L = useLookup();
  const now = useWitaClock();
  const today = jadwal.filter((j) => j.jenis === "Regular").map(L.detail).sort((a, b) => a.jam.localeCompare(b.jam)).slice(0, 6);
  return (
    <div data-testid="tiket-home">
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[520px] grad-sea grain" />
        <img src="/img/boat.jpg" alt="" className="absolute right-0 top-0 hidden h-[520px] w-[46%] object-cover opacity-60 mix-blend-luminosity lg:block [clip-path:polygon(22%_0,100%_0,100%_100%,0_100%)]" />
        <div className="relative mx-auto max-w-[1280px] px-5 pb-10 pt-16 sm:px-8 sm:pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/85">Modul Tiket · Pesan tanpa harus login</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-white sm:text-7xl">
            <MaskLines lines={["Mau menyeberang", "ke mana hari ini?"]} />
          </h1>
          <div className="mt-12 sm:mt-16"><SearchCard /></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1280px] gap-6 px-5 sm:px-8 lg:grid-cols-[1.6fr_1fr]">
        <Reveal className="rounded-[28px] bg-white p-6 sm:p-8" >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Keberangkatan hari ini</h2>
            <Link to="/tiket/jadwal" data-testid="tiket-home-all-jadwal" className="flex items-center gap-1 text-sm font-semibold text-[var(--sea)]">Semua <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <p className="mt-1 text-sm text-slate-500">{tanggalPanjang(todayWita())}</p>
          <div className="mt-6 divide-y divide-slate-100">
            {today.map((j) => (
              <motion.div whileHover={{ x: 4 }} key={j.id} className="flex flex-wrap items-center gap-4 py-4" data-testid={`tiket-home-jadwal-${j.id}`}>
                <span className="w-16 font-mono text-lg font-semibold text-[var(--ocean)]">{j.jam}</span>
                <div className="min-w-[180px] flex-1">
                  <p className="font-semibold">{j.asal.nama} <span className="text-slate-400">→</span> {j.tujuan.nama}</p>
                  <p className="text-xs text-slate-500">{j.armada.nama} · {j.kapal.nama}</p>
                </div>
                <StatusBadge status={statusKapal(j, now)} />
              </motion.div>
            ))}
          </div>
        </Reveal>
        <div className="flex flex-col gap-6">
          <Reveal delay={0.08} className="rounded-[28px] bg-[var(--ink)] p-6 text-white sm:p-8" >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--mint)]"><Megaphone className="h-4 w-4" />Pengumuman</div>
            <div className="mt-5 space-y-5" data-testid="tiket-home-pengumuman">
              {master.pengumuman.map((p) => (
                <div key={p.id} className="border-l-2 border-[var(--mint)] pl-4">
                  <p className="font-semibold">{p.judul}</p>
                  <p className="mt-1 text-sm text-slate-300">{p.deskripsi}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.12} className="rounded-[28px] bg-white p-6 sm:p-8">
            <p className="font-display text-xl font-bold">Rute populer</p>
            <div className="mt-4 flex flex-col gap-2">
              {[["Z1", "Z2", "Tribuana → Sampalan"], ["Z1", "Z3", "Banjar Bias → Jungutbatu"], ["Z2", "Z1", "Sampalan → Tribuana"]].map(([a, t, n]) => (
                <Link key={n} to={`/tiket/booking/${a}/${t}/${todayWita()}`} data-testid={`tiket-popular-${a}-${t}`} className="group flex items-center justify-between rounded-2xl bg-[var(--canvas)] px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--foam)]">
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--teal)]" />{n}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />Tanggal default: hari ini</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
