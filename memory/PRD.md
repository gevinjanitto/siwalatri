# PRD — Siwalatri Terpadu (UI Prototipe)

## Original problem statement
"Buatkan ui yang modern dan fresh dari file .md yang tak kirim, buat yang lengkap persis kayak yang di .md. tu tak kasi referensi uinya ya buat di figma dan udah nyambung klik kliknya ya. buat tema warana biru ke hijau hijauan ya"
(File: DOKUMENTASI-gabungan.md — Sistem Terpadu Siwalatri + Tix; referensi UI: Realty Hub dashboard, Kreative login, Visa Travels landing)

## User choices
- Prototipe klik dengan data contoh (frontend-only, tanpa pembayaran/login sungguhan)
- Semua bagian: Landing, Modul Tiket, Modul Petugas
- Gaya campuran: landing ala Visa Travels, login ala Kreative, dashboard ala Realty Hub
- Bahasa Indonesia; tema biru → hijau

## Architecture
- React (CRA) + Tailwind + shadcn, framer-motion, lenis, recharts, react-qr-code
- State global: `src/store/AppStore.js` (React context, persist ke localStorage) — MOCK, tanpa backend
- Data contoh: `src/data/mock.js`; aturan bisnis: `src/lib/format.js` (status kapal WITA, cutoff penjualan)
- Modul Tiket di prefix `/tiket` (pengganti subdomain tiket.)

## Implemented (2026-11-14)
- Landing: hero masked reveal + parallax, search strip, pengumuman, jadwal hari ini (Persiapan/Berlayar/Sandar), marquee dermaga, destinasi carousel, CTA, footer
- Modul Tiket: beranda + pencarian zona (zona akhir dinamis), daftar keberangkatan (strip tanggal, filter armada, kuota, cutoff), order (login/daftar/Google/tamu, penumpang orang & non-orang, validasi NIK 16 digit/paspor, ekspansi jumlah, rincian harga, QRIS/VA, tahap A–E), konfirmasi QRIS (QR) / VA, status transaksi + barcode per unit, login/register (validasi sesuai dok, safe redirect), riwayat, jadwal pelayaran, info pemesanan, partner, kontak, idle logout 15 menit
- Modul Petugas: login (validasi, "Email not found"), dashboard (profil, status kapal, pembayaran cash/QRIS/VA harian/bulanan + chart, jadwal hari ini, armada eksternal api/database, live feed), profil, CRUD master (kapal, jenis penumpang, dermaga, rute, tujuan, SOP, petugas+foto, operator armada, pengumuman, barang), jadwal & approval (SOP, start/stop/reset, operasional, tiket per jadwal, history, tambah jadwal/Extra Trip), manifest & barang/ekspedisi, laporan harian/bulanan/penumpang/transaksi (CSV/print), rekonsiliasi VA/QRIS (filter), batas penjualan tiket (sistem/armada/jadwal, toggle manual, audit log)

## Iterasi 2 (2026-11-14)
- Logo Pemkab Klungkung di semua header/sidebar/login + footer
- Dropdown kustom (Radix) menggantikan semua <select> native
- Tombol notifikasi petugas: panel popover, badge jumlah, tandai dibaca, klik menuju halaman terkait
- Kartu jadwal landing → halaman tiket (booking rute hari ini)
- Footer: "Design & Develop by MaiHarta" → https://maiharta.com/
- Gambar hero landing diganti kapal penumpang menyeberang ke pulau
- setup.sh (struktur sama dengan group.sh, MongoDB) di frontend/public/setup.sh + start-local.sh/.bat; header di scripts/setup-header.sh (regenerasi manual saat kode berubah)

## Backlog
- P1: Backend nyata (FastAPI + MongoDB) untuk semua data; integrasi pembayaran nyata (QRIS/VA BPD Bali), Google OAuth nyata
- P1: Pembatasan menu per role (bagian 7.6)
- P2: Export PDF sungguhan (saat ini window.print), email tiket nyata
- P2: Foto destinasi asli (saat ini foto stok ilustratif)

## Next tasks
- Konfirmasi tampilan dengan user, lanjut iterasi desain/flow
