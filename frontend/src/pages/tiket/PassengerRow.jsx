import { Bike, PawPrint, Trash2, User } from "lucide-react";
import { rupiah } from "@/lib/format";
import { Dropdown, strOpts } from "@/components/common/Dropdown";

const KAT_ICON = { orang: <User className="h-4 w-4" />, kendaraan: <Bike className="h-4 w-4" />, hewan: <PawPrint className="h-4 w-4" /> };

const inp = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--teal)]";
const F = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
    {children}
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
);

export const validatePassenger = (p, tiket) => {
  const e = {};
  const orang = tiket?.kategori === "orang";
  if (!p.nama?.trim()) e.nama = orang ? "Nama penumpang wajib diisi" : "Nama pemilik wajib diisi";
  if (orang) {
    if (!p.gender) e.gender = "Pilih jenis kelamin";
    if (tiket.asing) {
      if (!p.identitas?.trim()) e.identitas = "Nomor paspor wajib";
      if (!p.negara?.trim()) e.negara = "Kewarganegaraan wajib";
    } else if (!/^\d{16}$/.test(p.identitas || "")) e.identitas = "NIK harus tepat 16 digit";
  } else {
    const n = Number(p.jumlah);
    if (!Number.isInteger(n) || n < 1 || n > 1000) e.jumlah = "Jumlah bulat 1–1.000";
    if (!p.identitas?.trim()) e.identitas = "No DK wajib diisi";
  }
  return e;
};

export const PassengerRow = ({ idx, p, tikets, onChange, onRemove, errors = {} }) => {
  const t = tikets.find((x) => x.id === p.tiketId);
  const orang = t?.kategori === "orang";
  const set = (k) => (e) => onChange({ ...p, [k]: e.target.value });
  const jumlah = orang ? 1 : Number(p.jumlah) || 0;
  return (
    <div className="rounded-3xl border border-slate-200 bg-[var(--canvas)]/60 p-5" data-testid={`passenger-row-${idx}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full grad-sea font-mono text-xs font-bold text-white">{idx + 1}</span>
          <Dropdown testid={`passenger-${idx}-tiket`} sub="Jenis tiket" className="min-w-[220px] font-semibold" value={p.tiketId} onChange={(v) => onChange({ ...p, tiketId: v, jumlah: 1 })}
            options={tikets.map((x) => ({ value: x.id, label: x.nama, hint: `${rupiah(x.harga)} · ${x.kategori}${x.asing ? " · WNA" : ""}`, icon: KAT_ICON[x.kategori] }))} />
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold text-[var(--ocean)]" data-testid={`passenger-${idx}-subtotal`}>{rupiah((t?.harga || 0) * jumlah)}</span>
          {onRemove && <button data-testid={`passenger-${idx}-remove`} onClick={onRemove} className="rounded-full p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <F label={orang ? "Nama Penumpang" : "Nama Pemilik"} error={errors.nama}><input data-testid={`passenger-${idx}-nama`} className={inp} value={p.nama || ""} onChange={set("nama")} /></F>
        {orang ? (
          <F label="Jenis Kelamin" error={errors.gender}>
            <Dropdown testid={`passenger-${idx}-gender`} value={p.gender || ""} onChange={(v) => onChange({ ...p, gender: v })} options={strOpts(["Laki-laki", "Perempuan"])} />
          </F>
        ) : (
          <F label="Jumlah" error={errors.jumlah}><input data-testid={`passenger-${idx}-jumlah`} type="number" min={1} max={1000} className={inp} value={p.jumlah ?? 1} onChange={set("jumlah")} /></F>
        )}
        <F label={orang ? (t?.asing ? "Nomor Paspor" : "NIK (16 digit)") : "No DK"} error={errors.identitas}>
          <input data-testid={`passenger-${idx}-identitas`} inputMode={orang && !t?.asing ? "numeric" : "text"} maxLength={orang && !t?.asing ? 16 : 30} className={inp} value={p.identitas || ""} onChange={set("identitas")} />
        </F>
        {orang && t?.asing && <F label="Kewarganegaraan" error={errors.negara}><input data-testid={`passenger-${idx}-negara`} className={inp} value={p.negara || ""} onChange={set("negara")} /></F>}
        <F label="No Telepon"><input data-testid={`passenger-${idx}-telp`} className={inp} value={p.telp || ""} onChange={set("telp")} /></F>
        <F label="Catatan"><input data-testid={`passenger-${idx}-catatan`} className={inp} value={p.catatan || ""} onChange={set("catatan")} /></F>
      </div>
    </div>
  );
};
