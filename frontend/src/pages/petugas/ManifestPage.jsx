import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FileDown, Package, Plus } from "lucide-react";
import { useLookup, useStore } from "@/store/AppStore";
import { PENUMPANG_SEED } from "@/data/mock";
import { todayWita } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageTitle, Panel } from "./AdminLayout";
import { CrudTable } from "./CrudTable";
import { CONFIGS } from "./CrudPage";
import { Dropdown, strOpts, toOpts } from "@/components/common/Dropdown";

const inp = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--teal)]";
const tab = "rounded-full data-[state=active]:bg-[var(--ink)] data-[state=active]:text-white";

export const useManifest = (jadwalId, tanggal, extra = []) => {
  const { invoices, master } = useStore();
  return useMemo(() => {
    const jn = (id) => master.jenisPenumpang.find((x) => x.id === id)?.nama;
    const tj = (id) => master.tujuan.find((x) => x.id === id)?.nama;
    const seed = tanggal === todayWita() ? PENUMPANG_SEED.filter((p) => String(p.jadwalId) === String(jadwalId)).map((p) => ({ ...p, jenis: jn(p.jenisId), tujuan: tj(p.tujuanId), sumber: "Loket" })) : [];
    const online = invoices.filter((i) => String(i.jadwalId) === String(jadwalId) && i.tanggal === tanggal).flatMap((i) => i.units.map((u) => ({ id: u.kodeBooking, nama: u.nama, jenis: u.jenis, tujuan: tj(i.tujuanId), gender: u.gender, identitas: u.identitas, verified: i.status === 1, invoice: i.id, sumber: "Online" })));
    return [...seed, ...online, ...extra.filter((e) => String(e.jadwalId) === String(jadwalId))];
  }, [invoices, master, jadwalId, tanggal, extra]);
};

