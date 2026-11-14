import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, Eye, FileDown } from "lucide-react";
import { useLookup, useStore } from "@/store/AppStore";
import { BULANAN, JENIS_PENUMPANG } from "@/data/mock";
import { downloadCSV, rupiah, todayWita } from "@/lib/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageTitle, Panel } from "./AdminLayout";
import { TARIF_GRT } from "./Dashboard";
import { useManifest } from "./ManifestPage";
import { Dropdown, toOpts } from "@/components/common/Dropdown";

const inp = "rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--teal)]";
const Btn = ({ children, ...p }) => <button {...p} className="flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal)]">{children}</button>;
const KONEKSI = { "Sekar Jaya": "mysql_sekarjaya", "The Angkal Fast Cruise": "mysql_angkal", "Gangga Express": "mysql_gangga" };

const DetailDialog = ({ j, tanggal, onClose }) => {
  const rows = useManifest(j.id, tanggal);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-[28px] sm:max-w-2xl" data-testid="laporan-detail-dialog">
        <DialogHeader><DialogTitle className="font-display text-2xl">Detail {j.kapal.nama} · {j.jam}</DialogTitle></DialogHeader>
        <p className="-mt-2 text-sm text-slate-600">{tanggal} · {j.asal.nama} → {j.tujuan.nama}</p>
        <table className="w-full text-sm"><tbody>{rows.map((r, i) => <tr key={r.id} className="border-t border-slate-100"><td className="py-2 font-mono text-xs">{i + 1}</td><td className="py-2 font-semibold">{r.nama}</td><td className="py-2">{r.jenis}</td><td className="py-2 font-mono text-xs">{r.invoice}</td></tr>)}</tbody></table>
        {!rows.length && <p className="py-6 text-center text-slate-500">Tidak ada detail tiket.</p>}
      </DialogContent>
    </Dialog>
  );
};

const Harian = () => {
  const { jadwal } = useStore();
  const L = useLookup();
  const [tgl, setTgl] = useState(todayWita());
  const [op, setOp] = useState("all");
  const [det, setDet] = useState(null);
  const rows = jadwal.map(L.detail).filter((j) => op === "all" || j.armadaId === op).sort((a, b) => a.jam.localeCompare(b.jam)).map((j) => ({ j, pax: j.terisi + L.sold(j.id, tgl), retri: (j.kapal.grt || 0) * TARIF_GRT }));
  const csv = rows.map(({ j, pax, retri }) => ({ operator: j.armada.nama, kapal: j.kapal.nama, nahkoda: j.nahkoda.nama, rute: `${j.asal.nama} - ${j.tujuan.nama}`, jam: j.jam, penumpang: pax, retribusi: retri }));
  return (
    <>
      <PageTitle title="Laporan Operator Harian" sub="Rekap operator, kapal, nahkoda, rute, jam, penumpang, dan jasa/retribusi.">
        <input data-testid="laporan-harian-tanggal" type="date" className={inp} value={tgl} onChange={(e) => setTgl(e.target.value)} />
        <Dropdown variant="pill" className="min-w-[200px]" testid="laporan-harian-operator" value={op} onChange={setOp} options={[{ value: "all", label: "Semua operator" }, ...toOpts(Object.values(L.armada))]} />
        <Btn data-testid="laporan-harian-download" onClick={() => downloadCSV(`laporan-harian-${tgl}.csv`, csv)}><Download className="h-4 w-4" />Unduh</Btn>
        <button data-testid="laporan-harian-pdf" onClick={() => window.print()} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold"><FileDown className="h-4 w-4" />PDF</button>
      </PageTitle>
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {[["Total trip", rows.filter((r) => r.j.operasional === "On").length], ["Total penumpang", rows.reduce((a, r) => a + r.pax, 0)], ["Total retribusi", rupiah(rows.reduce((a, r) => a + r.retri, 0))]].map(([l, v]) => (
          <Panel key={l}><p className="text-sm text-slate-500">{l}</p><p className="mt-1 font-display text-3xl font-bold">{v}</p></Panel>
        ))}
      </div>
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm" data-testid="laporan-harian-table">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr>{["Operator", "Kapal", "Nahkoda", "Rute", "Jam", "Penumpang", "Retribusi", ""].map((h) => <th key={h} className="pb-3 pr-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map(({ j, pax, retri }) => (
              <tr key={j.id} className="border-t border-slate-100">
                <td className="py-3 pr-3 font-semibold">{j.armada.nama}</td><td className="py-3 pr-3">{j.kapal.nama}</td><td className="py-3 pr-3 text-slate-600">{j.nahkoda.nama}</td>
                <td className="py-3 pr-3">{j.asal.nama} → {j.tujuan.nama}</td><td className="py-3 pr-3 font-mono">{j.jam}</td><td className="py-3 pr-3">{pax}</td><td className="py-3 pr-3">{rupiah(retri)}</td>
                <td className="py-3 text-right"><button data-testid={`laporan-harian-detail-${j.id}`} onClick={() => setDet(j)} className="rounded-full bg-[var(--canvas)] p-2 hover:bg-[var(--foam)]"><Eye className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      {det && <DetailDialog j={det} tanggal={tgl} onClose={() => setDet(null)} />}
    </>
  );
};

const Bulanan = () => {
  const ops = Object.keys(KONEKSI);
  const table = ops.map((o) => ({ operator: o, koneksi: KONEKSI[o], ...Object.fromEntries(BULANAN.map((b) => [b.bulan, b[o]])), total: BULANAN.reduce((a, b) => a + b[o], 0) }));
  return (
    <>
      <PageTitle title="Laporan Operator Bulanan" sub="Agregasi per bulan dan operator. Koneksi armada gagal → dilanjutkan ke data utama.">
        <Btn data-testid="laporan-bulanan-download" onClick={() => downloadCSV("laporan-bulanan.csv", table)}><Download className="h-4 w-4" />Unduh</Btn>
      </PageTitle>
      <Panel>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BULANAN} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={{ borderRadius: 16, border: "none" }} /><Legend wrapperStyle={{ fontSize: 12 }} />
              {[["Gangga Express", "#0077B6"], ["Sekar Jaya", "#00A896"], ["The Angkal Fast Cruise", "#02C39A"]].map(([k, c]) => <Bar key={k} dataKey={k} fill={c} radius={[8, 8, 0, 0]} />)}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm" data-testid="laporan-bulanan-table">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr><th className="pb-3">Operator</th><th className="pb-3">Koneksi</th>{BULANAN.map((b) => <th key={b.bulan} className="pb-3">{b.bulan}</th>)}<th className="pb-3">Total</th></tr></thead>
          <tbody>{table.map((r) => <tr key={r.operator} className="border-t border-slate-100"><td className="py-3 font-semibold">{r.operator}</td><td className="py-3 font-mono text-xs">{r.koneksi}</td>{BULANAN.map((b) => <td key={b.bulan} className="py-3">{r[b.bulan].toLocaleString("id-ID")}</td>)}<td className="py-3 font-bold">{r.total.toLocaleString("id-ID")}</td></tr>)}</tbody>
        </table>
      </Panel>
    </>
  );
};

const Penumpang = () => {
  const [mode, setMode] = useState("harian");
  const k = mode === "harian" ? 1 : 28;
  const rows = JENIS_PENUMPANG.map((j, i) => ({ jenis: j.nama, kategori: j.kategori, ...Object.fromEntries(["Gangga Express", "Sekar Jaya", "The Angkal Fast Cruise"].map((a, x) => [a, Math.round(([120, 35, 8, 44, 18, 4][i] + x * 9) * k)])) }));
  return (
    <>
      <PageTitle title="Laporan Penumpang" sub="Dari penumpang, keberangkatan, jadwal, jenis penumpang, rute, dan armada. (Menu disembunyikan di sistem asli, route tetap tersedia.)">
        <div className="flex rounded-full bg-white p-1 text-xs font-semibold">{["harian", "bulanan"].map((m) => <button key={m} data-testid={`laporan-penumpang-${m}`} onClick={() => setMode(m)} className={`rounded-full px-4 py-2 capitalize ${mode === m ? "bg-[var(--ink)] text-white" : ""}`}>{m}</button>)}</div>
        <Btn data-testid="laporan-penumpang-download" onClick={() => downloadCSV(`laporan-penumpang-${mode}.csv`, rows)}><Download className="h-4 w-4" />Unduh</Btn>
      </PageTitle>
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm" data-testid="laporan-penumpang-table">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr>{Object.keys(rows[0]).map((h) => <th key={h} className="pb-3 pr-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r.jenis} className="border-t border-slate-100">{Object.values(r).map((v, i) => <td key={i} className={`py-3 pr-3 ${i === 0 ? "font-semibold" : ""}`}>{typeof v === "number" ? v.toLocaleString("id-ID") : v}</td>)}</tr>)}</tbody>
        </table>
      </Panel>
    </>
  );
};

