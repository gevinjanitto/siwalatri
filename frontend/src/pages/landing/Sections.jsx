import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { DESTINASI } from "@/data/mock";
import { Chip } from "@/components/common/Badges";
import { Marquee, Reveal } from "@/components/motion/Motion";
import { KlungkungLogo, LogoMark } from "@/components/brand/Logo";

export const MaiHartaCredit = () => (
  <p data-testid="footer-credit">Design &amp; Develop by{" "}
    <a href="https://maiharta.com/" target="_blank" rel="noreferrer" data-testid="footer-maiharta-link" className="font-semibold text-[var(--ink)] underline decoration-[var(--mint)] decoration-2 underline-offset-4 transition-colors hover:text-[var(--teal)]">MaiHarta</a>
  </p>
);

export const Destinations = () => {
  const track = useRef(null);
  const scroll = (d) => track.current?.scrollBy({ left: d * 360, behavior: "smooth" });
  return (
    <section id="destinasi" className="bg-white py-24 sm:py-32" data-testid="destination-section">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.6fr]">
          <Reveal className="flex flex-col justify-between gap-10">
            <div>
              <Chip>02 · Destinasi</Chip>
              <h2 className="mt-6 font-display text-6xl font-bold tracking-[-0.04em] sm:text-8xl">Destinasi</h2>
              <p className="mt-6 max-w-sm font-display text-2xl font-medium leading-snug text-slate-700">Menyingkap Keajaiban. <span className="grad-text">Menciptakan Kenangan.</span></p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a data-testid="destination-all-btn" href="https://klungkungtourism.id/" target="_blank" rel="noreferrer" className="group flex items-center gap-2 rounded-full bg-[var(--ink)] px-7 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--teal)]">
                Semua Destinasi <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
              </a>
              <div className="flex gap-2">
                <button data-testid="destination-prev-btn" onClick={() => scroll(-1)} className="flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Prev</button>
                <button data-testid="destination-next-btn" onClick={() => scroll(1)} className="flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50">Next<ArrowRight className="h-4 w-4" /></button>
              </div>
            </div>
          </Reveal>
          <div ref={track} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 scrollbar-none" data-testid="destination-track">
            {[...DESTINASI, ...DESTINASI.map((d) => ({ ...d, slug: d.slug + "-2" }))].map((d, i) => (
              <a key={d.slug} href="https://klungkungtourism.id/" target="_blank" rel="noreferrer" data-testid={`destination-card-${d.slug}`}
                className={`group relative shrink-0 snap-start overflow-hidden rounded-[32px] w-[78vw] sm:w-[340px] ${i % 2 ? "h-[440px] sm:mt-16" : "h-[480px]"}`}>
                <img src={d.img} alt={d.nama} className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,34,58,0.9)] via-[rgba(6,34,58,0.15)] to-transparent" />
                <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--ink)] backdrop-blur">{d.tag}</span>
                <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-[transform,background-color] group-hover:rotate-45 group-hover:bg-[var(--mint)] group-hover:text-[var(--ink)]"><ArrowUpRight className="h-4 w-4" /></span>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="flex items-center gap-1.5 text-xs text-white/85"><MapPin className="h-3.5 w-3.5" />{d.lokasi}</p>
                  <p className="mt-1 font-display text-3xl font-bold">{d.nama}</p>
                  <p className="mt-2 max-w-[280px] text-sm text-white/85">{d.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const DockMarquee = () => (
  <section className="overflow-hidden bg-[var(--ink)] py-12 text-white" data-testid="dock-marquee-section">
    <Marquee items={["Sampalan", "Tribuana", "Kampung Kusamba", "Kusamba-Banjar Bias", "Junggutbatu"]} />
  </section>
);

export const CtaBand = () => (
  <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-10" data-testid="cta-section">
    <Reveal className="relative overflow-hidden rounded-[36px] grad-sea grain p-8 text-white sm:p-14">
      <img src="/img/boat-aerial.jpg" alt="" className="absolute right-0 top-0 hidden h-full w-1/2 object-cover opacity-40 mix-blend-luminosity md:block [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)]" />
      <div className="relative max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Siwalatri Terpadu</p>
        <h3 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl">Satu aplikasi untuk pelanggan dan petugas pelabuhan.</h3>
        <p className="mt-5 text-white/90">Pelanggan memesan tiket tanpa harus login. Petugas memantau jadwal, manifest, pembayaran, dan laporan dari satu dashboard.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/tiket" data-testid="cta-tiket-btn" className="rounded-full bg-white px-7 py-3.5 font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--mint)]">Buka Modul Tiket</Link>
          <Link to="/login" data-testid="cta-petugas-btn" className="rounded-full border border-white/50 px-7 py-3.5 font-semibold transition-colors hover:bg-white/15">Masuk Modul Petugas</Link>
        </div>
      </div>
    </Reveal>
  </section>
);

export const Footer = () => (
  <footer className="border-t border-slate-200 bg-white" data-testid="site-footer">
    <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-14 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-10">
      <div>
        <div className="flex items-center gap-3"><KlungkungLogo className="h-12 w-auto" /><LogoMark /><span className="font-display text-xl font-bold">Siwalatri</span></div>
        <p className="mt-4 max-w-sm text-sm text-slate-600">Sistem terpadu pengawasan pelayaran dan pemesanan tiket kapal Kabupaten Klungkung.</p>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <p className="font-semibold">Jelajahi</p>
        <a href="#jadwal" className="text-slate-600 hover:text-[var(--sea)]">Jadwal</a>
        <a href="#destinasi" className="text-slate-600 hover:text-[var(--sea)]">Destinasi</a>
        <Link to="/tiket" className="text-slate-600 hover:text-[var(--sea)]">Pesan Tiket</Link>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <p className="font-semibold">Layanan</p>
        <Link to="/tiket/contact-us" className="text-slate-600 hover:text-[var(--sea)]">Kontak</Link>
        <Link to="/login" className="text-slate-600 hover:text-[var(--sea)]">Login Petugas</Link>
        <a href="https://klungkungtourism.id/" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-[var(--sea)]">klungkungtourism.id</a>
      </div>
    </div>
    <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-100 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:px-10 max-w-[1400px] mx-auto">
      <p>© 2026 Siwalatri Terpadu · Kabupaten Klungkung</p>
      <MaiHartaCredit />
    </div>
  </footer>
);
