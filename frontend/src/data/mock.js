export const ZONA = [
  { id: "Z1", nama: "Klungkung Daratan" },
  { id: "Z2", nama: "Nusa Penida" },
  { id: "Z3", nama: "Nusa Lembongan" },
];

export const DERMAGA = [
  { id: "D1", nama: "Tribuana", wilayah: "Kusamba - Klungkung", zona: "Z1", lokasi: "Desa Kusamba, Dawan", syahbandar: "I Made Sudarsana" },
  { id: "D2", nama: "Kampung Kusamba", wilayah: "Kusamba - Klungkung", zona: "Z1", lokasi: "Kampung Kusamba, Dawan", syahbandar: "I Made Sudarsana" },
  { id: "D3", nama: "Kusamba-Banjar Bias", wilayah: "Kusamba - Klungkung", zona: "Z1", lokasi: "Banjar Bias, Kusamba", syahbandar: "Ni Kadek Ayu Lestari" },
  { id: "D4", nama: "Sampalan", wilayah: "Batununggul - Nusa Penida", zona: "Z2", lokasi: "Batununggul, Nusa Penida", syahbandar: "I Ketut Wirawan" },
  { id: "D5", nama: "Junggutbatu", wilayah: "Jungutbatu - Nusa Lembongan", zona: "Z3", lokasi: "Jungutbatu, Nusa Penida", syahbandar: "I Wayan Sutama" },
];

export const RUTE = [
  { id: "R1", awal: "D1", akhir: "D4", jarak: 18 },
  { id: "R2", awal: "D4", akhir: "D1", jarak: 18 },
  { id: "R3", awal: "D2", akhir: "D4", jarak: 17 },
  { id: "R4", awal: "D4", akhir: "D2", jarak: 17 },
  { id: "R5", awal: "D3", akhir: "D5", jarak: 21 },
  { id: "R6", awal: "D5", akhir: "D3", jarak: 21 },
];

export const ARMADA = [
  { id: "A1", nama: "Gangga Express", kontak: "0812-3800-1101", alamat: "Kusamba, Klungkung", deskripsi: "Operator fast boat rute Tribuana–Sampalan", user: "gangga@armada.id", sumber: "api" },
  { id: "A2", nama: "Sekar Jaya", kontak: "0813-3700-2202", alamat: "Sampalan, Nusa Penida", deskripsi: "Armada reguler Kampung Kusamba–Sampalan", user: "sekarjaya@armada.id", sumber: "api" },
  { id: "A3", nama: "The Angkal Fast Cruise", kontak: "0811-3900-3303", alamat: "Banjar Bias, Kusamba", deskripsi: "Fast cruise Banjar Bias–Jungutbatu", user: "angkal@armada.id", sumber: "database" },
];

export const KAPAL = [
  { id: "KPL-GE-01", nama: "Gangga Express 1", armadaId: "A1", jenis: "Fast Boat", status: "Aktif", kapasitas: 120, kru: 5, grt: 34, dwt: 12, callsign: "YD-GE01", mesin: "4 x 300 HP" },
  { id: "KPL-GE-02", nama: "Gangga Express 2", armadaId: "A1", jenis: "Fast Boat", status: "Aktif", kapasitas: 100, kru: 4, grt: 29, dwt: 10, callsign: "YD-GE02", mesin: "3 x 300 HP" },
  { id: "KPL-SJ-01", nama: "Sekar Jaya I", armadaId: "A2", jenis: "Fast Boat", status: "Aktif", kapasitas: 90, kru: 4, grt: 26, dwt: 9, callsign: "YD-SJ01", mesin: "3 x 250 HP" },
  { id: "KPL-SJ-02", nama: "Sekar Jaya II", armadaId: "A2", jenis: "Kapal Kayu", status: "Docking", kapasitas: 60, kru: 3, grt: 18, dwt: 7, callsign: "YD-SJ02", mesin: "2 x 200 HP" },
  { id: "KPL-AN-01", nama: "Angkal Cruise 1", armadaId: "A3", jenis: "Fast Cruise", status: "Aktif", kapasitas: 150, kru: 6, grt: 41, dwt: 15, callsign: "YD-AN01", mesin: "4 x 350 HP" },
];

export const NAHKODA = [
  { id: "N1", nama: "Kapten I Nyoman Arta", armadaId: "A1" },
  { id: "N2", nama: "Kapten Gede Sumerta", armadaId: "A1" },
  { id: "N3", nama: "Kapten Komang Juliana", armadaId: "A2" },
  { id: "N4", nama: "Kapten Wayan Ardana", armadaId: "A3" },
];

