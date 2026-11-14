export const rupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

export const witaNow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Makassar" }));

const pad = (n) => String(n).padStart(2, "0");
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayWita = () => ymd(witaNow());
export const hm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const tanggalPanjang = (s) =>
  new Date(s + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export const departureAt = (tanggal, jam) => {
  const [h, m] = jam.split(":").map(Number);
  const d = new Date(tanggal + "T00:00:00");
  d.setHours(h, m, 0, 0);
  return d;
};

// Bagian 8.2: Persiapan 20 menit sebelum, Berlayar s.d. 30 menit sesudah, selain itu Sandar
export const statusKapal = (jadwal, now = witaNow()) => {
  if (jadwal.operasional === "Off") return "Off";
  const diff = (now - departureAt(ymd(now), jadwal.jam)) / 60000;
  if (diff >= -20 && diff < 0) return "Persiapan";
  if (diff >= 0 && diff <= 30) return "Berlayar";
  return "Sandar";
};

export const STATUS_STYLE = {
  Persiapan: "bg-amber-100 text-amber-800 ring-amber-200",
  Berlayar: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Sandar: "bg-sky-100 text-sky-800 ring-sky-200",
  Off: "bg-slate-200 text-slate-700 ring-slate-300",
};

// Bagian 34: jadwal override > default armada > default sistem
export const effectiveCutoff = (jadwal, cutoff) => {
  if (jadwal.cutoff !== null && jadwal.cutoff !== undefined && jadwal.cutoff !== "") return { hours: Number(jadwal.cutoff), level: "Jadwal" };
  const a = cutoff.armada?.[jadwal.armadaId];
  if (a !== null && a !== undefined && a !== "") return { hours: Number(a), level: "Armada" };
  return { hours: Number(cutoff.system), level: "Sistem" };
};

export const salesInfo = (jadwal, tanggal, cutoff, now = witaNow()) => {
  const { hours, level } = effectiveCutoff(jadwal, cutoff);
  const close = new Date(departureAt(tanggal, jadwal.jam).getTime() - hours * 3600000);
  const manualOff = jadwal.penjualan === false;
  const open = !manualOff && now < close;
  return {
    open,
    hours,
    level,
    closeAt: close,
    closeLabel: hm(close),
    reason: manualOff ? "Penjualan dinonaktifkan petugas" : open ? "" : `Penjualan tiket untuk jadwal ini telah ditutup sejak ${hm(close)} WITA.`,
  };
};

export const downloadCSV = (filename, rows) => {
  if (!rows.length) return;
  const head = Object.keys(rows[0]);
  const csv = [head.join(","), ...rows.map((r) => head.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = filename;
  a.click();
};
