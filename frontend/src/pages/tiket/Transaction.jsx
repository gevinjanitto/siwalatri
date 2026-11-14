import { Link, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Mail, Printer, Ship } from "lucide-react";
import { useLookup, useStore } from "@/store/AppStore";
import { rupiah, tanggalPanjang } from "@/lib/format";

const TicketStub = ({ u, i, j, tanggal, paid }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="grid overflow-hidden rounded-[28px] bg-white sm:grid-cols-[1fr_auto]" data-testid={`ticket-unit-${i}`}>
    <div className="relative p-6">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold text-[var(--sea)]"><Ship className="h-4 w-4" />{j.armada.nama}</span>
        <span className="rounded-full bg-[var(--foam)] px-3 py-1 text-xs font-semibold text-teal-800">{u.jenis}</span>
      </div>
      <p className="mt-4 font-display text-2xl font-bold">{u.nama}</p>
      <p className="text-xs text-slate-500">{u.kategori === "orang" ? `${u.gender} · ${u.identitas}` : `No DK ${u.identitas}`}</p>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div><p className="text-[11px] text-slate-500">Dari</p><p className="font-semibold">{j.asal.nama}</p></div>
        <div><p className="text-[11px] text-slate-500">Ke</p><p className="font-semibold">{j.tujuan.nama}</p></div>
        <div><p className="text-[11px] text-slate-500">Berangkat</p><p className="font-semibold">{j.jam} WITA</p></div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{tanggalPanjang(tanggal)} · {j.kapal.nama}</p>
    </div>
    <div className="relative flex flex-col items-center justify-center gap-2 border-t-2 border-dashed border-slate-200 bg-[var(--canvas)] p-6 sm:border-l-2 sm:border-t-0 bg-[var(--foam)]">
      <span className="absolute -left-3 -top-3 hidden h-6 w-6 rounded-full bg-[var(--canvas)] sm:block" />
      {paid ? <div className="rounded-2xl bg-white p-3"><QRCode value={u.kodeBooking} size={110} fgColor="#06223A" /></div>
        : <div className="flex h-[134px] w-[134px] items-center justify-center rounded-2xl bg-white text-center text-xs text-slate-500">Barcode tampil setelah lunas</div>}
      <p className="font-mono text-xs font-semibold" data-testid={`ticket-kode-${i}`}>{u.kodeBooking}</p>
    </div>
  </motion.div>
);

export default function Transaction() {
  const { invoice } = useParams();
  const { invoices, jadwal } = useStore();
  const L = useLookup();
  const inv = invoices.find((i) => i.id === invoice);
  if (!inv) return <div className="p-10 text-center" data-testid="transaction-not-found">Invoice tidak ditemukan. <Link to="/tiket" className="underline">Beranda</Link></div>;
  const j = L.detail(jadwal.find((x) => x.id === inv.jadwalId));
  const paid = inv.status === 1;
  return (
    <div className="mx-auto max-w-[1080px] px-5 py-10 sm:px-8" data-testid="transaction-page">
      <div className={`relative overflow-hidden rounded-[32px] p-8 text-white sm:p-10 ${paid ? "grad-sea" : "bg-slate-700"}`}>
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold" data-testid="transaction-status">
              {paid ? <CheckCircle2 className="h-5 w-5 text-[var(--mint)]" /> : <Clock className="h-5 w-5" />}{paid ? "Lunas · Terverifikasi" : "Belum dibayar"}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{paid ? "Tiket Anda siap." : "Menunggu pembayaran"}</h1>
            <p className="mt-2 text-white/85">Invoice <span className="font-mono">{inv.id}</span> · Operator <span className="font-mono">{inv.noInvoice}</span></p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-white/80">Total · {inv.metode === "qris" ? "QRIS" : "Virtual Account"}</p>
            <p className="font-display text-4xl font-bold">{rupiah(inv.grandtotal)}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3 no-print">
        {paid ? (
          <>
            <button data-testid="transaction-print" onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--ocean)]"><Printer className="h-4 w-4" />Cetak / Simpan PDF</button>
            <button data-testid="transaction-email" onClick={() => toast.success(`E-tiket dikirim ulang ke ${inv.email}`)} className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold"><Mail className="h-4 w-4" />Kirim ulang email</button>
          </>
        ) : (
          <Link to={`/tiket/confirmation-payments/${inv.id}/${inv.metode}`} data-testid="transaction-pay-now" className="rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white">Bayar sekarang</Link>
        )}
        <Link to="/tiket" data-testid="transaction-home" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold">Pesan lagi</Link>
      </div>
      <h2 className="mt-10 font-display text-2xl font-bold">Detail tiket · {inv.units.length} unit</h2>
      <div className="mt-4 flex flex-col gap-4">
        {inv.units.map((u, i) => <TicketStub key={u.kodeBooking} u={u} i={i} j={j} tanggal={inv.tanggal} paid={paid} />)}
      </div>
    </div>
  );
}
