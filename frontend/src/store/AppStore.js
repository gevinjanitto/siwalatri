import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as M from "@/data/mock";

const KEY = "siwalatri-terpadu-v1";

const initial = () => ({
  master: {
    kapal: M.KAPAL, jenisPenumpang: M.JENIS_PENUMPANG, dermaga: M.DERMAGA, rute: M.RUTE, tujuan: M.TUJUAN, sop: M.SOP,
    petugas: M.PETUGAS, armada: M.ARMADA, pengumuman: M.PENGUMUMAN, barang: M.BARANG, zona: M.ZONA, nahkoda: M.NAHKODA,
  },
  jadwal: M.JADWAL,
  cutoff: { system: 2, armada: { A3: 1.5 } },
  audit: [{ at: "2026-11-12T09:12:00", by: "Admin Siwalatri", msg: "Default cutoff armada The Angkal Fast Cruise diubah menjadi 1,5 jam" }],
  invoices: [],
  customers: [{ nama: "Putu Ayu Saraswati", email: "putu@contoh.id", telp: "081234567890", password: "putu1234" }],
  customer: null,
  staff: null,
});

const load = () => {
  try { return { ...initial(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return initial(); }
};

const Ctx = createContext(null);

export const AppStoreProvider = ({ children }) => {
  const [s, setS] = useState(load);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(s)); }, [s]);

  const patch = useCallback((fn) => setS((p) => ({ ...p, ...fn(p) })), []);
  const audit = (p, msg) => [{ at: new Date().toISOString(), by: p.staff?.nama || "Sistem", msg }, ...p.audit];

  const api = useMemo(() => ({
    crud: (entity, op, item) => patch((p) => {
      const list = p.master[entity];
      let next = list;
      if (op === "create") next = [...list, { ...item, id: item.id || Date.now() }];
      if (op === "update") next = list.map((x) => (x.id === item.id ? { ...x, ...item } : x));
      if (op === "delete") next = list.filter((x) => x.id !== item.id);
      return { master: { ...p.master, [entity]: next } };
    }),
    updateJadwal: (id, change, msg) => patch((p) => ({
      jadwal: p.jadwal.map((j) => (j.id === id ? { ...j, ...change } : j)),
      audit: msg ? audit(p, msg) : p.audit,
    })),
    addJadwal: (j) => patch((p) => ({ jadwal: [...p.jadwal, { ...j, id: Math.max(...p.jadwal.map((x) => x.id)) + 1 }] })),
    setCutoff: (cutoff, msg) => patch((p) => ({ cutoff, audit: audit(p, msg) })),
    createInvoice: (inv) => {
      const id = "SWL-" + String(Date.now()).slice(-6);
      const prefix = { A1: "GE", A2: "SJ", A3: "AN" }[inv.armadaId] || "OP";
      const noInvoice = `${prefix}${inv.tanggal.replace(/-/g, "").slice(2)}${String(Date.now()).slice(-4)}`;
      const full = {
        ...inv, id, noInvoice, status: 0, createdAt: new Date().toISOString(),
        units: inv.units.map((u, i) => ({ ...u, kodeBooking: `${noInvoice}-${String(i + 1).padStart(2, "0")}` })),
        qrValue: inv.metode === "qris" ? `00020101021226670016ID.CO.BPDBALI.WWW0118936001290000${id}5204411153033605405${inv.grandtotal}5802ID5909SIWALATRI6009KLUNGKUNG` : null,
        noVa: inv.metode === "va" ? "88051" + String(Date.now()).slice(-9) : null,
      };
      patch((p) => ({ invoices: [full, ...p.invoices] }));
      return full;
    },
    payInvoice: (id) => patch((p) => ({ invoices: p.invoices.map((i) => (i.id === id ? { ...i, status: 1, paidAt: new Date().toISOString() } : i)) })),
    register: (c, customers) => {
      if (customers.some((x) => x.email === c.email)) return false;
      patch((p) => ({ customers: [...p.customers, c], customer: { nama: c.nama, email: c.email, telp: c.telp, via: "email" } }));
      return true;
    },
    loginCustomer: (email, password, customers) => {
      const c = customers.find((x) => x.email === email && x.password === password);
      if (c) patch(() => ({ customer: { nama: c.nama, email: c.email, telp: c.telp, via: "email" } }));
      return !!c;
    },
    googleLogin: () => patch(() => ({ customer: { nama: "Komang Pelanggan", email: "komang.pelanggan@gmail.com", telp: "", via: "google" } })),
    logoutCustomer: () => patch(() => ({ customer: null })),
    loginStaff: (email, password, petugas) => {
      const u = petugas.find((x) => x.email === email);
      if (!u || u.type === "user") return "Email not found";
      if (password !== "admin123") return "Password salah";
      patch(() => ({ staff: u }));
      return null;
    },
    logoutStaff: () => patch(() => ({ staff: null })),
    updateStaff: (u) => patch((p) => ({ staff: { ...p.staff, ...u }, master: { ...p.master, petugas: p.master.petugas.map((x) => (x.id === p.staff.id ? { ...x, ...u } : x)) } })),
    reset: () => setS(initial()),
  }), [patch]);

  return <Ctx.Provider value={{ ...s, ...api }}>{children}</Ctx.Provider>;
};

export const useStore = () => useContext(Ctx);

export const useLookup = () => {
  const s = useStore();
  return useMemo(() => {
    const by = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
    const dermaga = by(s.master.dermaga), rute = by(s.master.rute), armada = by(s.master.armada), kapal = by(s.master.kapal), nahkoda = by(s.master.nahkoda);
    const detail = (j) => {
      const r = rute[j.ruteId] || {};
      const k = kapal[j.kapalId] || {};
      return { ...j, asal: dermaga[r.awal] || {}, tujuan: dermaga[r.akhir] || {}, armada: armada[j.armadaId] || {}, kapal: k, nahkoda: nahkoda[j.nahkodaId] || {}, kapasitas: j.kapasitasJadwal || k.kapasitas || 0 };
    };
    const sold = (jadwalId, tanggal) =>
      s.invoices.filter((i) => i.jadwalId === jadwalId && i.tanggal === tanggal).reduce((a, i) => a + i.units.length, 0);
    const kuota = (j, tanggal) => Math.max(0, detail(j).kapasitas - j.terisi - sold(j.id, tanggal));
    const tikets = (j) =>
      s.master.jenisPenumpang.map((jp) => ({ id: `${j.id}-${jp.id}`, idSiwalatri: jp.id, nama: jp.nama, kategori: jp.kategori, asing: jp.asing, harga: (M.HARGA_DASAR[jp.id] ?? 50000) + (j.armadaId === "A3" ? 10000 : 0) }));
    return { dermaga, rute, armada, kapal, nahkoda, detail, sold, kuota, tikets };
  }, [s.master, s.invoices]);
};