export const JENIS_PENUMPANG = [
  { id: 1, nama: "Dewasa", kategori: "orang", asing: false },
  { id: 2, nama: "Anak-anak", kategori: "orang", asing: false },
  { id: 3, nama: "Bayi", kategori: "orang", asing: false },
  { id: 4, nama: "Dewasa Asing", kategori: "orang", asing: true },
  { id: 5, nama: "Sepeda Motor", kategori: "kendaraan", asing: false },
  { id: 6, nama: "Hewan", kategori: "hewan", asing: false },
];

export const HARGA_DASAR = { 1: 75000, 2: 50000, 3: 15000, 4: 150000, 5: 60000, 6: 40000 };

export const TUJUAN = [
  { id: 1, nama: "Pribadi / Keluarga" },
  { id: 2, nama: "Pekerjaan" },
  { id: 3, nama: "Wisata" },
  { id: 4, nama: "Pendidikan" },
  { id: 5, nama: "Upacara Adat / Keagamaan" },
];

export const SOP = [
  { id: 1, nama: "Pemeriksaan jumlah life jacket sesuai kapasitas" },
  { id: 2, nama: "Cek kondisi mesin dan bahan bakar" },
  { id: 3, nama: "Cek prakiraan cuaca dan tinggi gelombang BMKG" },
  { id: 4, nama: "Verifikasi manifest penumpang" },
  { id: 5, nama: "Pemeriksaan alat komunikasi radio" },
  { id: 6, nama: "Briefing keselamatan oleh nahkoda" },
];

export const PENGUMUMAN = [
  { id: 1, judul: "Antisipasi Penyebaran Covid-19 Varian Omicron", deskripsi: "Mari lindungi orang yang Anda cintai dengan tetap DISIPLIN MENERAPKAN PROTOKOL KESEHATAN.", tanggal: "2026-11-10" },
  { id: 2, judul: "Info Gelombang Selat Badung", deskripsi: "Pantau informasi cuaca sebelum berangkat. Keberangkatan dapat ditunda oleh syahbandar demi keselamatan.", tanggal: "2026-11-12" },
];

export const PETUGAS = [
  { id: 1, nama: "Admin Siwalatri", email: "admin@siwalatri.id", type: "admin" },
  { id: 2, nama: "I Made Sudarsana", email: "syahbandar@siwalatri.id", type: "syahbandar" },
  { id: 3, nama: "Gangga Express", email: "gangga@armada.id", type: "armada" },
  { id: 4, nama: "Sekar Jaya", email: "sekarjaya@armada.id", type: "armada" },
  { id: 5, nama: "Angkal Fast Cruise", email: "angkal@armada.id", type: "armada" },
  { id: 6, nama: "Loket Tribuana", email: "loket.tribuana@siwalatri.id", type: "loket" },
  { id: 7, nama: "Dinas Pariwisata", email: "wisata@siwalatri.id", type: "wisata" },
];

export const BARANG = [
  { id: 1, nama: "Paket Kecil (< 5 kg)", harga: 15000 },
  { id: 2, nama: "Paket Sedang (5–20 kg)", harga: 35000 },
  { id: 3, nama: "Bahan Bangunan / karung", harga: 25000 },
];

export const LOKET = ["Loket Tribuana", "Loket Sampalan", "Loket Kampung Kusamba", "Loket Banjar Bias", "Loket Jungutbatu"];

const J = (id, armadaId, kapalId, nahkodaId, ruteId, jam, extra = {}) => ({
  id, armadaId, kapalId, nahkodaId, ruteId, jam, jenis: "Regular", operasional: "On", approval: "Disetujui",
  kapasitasJadwal: null, cutoff: null, penjualan: true, terisi: Math.floor(((id * 37) % 60) + 10), loket: LOKET[id % 5], sop: [], ...extra,
});

export const JADWAL = [
  J(1, "A1", "KPL-GE-01", "N1", "R1", "06:30"),
  J(2, "A2", "KPL-SJ-01", "N3", "R3", "07:00"),
  J(3, "A3", "KPL-AN-01", "N4", "R5", "08:00"),
  J(4, "A1", "KPL-GE-02", "N2", "R2", "09:30", { cutoff: 1 }),
  J(5, "A2", "KPL-SJ-01", "N3", "R4", "10:30"),
  J(6, "A3", "KPL-AN-01", "N4", "R6", "11:00"),
  J(7, "A1", "KPL-GE-01", "N1", "R1", "13:00"),
  J(8, "A2", "KPL-SJ-02", "N3", "R3", "14:30", { operasional: "Off" }),
  J(9, "A1", "KPL-GE-02", "N2", "R2", "15:00"),
  J(10, "A3", "KPL-AN-01", "N4", "R5", "16:00", { kapasitasJadwal: 130 }),
  J(11, "A1", "KPL-GE-01", "N1", "R2", "17:30"),
  J(12, "A2", "KPL-SJ-01", "N3", "R4", "18:00", { approval: "Menunggu" }),
];

