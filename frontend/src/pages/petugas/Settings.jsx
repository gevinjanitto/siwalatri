import { useState } from "react";
import { toast } from "sonner";
import { History, Save } from "lucide-react";
import { useLookup, useStore } from "@/store/AppStore";
import { effectiveCutoff, salesInfo, todayWita } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
import { PageTitle, Panel } from "./AdminLayout";

const inp = "w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--teal)]";
const valid = (v) => v === "" || v === null || (Number(v) >= 0 && !Number.isNaN(Number(v)));

export const CutoffSettings = () => {
  const { cutoff, setCutoff, jadwal, updateJadwal, audit, master } = useStore();
  const L = useLookup();
  const [sys, setSys] = useState(cutoff.system);
  const [arm, setArm] = useState(cutoff.armada);
  const [tgl, setTgl] = useState(todayWita());
  const saveDefaults = () => {
    if (!valid(sys) || sys === "" || Object.values(arm).some((v) => !valid(v))) return toast.error("Nilai cutoff tidak boleh negatif");
    setCutoff({ system: Number(sys), armada: arm }, `Default cutoff diubah: sistem ${sys} jam; ${master.armada.map((a) => `${a.nama} ${arm[a.id] ?? "—"}`).join(", ")}`);
    toast.success("Default batas penjualan disimpan");
  };
  return (
    <div data-testid="cutoff-page">
      <PageTitle title="Batas Penjualan Tiket" sub="Berapa jam sebelum keberangkatan tiket berhenti ditampilkan & dipesan. Urutan: jadwal → armada → sistem. Zona waktu WITA." />
      <div className="mb-3 inline-flex rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-900">Rencana fitur (bagian 34) — disimulasikan di prototipe</div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        <Panel className="h-fit">
          <h2 className="font-display text-xl font-bold">Default</h2>
          <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[var(--canvas)] p-4"><span><b>Sistem</b><p className="text-xs text-slate-500">DEFAULT_TICKET_CUTOFF_HOURS</p></span>
            <input data-testid="cutoff-system" type="number" step="0.5" min="0" className={inp} value={sys} onChange={(e) => setSys(e.target.value)} /></label>
          {master.armada.map((a) => (
            <label key={a.id} className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4"><span><b>{a.nama}</b><p className="text-xs text-slate-500">kosong = pakai default sistem</p></span>
              <input data-testid={`cutoff-armada-${a.id}`} type="number" step="0.5" min="0" className={inp} value={arm[a.id] ?? ""} onChange={(e) => setArm({ ...arm, [a.id]: e.target.value === "" ? null : e.target.value })} /></label>
          ))}
          <button data-testid="cutoff-save-defaults" onClick={saveDefaults} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] py-3 text-sm font-semibold text-white hover:bg-[var(--teal)]"><Save className="h-4 w-4" />Simpan default</button>
          <p className="mt-3 text-xs text-slate-500">0 = ditutup tepat jam berangkat · nilai negatif ditolak.</p>
        </Panel>
        <Panel className="overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-xl font-bold">Override per jadwal</h2>
            <input data-testid="cutoff-tanggal" type="date" className="rounded-full border border-slate-200 px-4 py-2 text-sm" value={tgl} onChange={(e) => setTgl(e.target.value)} /></div>
          <table className="mt-4 w-full min-w-[680px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr>{["Jam", "Rute / Armada", "Override (jam)", "Berlaku", "Tutup", "Penjualan"].map((h) => <th key={h} className="pb-3 pr-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {jadwal.map(L.detail).sort((a, b) => a.jam.localeCompare(b.jam)).map((j) => {
                const s = salesInfo(j, tgl, cutoff);
                const e = effectiveCutoff(j, cutoff);
                return (
                  <tr key={j.id} className="border-t border-slate-100" data-testid={`cutoff-row-${j.id}`}>
                    <td className="py-3 pr-3 font-mono font-semibold text-[var(--ocean)]">{j.jam}</td>
                    <td className="py-3 pr-3"><b>{j.asal.nama} → {j.tujuan.nama}</b><p className="text-xs text-slate-500">{j.armada.nama}</p></td>
                    <td className="py-3 pr-3"><input data-testid={`cutoff-override-${j.id}`} type="number" step="0.5" min="0" placeholder="—" className={inp} defaultValue={j.cutoff ?? ""} onBlur={(ev) => {
                      const v = ev.target.value;
                      if (!valid(v)) { toast.error("Nilai negatif ditolak"); ev.target.value = j.cutoff ?? ""; return; }
                      const nv = v === "" ? null : Number(v);
                      if (nv !== j.cutoff) { updateJadwal(j.id, { cutoff: nv }, `Override cutoff jadwal ${j.jam} ${j.asal.nama}→${j.tujuan.nama}: ${nv ?? "dihapus"}`); toast.success("Override disimpan"); }
                    }} /></td>
                    <td className="py-3 pr-3 text-xs"><b>{e.hours} jam</b><p className="text-slate-500">{e.level}</p></td>
                    <td className="py-3 pr-3 font-mono">{s.closeLabel} WITA<p className={`font-sans text-xs font-semibold ${s.open ? "text-emerald-700" : "text-red-600"}`}>{s.open ? "Masih dibuka" : "Ditutup"}</p></td>
                    <td className="py-3 pr-3"><Switch data-testid={`cutoff-sales-${j.id}`} checked={j.penjualan !== false} onCheckedChange={(v) => { updateJadwal(j.id, { penjualan: v }, `Penjualan manual jadwal ${j.jam} ${v ? "diaktifkan" : "dinonaktifkan"}`); toast.success(v ? "Penjualan diaktifkan" : "Penjualan dinonaktifkan"); }} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      </div>
      <Panel className="mt-5" data-testid="cutoff-audit-log">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><History className="h-5 w-5 text-[var(--teal)]" />Audit log</h2>
        <div className="mt-4 flex flex-col gap-2">
          {audit.slice(0, 10).map((a, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--canvas)] p-3 text-sm"><span className="font-mono text-xs text-slate-500">{new Date(a.at).toLocaleString("id-ID")}</span><b>{a.by}</b><span className="text-slate-700">{a.msg}</span></div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

export const Profile = () => {
  const { staff, updateStaff } = useStore();
  const [f, setF] = useState({ nama: staff.nama, email: staff.email, pw: "", pw2: "" });
  const field = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--teal)]";
  return (
    <div data-testid="profile-page">
      <PageTitle title="Profil" sub="Ubah data user yang sedang login." />
      <Panel className="max-w-2xl">
        <div className="flex items-center gap-4"><span className="flex h-16 w-16 items-center justify-center rounded-2xl grad-sea font-display text-2xl font-bold text-white">{staff.nama[0]}</span><div><p className="font-display text-xl font-bold">{staff.nama}</p><p className="text-sm text-slate-500">Tipe: {staff.type}</p></div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Nama<input data-testid="profile-nama" className={field} value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} /></label>
          <label className="text-sm">Email<input data-testid="profile-email" className={field} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
          <label className="text-sm">Password baru<input data-testid="profile-password" type="password" className={field} value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} /></label>
          <label className="text-sm">Konfirmasi password<input data-testid="profile-password-confirm" type="password" className={field} value={f.pw2} onChange={(e) => setF({ ...f, pw2: e.target.value })} /></label>
        </div>
        <button data-testid="profile-save" onClick={() => {
          if (!/^\S+@\S+\.\S+$/.test(f.email)) return toast.error("Email tidak valid");
          if (f.pw && (f.pw.length < 5 || f.pw !== f.pw2)) return toast.error("Password minimal 5 karakter dan harus sama");
          updateStaff({ nama: f.nama, email: f.email }); toast.success("Profil diperbarui");
        }} className="mt-6 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--teal)]">Simpan perubahan</button>
      </Panel>
    </div>
  );
};
