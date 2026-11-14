import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Megaphone, Ship } from "lucide-react";
import { useLookup, useStore } from "@/store/AppStore";
import { hm, statusKapal, todayWita, witaNow } from "@/lib/format";
import { StatusBadge, Chip } from "@/components/common/Badges";
import { Reveal } from "@/components/motion/Motion";

export const useWitaClock = () => {
  const [now, setNow] = useState(witaNow());
  useEffect(() => { const t = setInterval(() => setNow(witaNow()), 30000); return () => clearInterval(t); }, []);
  return now;
};

export const AnnouncementBar = () => {
  const { master } = useStore();
  const list = master.pengumuman;
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % Math.max(list.length, 1)), 6000); return () => clearInterval(t); }, [list.length]);
  const p = list[i % Math.max(list.length, 1)];
  if (!p) return null;
  return (
    <section id="pengumuman" className="mx-auto max-w-[1400px] px-5 pt-14 sm:px-10" data-testid="announcement-section">
      <Reveal className="flex flex-col gap-4 rounded-[28px] border border-teal-100 bg-white p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl grad-sea text-white"><Megaphone className="h-5 w-5" /></span>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">Pengumuman · {i + 1}/{list.length}</p>
          <p className="mt-1 font-display text-xl font-semibold" data-testid="announcement-title">{p.judul}</p>
          <p className="mt-1 text-sm text-slate-600" data-testid="announcement-desc">{p.deskripsi}</p>
        </div>
        <div className="flex gap-1.5">
          {list.map((_, k) => <button key={k} data-testid={`announcement-dot-${k}`} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-[width,background-color] ${k === i ? "w-8 bg-[var(--teal)]" : "w-3 bg-slate-300"}`} />)}
        </div>
      </Reveal>
    </section>
  );
};

export const ScheduleCard = ({ j, now, i }) => {
  const st = statusKapal(j, now);
  return (
    <Reveal delay={(i % 3) * 0.06} className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(0,119,182,0.45)]">
      <Link to={`/tiket/booking/${j.asal.zona}/${j.tujuan.zona}/${todayWita()}`} data-testid={`schedule-card-${j.id}`} className="block p-6">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Ship className="h-4 w-4 text-[var(--sea)]" />{j.armada.nama}</span>
          <StatusBadge status={st} testid={`schedule-status-${j.id}`} />
        </div>
        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <p className="text-[11px] text-slate-500">{j.asal.wilayah}</p>
            <p className="font-display text-xl font-bold leading-tight">{j.asal.nama}</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono text-lg font-semibold text-[var(--ocean)]">{j.jam}</span>
            <span className="relative my-1 h-px w-16 bg-gradient-to-r from-[var(--sea)] to-[var(--mint)]"><span className="absolute -top-1 left-0 h-2 w-2 rounded-full bg-[var(--sea)] transition-[left] duration-700 group-hover:left-[calc(100%-8px)]" /></span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">WITA · Menuju</span>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-500">{j.tujuan.wilayah}</p>
            <p className="font-display text-xl font-bold leading-tight">{j.tujuan.nama}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-dashed border-slate-200 pt-4 text-xs text-slate-600">
          <span>{j.kapal.nama} · {j.jenis}</span>
          <span className="flex items-center gap-1 font-semibold text-[var(--sea)] transition-[gap] group-hover:gap-2">Lihat tiket <ArrowRight className="h-3.5 w-3.5" /></span>
        </div>
      </Link>
    </Reveal>
  );
};

export const ScheduleSection = () => {
  const { jadwal, master } = useStore();
  const L = useLookup();
  const now = useWitaClock();
  const [zona, setZona] = useState("all");
  const list = jadwal.filter((j) => j.jenis === "Regular").map(L.detail).filter((j) => zona === "all" || j.asal.zona === zona).sort((a, b) => a.jam.localeCompare(b.jam));
  return (
    <section id="jadwal" className="mx-auto max-w-[1400px] px-5 py-24 sm:px-10 sm:py-32" data-testid="schedule-section">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <Reveal>
          <Chip>01 · Keberangkatan Hari Ini</Chip>
          <h2 className="mt-6 font-display text-6xl font-bold tracking-[-0.04em] sm:text-8xl">Jadwal</h2>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-5 lg:items-end lg:text-right">
          <p className="max-w-md text-base text-slate-600 sm:text-lg">Dengan Siwalatri, semua informasi tiket kapal dan jadwal keberangkatan ada dalam satu tempat.</p>
          <span className="flex items-center gap-2 font-mono text-sm text-[var(--ocean)]" data-testid="schedule-clock"><Clock className="h-4 w-4" /> {hm(now)} WITA · Asia/Makassar</span>
        </Reveal>
      </div>
      <div className="mt-12 flex gap-2 overflow-x-auto scrollbar-none" data-testid="schedule-zone-filter">
        {[{ id: "all", nama: "Semua Dermaga" }, ...master.zona].map((z) => (
          <button key={z.id} data-testid={`schedule-zone-${z.id}`} onClick={() => setZona(z.id)} className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${zona === z.id ? "bg-[var(--ink)] text-white" : "bg-white text-slate-700 hover:bg-[var(--foam)]"}`}>{z.nama}</button>
        ))}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((j, i) => <ScheduleCard key={j.id} j={j} now={now} i={i} />)}
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
        <p className="text-xs text-slate-500">Status: Persiapan (20 menit sebelum) · Berlayar (hingga 30 menit sesudah) · Sandar</p>
        <Link to="/tiket" data-testid="schedule-all-btn" className="group flex items-center gap-3 rounded-full bg-[var(--ink)] px-7 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--sea)]">
          Semua Jadwal <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};
