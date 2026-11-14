import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Anchor, Clock3, Users, UserRound } from "lucide-react";
import { useLookup, useStore } from "@/store/AppStore";
import { departureAt, salesInfo, tanggalPanjang, todayWita, witaNow, ymd } from "@/lib/format";
import { SearchCard } from "./TiketHome";
import { PageFade } from "@/components/motion/Motion";

const days = (start) => Array.from({ length: 7 }, (_, i) => { const d = new Date(start + "T00:00:00"); d.setDate(d.getDate() + i); return ymd(d); });

export default function BookingList() {
  const { asal, tujuan, tanggal } = useParams();
  const { jadwal, master, cutoff } = useStore();
  const L = useLookup();
  const nav = useNavigate();
  const [armada, setArmada] = useState("all");
  const zn = (id) => master.zona.find((z) => z.id === id)?.nama || id;
  const now = witaNow();

  const list = useMemo(() => jadwal
    .filter((j) => j.jenis === "Regular" && j.operasional === "On" && j.approval === "Disetujui")
    .map(L.detail)
    .filter((j) => j.asal.zona === asal && j.tujuan.zona === tujuan && (armada === "all" || j.armadaId === armada))
    .filter((j) => tanggal !== todayWita() || departureAt(tanggal, j.jam) > now)
    .sort((a, b) => a.jam.localeCompare(b.jam)), [jadwal, L, asal, tujuan, armada, tanggal]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageFade className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8" >
      <div data-testid="booking-list-page">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Daftar Keberangkatan</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">{zn(asal)} <span className="text-[var(--teal)]">→</span> {zn(tujuan)}</h1>
        <p className="mt-2 text-slate-600">{tanggalPanjang(tanggal)}</p>
        <div className="mt-8"><SearchCard compact init={{ asal, tujuan, tanggal }} key={asal + tujuan + tanggal} /></div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-1 scrollbar-none" data-testid="booking-date-strip">
          {days(todayWita()).map((d) => {
            const dt = new Date(d + "T00:00:00");
            return (
              <Link key={d} to={`/tiket/booking/${asal}/${tujuan}/${d}`} data-testid={`booking-date-${d}`} className={`flex min-w-[84px] flex-col items-center rounded-2xl px-4 py-3 text-sm transition-colors ${d === tanggal ? "bg-[var(--ink)] text-white" : "bg-white hover:bg-[var(--foam)]"}`}>
                <span className="text-[11px] uppercase opacity-80">{dt.toLocaleDateString("id-ID", { weekday: "short" })}</span>
                <span className="font-display text-xl font-bold">{dt.getDate()}</span>
                <span className="text-[11px] opacity-80">{dt.toLocaleDateString("id-ID", { month: "short" })}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2" data-testid="booking-armada-filter">
          <span className="mr-1 text-sm text-slate-600">Armada:</span>
          {[{ id: "all", nama: "Semua" }, ...master.armada].map((a) => (
            <button key={a.id} data-testid={`booking-armada-${a.id}`} onClick={() => setArmada(a.id)} className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${armada === a.id ? "bg-[var(--teal)] text-white" : "bg-white text-slate-700 hover:bg-[var(--foam)]"}`}>{a.nama}</button>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {list.length === 0 && (
            <div className="rounded-[28px] bg-white p-10 text-center" data-testid="booking-empty">
              <Anchor className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 font-semibold">Tidak ada keberangkatan tersedia</p>
              <p className="text-sm text-slate-500">Coba tanggal lain atau ubah zona asal/tujuan.</p>
            </div>
          )}
          {list.map((j, i) => {
            const s = salesInfo(j, tanggal, cutoff, now);
            const sisa = L.kuota(j, tanggal);
            return (
              <motion.div key={j.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`grid gap-5 rounded-[28px] bg-white p-6 transition-shadow hover:shadow-[0_24px_60px_-36px_rgba(0,119,182,0.5)] md:grid-cols-[auto_1fr_auto] md:items-center ${!s.open ? "opacity-80" : ""}`} data-testid={`departure-card-${j.id}`}>
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-[var(--foam)] px-4 py-3 text-center">
                    <p className="font-mono text-2xl font-bold text-[var(--ocean)]">{j.jam}</p>
                    <p className="text-[10px] uppercase tracking-widest text-teal-700">WITA</p>
                  </div>
                </div>
                <div>
                  <p className="font-display text-xl font-bold">{j.asal.nama} → {j.tujuan.nama}</p>
                  <p className="mt-1 text-sm text-slate-600">{j.armada.nama} · {j.kapal.nama}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1"><UserRound className="h-3.5 w-3.5" />{j.nahkoda.nama}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />Sisa kuota <b className={sisa < 10 ? "text-red-600" : "text-emerald-700"}>{sisa}</b> / {j.kapasitas}</span>
                    <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />Penjualan tutup {s.closeLabel} WITA ({s.hours} jam sebelum)</span>
                  </div>
                  {!s.open && <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-600" data-testid={`departure-closed-${j.id}`}><AlertCircle className="h-3.5 w-3.5" />{s.reason}</p>}
                </div>
                <button data-testid={`departure-book-${j.id}`} disabled={!s.open || sisa === 0} onClick={() => nav(`/tiket/order/${j.id}/${j.kapasitas}/${tanggal}`)}
                  className="group flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--teal)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">
                  {s.open ? "Pesan" : "Ditutup"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageFade>
  );
}
