import { useLocation } from "react-router-dom";
import { CrudTable } from "./CrudTable";
import { PageTitle } from "./AdminLayout";
import { rupiah } from "@/lib/format";

const opt = (key, label = "nama") => (m) => m[key].map((x) => ({ value: x.id, label: x[label] }));
const name = (key, id, m) => m[key].find((x) => String(x.id) === String(id))?.nama || "-";
const pill = (t, tone = "bg-[var(--foam)] text-teal-800") => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{t}</span>;
const TYPES = ["admin", "syahbandar", "armada", "pelabuhan", "nahkoda", "loket", "wisata", "pelapor"];

export const CONFIGS = {
  "/master/kapal": {
    entity: "kapal", title: "Master Kapal", sub: "Daftar kapal, relasi armada, kapasitas, dan atribut teknis.", singular: "Kapal",
    filter: { key: "armadaId", label: "Armada", options: opt("armada") },
    columns: [
      { key: "id", label: "ID Kapal", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
      { key: "nama", label: "Nama", render: (r) => <b>{r.nama}</b> },
      { key: "armadaId", label: "Armada", render: (r, m) => name("armada", r.armadaId, m) },
      { key: "jenis", label: "Jenis" },
      { key: "status", label: "Status", render: (r) => pill(r.status, r.status === "Aktif" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800") },
      { key: "kapasitas", label: "Penumpang / Kru", render: (r) => `${r.kapasitas} / ${r.kru}` },
      { key: "grt", label: "GRT / DWT", render: (r) => `${r.grt} / ${r.dwt}` },
      { key: "callsign", label: "Call Sign" },
    ],
    fields: [
      { key: "id", label: "ID Kapal", required: true, onlyOn: "create" }, { key: "nama", label: "Nama Kapal", required: true },
      { key: "armadaId", label: "Armada", type: "select", options: opt("armada"), required: true },
      { key: "jenis", label: "Jenis", type: "select", options: () => ["Fast Boat", "Fast Cruise", "Kapal Kayu", "Ro-Ro"].map((v) => ({ value: v, label: v })) },
      { key: "status", label: "Status", type: "select", options: () => ["Aktif", "Docking", "Nonaktif"].map((v) => ({ value: v, label: v })) },
      { key: "kapasitas", label: "Kapasitas Penumpang", type: "number", required: true }, { key: "kru", label: "Kapasitas Kru", type: "number" },
      { key: "grt", label: "GRT", type: "number" }, { key: "dwt", label: "DWT", type: "number" }, { key: "callsign", label: "Call Sign" }, { key: "mesin", label: "Mesin" },
    ],
  },
  "/master/penumpang": {
    entity: "jenisPenumpang", title: "Jenis Penumpang", sub: "Kategori tiket: orang, kendaraan, hewan. ID dipakai lintas aplikasi — selaraskan dengan Operator.", singular: "Jenis Penumpang",
    deleteNote: "ID kategori dipakai Operator; pastikan sudah diselaraskan.",
    columns: [
      { key: "id", label: "ID", render: (r) => <span className="font-mono">{r.id}</span> }, { key: "nama", label: "Nama", render: (r) => <b>{r.nama}</b> },
      { key: "kategori", label: "Kategori", render: (r) => pill(r.kategori) }, { key: "asing", label: "WNA", render: (r) => (r.asing ? "Ya" : "Tidak") },
    ],
    fields: [{ key: "nama", label: "Nama", required: true }, { key: "kategori", label: "Kategori", type: "select", required: true, options: () => ["orang", "kendaraan", "hewan", "lainnya"].map((v) => ({ value: v, label: v })) }],
  },
  "/master/dermaga": {
    entity: "dermaga", title: "Dermaga & Zona", sub: "Zona dipakai modul tiket untuk pencarian asal/tujuan.", singular: "Dermaga",
    filter: { key: "zona", label: "Zona", options: opt("zona") },
    columns: [{ key: "nama", label: "Dermaga", render: (r) => <b>{r.nama}</b> }, { key: "wilayah", label: "Wilayah" }, { key: "lokasi", label: "Lokasi" }, { key: "zona", label: "Zona", render: (r, m) => pill(name("zona", r.zona, m)) }, { key: "syahbandar", label: "Syahbandar" }],
    fields: [{ key: "nama", label: "Nama", required: true }, { key: "wilayah", label: "Wilayah" }, { key: "lokasi", label: "Lokasi", full: true }, { key: "zona", label: "Zona", type: "select", options: opt("zona"), required: true }, { key: "syahbandar", label: "Syahbandar" }],
  },
  "/master/rute": {
    entity: "rute", title: "Rute", sub: "Dermaga awal → dermaga tujuan. ID rute dipakai jadwal.", singular: "Rute",
    columns: [{ key: "id", label: "ID", render: (r) => <span className="font-mono">{r.id}</span> }, { key: "awal", label: "Tujuan Awal", render: (r, m) => <b>{name("dermaga", r.awal, m)}</b> }, { key: "akhir", label: "Tujuan Akhir", render: (r, m) => <b>{name("dermaga", r.akhir, m)}</b> }, { key: "jarak", label: "Jarak", render: (r) => `${r.jarak} km` }],
    fields: [{ key: "awal", label: "Dermaga Awal", type: "select", options: opt("dermaga"), required: true }, { key: "akhir", label: "Dermaga Tujuan", type: "select", options: opt("dermaga"), required: true }, { key: "jarak", label: "Jarak (km)", type: "number" }],
    validate: (d) => (d.awal === d.akhir ? "Dermaga awal dan tujuan tidak boleh sama" : null),
  },
  "/master/tujuan-penumpang": {
    entity: "tujuan", title: "Tujuan Penumpang", sub: "Kepentingan perjalanan — tampil sebagai “Kepentingan penumpang” di modul tiket.", singular: "Tujuan",
    columns: [{ key: "id", label: "ID", render: (r) => <span className="font-mono">{r.id}</span> }, { key: "nama", label: "Kepentingan", render: (r) => <b>{r.nama}</b> }],
    fields: [{ key: "nama", label: "Nama", required: true, full: true }],
  },
  "/master/sop": {
    entity: "sop", title: "Master SOP", sub: "Butir pemeriksaan SOP. Hasil per jadwal tersimpan di sop_keberangkatan.", singular: "Butir SOP",
    columns: [{ key: "id", label: "No", render: (r) => <span className="font-mono">{r.id}</span> }, { key: "nama", label: "Butir Pemeriksaan", render: (r) => <b>{r.nama}</b> }],
    fields: [{ key: "nama", label: "Butir pemeriksaan", required: true, full: true, type: "textarea" }],
  },
  "/user/petugas": {
    entity: "petugas", title: "Petugas", sub: "Kelola akun pengguna dashboard.", singular: "Petugas",
    filter: { key: "type", label: "Tipe", options: () => TYPES.map((v) => ({ value: v, label: v })) },
    columns: [
      { key: "nama", label: "Nama", render: (r) => <span className="flex items-center gap-3">{r.foto ? <img src={r.foto} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full grad-sea text-xs font-bold text-white">{r.nama[0]}</span>}<b>{r.nama}</b></span> },
      { key: "email", label: "Email" }, { key: "type", label: "Tipe", render: (r) => pill(r.type) },
    ],
    fields: [
      { key: "nama", label: "Nama", required: true }, { key: "email", label: "Email", required: true },
      { key: "type", label: "Tipe", type: "select", required: true, options: () => TYPES.map((v) => ({ value: v, label: v })) },
      { key: "foto", label: "Foto Profil", type: "file" },
      { key: "_pwNow", label: "Password saat ini (wajib)", type: "password", onlyOn: "update" }, { key: "_pwNew", label: "Password baru (opsional)", type: "password" },
    ],
    validate: (d, mode) => (mode === "update" && !d._pwNow ? "Password saat ini dari user yang diedit wajib diisi" : !/^\S+@\S+\.\S+$/.test(d.email || "") ? "Email tidak valid" : null),
  },
  "/user/operator-armada": {
    entity: "armada", title: "Operator Armada", sub: "Profil badan/operator armada dan relasi ke akun user tipe armada.", singular: "Operator",
    columns: [{ key: "nama", label: "Operator", render: (r) => <b>{r.nama}</b> }, { key: "user", label: "Akun User" }, { key: "kontak", label: "Kontak" }, { key: "alamat", label: "Alamat" }, { key: "sumber", label: "Sumber Data", render: (r) => pill(r.sumber || "database") }],
    fields: [
      { key: "user", label: "User Armada", type: "select", required: true, options: (m) => m.petugas.filter((p) => p.type === "armada").map((p) => ({ value: p.email, label: `${p.nama} (${p.email})` })) },
      { key: "nama", label: "Nama Operator", required: true }, { key: "kontak", label: "Kontak" }, { key: "alamat", label: "Alamat" }, { key: "deskripsi", label: "Deskripsi", type: "textarea", full: true },
    ],
  },
  "/pengumuman": {
    entity: "pengumuman", title: "Pengumuman", sub: "Tampil di landing page dan beranda modul tiket.", singular: "Pengumuman",
    columns: [{ key: "judul", label: "Judul", render: (r) => <b>{r.judul}</b> }, { key: "deskripsi", label: "Deskripsi", render: (r) => <span className="line-clamp-2 max-w-md text-slate-600">{r.deskripsi}</span> }, { key: "tanggal", label: "Tanggal" }],
    fields: [{ key: "judul", label: "Judul", required: true, full: true }, { key: "deskripsi", label: "Deskripsi", type: "textarea", required: true, full: true }, { key: "tanggal", label: "Tanggal", type: "date" }],
  },
  barang: {
    entity: "barang", singular: "Barang",
    columns: [{ key: "nama", label: "Barang", render: (r) => <b>{r.nama}</b> }, { key: "harga", label: "Tarif", render: (r) => rupiah(r.harga) }],
    fields: [{ key: "nama", label: "Nama barang", required: true }, { key: "harga", label: "Tarif", type: "number", required: true }],
  },
};

export default function CrudPage() {
  const { pathname } = useLocation();
  const c = CONFIGS[pathname];
  if (!c) return null;
  return (
    <div data-testid={`page-${c.entity}`}>
      <PageTitle title={c.title} sub={c.sub} />
      <CrudTable key={pathname} entity={c.entity} config={c} />
    </div>
  );
}
