import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Building2, Mail, MapPin, Phone, Ship, Ticket } from "lucide-react";
import { useLookup, useStore } from "@/store/AppStore";
import { rupiah, statusKapal, tanggalPanjang, todayWita } from "@/lib/format";
import { PageFade, Reveal } from "@/components/motion/Motion";
import { StatusBadge } from "@/components/common/Badges";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useWitaClock } from "@/pages/landing/Schedule";

const Head = ({ eyebrow, title, sub }) => (
  <div className="mb-10">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">{eyebrow}</p>
    <h1 className="mt-2 font-display text-5xl font-bold tracking-[-0.03em] sm:text-6xl">{title}</h1>
    {sub && <p className="mt-3 max-w-xl text-slate-600">{sub}</p>}
  </div>
);
const wrap = "mx-auto max-w-[1280px] px-5 py-12 sm:px-8";

export const Riwayat = () => {
  const { customer, invoices, jadwal } = useStore();
  const L = useLookup();
  if (!customer) return (
    <div className={wrap} data-testid="riwayat-login-required">
      <Head eyebrow="Riwayat Pemesanan" title="Masuk dulu, ya." sub="Riwayat hanya tersedia untuk pelanggan yang login. Pesanan sebagai tamu tidak tercatat di akun." />
      <Link to="/tiket/login" className="rounded-full bg-[var(--ink)] px-6 py-3 font-semibold text-white">Masuk</Link>
    </div>
  );
  const mine = invoices.filter((i) => i.userEmail === customer.email);
  return (
    <PageFade className={wrap}>
      <div data-testid="riwayat-page">
        <Head eyebrow="Riwayat Pemesanan" title={`Halo, ${customer.nama.split(" ")[0]}.`} sub={`${mine.length} pemesanan tercatat di akun ${customer.email}.`} />
        {mine.length === 0 && <div className="rounded-[28px] bg-white p-10 text-center" data-testid="riwayat-empty"><Ticket className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold">Belum ada pemesanan</p><Link to="/tiket" className="mt-4 inline-block text-sm font-semibold text-[var(--sea)]">Cari jadwal →</Link></div>}
        <div className="flex flex-col gap-3">
          {mine.map((i) => {
            const j = L.detail(jadwal.find((x) => x.id === i.jadwalId));
            return (
              <Link key={i.id} to={`/tiket/transaction/${i.id}/status-payment`} data-testid={`riwayat-item-${i.id}`} className="group grid gap-3 rounded-[24px] bg-white p-5 transition-shadow hover:shadow-lg sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center">
                <div><p className="font-mono text-sm font-semibold">{i.id}</p><p className="text-xs text-slate-500">{tanggalPanjang(i.tanggal)}</p></div>
                <div><p className="font-semibold">{i.units[0]?.nama}</p><p className="text-xs text-slate-500">{i.units.length} unit · {j.armada.nama}</p></div>
                <div><p className="font-semibold">{rupiah(i.grandtotal)}</p><p className="text-xs text-slate-500">{i.metode === "qris" ? "QRIS" : "Virtual Account"}</p></div>
                <span className={`flex items-center gap-2 justify-self-start rounded-full px-3 py-1 text-xs font-semibold sm:justify-self-end ${i.status === 1 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{i.status === 1 ? "Lunas" : "Pending"}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </PageFade>
  );
};

export const JadwalPelayaran = () => {
  const { jadwal } = useStore();
  const L = useLookup();
  const now = useWitaClock();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const list = jadwal.filter((j) => j.jenis === "Regular").map(L.detail).filter((j) => `${j.asal.nama} ${j.tujuan.nama} ${j.armada.nama}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.jam.localeCompare(b.jam));
  return (
    <PageFade className={wrap}>
      <div data-testid="jadwal-pelayaran-page">
        <Head eyebrow="Jadwal Pelayaran" title="Semua jadwal reguler" sub="Jadwal tetap harian. Status kapal dihitung berdasarkan waktu WITA." />
        <input data-testid="jadwal-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari dermaga atau armada…" className="mb-6 w-full max-w-md rounded-full border border-slate-200 bg-white px-5 py-3 text-sm outline-none focus:border-[var(--teal)]" />
        <div className="overflow-x-auto rounded-[28px] bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr>{["Jam", "Rute", "Armada", "Kapal", "Status", ""].map((h) => <th key={h} className="px-6 py-4 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {list.map((j) => (
                <tr key={j.id} className="border-t border-slate-100 hover:bg-[var(--canvas)]" data-testid={`jadwal-row-${j.id}`}>
                  <td className="px-6 py-4 font-mono font-semibold text-[var(--ocean)]">{j.jam}</td>
                  <td className="px-6 py-4 font-semibold">{j.asal.nama} → {j.tujuan.nama}</td>
                  <td className="px-6 py-4">{j.armada.nama}</td>
                  <td className="px-6 py-4 text-slate-600">{j.kapal.nama}</td>
                  <td className="px-6 py-4"><StatusBadge status={statusKapal(j, now)} /></td>
                  <td className="px-6 py-4 text-right"><button data-testid={`jadwal-row-book-${j.id}`} onClick={() => nav(`/tiket/booking/${j.asal.zona}/${j.tujuan.zona}/${todayWita()}`)} className="rounded-full bg-[var(--foam)] px-4 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-100">Lihat tiket</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageFade>
  );
};

export const InfoPemesanan = () => (
  <PageFade className={wrap}>
    <div data-testid="info-pemesanan-page">
      <Head eyebrow="Info Pemesanan" title="Cara memesan tiket" sub="Empat langkah, tanpa harus membuat akun." />
      <div className="grid gap-4 md:grid-cols-4">
        {[["Cari jadwal", "Pilih zona asal, tujuan, dan tanggal keberangkatan."], ["Isi data", "Email pemesan, kepentingan, dan data tiap penumpang (NIK 16 digit / paspor)."], ["Bayar", "QRIS atau Virtual Account BPD Bali sebelum masa berlaku habis."], ["Terima tiket", "Barcode per unit tampil di status transaksi dan dikirim ke email."]].map(([t, d], i) => (
          <Reveal key={t} delay={i * 0.06} className="rounded-[28px] bg-white p-6">
            <span className="font-display text-5xl font-bold grad-text">0{i + 1}</span>
            <p className="mt-4 font-display text-xl font-bold">{t}</p>
            <p className="mt-2 text-sm text-slate-600">{d}</p>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 rounded-[28px] bg-white p-6 sm:p-8">
        <Accordion type="single" collapsible>
          {[["Apakah wajib login?", "Tidak. Anda dapat memesan sebagai tamu. Login hanya diperlukan agar pesanan tercatat di Riwayat Pemesanan."], ["Bagaimana dengan hewan atau kendaraan?", "Pilih jenis tiket non-orang, isi Nama Pemilik, Jumlah, dan No DK. Setiap unit mendapat barcode sendiri."], ["Kapan penjualan tiket ditutup?", "Penjualan ditutup beberapa jam sebelum keberangkatan sesuai pengaturan jadwal/armada (contoh: jadwal 15:00 dengan batas 2 jam ditutup 13:00 WITA)."], ["Barcode tidak muncul?", "Barcode tampil setelah invoice lunas dan nomor invoice Operator tersedia. Cek kembali halaman status transaksi."]].map(([q, a]) => (
            <AccordionItem key={q} value={q}><AccordionTrigger data-testid={`faq-${q.slice(0, 12)}`} className="text-left font-semibold">{q}</AccordionTrigger><AccordionContent className="text-slate-600">{a}</AccordionContent></AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </PageFade>
);

export const Partner = () => {
  const { master } = useStore();
  return (
    <PageFade className={wrap}>
      <div data-testid="partner-page">
        <Head eyebrow="Partner" title="Armada mitra" sub="Operator fast boat yang terhubung dengan Siwalatri." />
        <div className="grid gap-5 md:grid-cols-3">
          {master.armada.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.06} className="group overflow-hidden rounded-[28px] bg-white">
              <div className="relative h-44 overflow-hidden"><img src={["/img/boat.jpg", "/img/boat-aerial.jpg", "/img/pier.jpg"][i % 3]} alt={a.nama} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" /></div>
              <div className="p-6" data-testid={`partner-card-${a.id}`}>
                <p className="flex items-center gap-2 font-display text-xl font-bold"><Ship className="h-5 w-5 text-[var(--teal)]" />{a.nama}</p>
                <p className="mt-2 text-sm text-slate-600">{a.deskripsi}</p>
                <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Phone className="h-3.5 w-3.5" />{a.kontak}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{a.alamat}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </PageFade>
  );
};

export const Kontak = () => {
  const [f, setF] = useState({ nama: "", email: "", pesan: "" });
  return (
    <PageFade className={wrap}>
      <div data-testid="kontak-page" className="grid gap-8 lg:grid-cols-2">
        <div>
          <Head eyebrow="Kontak" title="Ada pertanyaan?" sub="Hubungi pengelola Siwalatri untuk bantuan pemesanan dan pembayaran." />
          <div className="flex flex-col gap-3 text-sm">
            {[[Building2, "[Alamat kantor pengelola]"], [Phone, "[Nomor telepon layanan]"], [Mail, "[Email layanan]"]].map(([I, t], k) => (
              <p key={k} className="flex items-center gap-3 rounded-2xl bg-white p-4"><I className="h-4 w-4 text-[var(--teal)]" />{t}</p>
            ))}
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Pesan terkirim (demo)"); setF({ nama: "", email: "", pesan: "" }); }} className="flex flex-col gap-4 rounded-[28px] bg-white p-6 sm:p-8">
          {["nama", "email"].map((k) => <input key={k} required data-testid={`kontak-${k}`} placeholder={k === "nama" ? "Nama" : "Email"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[var(--teal)]" />)}
          <textarea required data-testid="kontak-pesan" rows={5} placeholder="Pesan" value={f.pesan} onChange={(e) => setF({ ...f, pesan: e.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[var(--teal)]" />
          <button data-testid="kontak-submit" className="rounded-full bg-[var(--ink)] px-6 py-3.5 font-semibold text-white hover:bg-[var(--teal)]">Kirim Pesan</button>
        </form>
      </div>
    </PageFade>
  );
};