const Transaksi = () => {
  const { invoices } = useStore();
  const online = invoices.map((i) => ({ id: i.id, tanggal: i.tanggal, kanal: "Online (Modul Tiket)", metode: i.metode === "qris" ? "QRIS" : "Virtual Account", nominal: i.grandtotal, status: i.status ? "Lunas" : "Pending" }));
  const spot = [1, 2, 3, 4].map((n) => ({ id: "OTS-" + (880 + n), tanggal: todayWita(), kanal: "On the spot (Loket)", metode: "Tunai", nominal: n * 75000, status: "Lunas" }));
  const rows = [...online, ...spot];
  return (
    <>
      <PageTitle title="Laporan Transaksi" sub="Online dan on-the-spot, diklasifikasikan berdasarkan metode pembayaran & metadata invoice.">
        <Btn data-testid="laporan-transaksi-download" onClick={() => downloadCSV("laporan-transaksi.csv", rows)}><Download className="h-4 w-4" />Unduh</Btn>
      </PageTitle>
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm" data-testid="laporan-transaksi-table">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr>{["Invoice", "Tanggal", "Kanal", "Metode", "Nominal", "Status"].map((h) => <th key={h} className="pb-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id} className="border-t border-slate-100"><td className="py-3 font-mono text-xs">{r.id}</td><td className="py-3">{r.tanggal}</td><td className="py-3">{r.kanal}</td><td className="py-3">{r.metode}</td><td className="py-3 font-semibold">{rupiah(r.nominal)}</td><td className="py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.status === "Lunas" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{r.status}</span></td></tr>)}</tbody>
        </table>
      </Panel>
    </>
  );
};

export default function LaporanPage() {
  const { pathname } = useLocation();
  const C = { "/laporan/operator/harian": Harian, "/laporan/operator/bulanan": Bulanan, "/laporan/penumpang": Penumpang, "/laporan/transaksi": Transaksi }[pathname] || Harian;
  return <div data-testid="laporan-page"><C /></div>;
}