const Manifest = () => {
  const { jadwal, master } = useStore();
  const L = useLookup();
  const [jid, setJid] = useState(String(jadwal[0].id));
  const [tgl, setTgl] = useState(todayWita());
  const [q, setQ] = useState("");
  const [extra, setExtra] = useState([]);
  const [add, setAdd] = useState(null);
  const rows = useManifest(jid, tgl, extra).filter((r) => r.nama.toLowerCase().includes(q.toLowerCase()));
  const byJenis = rows.reduce((a, r) => ({ ...a, [r.jenis]: (a[r.jenis] || 0) + 1 }), {});
  const j = L.detail(jadwal.find((x) => String(x.id) === jid));
  return (
    <>
      <Panel>
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1.5fr_auto_auto]">
          <Dropdown testid="manifest-jadwal" sub="Jadwal keberangkatan" value={jid} onChange={setJid} options={jadwal.map(L.detail).map((x) => ({ value: x.id, label: `${x.jam} · ${x.asal.nama} → ${x.tujuan.nama}`, hint: `${x.armada.nama} · ${x.kapal.nama}` }))} />
          <input data-testid="manifest-tanggal" type="date" className={inp} value={tgl} onChange={(e) => setTgl(e.target.value)} />
          <input data-testid="manifest-search" className={inp} placeholder="Cari penumpang…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button data-testid="manifest-add" onClick={() => setAdd({ nama: "", jenisId: 1, tujuanId: 1, gender: "Laki-laki", identitas: "" })} className="flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Tambah</button>
          <button data-testid="manifest-export-pdf" onClick={() => { toast.success("Menyiapkan PDF manifest…"); setTimeout(() => window.print(), 300); }} className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold"><FileDown className="h-4 w-4" />PDF</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-[var(--ink)] px-3 py-1 font-semibold text-white">{rows.length} penumpang</span>
          {Object.entries(byJenis).map(([k, v]) => <span key={k} className="rounded-full bg-[var(--foam)] px-3 py-1 font-semibold text-teal-800">{k}: {v}</span>)}
          <span className="rounded-full bg-slate-100 px-3 py-1">{j.kapal.nama} · kapasitas {j.kapasitas}</span>
        </div>
      </Panel>
      <Panel className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm" data-testid="manifest-table">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr>{["#", "Nama", "Jenis", "Tujuan", "Kelamin", "Identitas", "Invoice", "Sumber", "Verifikasi"].map((h) => <th key={h} className="pb-3 pr-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="py-3 pr-3 font-mono text-xs">{i + 1}</td><td className="py-3 pr-3 font-semibold">{r.nama}</td><td className="py-3 pr-3">{r.jenis}</td><td className="py-3 pr-3">{r.tujuan}</td>
                <td className="py-3 pr-3">{r.gender}</td><td className="py-3 pr-3 font-mono text-xs">{r.identitas}</td><td className="py-3 pr-3 font-mono text-xs">{r.invoice}</td>
                <td className="py-3 pr-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.sumber === "Online" ? "bg-sky-100 text-sky-800" : "bg-slate-100"}`}>{r.sumber}</span></td>
                <td className="py-3 pr-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{r.verified ? "Terverifikasi" : "Belum"}</span></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={9} className="py-10 text-center text-slate-500">Belum ada penumpang pada jadwal & tanggal ini.</td></tr>}
          </tbody>
        </table>
      </Panel>
      <Dialog open={!!add} onOpenChange={(o) => !o && setAdd(null)}>
        <DialogContent className="rounded-[28px]" data-testid="manifest-add-dialog">
          <DialogHeader><DialogTitle className="font-display text-2xl">Tambah Manifest</DialogTitle></DialogHeader>
          {add && (
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <label className="sm:col-span-2">Nama<input data-testid="manifest-add-nama" className={inp} value={add.nama} onChange={(e) => setAdd({ ...add, nama: e.target.value })} /></label>
              <label>Jenis<Dropdown testid="manifest-add-jenis" value={add.jenisId} onChange={(v) => setAdd({ ...add, jenisId: Number(v) })} options={toOpts(master.jenisPenumpang)} /></label>
              <label>Tujuan<Dropdown testid="manifest-add-tujuan" value={add.tujuanId} onChange={(v) => setAdd({ ...add, tujuanId: Number(v) })} options={toOpts(master.tujuan)} /></label>
              <label>Jenis Kelamin<Dropdown testid="manifest-add-gender" value={add.gender} onChange={(v) => setAdd({ ...add, gender: v })} options={strOpts(["Laki-laki", "Perempuan"])} /></label>
              <label>Identitas<input data-testid="manifest-add-identitas" className={inp} value={add.identitas} onChange={(e) => setAdd({ ...add, identitas: e.target.value })} /></label>
            </div>
          )}
          <DialogFooter><button data-testid="manifest-add-save" onClick={() => {
            if (!add.nama.trim()) return toast.error("Nama wajib diisi");
            setExtra([...extra, { ...add, id: "M" + Date.now(), jadwalId: jid, jenis: master.jenisPenumpang.find((x) => x.id === add.jenisId)?.nama, tujuan: master.tujuan.find((x) => x.id === add.tujuanId)?.nama, invoice: "ON-THE-SPOT", sumber: "Loket", verified: true }]);
            toast.success("Penumpang ditambahkan ke manifest"); setAdd(null);
          }} className="rounded-full bg-[var(--ink)] px-6 py-2.5 text-sm font-semibold text-white">Simpan</button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Ekspedisi = () => {
  const { master } = useStore();
  const per = master.dermaga.map((d, i) => ({ ...d, paket: [12, 7, 4, 18, 9][i % 5], berat: [64, 31, 22, 120, 48][i % 5] }));
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <CrudTable entity="barang" config={CONFIGS.barang} />
      <Panel data-testid="ekspedisi-per-tujuan">
        <h3 className="font-display text-xl font-bold">Ekspedisi per tujuan</h3>
        <div className="mt-4 flex flex-col gap-3">
          {per.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-2xl bg-[var(--canvas)] p-3">
              <Package className="h-5 w-5 text-[var(--teal)]" /><span className="flex-1 font-semibold">{d.nama}</span>
              <span className="text-sm">{d.paket} paket</span><span className="font-mono text-xs text-slate-600">{d.berat} kg</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

export default function ManifestPage() {
  return (
    <div data-testid="manifest-page">
      <PageTitle title="Manifest & Barang" sub="Satu unit tiket = satu baris penumpang. Online (modul tiket) dan on-the-spot (loket)." />
      <Tabs defaultValue="manifest">
        <TabsList className="mb-4 rounded-full bg-white p-1">
          <TabsTrigger data-testid="tab-manifest" value="manifest" className={tab}>Manifest</TabsTrigger>
          <TabsTrigger data-testid="tab-barang" value="barang" className={tab}>Barang / Ekspedisi</TabsTrigger>
        </TabsList>
        <TabsContent value="manifest"><Manifest /></TabsContent>
        <TabsContent value="barang"><Ekspedisi /></TabsContent>
      </Tabs>
    </div>
  );
}
