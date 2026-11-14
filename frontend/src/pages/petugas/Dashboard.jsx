import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Banknote, CreditCard, Database, Maximize2, Mail, MapPin, Phone, QrCode, RefreshCcw, Server, Ship } from "lucide-react";
import { useLookup, useStore } from "@/store/AppStore";
import { hm, rupiah, statusKapal, todayWita } from "@/lib/format";
import { StatusBadge } from "@/components/common/Badges";
import { PageTitle, Panel } from "./AdminLayout";
import { useWitaClock } from "@/pages/landing/Schedule";

export const TARIF_GRT = 2500;
const ROLE = { admin: "Administrator", syahbandar: "Syahbandar", armada: "Operator Armada", pelabuhan: "Pelabuhan", nahkoda: "Nahkoda", loket: "Petugas Loket", wisata: "Pengelola Wisata", pelapor: "Pelapor" };

const Tile = ({ title, value, sub, tone, testid, to }) => (
  <motion.div whileHover={{ y: -4 }} className={`relative flex min-h-[150px] flex-col justify-between rounded-[24px] p-5 ${tone}`} data-testid={testid}>
    <div className="flex items-start justify-between"><p className="max-w-[70%] font-semibold leading-snug">{title}</p><Link to={to} className="rounded-full bg-white/60 p-1.5"><Maximize2 className="h-3.5 w-3.5" /></Link></div>
    <div className="flex items-end justify-between"><p className="text-xs opacity-80">{sub}</p><span className="rounded-xl bg-white/70 px-3 py-1.5 font-mono text-lg font-bold">{value}</span></div>
  </motion.div>
);

const usePayment = (invoices, mode) => useMemo(() => {
  const today = todayWita();
  const inv = invoices.filter((i) => i.status === 1 && (mode === "bulanan" || i.tanggal === today || i.createdAt?.slice(0, 10) === today));
  const base = mode === "harian" ? { cash: [42, 3150000], qris: [27, 2475000], va: [11, 1125000] } : { cash: [1120, 84200000], qris: [764, 70450000], va: [318, 31900000] };
  const q = inv.filter((i) => i.metode === "qris"), v = inv.filter((i) => i.metode === "va");
  const sum = (l) => l.reduce((a, i) => a + i.grandtotal, 0);
  return [
    { key: "cash", label: "Tunai / Cash", Icon: Banknote, n: base.cash[0], total: base.cash[1] },
    { key: "qris", label: "QRIS", Icon: QrCode, n: base.qris[0] + q.length, total: base.qris[1] + sum(q) },
    { key: "va", label: "Virtual Account", Icon: CreditCard, n: base.va[0] + v.length, total: base.va[1] + sum(v) },
  ];
}, [invoices, mode]);

const CHART = { harian: ["06", "08", "10", "12", "14", "16", "18"].map((h, i) => ({ x: h + ":00", cash: [4, 9, 7, 5, 8, 6, 3][i] * 75000, qris: [2, 6, 8, 4, 3, 3, 1][i] * 75000, va: [1, 2, 3, 2, 1, 1, 1][i] * 75000 })),
  bulanan: ["Jun", "Jul", "Agu", "Sep", "Okt", "Nov"].map((m, i) => ({ x: m, cash: [62, 70, 75, 68, 80, 84][i] * 1e6, qris: [38, 45, 52, 58, 64, 70][i] * 1e6, va: [20, 22, 25, 27, 30, 32][i] * 1e6 })) };

