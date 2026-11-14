import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AuthSplit, GoogleButton, PillButton, UnderlineField } from "@/components/auth/AuthSplit";
import { useStore } from "@/store/AppStore";
import { Checkbox } from "@/components/ui/checkbox";

// hanya izinkan redirect ke pola URL order (mencegah open redirect)
const safeRedirect = (r) => (r && /^\/tiket\/order\/\d+\/\d+\/\d{4}-\d{2}-\d{2}$/.test(r) ? r : "/tiket");

const Caption = () => (
  <div>
    <p className="font-display text-2xl font-bold leading-tight">Pesan tiket lebih cepat dengan akun.</p>
    <p className="mt-1 text-sm text-white/85">Riwayat pemesanan tersimpan otomatis. Tetap bisa memesan sebagai tamu.</p>
  </div>
);

export const CustomerLogin = () => {
  const { customers, loginCustomer, googleLogin } = useStore();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const [f, setF] = useState({ email: "putu@contoh.id", password: "putu1234" });
  const [err, setErr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!loginCustomer(f.email, f.password, customers)) return setErr("Email atau kata sandi salah");
    toast.success("Berhasil masuk");
    nav(safeRedirect(sp.get("redirect")));
  };
  const google = () => { googleLogin(); toast.success("Masuk dengan Google berhasil"); nav(safeRedirect(sp.get("redirect"))); };
  return (
    <AuthSplit testid="customer-login-page" image="/img/crystal.jpg" badge="Modul Tiket" caption={<Caption />} logoTo="/tiket" logoSub="Tiket">
      <h1 className="text-center font-display text-4xl font-bold tracking-tight">Selamat Datang!</h1>
      <p className="mt-2 text-center text-sm text-slate-500">Masukkan data akun Anda</p>
      <form onSubmit={submit} className="mt-10 flex flex-col gap-6">
        <UnderlineField label="Email" testid="customer-login-email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <UnderlineField label="Kata Sandi" type="password" testid="customer-login-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} error={err} />
        <PillButton type="submit" data-testid="customer-login-submit">Masuk</PillButton>
        <GoogleButton data-testid="customer-login-google" onClick={google} />
      </form>
      <p className="mt-8 text-center text-xs text-slate-500">Belum punya akun? <Link to={`/tiket/register${sp.get("redirect") ? `?redirect=${encodeURIComponent(sp.get("redirect"))}` : ""}`} data-testid="customer-login-to-register" className="font-semibold text-[var(--ink)]">Daftar</Link></p>
      <p className="mt-2 text-center text-xs"><Link to="/tiket" data-testid="customer-login-guest" className="text-teal-700 underline">Lanjut tanpa login</Link></p>
    </AuthSplit>
  );
};

export const CustomerRegister = () => {
  const { customers, register } = useStore();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const [f, setF] = useState({ nama: "", email: "", telp: "", password: "", confirm: "", agree: false });
  const [e, setE] = useState({});
  const set = (k) => (ev) => setF({ ...f, [k]: ev.target.value });
  const submit = (ev) => {
    ev.preventDefault();
    const x = {};
    if (!f.nama.trim() || f.nama.length > 100) x.nama = "Nama wajib, maks. 100 karakter";
    if (!/^\S+@\S+\.\S+$/.test(f.email) || f.email.length > 100) x.email = "Email tidak valid";
    if (!f.telp.trim() || f.telp.length > 30) x.telp = "Nomor telepon wajib, maks. 30 karakter";
    if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) x.password = "Min. 8 karakter berisi huruf dan angka";
    if (f.confirm !== f.password) x.confirm = "Konfirmasi tidak sama";
    if (!f.agree) x.agree = "Anda harus menyetujui syarat";
    setE(x);
    if (Object.keys(x).length) return;
    if (!register({ nama: f.nama, email: f.email, telp: f.telp, password: f.password }, customers)) return setE({ email: "Email sudah terdaftar" });
    toast.success("Akun berhasil dibuat");
    nav(safeRedirect(sp.get("redirect")));
  };
  return (
    <AuthSplit testid="customer-register-page" image="/img/kelingking.jpg" badge="Daftar Pelanggan" caption={<Caption />} logoTo="/tiket" logoSub="Tiket">
      <h1 className="text-center font-display text-4xl font-bold tracking-tight">Buat Akun</h1>
      <p className="mt-2 text-center text-sm text-slate-500">Gratis, kurang dari satu menit</p>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
        <UnderlineField label="Nama" testid="register-nama" value={f.nama} onChange={set("nama")} error={e.nama} />
        <UnderlineField label="Email" testid="register-email" value={f.email} onChange={set("email")} error={e.email} />
        <UnderlineField label="No Telepon" testid="register-telp" value={f.telp} onChange={set("telp")} error={e.telp} />
        <UnderlineField label="Kata Sandi" type="password" testid="register-password" value={f.password} onChange={set("password")} error={e.password} />
        <UnderlineField label="Konfirmasi Kata Sandi" type="password" testid="register-confirm" value={f.confirm} onChange={set("confirm")} error={e.confirm} />
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <Checkbox data-testid="register-agree" checked={f.agree} onCheckedChange={(v) => setF({ ...f, agree: !!v })} /> Saya menyetujui syarat & ketentuan
        </label>
        {e.agree && <span className="-mt-3 text-xs text-red-600">{e.agree}</span>}
        <PillButton type="submit" data-testid="register-submit">Daftar</PillButton>
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">Sudah punya akun? <Link to="/tiket/login" data-testid="register-to-login" className="font-semibold text-[var(--ink)]">Masuk</Link></p>
    </AuthSplit>
  );
};
