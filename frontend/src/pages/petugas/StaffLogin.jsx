import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { AuthSplit, PillButton, UnderlineField } from "@/components/auth/AuthSplit";
import { useStore } from "@/store/AppStore";
import { Checkbox } from "@/components/ui/checkbox";

export default function StaffLogin() {
  const { master, loginStaff, staff } = useStore();
  const nav = useNavigate();
  const [f, setF] = useState({ email: "admin@siwalatri.id", password: "admin123" });
  const [e, setE] = useState({});
  if (staff) return <Navigate to="/dashboard" replace />;
  const submit = (ev) => {
    ev.preventDefault();
    const x = {};
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = "Email wajib dan harus valid";
    if (f.password.length < 5) x.password = "Password minimal 5 karakter";
    setE(x);
    if (Object.keys(x).length) return;
    const err = loginStaff(f.email, f.password, master.petugas);
    if (err) return setE(err === "Email not found" ? { email: "Email not found" } : { password: err });
    toast.success("Selamat bertugas!");
    nav("/dashboard");
  };
  return (
    <AuthSplit testid="staff-login-page" image="/img/boat-aerial.jpg" badge="Modul Petugas"
      caption={<div><p className="font-display text-2xl font-bold leading-tight">Pengawasan pelayaran Klungkung dalam satu layar.</p><p className="mt-1 text-sm text-white/85">Jadwal, manifest, pembayaran, dan laporan armada.</p></div>}>
      <h1 className="text-center font-display text-4xl font-bold tracking-tight">Selamat Bertugas!</h1>
      <p className="mt-2 text-center text-sm text-slate-500">Masuk dengan akun petugas Siwalatri</p>
      <form onSubmit={submit} className="mt-10 flex flex-col gap-6">
        <UnderlineField label="Email" testid="staff-login-email" value={f.email} onChange={(ev) => setF({ ...f, email: ev.target.value })} error={e.email} />
        <UnderlineField label="Password" type="password" testid="staff-login-password" value={f.password} onChange={(ev) => setF({ ...f, password: ev.target.value })} error={e.password} />
        <div className="flex items-center justify-between text-xs text-slate-600">
          <label className="flex items-center gap-2"><Checkbox data-testid="staff-login-remember" defaultChecked />Ingat saya</label>
          <button type="button" data-testid="staff-login-forgot" onClick={() => toast.info("Hubungi administrator untuk reset password")} className="text-slate-500 hover:text-[var(--ink)]">Lupa password?</button>
        </div>
        <PillButton type="submit" data-testid="staff-login-submit">Masuk</PillButton>
      </form>
      <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[var(--foam)] p-4 text-xs text-teal-900" data-testid="staff-login-demo-hint">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Akun demo: semua email petugas memakai password <b>admin123</b> (contoh admin@siwalatri.id, syahbandar@siwalatri.id). Pelanggan modul tiket tidak dapat masuk dashboard.</span>
      </div>
    </AuthSplit>
  );
}
