import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Download } from "lucide-react";
import { useStore } from "@/store/AppStore";
import { REKON_QRIS_SEED, REKON_VA_SEED } from "@/data/mock";
import { downloadCSV, rupiah } from "@/lib/format";
import { PageTitle, Panel } from "./AdminLayout";
import { Dropdown, strOpts } from "@/components/common/Dropdown";

const inp = "rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--teal)]";
const badge = (ok, t) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{t}</span>;
const uniq = (rows, k) => [...new Set(rows.map((r) => r[k]))];

const Filters = ({ f, setF, rows, status, extra }) => (
  <>
    <input data-testid="rekon-from" type="date" className={inp} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
    <input data-testid="rekon-to" type="date" className={inp} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
    <Dropdown variant="pill" className="min-w-[160px]" testid="rekon-status" value={f.status} onChange={(v) => setF({ ...f, status: v })} options={[{ value: "", label: "Semua status" }, ...strOpts(status)]} />
    {extra}
  </>
);

const Stats = ({ rows, okKey, okVal }) => (
  <div className="mb-4 grid gap-4 sm:grid-cols-3">
    {[["Transaksi", rows.length], ["Lunas", rows.filter((r) => r[okKey] === okVal).length], ["Nominal", rupiah(rows.reduce((a, r) => a + r.nominal, 0))]].map(([l, v]) => (
      <Panel key={l}><p className="text-sm text-slate-500">{l}</p><p className="mt-1 font-display text-3xl font-bold">{v}</p></Panel>
    ))}
  </div>
);

const QRIS = () => {
  const { invoices, master } = useStore();
  const [f, setF] = useState({ from: "", to: "", status: "", merchant: "" });
  const live = invoices.filter((i) => i.metode === "qris").map((i) => ({ id: i.id, product: "QRIS-DYN", nmid: "ID1020261130" + i.id.slice(-3), merchant: master.armada.find((a) => a.id === i.armadaId)?.nama, nominal: i.grandtotal, bill: i.id, tanggal: i.createdAt.slice(0, 10), expired: "15 menit", status: i.status ? "Lunas" : "Pending" }));
  const all = [...live, ...REKON_QRIS_SEED];
  const rows = all.filter((r) => (!f.from || r.tanggal >= f.from) && (!f.to || r.tanggal <= f.to) && (!f.status || r.status === f.status) && (!f.merchant || r.merchant === f.merchant));
  return (
    <>
      <PageTitle title="Rekonsiliasi QRIS" sub="rekon_qris: product code, QR value, NMID, merchant, masa berlaku, nominal, bill number, status.">
        <Filters f={f} setF={setF} rows={all} status={["Lunas", "Pending"]} extra={<Dropdown variant="pill" className="min-w-[200px]" testid="rekon-merchant" value={f.merchant} onChange={(v) => setF({ ...f, merchant: v })} options={[{ value: "", label: "Semua merchant" }, ...strOpts(uniq(all, "merchant"))]} />} />
        <button data-testid="rekon-qris-download" onClick={() => downloadCSV("rekon-qris.csv", rows)} className="flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white"><Download className="h-4 w-4" />Unduh</button>
      </PageTitle>
      <Stats rows={rows} okKey="status" okVal="Lunas" />
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm" data-testid="rekon-qris-table">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr>{["Bill Number", "Tanggal", "Product", "NMID", "Merchant", "Berlaku", "Nominal", "Status"].map((h) => <th key={h} className="pb-3 pr-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id} className="border-t border-slate-100"><td className="py-3 pr-3 font-mono text-xs">{r.bill}</td><td className="py-3 pr-3">{r.tanggal}</td><td className="py-3 pr-3">{r.product}</td><td className="py-3 pr-3 font-mono text-xs">{r.nmid}</td><td className="py-3 pr-3 font-semibold">{r.merchant}</td><td className="py-3 pr-3">{r.expired}</td><td className="py-3 pr-3">{rupiah(r.nominal)}</td><td className="py-3 pr-3">{badge(r.status === "Lunas", r.status)}</td></tr>)}</tbody>
        </table>
      </Panel>
    </>
  );
};

