import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, Clock3, CreditCard, Loader2, Plus, QrCode, ShieldCheck, Ship, UserRound } from "lucide-react";
import { useLookup, useStore } from "@/store/AppStore";
import { rupiah, salesInfo, tanggalPanjang } from "@/lib/format";
import { PassengerRow, validatePassenger } from "./PassengerRow";
import { GoogleIcon } from "@/components/auth/AuthSplit";
import { Dropdown, toOpts } from "@/components/common/Dropdown";

const card = "rounded-[28px] bg-white p-6 sm:p-8";
const STEPS = ["Pemeriksaan kuota Operator", "Pencatatan Siwalatri (penumpang-group)", "Pencatatan penjualan Operator", "Membuat tagihan pembayaran"];

const AuthChoice = ({ onGuest, redirect, googleLogin }) => (
  <div className={`${card} border-2 border-dashed border-teal-200`} data-testid="order-auth-choice">
    <p className="font-display text-xl font-bold">Login tidak wajib</p>
    <p className="mt-1 text-sm text-slate-600">Masuk agar pesanan tersimpan di Riwayat Pemesanan, atau lanjut sebagai tamu.</p>
    <div className="mt-5 grid gap-2 sm:grid-cols-2">
      <Link to={`/tiket/login?redirect=${encodeURIComponent(redirect)}`} data-testid="order-auth-login" className="rounded-full bg-[var(--ink)] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[var(--ocean)]">Masuk</Link>
      <Link to={`/tiket/register?redirect=${encodeURIComponent(redirect)}`} data-testid="order-auth-register" className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold hover:bg-slate-50">Daftar</Link>
      <button data-testid="order-auth-google" onClick={() => { googleLogin(); toast.success("Masuk dengan Google berhasil"); }} className="flex items-center justify-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold hover:bg-slate-200"><GoogleIcon />Google</button>
      <button data-testid="order-auth-guest" onClick={onGuest} className="rounded-full bg-[var(--foam)] px-5 py-3 text-sm font-semibold text-teal-800 hover:bg-teal-100">Lanjut sebagai Tamu</button>
    </div>
  </div>
);

