import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Copy, Loader2, RefreshCcw, Timer } from "lucide-react";
import { useLookup, useStore } from "@/store/AppStore";
import { rupiah, tanggalPanjang } from "@/lib/format";
import { PageFade } from "@/components/motion/Motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const useCountdown = (sec) => {
  const [s, setS] = useState(sec);
  useEffect(() => { const t = setInterval(() => setS((x) => Math.max(0, x - 1)), 1000); return () => clearInterval(t); }, []);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export default function Confirmation() {
  const { invoice, metode } = useParams();
  const { invoices, jadwal, payInvoice } = useStore();
  const L = useLookup();
  const nav = useNavigate();
  const inv = invoices.find((i) => i.id === invoice);
  const left = useCountdown(metode === "qris" ? 15 * 60 : 24 * 3600 - 1);
  const [checking, setChecking] = useState(false);
  if (!inv) return <div className="p-10 text-center" data-testid="confirmation-not-found">Invoice tidak ditemukan. <Link to="/tiket" className="underline">Beranda</Link></div>;
  const j = L.detail(jadwal.find((x) => x.id === inv.jadwalId));

  const check = async () => {
    setChecking(true);
    await new Promise((r) => setTimeout(r, 1200));
    payInvoice(inv.id);
    setChecking(false);
    toast.success(`Pembayaran terverifikasi. E-tiket dikirim ke ${inv.email}`);
    nav(`/tiket/transaction/${inv.id}/status-payment`);
  };

  return (
    <PageFade className="mx-auto max-w-[1080px] px-5 py-10 sm:px-8">
      <div data-testid="confirmation-page">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Konfirmasi Pembayaran · {metode === "qris" ? "QRIS" : "Virtual Account"}</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">Selesaikan pembayaran</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <div className="rounded-[32px] bg-white p-6 text-center sm:p-10">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800" data-testid="confirmation-countdown"><Timer className="h-4 w-4" />Berlaku {left}</div>
            {metode === "qris" ? (
              <>
                <div className="mx-auto mt-6 w-fit rounded-3xl border-[10px] border-[var(--foam)] bg-white p-4" data-testid="confirmation-qris">
                  <QRCode value={inv.qrValue || inv.id} size={220} fgColor="#06223A" />
                </div>
                <p className="mt-4 text-xs text-slate-500">NMID ID1020261130{inv.id.slice(-3)} · SIWALATRI KLUNGKUNG</p>
              </>
            ) : (
              <div className="mt-8" data-testid="confirmation-va">
                <p className="text-sm text-slate-600">Nomor Virtual Account BPD Bali</p>
                <p className="mt-2 font-mono text-3xl font-bold tracking-wider text-[var(--ocean)] sm:text-4xl" data-testid="confirmation-va-number">{inv.noVa}</p>
                <button data-testid="confirmation-va-copy" onClick={() => { navigator.clipboard?.writeText(inv.noVa); toast.success("Nomor VA disalin"); }} className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-[var(--foam)] px-4 py-2 text-sm font-semibold text-teal-800"><Copy className="h-4 w-4" />Salin</button>
                <Accordion type="single" collapsible className="mt-6 text-left">
                  {[["ATM BPD Bali", "Pilih Transfer › Virtual Account › masukkan nomor VA › konfirmasi nominal."], ["Mobile Banking", "Buka aplikasi › Pembayaran › Virtual Account › tempel nomor VA › bayar."], ["Teller", "Sebutkan nomor VA kepada teller BPD Bali terdekat."]].map(([t, d]) => (
                    <AccordionItem key={t} value={t}><AccordionTrigger data-testid={`va-guide-${t}`}>{t}</AccordionTrigger><AccordionContent className="text-slate-600">{d}</AccordionContent></AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
            <p className="mt-6 font-display text-4xl font-bold" data-testid="confirmation-total">{rupiah(inv.grandtotal)}</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-[28px] bg-white p-6">
              <p className="text-xs uppercase tracking-widest text-slate-500">Invoice</p>
              <p className="font-mono text-lg font-semibold" data-testid="confirmation-invoice">{inv.id}</p>
              <p className="mt-1 text-xs text-slate-500">No. invoice Operator: <span className="font-mono">{inv.noInvoice}</span></p>
              <div className="mt-4 space-y-1 text-sm">
                <p><b>{j.asal.nama} → {j.tujuan.nama}</b></p>
                <p className="text-slate-600">{tanggalPanjang(inv.tanggal)} · {j.jam} WITA</p>
                <p className="text-slate-600">{j.armada.nama} · {inv.units.length} unit</p>
              </div>
            </div>
            <button data-testid="confirmation-check-status" onClick={check} disabled={checking} className="flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-6 py-4 font-semibold text-white transition-colors hover:bg-[var(--teal)] disabled:opacity-60">
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />} Cek Status Pembayaran
            </button>
            <Link to={`/tiket/transaction/${inv.id}/status-payment`} data-testid="confirmation-view-transaction" className="rounded-full border border-slate-300 px-6 py-4 text-center font-semibold hover:bg-white">Lihat Status Transaksi</Link>
            <p className="rounded-2xl bg-[var(--foam)] p-4 text-xs text-teal-900">Prototipe: tombol “Cek Status Pembayaran” mensimulasikan inquiry ke BPD Bali dan menandai invoice lunas.</p>
          </div>
        </div>
      </div>
    </PageFade>
  );
}