const VA = () => {
  const { invoices, master, jadwal } = useStore();
  const [f, setF] = useState({ from: "", to: "", status: "", reversal: "", operator: "" });
  const live = invoices.filter((i) => i.metode === "va").map((i) => ({ id: i.id, jenisBayar: "Virtual Account", tiket: `${i.units.length} unit`, tagihan: i.noVa, operator: master.armada.find((a) => a.id === i.armadaId)?.nama, tglPerjalanan: i.tanggal, tglBeli: i.createdAt.slice(0, 10), tujuan: master.dermaga.find((d) => d.id === master.rute.find((r) => r.id === jadwal.find((j) => j.id === i.jadwalId)?.ruteId)?.akhir)?.nama, nama: i.units[0]?.nama, nominal: i.grandtotal, statusBayar: i.status ? "Lunas" : "Belum Bayar", reversal: "Normal", bukti: i.status ? "BPD" + i.id.slice(-6) : "-" }));
  const all = [...live, ...REKON_VA_SEED];
  const rows = all.filter((r) => (!f.from || r.tglBeli >= f.from) && (!f.to || r.tglBeli <= f.to) && (!f.status || r.statusBayar === f.status) && (!f.reversal || r.reversal === f.reversal) && (!f.operator || r.operator === f.operator));
  return (
    <>
      <PageTitle title="Rekonsiliasi Virtual Account" sub="rekon_vas: jenis & jumlah tiket, nomor tagihan, operator, tanggal, tujuan, status bayar, reversal, nominal, bukti.">
        <Filters f={f} setF={setF} rows={all} status={["Lunas", "Belum Bayar"]} extra={<>
          <Dropdown variant="pill" className="min-w-[160px]" testid="rekon-reversal" value={f.reversal} onChange={(v) => setF({ ...f, reversal: v })} options={[{ value: "", label: "Semua reversal" }, ...strOpts(["Normal", "Reversal"])]} />
          <Dropdown variant="pill" className="min-w-[200px]" testid="rekon-operator" value={f.operator} onChange={(v) => setF({ ...f, operator: v })} options={[{ value: "", label: "Semua operator" }, ...strOpts(uniq(all, "operator"))]} />
        </>} />
        <button data-testid="rekon-va-download" onClick={() => downloadCSV("rekon-va.csv", rows)} className="flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white"><Download className="h-4 w-4" />Unduh</button>
      </PageTitle>
      <Stats rows={rows} okKey="statusBayar" okVal="Lunas" />
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-sm [&_td]:whitespace-nowrap" data-testid="rekon-va-table">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr>{["No Tagihan", "Nama", "Tiket", "Operator", "Tujuan", "Tgl Perjalanan", "Tgl Beli", "Nominal", "Status", "Reversal", "Bukti"].map((h) => <th key={h} className="pb-3 pr-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id} className="border-t border-slate-100"><td className="py-3 pr-3 font-mono text-xs">{r.tagihan}</td><td className="py-3 pr-3 font-semibold">{r.nama}</td><td className="py-3 pr-3">{r.tiket}</td><td className="py-3 pr-3">{r.operator}</td><td className="py-3 pr-3">{r.tujuan}</td><td className="py-3 pr-3">{r.tglPerjalanan}</td><td className="py-3 pr-3">{r.tglBeli}</td><td className="py-3 pr-3">{rupiah(r.nominal)}</td><td className="py-3 pr-3">{badge(r.statusBayar === "Lunas", r.statusBayar)}</td><td className="py-3 pr-3">{badge(r.reversal === "Normal", r.reversal)}</td><td className="py-3 pr-3 font-mono text-xs">{r.bukti}</td></tr>)}</tbody>
        </table>
      </Panel>
    </>
  );
};

export default function RekonPage() {
  const { pathname } = useLocation();
  return <div data-testid="rekon-page">{pathname.endsWith("qris") ? <QRIS /> : <VA />}</div>;
}