export default function Dashboard() {
  const { staff, jadwal, invoices } = useStore();
  const L = useLookup();
  const now = useWitaClock();
  const [mode, setMode] = useState("harian");
  const [armadaRefresh, setArmadaRefresh] = useState(0);
  const pay = usePayment(invoices, mode);
  const today = jadwal.filter((j) => j.jenis === "Regular" || j.createdToday).map(L.detail).sort((a, b) => a.jam.localeCompare(b.jam));
  const counts = today.reduce((a, j) => { const s = statusKapal(j, now); a[s] = (a[s] || 0) + 1; return a; }, {});
  const totalPax = today.reduce((a, j) => a + j.terisi + L.sold(j.id, todayWita()), 0);
  const retribusi = today.filter((j) => j.operasional === "On").reduce((a, j) => a + (j.kapal.grt || 0) * TARIF_GRT, 0);
  const feed = [
    ...invoices.slice(0, 4).map((i) => ({ id: i.id, t: hm(new Date(i.createdAt)), title: `Invoice ${i.id}`, sub: `${i.units[0]?.nama} · ${i.units.length} unit`, tag: i.status ? "Lunas" : "Pending", amt: rupiah(i.grandtotal), Icon: i.metode === "qris" ? QrCode : CreditCard })),
    { id: "f1", t: "12:40", title: "Jadwal 18:00 menunggu approval", sub: "Sekar Jaya · Sampalan → Kampung Kusamba", tag: "Approval", Icon: Ship },
    { id: "f2", t: "11:02", title: "Angkal Cruise 1 berangkat", sub: "Junggutbatu → Kusamba-Banjar Bias · 118 penumpang", tag: "Berlayar", Icon: Ship },
    { id: "f3", t: "10:15", title: "Rekonsiliasi QRIS diperbarui", sub: "9 transaksi · BPD Bali", tag: "QRIS", Icon: QrCode },
  ];
  const armadaSummary = L.armada && Object.values(L.armada).map((a, i) => ({ ...a, pax: [612, 438, 529][i % 3] + armadaRefresh * 3, trip: [8, 6, 5][i % 3], retri: today.filter((j) => j.armadaId === a.id).reduce((s, j) => s + (j.kapal.grt || 0) * TARIF_GRT, 0) }));

  return (
    <div data-testid="dashboard-page">
      <PageTitle title="Dashboard Pengawasan" sub={`Data hari ini · ${now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}>
        <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold"><span className="relative flex h-2 w-2"><span className="pulse-ring absolute h-full w-full rounded-full bg-emerald-500" /><span className="relative h-2 w-2 rounded-full bg-emerald-500" /></span>Live · {today.length} jadwal</span>
      </PageTitle>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Panel className="grid gap-6 md:grid-cols-[auto_1fr]" data-testid="dashboard-profile-card">
            <div className="relative h-36 w-36 overflow-hidden rounded-[24px] grad-sea grain">
              <span className="absolute inset-0 flex items-center justify-center font-display text-6xl font-bold text-white">{staff.nama[0]}</span>
            </div>
            <div className="flex flex-col justify-between gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-display text-2xl font-bold">{staff.nama}</p><p className="text-sm text-slate-600">{ROLE[staff.type] || staff.type} · Siwalatri Terpadu</p></div>
                <Link to="/profile" data-testid="dashboard-edit-profile" className="rounded-full bg-[var(--canvas)] px-4 py-2 text-xs font-semibold hover:bg-[var(--foam)]">Ubah profil</Link>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{staff.email}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />Kabupaten Klungkung</span>
                <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />[no. kantor]</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[["Trip hari ini", today.filter((j) => j.operasional === "On").length, "from-[var(--sea)]"], ["Penumpang", totalPax, "from-[var(--teal)]"], ["Retribusi", rupiah(retribusi), "from-[var(--mint)]"]].map(([l, v, c]) => (
                  <div key={l} data-testid={`dashboard-stat-${l.split(" ")[0].toLowerCase()}`}>
                    <p className="text-xs text-slate-500">{l}</p><p className="font-display text-base font-bold sm:text-2xl">{v}</p>
                    <div className={`mt-2 h-1 rounded-full bg-gradient-to-r ${c} to-transparent`} />
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Status Kapal</h2><span className="text-xs text-slate-500">Asia/Makassar</span></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Tile testid="tile-persiapan" to="/jadwal" title="Persiapan" sub="20 menit sebelum berangkat" value={counts.Persiapan || 0} tone="bg-[#d9f99d] text-lime-950" />
              <Tile testid="tile-berlayar" to="/jadwal" title="Berlayar" sub="Hingga 30 menit sesudah" value={counts.Berlayar || 0} tone="bg-[#99f6e4] text-teal-950" />
              <Tile testid="tile-sandar" to="/jadwal" title="Sandar" sub={`${counts.Off || 0} jadwal Off`} value={counts.Sandar || 0} tone="bg-[#bae6fd] text-sky-950" />
            </div>
          </Panel>

          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold">Ringkasan Pembayaran</h2>
              <div className="flex rounded-full bg-[var(--canvas)] p-1 text-xs font-semibold">
                {["harian", "bulanan"].map((m) => <button key={m} data-testid={`payment-mode-${m}`} onClick={() => setMode(m)} className={`rounded-full px-4 py-1.5 capitalize transition-colors ${mode === m ? "bg-[var(--ink)] text-white" : "text-slate-600"}`}>{m}</button>)}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {pay.map(({ key, label, Icon, n, total }) => (
                <div key={key} className="rounded-2xl border border-slate-100 p-4" data-testid={`payment-${key}`}>
                  <p className="flex items-center gap-2 text-sm text-slate-600"><Icon className="h-4 w-4 text-[var(--teal)]" />{label}</p>
                  <p className="mt-2 font-display text-2xl font-bold">{rupiah(total)}</p><p className="text-xs text-slate-500">{n} transaksi</p>
                </div>
              ))}
            </div>
            <div className="mt-5 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART[mode]} margin={{ left: 0, right: 8, top: 8 }}>
                  <defs>{[["cash", "#0077B6"], ["qris", "#00A896"], ["va", "#02C39A"]].map(([k, c]) => <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity={0.35} /><stop offset="1" stopColor={c} stopOpacity={0} /></linearGradient>)}</defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1e6 ? v / 1e6 + "jt" : v / 1000 + "rb")} width={44} />
                  <Tooltip formatter={(v) => rupiah(v)} contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 10px 30px -10px rgba(0,0,0,.2)" }} />
                  {[["cash", "#0077B6"], ["qris", "#00A896"], ["va", "#02C39A"]].map(([k, c]) => <Area key={k} type="monotone" dataKey={k} stroke={c} strokeWidth={2} fill={`url(#g-${k})`} />)}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Jadwal Hari Ini</h2><Link to="/jadwal" data-testid="dashboard-to-jadwal" className="flex items-center gap-1 text-sm font-semibold text-[var(--sea)]">Kelola <ArrowUpRight className="h-4 w-4" /></Link></div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm" data-testid="dashboard-jadwal-table">
                <thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr>{["Jam", "Armada / Kapal", "Nahkoda", "Rute", "Penumpang", "Status"].map((h) => <th key={h} className="pb-3 pr-4 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {today.map((j) => {
                    const pax = j.terisi + L.sold(j.id, todayWita());
                    return (
                      <tr key={j.id} className="border-t border-slate-100">
                        <td className="py-3 pr-4 font-mono font-semibold text-[var(--ocean)]">{j.jam}</td>
                        <td className="py-3 pr-4"><p className="font-semibold">{j.armada.nama}</p><p className="text-xs text-slate-500">{j.kapal.nama}</p></td>
                        <td className="py-3 pr-4 text-slate-600">{j.nahkoda.nama}</td>
                        <td className="py-3 pr-4">{j.asal.nama} → {j.tujuan.nama}</td>
                        <td className="py-3 pr-4"><div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100"><div className="h-full grad-sea" style={{ width: `${Math.min(100, (pax / j.kapasitas) * 100)}%` }} /></div><span className="text-xs">{pax}/{j.kapasitas}</span></div></td>
                        <td className="py-3 pr-4"><StatusBadge status={statusKapal(j, now)} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Ringkasan Armada Eksternal</h2>
              <button data-testid="armada-refresh" onClick={() => setArmadaRefresh((x) => x + 1)} className="flex items-center gap-1.5 rounded-full bg-[var(--canvas)] px-3 py-1.5 text-xs font-semibold"><RefreshCcw className="h-3.5 w-3.5" />Muat ulang</button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {armadaSummary.map((a) => (
                <div key={a.id} className="rounded-2xl border border-slate-100 p-4" data-testid={`armada-summary-${a.id}`}>
                  <div className="flex items-center justify-between"><p className="font-semibold">{a.nama}</p>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${a.sumber === "api" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{a.sumber === "api" ? <Server className="h-3 w-3" /> : <Database className="h-3 w-3" />}{a.sumber}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div><p className="font-display text-xl font-bold">{a.pax}</p><p className="text-[11px] text-slate-500">Penumpang</p></div>
                    <div><p className="font-display text-xl font-bold">{a.trip}</p><p className="text-[11px] text-slate-500">Trip</p></div>
                    <div><p className="font-display text-sm font-bold">{rupiah(a.retri)}</p><p className="text-[11px] text-slate-500">Retribusi</p></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">Bila API armada gagal (timeout & retry), data diambil dari database utama; retribusi sandar = GRT × {rupiah(TARIF_GRT)}.</p>
          </Panel>
        </div>

        <Panel className="h-fit xl:sticky xl:top-20" data-testid="dashboard-live-feed">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Live Feed</h2><span className="relative flex h-2 w-2"><span className="pulse-ring absolute h-full w-full rounded-full bg-emerald-500" /><span className="relative h-2 w-2 rounded-full bg-emerald-500" /></span></div>
          <div className="relative mt-5 flex flex-col gap-5 before:absolute before:bottom-2 before:left-[19px] before:top-2 before:w-px before:bg-slate-200">
            {feed.map(({ id, t, title, sub, tag, amt, Icon }) => (
              <motion.div key={id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="relative flex gap-3" data-testid={`feed-item-${id}`}>
                <span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--canvas)] ring-4 ring-white"><Icon className="h-4 w-4 text-[var(--ocean)]" /></span>
                <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold">{title}</p><span className="font-mono text-[11px] text-slate-500">{t}</span></div>
                  <p className="mt-0.5 text-xs text-slate-600">{sub}</p>
                  <div className="mt-2 flex items-center justify-between"><span className="rounded-full bg-[var(--foam)] px-2 py-0.5 text-[11px] font-semibold text-teal-800">{tag}</span>{amt && <span className="text-xs font-semibold">{amt}</span>}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