export const DESTINASI = [
  { slug: "goa-giri-putri", nama: "Goa Giri Putri", lokasi: "Desa Suana, Nusa Penida", img: "/img/giriputri.jpg", desc: "Pura gua besar di Desa Suana, timur laut Nusa Penida, melalui Jalan Ped-Buyuk.", tag: "Spiritual" },
  { slug: "crystal-bay", nama: "Crystal Bay", lokasi: "Sakti, Nusa Penida", img: "/img/crystal.jpg", desc: "Pantai berpasir dengan batu karang di tengah teluk, tempat scuba diving dan snorkeling.", tag: "Snorkeling" },
  { slug: "pantai-atuh", nama: "Pantai Atuh", lokasi: "Pejukutan, Nusa Penida", img: "/img/atuh.jpg", desc: "Pantai di sisi timur Nusa Penida dengan tebing karang, pasir putih, dan air biru jernih.", tag: "Pantai" },
];

export const HISTORY = [
  { id: 1, jadwalId: 1, kapal: "Gangga Express 1", berangkat: "06:31", tiba: "07:12", penumpang: 98, tanggal: "2026-11-13" },
  { id: 2, jadwalId: 2, kapal: "Sekar Jaya I", berangkat: "07:02", tiba: "07:45", penumpang: 71, tanggal: "2026-11-13" },
  { id: 3, jadwalId: 3, kapal: "Angkal Cruise 1", berangkat: "08:00", tiba: "08:38", penumpang: 120, tanggal: "2026-11-13" },
  { id: 4, jadwalId: 4, kapal: "Gangga Express 2", berangkat: "09:33", tiba: "10:15", penumpang: 64, tanggal: "2026-11-13" },
];

const NAMA = ["Putu Ayu Saraswati", "Kadek Dwi Pradnyana", "Made Wira Adnyana", "Komang Sri Utami", "Ketut Arya Wibawa", "Luh Gede Purnami", "Wayan Budiarta", "Gede Krisna Yoga", "Ni Nyoman Sukasih", "Emma Lindqvist", "Lucas Moreau", "Nengah Suardana"];
export const PENUMPANG_SEED = NAMA.map((n, i) => ({
  id: "P" + (i + 1), nama: n, jenisId: i === 9 || i === 10 ? 4 : i % 5 === 3 ? 2 : 1, tujuanId: (i % 5) + 1, gender: i % 2 ? "Perempuan" : "Laki-laki",
  identitas: i === 9 || i === 10 ? "PA" + (482910 + i) : "51050" + String(1234567890 + i * 7919).slice(0, 11), jadwalId: (i % 6) + 1, verified: i % 4 !== 0, invoice: "SWL-" + (2400 + Math.floor(i / 2)),
}));

export const REKON_QRIS_SEED = Array.from({ length: 9 }, (_, i) => ({
  id: "QR" + (i + 1), product: "QRIS-DYN", nmid: "ID10202611" + (300 + i), merchant: ARMADA[i % 3].nama, nominal: [150000, 75000, 225000, 300000, 50000][i % 5],
  bill: "SWL-" + (2300 + i), tanggal: `2026-11-${String(5 + i).padStart(2, "0")}`, expired: "15 menit", status: i % 4 === 0 ? "Pending" : "Lunas",
}));

export const REKON_VA_SEED = Array.from({ length: 9 }, (_, i) => ({
  id: "VA" + (i + 1), jenisBayar: "Virtual Account", tiket: `${(i % 3) + 1} x Dewasa`, tagihan: "88051" + (402210 + i * 13), operator: ARMADA[i % 3].nama,
  tglPerjalanan: `2026-11-${String(6 + i).padStart(2, "0")}`, tglBeli: `2026-11-${String(5 + i).padStart(2, "0")}`, tujuan: i % 2 ? "Sampalan" : "Junggutbatu",
  nama: NAMA[i], nominal: ((i % 3) + 1) * 75000, statusBayar: i % 3 === 0 ? "Belum Bayar" : "Lunas", reversal: i === 4 ? "Reversal" : "Normal", bukti: "BPD" + (771200 + i),
}));

export const BULANAN = ["Jun", "Jul", "Agu", "Sep", "Okt", "Nov"].map((b, i) => ({
  bulan: b, "Gangga Express": 4200 + i * 380 + (i % 2) * 260, "Sekar Jaya": 3100 + i * 210, "The Angkal Fast Cruise": 3600 + i * 300 - (i % 3) * 150,
}));
