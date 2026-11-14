import { useState } from "react";
import { toast } from "sonner";
import { Check, ClipboardCheck, Play, Plus, RotateCcw, Square } from "lucide-react";
import { useLookup, useStore } from "@/store/AppStore";
import { HISTORY } from "@/data/mock";
import { effectiveCutoff, salesInfo, statusKapal, todayWita } from "@/lib/format";
import { StatusBadge } from "@/components/common/Badges";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { PageTitle, Panel } from "./AdminLayout";
import { Dropdown, strOpts, toOpts } from "@/components/common/Dropdown";
import { useWitaClock } from "@/pages/landing/Schedule";

const inp = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--teal)]";
const RUN = { idle: "Belum mulai", berjalan: "Berjalan", selesai: "Selesai" };

const SopDialog = ({ j, onClose }) => {
  const { master, updateJadwal } = useStore();
  const [done, setDone] = useState(j?.sop || []);
  if (!j) return null;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-[28px]" data-testid="sop-dialog">
        <DialogHeader><DialogTitle className="font-display text-2xl">Pemeriksaan SOP · {j.jam}</DialogTitle></DialogHeader>
        <p className="-mt-2 text-sm text-slate-600">{j.kapal.nama} · {j.asal.nama} → {j.tujuan.nama}</p>
        <div className="flex flex-col gap-2">
          {master.sop.map((s) => (
            <label key={s.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 text-sm">
              <Checkbox data-testid={`sop-check-${s.id}`} checked={done.includes(s.id)} onCheckedChange={(v) => setDone(v ? [...done, s.id] : done.filter((x) => x !== s.id))} />{s.nama}
            </label>
          ))}
        </div>
        <DialogFooter>
          <span className="mr-auto text-sm text-slate-600">{done.length}/{master.sop.length} terpenuhi</span>
          <button data-testid="sop-save" onClick={() => { updateJadwal(j.id, { sop: done }); toast.success("Hasil SOP disimpan"); onClose(); }} className="rounded-full bg-[var(--ink)] px-6 py-2.5 text-sm font-semibold text-white">Simpan hasil</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddJadwal = ({ open, onClose }) => {
  const { master, addJadwal } = useStore();
  const [f, setF] = useState({ armadaId: "A1", kapalId: "KPL-GE-01", nahkodaId: "N1", ruteId: "R1", jam: "12:00", jenis: "Extra Trip", loket: "Loket Tribuana", kapasitasJadwal: "" });
  const sel = (k, list, label = "nama") => (
    <Dropdown testid={`add-jadwal-${k}`} value={f[k]} onChange={(v) => setF({ ...f, [k]: v })} options={toOpts(list, label)} />
  );
  const dn = (id) => master.dermaga.find((d) => d.id === id)?.nama;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-[28px] sm:max-w-xl" data-testid="add-jadwal-dialog">
        <DialogHeader><DialogTitle className="font-display text-2xl">Tambah Jadwal</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <label>Armada{sel("armadaId", master.armada)}</label>
          <label>Kapal{sel("kapalId", master.kapal.filter((k) => k.armadaId === f.armadaId))}</label>
          <label>Nahkoda{sel("nahkodaId", master.nahkoda.filter((k) => k.armadaId === f.armadaId))}</label>
          <label>Rute{sel("ruteId", master.rute, (r) => `${dn(r.awal)} → ${dn(r.akhir)}`)}</label>
          <label>Jam<input data-testid="add-jadwal-jam" type="time" className={inp} value={f.jam} onChange={(e) => setF({ ...f, jam: e.target.value })} /></label>
          <label>Jenis<Dropdown testid="add-jadwal-jenis" value={f.jenis} onChange={(v) => setF({ ...f, jenis: v })} options={strOpts(["Regular", "Extra Trip"])} /></label>
          <label>Kapasitas khusus (opsional)<input data-testid="add-jadwal-kapasitas" type="number" className={inp} value={f.kapasitasJadwal} onChange={(e) => setF({ ...f, kapasitasJadwal: e.target.value })} /></label>
          <label>Loket<input data-testid="add-jadwal-loket" className={inp} value={f.loket} onChange={(e) => setF({ ...f, loket: e.target.value })} /></label>
        </div>
        <DialogFooter><button data-testid="add-jadwal-save" onClick={() => {
          addJadwal({ ...f, kapasitasJadwal: f.kapasitasJadwal ? Number(f.kapasitasJadwal) : null, operasional: "On", approval: "Menunggu", cutoff: null, penjualan: true, terisi: 0, sop: [], createdToday: f.jenis === "Extra Trip" ? todayWita() : null });
          toast.success("Jadwal ditambahkan, menunggu approval"); onClose();
        }} className="rounded-full bg-[var(--ink)] px-6 py-2.5 text-sm font-semibold text-white">Simpan</button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function JadwalPage() {
  const { jadwal, updateJadwal, cutoff, master } = useStore();
  const L = useLookup();
  const now = useWitaClock();
  const [sop, setSop] = useState(null);
  const [add, setAdd] = useState(false);
  const today = todayWita();
  // Extra Trip hanya tampil bila dibuat hari yang sama
  const list = jadwal.filter((j) => j.jenis === "Regular" || j.createdToday === today).map(L.detail).sort((a, b) => a.jam.localeCompare(b.jam));
  const pending = list.filter((j) => j.approval !== "Disetujui");
  const act = (j, change, msg) => { updateJadwal(j.id, change); toast.success(msg); };

  return (
    <div data-testid="jadwal-page">
      <PageTitle title="Jadwal & Approval" sub="Isi jadwal, tiket per jadwal, approval, SOP, start/stop keberangkatan, dan history.">
        <button data-testid="jadwal-add-btn" onClick={() => setAdd(true)} className="flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal)]"><Plus className="h-4 w-4" />Tambah Jadwal</button>
      </PageTitle>
      <Tabs defaultValue="jadwal">
        <TabsList className="mb-4 rounded-full bg-white p-1">
          <TabsTrigger data-testid="tab-jadwal" value="jadwal" className="rounded-full data-[state=active]:bg-[var(--ink)] data-[state=active]:text-white">Jadwal</TabsTrigger>
          <TabsTrigger data-testid="tab-approval" value="approval" className="rounded-full data-[state=active]:bg-[var(--ink)] data-[state=active]:text-white">Approval ({pending.length})</TabsTrigger>
          <TabsTrigger data-testid="tab-tiket" value="tiket" className="rounded-full data-[state=active]:bg-[var(--ink)] data-[state=active]:text-white">Tiket per Jadwal</TabsTrigger>
          <TabsTrigger data-testid="tab-history" value="history" className="rounded-full data-[state=active]:bg-[var(--ink)] data-[state=active]:text-white">History</TabsTrigger>
        </TabsList>
        <TabsContent value="jadwal">
          <Panel className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr>{["Jam", "Rute", "Armada / Kapal", "Kapasitas", "Jenis", "Operasional", "Status", "Penjualan", "Keberangkatan", "Aksi"].map((h) => <th key={h} className="pb-3 pr-3 font-semibold">{h}</th>)}</tr></thead>
              <tbody>
                {list.map((j) => {
                  const s = salesInfo(j, today, cutoff, now);
                  const run = j.run || "idle";
                  return (
                    <tr key={j.id} className="border-t border-slate-100 align-top" data-testid={`jadwal-admin-row-${j.id}`}>
                      <td className="py-3 pr-3 font-mono font-semibold text-[var(--ocean)]">{j.jam}</td>
                      <td className="py-3 pr-3 font-semibold">{j.asal.nama} → {j.tujuan.nama}<p className="text-xs font-normal text-slate-500">{j.loket}</p></td>
                      <td className="py-3 pr-3">{j.armada.nama}<p className="text-xs text-slate-500">{j.kapal.nama} · {j.nahkoda.nama}</p></td>
                      <td className="py-3 pr-3">{j.kapasitas}{j.kapasitasJadwal && <p className="text-[11px] text-teal-700">khusus jadwal</p>}</td>
                      <td className="py-3 pr-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${j.jenis === "Regular" ? "bg-slate-100" : "bg-violet-100 text-violet-800"}`}>{j.jenis}</span></td>
                      <td className="py-3 pr-3"><Switch data-testid={`jadwal-operasional-${j.id}`} checked={j.operasional === "On"} onCheckedChange={(v) => act(j, { operasional: v ? "On" : "Off" }, `Jadwal ${j.jam} ${v ? "diaktifkan" : "Off"}`)} /></td>
                      <td className="py-3 pr-3"><StatusBadge status={statusKapal(j, now)} /><p className={`mt-1 text-[11px] font-semibold ${j.approval === "Disetujui" ? "text-emerald-700" : "text-amber-700"}`}>{j.approval}</p></td>
                      <td className="py-3 pr-3 text-xs"><span className={s.open ? "font-semibold text-emerald-700" : "font-semibold text-red-600"}>{s.open ? "Buka" : "Tutup"}</span><p className="text-slate-500">tutup {s.closeLabel} · {effectiveCutoff(j, cutoff).level}</p></td>
                      <td className="py-3 pr-3 text-xs"><span className="font-semibold">{RUN[run]}</span><p className="text-slate-500">SOP {j.sop.length}/{master.sop.length}</p></td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-wrap gap-1">
                          <button title="SOP" data-testid={`jadwal-sop-${j.id}`} onClick={() => setSop(j)} className="rounded-full bg-[var(--canvas)] p-2 hover:bg-[var(--foam)]"><ClipboardCheck className="h-4 w-4" /></button>
                          <button title="Start" data-testid={`jadwal-start-${j.id}`} disabled={run !== "idle"} onClick={() => act(j, { run: "berjalan" }, "Keberangkatan dimulai")} className="rounded-full bg-emerald-50 p-2 text-emerald-700 disabled:opacity-40"><Play className="h-4 w-4" /></button>
                          <button title="Stop" data-testid={`jadwal-stop-${j.id}`} disabled={run !== "berjalan"} onClick={() => act(j, { run: "selesai" }, "Keberangkatan dihentikan & dicatat ke history")} className="rounded-full bg-red-50 p-2 text-red-600 disabled:opacity-40"><Square className="h-4 w-4" /></button>
                          <button title="Reset" data-testid={`jadwal-reset-${j.id}`} onClick={() => act(j, { run: "idle", sop: [] }, "Keberangkatan direset")} className="rounded-full bg-[var(--canvas)] p-2"><RotateCcw className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        </TabsContent>
        <TabsContent value="approval">
          <Panel>
            {!pending.length && <p className="py-8 text-center text-slate-500" data-testid="approval-empty">Semua jadwal sudah disetujui.</p>}
            {pending.map((j) => (
              <div key={j.id} className="flex flex-wrap items-center gap-4 border-b border-slate-100 py-4 last:border-0" data-testid={`approval-item-${j.id}`}>
                <span className="font-mono text-lg font-semibold text-[var(--ocean)]">{j.jam}</span>
                <div className="flex-1"><p className="font-semibold">{j.asal.nama} → {j.tujuan.nama} · {j.jenis}</p><p className="text-xs text-slate-500">{j.armada.nama} · {j.kapal.nama} · SOP {j.sop.length}/{master.sop.length}</p></div>
                <button data-testid={`approval-reject-${j.id}`} onClick={() => act(j, { approval: "Ditolak" }, "Jadwal ditolak")} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">Tolak</button>
                <button data-testid={`approval-approve-${j.id}`} onClick={() => act(j, { approval: "Disetujui" }, "Jadwal disetujui")} className="flex items-center gap-1.5 rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white"><Check className="h-4 w-4" />Setujui</button>
              </div>
            ))}
          </Panel>
        </TabsContent>
        <TabsContent value="tiket">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.slice(0, 6).map((j) => (
              <Panel key={j.id} data-testid={`tiket-jadwal-${j.id}`}>
                <p className="font-semibold">{j.jam} · {j.asal.nama} → {j.tujuan.nama}</p>
                <p className="text-xs text-slate-500">{j.armada.nama}</p>
                <div className="mt-3 divide-y divide-slate-100 text-sm">
                  {L.tikets(j).map((t) => <div key={t.id} className="flex justify-between py-1.5"><span>{t.nama} <span className="font-mono text-[11px] text-slate-500">id_siwalatri {t.idSiwalatri}</span></span><span className="font-mono">{t.harga.toLocaleString("id-ID")}</span></div>)}
                </div>
              </Panel>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="history">
          <Panel className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm"><thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr>{["Tanggal", "Kapal", "Berangkat", "Tiba", "Penumpang"].map((h) => <th key={h} className="pb-3 font-semibold">{h}</th>)}</tr></thead>
              <tbody>{HISTORY.map((h) => <tr key={h.id} className="border-t border-slate-100"><td className="py-3">{h.tanggal}</td><td className="py-3 font-semibold">{h.kapal}</td><td className="py-3 font-mono">{h.berangkat}</td><td className="py-3 font-mono">{h.tiba}</td><td className="py-3">{h.penumpang}</td></tr>)}</tbody>
            </table>
          </Panel>
        </TabsContent>
      </Tabs>
      {sop && <SopDialog j={sop} onClose={() => setSop(null)} />}
      <AddJadwal open={add} onClose={() => setAdd(false)} />
    </div>
  );
}