export default function Order() {
  const { id, tanggal } = useParams();
  const loc = useLocation();
  const nav = useNavigate();
  const st = useStore();
  const L = useLookup();
  const raw = st.jadwal.find((j) => String(j.id) === id);
  const j = raw ? L.detail(raw) : null;
  const tikets = useMemo(() => (raw ? L.tikets(raw) : []), [raw, L]);
  const [guest, setGuest] = useState(false);
  const [email, setEmail] = useState(st.customer?.email || "");
  const [tujuanId, setTujuanId] = useState("3");
  const [pax, setPax] = useState([{ tiketId: tikets[0]?.id, jumlah: 1 }]);
  const [errors, setErrors] = useState({});
  const [metode, setMetode] = useState("qris");
  const [proc, setProc] = useState(-1);

  if (!j) return <div className="p-10 text-center" data-testid="order-not-found">Jadwal tidak ditemukan. <Link className="underline" to="/tiket">Kembali</Link></div>;

  const sales = salesInfo(raw, tanggal, st.cutoff);
  const kuota = L.kuota(raw, tanggal);
  const unitOf = (p) => (tikets.find((t) => t.id === p.tiketId)?.kategori === "orang" ? 1 : Number(p.jumlah) || 0);
  const totalUnit = pax.reduce((a, p) => a + unitOf(p), 0);
  const total = pax.reduce((a, p) => a + (tikets.find((t) => t.id === p.tiketId)?.harga || 0) * unitOf(p), 0);
  const byTiket = tikets.map((t) => ({ ...t, unit: pax.filter((p) => p.tiketId === t.id).reduce((a, p) => a + unitOf(p), 0) })).filter((t) => t.unit);
  const showForm = st.customer || guest;

  const submit = async () => {
    const errs = {};
    pax.forEach((p, i) => { const e = validatePassenger(p, tikets.find((t) => t.id === p.tiketId)); if (Object.keys(e).length) errs[i] = e; });
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Email tidak valid";
    setErrors(errs);
    if (Object.keys(errs).length) return toast.error("Periksa kembali data pemesanan");
    if (!sales.open) return toast.error(sales.reason);
    if (totalUnit > 1000) return toast.error("Total unit satu pengiriman maksimal 1.000");
    for (let s = 0; s < STEPS.length; s++) { setProc(s); await new Promise((r) => setTimeout(r, 650)); }
    if (totalUnit > L.kuota(raw, tanggal)) { setProc(-1); return toast.error(`Sisa kuota tidak mencukupi (${L.kuota(raw, tanggal)} unit)`); }
    // ekspansi jumlah non-orang menjadi unit per baris
    const units = pax.flatMap((p) => {
      const t = tikets.find((x) => x.id === p.tiketId);
      return Array.from({ length: unitOf(p) }, () => ({ nama: p.nama, jenis: t.nama, kategori: t.kategori, gender: p.gender || "-", identitas: p.identitas, negara: p.negara || "Indonesia", telp: p.telp, catatan: p.catatan, harga: t.harga }));
    });
    const inv = st.createInvoice({ jadwalId: raw.id, armadaId: raw.armadaId, tanggal, email, tujuanId: Number(tujuanId), metode, grandtotal: total, units, userEmail: st.customer?.email || null });
    if (st.customer) toast.success("Pesanan tersimpan di Riwayat Pemesanan");
    setProc(-1);
    nav(`/tiket/confirmation-payments/${inv.id}/${metode}`);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8" data-testid="order-page">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Pemesanan Tiket</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">{j.asal.nama} → {j.tujuan.nama}</h1>
      <p className="mt-2 text-slate-600">{tanggalPanjang(tanggal)} · {j.jam} WITA · {j.armada.nama}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-6">
          {!sales.open && <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700" data-testid="order-sales-closed">{sales.reason}</div>}
          {!showForm && <AuthChoice onGuest={() => setGuest(true)} redirect={loc.pathname} googleLogin={st.googleLogin} />}
          {st.customer && <div className="flex items-center gap-3 rounded-2xl bg-[var(--foam)] p-4 text-sm" data-testid="order-logged-in"><UserRound className="h-4 w-4 shrink-0 text-teal-700" /><span>Masuk sebagai <b>{st.customer.nama}</b> — pesanan akan dicatat ke riwayat.</span></div>}
          {guest && !st.customer && <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900" data-testid="order-guest-note">Anda memesan sebagai tamu. Transaksi tetap dibuat, tetapi tidak tercatat di riwayat akun.</div>}

          {showForm && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <section className={card}>
                <h2 className="font-display text-xl font-bold">Data Pemesan</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Email (invoice & tiket dikirim ke sini)</span>
                    <input data-testid="order-email" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--teal)]" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" />
                    {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email}</span>}
                  </label>
                  <div className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Kepentingan penumpang</span>
                    <Dropdown testid="order-kepentingan" sub="Kepentingan" value={tujuanId} onChange={setTujuanId} options={toOpts(st.master.tujuan)} />
                  </div>
                </div>
              </section>

              <section className={card}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-bold">Penumpang <span className="text-slate-400">· {totalUnit} unit</span></h2>
                  <button data-testid="order-add-passenger" onClick={() => setPax([...pax, { tiketId: tikets[0].id, jumlah: 1 }])} className="flex items-center gap-1.5 rounded-full bg-[var(--foam)] px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-100"><Plus className="h-4 w-4" />Tambah</button>
                </div>
                <p className="mt-1 text-xs text-slate-500">Setiap formulir orang = 1 unit tiket. Untuk kendaraan/hewan isi jumlah, sistem akan memecah per unit.</p>
                <div className="mt-5 flex flex-col gap-4">
                  {pax.map((p, i) => (
                    <PassengerRow key={i} idx={i} p={p} tikets={tikets} errors={errors[i]} onChange={(np) => setPax(pax.map((x, k) => (k === i ? np : x)))} onRemove={pax.length > 1 ? () => setPax(pax.filter((_, k) => k !== i)) : null} />
                  ))}
                </div>
              </section>

              <section className={card}>
                <h2 className="font-display text-xl font-bold">Metode Pembayaran</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[{ id: "qris", label: "QRIS", sub: "Scan dari e-wallet / m-banking", Icon: QrCode }, { id: "va", label: "Virtual Account", sub: "BPD Bali · echo-test OK", Icon: CreditCard }].map(({ id: mid, label, sub, Icon }) => (
                    <button key={mid} data-testid={`order-metode-${mid}`} onClick={() => setMetode(mid)} className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors ${metode === mid ? "border-[var(--teal)] bg-[var(--foam)]" : "border-slate-200 hover:border-slate-300"}`}>
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${metode === mid ? "grad-sea text-white" : "bg-slate-100"}`}><Icon className="h-5 w-5" /></span>
                      <span><span className="block font-semibold">{label}</span><span className="text-xs text-slate-600">{sub}</span></span>
                      {metode === mid && <CheckCircle2 className="ml-auto h-5 w-5 text-[var(--teal)]" />}
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[28px] bg-[var(--ink)] text-white" data-testid="order-summary">
            <div className="relative p-6 sm:p-8">
              <div className="absolute inset-0 grad-sea opacity-40" />
              <div className="relative">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--mint)]"><Ship className="h-4 w-4" />Ringkasan</p>
                <div className="mt-5 flex items-end justify-between">
                  <div><p className="text-xs text-slate-300">{j.asal.wilayah}</p><p className="font-display text-2xl font-bold">{j.asal.nama}</p></div>
                  <span className="font-mono text-lg">{j.jam}</span>
                  <div className="text-right"><p className="text-xs text-slate-300">{j.tujuan.wilayah}</p><p className="font-display text-2xl font-bold">{j.tujuan.nama}</p></div>
                </div>
                <p className="mt-4 text-sm text-slate-300">{j.kapal.nama} · Nahkoda {j.nahkoda.nama}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white/10 px-3 py-1" data-testid="order-kuota">Sisa kuota {kuota}</span>
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><Clock3 className="h-3 w-3" />Tutup {sales.closeLabel} WITA</span>
                </div>
              </div>
            </div>
            <div className="border-t border-dashed border-white/20 p-6 sm:p-8">
              {byTiket.map((t) => (
                <div key={t.id} className="mb-3">
                  <div className="flex justify-between text-sm"><span>{t.nama} × {t.unit}</span><span className="font-mono">{rupiah(t.harga * t.unit)}</span></div>
                  {t.kategori === "orang" && t.harga >= 75000 && (
                    <p className="mt-0.5 text-[11px] text-slate-300">Tiket {rupiah(Math.round(t.harga * 0.72))} · JR {rupiah(Math.round(t.harga * 0.24))} · ATJP-K {rupiah(t.harga - Math.round(t.harga * 0.72) - Math.round(t.harga * 0.24))}</p>
                  )}
                </div>
              ))}
              <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-4">
                <span className="text-sm text-slate-300">Total</span>
                <span className="font-display text-3xl font-bold" data-testid="order-total">{rupiah(total)}</span>
              </div>
              {totalUnit > kuota && <p className="mt-3 text-xs font-semibold text-amber-300" data-testid="order-kuota-warning">Jumlah unit melebihi sisa kuota ({kuota})</p>}
              <button data-testid="order-submit" disabled={!showForm || proc >= 0 || !sales.open || totalUnit > kuota} onClick={submit}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--mint)] px-6 py-4 font-semibold text-[var(--ink)] transition-colors hover:bg-white disabled:opacity-50">
                {proc >= 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Bayar dengan {metode === "qris" ? "QRIS" : "Virtual Account"}
              </button>
              <p className="mt-3 text-center text-[11px] text-slate-300">Harga divalidasi ulang di server · kuota final oleh Operator</p>
            </div>
          </div>
          <AnimatePresence>
            {proc >= 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-3xl bg-white p-5" data-testid="order-processing">
                {STEPS.map((s, i) => (
                  <p key={s} className={`flex items-center gap-2 py-1 text-sm ${i <= proc ? "text-[var(--ink)]" : "text-slate-400"}`}>
                    {i < proc ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : i === proc ? <Loader2 className="h-4 w-4 animate-spin text-[var(--teal)]" /> : <span className="h-4 w-4 rounded-full border border-slate-300" />}
                    Tahap {String.fromCharCode(65 + i)} — {s}
                  </p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}
